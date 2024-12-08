import express from 'express'
import {
   getAllBarang,
   getBarangById,
   addBarang,
   updateBarang,
   deleteBarang
} from '../controllers/barang_controllers.js'

import {authorize} from '../controllers/auth_controllers.js'
import {IsAdmin,} from '../middleware/role_validation.js'

const app = express()


app.get('/', authorize, getAllBarang)
app.get('/:id', authorize, getBarangById)
app.post('/', authorize, [IsAdmin], addBarang)
app.put('/:id', authorize, [IsAdmin], updateBarang)
app.delete('/:id', authorize, [IsAdmin], deleteBarang)

export default app