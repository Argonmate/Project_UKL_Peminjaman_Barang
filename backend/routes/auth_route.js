import express from 'express'
import {
   authenticate
} from '../controllers/auth_controllers.js'


const app = express()

app.post('/login', authenticate)


export default app