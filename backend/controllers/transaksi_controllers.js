import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.presensi.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });
    if (formattedData) {
      res.json({
        success: true,
        data: formattedData,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};
export const addPeminjaman = async(req, res) => {
  const { id_user, barang_id, borrow_date, return_date, qty } = req.body;

  const formattedBorrowDate = new Date(borrow_date).toISOString();
  const formattedReturnDate = new Date(return_date).toISOString();

  const [getuserid, getbarangid] = await Promise.all([
      prisma.user.findUnique({where: { id_user: Number(id_user) } }),
      prisma.barang.findUnique({where: { id_barang: Number(barang_id) } })
  ]);

  if (getuserid && getbarangid) {
      try {
          const result = await prisma.peminjaman.create({
              data: {
                  user:        {connect: {id_user: Number(id_user)}},
                  barang:      {connect: {id_barang: Number(barang_id)}},
                  qty:         qty,
                  borrow_date: formattedBorrowDate,
                  return_date: formattedReturnDate,
              },
          });
          if(result) {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: Number(barang_id) },
              });
              if (!barang) {
                  throw new Error(
                      `barang dengan id_barang ${id_barang} tidak ditemukan`
                  )
              }else{
                  const penguranganQty = barang.quantity - qty;
                  const result = await prisma.barang.update({
                      where: {
                          id_barang: Number(barang_id),
                      },
                      data: {
                          quantity: penguranganQty,
                      },
                  });
              }
          }
          res.status(201).json({
              success: true,
              message: "Peminjaman Berhasil Dicatat",
              peminjaman: result,
              data: {
                  id_user:     result.id_user,
                  id_barang:   result.id_barang,
                  qty:         result.qty,
                  borrow_date: result.borrow_date.toISOString().split("T")[0],
                  return_date: result.return_date.toISOString().split("T")[0],
                  status:      result.status,
              },
          });
      } catch (error) {
          console.log(error);
          res.json({ msg: "gagal menambahkan peminjaman" });
      }
  } else {
      res.json({ msg: "user dan barangh belum ada" });
  }
};

export const pengembalianBarang = async(req, res) => {
  const { borrow_id, return_date } = req.body;

  const formattedReturnDate = new Date(return_date).toISOString();

  const cekborrowid = await prisma.peminjaman.findUnique({
      where: { id_peminjaman: Number(borrow_id) }
  })

  if (cekborrowid.status == "dipinjam") {
      try {
          const result = await prisma.peminjaman.update({
              where: {
                  id_peminjaman: borrow_id,
              },
              data: {
                  return_date: formattedReturnDate,
                  status: "kembali"
              },
          });
          if(result) {
              const barang = await prisma.barang.findUnique({
                  where: { id_barang: Number(cekborrowid.id_barang) },
              });

              if (!barang) {
                  throw new Error(
                      "barang dengan id_barang ${id_barang} tidak ditemukan"
                  )
              } else {
                  const pengambalianQty = cekborrowid.qty + barang.quantity;
                  const result = await prisma.barang.update({
                      where: {
                          id_barang: Number(cekborrowid.id_barang),
                      },
                      data: {
                          quantity: pengambalianQty,
                      },
                  });
              }
          }
          res.status(201).json({
              success: true,
              message: "Peminjaman Berhasil Dicatat",
              peminjaman: result,
              data: {
                  id_user:     result.id_user,
                  id_barang:   result.id_barang,
                  qty:         result.qty,
                  borrow_date: result.borrow_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
                  return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
                  status:      result.status,
              },
          });
      } catch (error) {
          console.log(error);
          res.json({ msg: "pengambalian gagal" });
      }
  } else {
      res.json({ msg: "user dan barangh belum ada" });
  }
}
export const usageReport = async (req, res) => {
  const { start_date, end_date, category, location, group_by } = req.body;

  const formattedStartDate = new Date(start_date).toISOString();
  const formattedEndDate = new Date(end_date).toISOString();

  try {
    // Filter barang berdasarkan kategori dan lokasi
    const items = await prisma.barang.findMany({
      where: {
        AND: [
          category ? { category: { contains: category } } : {},
          location ? { location: { contains: location } } : {},
        ],
      },
    });

    if (items.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No items found for the given filters.",
      });
    }

    // Ambil peminjaman berdasarkan rentang tanggal
    const borrowRecords = await prisma.peminjaman.findMany({
      where: {
        borrow_date: { gte: formattedStartDate },
        return_date: { lte: formattedEndDate },
      },
    });

    // Kelompokkan data berdasarkan group_by
    const analysis = items.reduce((acc, item) => {
      const Group = group_by === "location" ? item.location : item.category;

      if (!acc[Group]) {
        acc[Group] = { 
          group: Group,
          total_borrowed: 0,
          total_returned: 0,
          items_in_use: 0,
        };
      }

      const relevantBorrows = borrowRecords.filter(
        (record) => record.id_barang === item.id_barang
      );

      const totalBorrowed = relevantBorrows.reduce(
        (sum, record) => sum + record.qty,
        0
      );

      const totalReturned = relevantBorrows.reduce(
        (sum, record) => (record.status === "kembali" ? sum + record.qty : sum),
        0
      );

      acc[Group].total_borrowed += totalBorrowed;
      acc[Group].total_returned += totalReturned;
      acc[Group].items_in_use += totalBorrowed - totalReturned;

      return acc;
    }, {});

    // Respons dalam format yang diminta
    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date: start_date,
          end_date: end_date,
        },
        usage_analysis: Object.values(analysis), // Konversi objek menjadi array
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the usage report.",
      error: error.message,
    });
  }
};

