import express from 'express'
import {
   getAllPeminjaman,
   getPeminjamanById,
   addPeminjaman,
   pengembalianBarang,
   usageReport
} from '../controllers/transaksi_controllers.js'

import {authorize} from '../controllers/auth_controllers.js'
import {IsMember, IsAdmin} from '../middleware/role_validation.js'

const app = express()

app.get('/borrow', authorize, getAllPeminjaman)
app.get('/borrow/:id', authorize, getPeminjamanById)
app.post('/borrow', authorize, addPeminjaman)
app.post('/return', authorize, pengembalianBarang)
app.post('/usage-report', usageReport)


export default app