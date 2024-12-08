import { PrismaClient } from "@prisma/client";
import md5 from "md5";

const prisma = new PrismaClient();

export const getAllBarang = async (req, res) => {
  try {
    const result = await prisma.barang.findMany();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getBarangById = async (req, res) => {
  try {
    const result = await prisma.barang.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
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
export const addBarang = async (req, res) => {
  try {
    const { nama_barang, category, location, quantity } = req.body;

    const itemCheck = await prisma.barang.findFirst({
      where: {
        nama_barang: nama_barang,
      },
    });
    if (itemCheck) {
      res.status(401).json({
        msg: "barang sudah ada",
      });
    } else {
      const result = await prisma.barang.create({
        data: {
          nama_barang: nama_barang,
          category: category,
          location: location,
          quantity: quantity,
        },
      });
      res.status(201).json({
        success: true,
        message: "Barang berhasil ditambah",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const updateBarang = async (req, res) => {
  try {
    const { nama_barang, kategori, lokasi, kuantitas } = req.body;

    const dataCheck = await prisma.barang.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (!dataCheck) {
      res.status(401).json({
        msg: "data tidak ditemukan",
      });
    } else {
      const result = await prisma.barang.update({
        where: {
          id_barang: Number(req.params.id),
        },
        data: {
          nama_barang: nama_barang,
          category: kategori,
          location: lokasi,
          quantity: kuantitas,
        },
      });
      res.json({
        success: true,
        message: "Barang berhasil diubah",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const deleteBarang = async (req, res) => {
  try {
    const dataCheck = await prisma.barang.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (!dataCheck) {
      res.status(401).json({
        msg: "data tidak ditemukan",
      });
    } else {
      const result = await prisma.barang.delete({
        where: {
          id_barang: Number(req.params.id),
        },
      });
      res.json({
        success: true,
        message: "Data Barang berhasil dihapus",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
