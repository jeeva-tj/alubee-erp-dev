import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
// import path from 'path';

import { errorHandle } from "./middlewares/ErrorMiddleware.js";
import authRouter from './routers/authRouters.js';
import enquiryRouter from './routers/enquiryRouter.js';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())


if(process.env.NODE_ENV === 'development'){
    app.use(morgan("dev"))
}

// const __dirname = path.resolve()

// router
app.use('/v2/api', authRouter)
app.use('/v2/api/enquiry', enquiryRouter)


// error middleware
app.use(errorHandle);

app.get('/', (req, res) => {
    res.send('server is running...!')
})


const PORT = process.env.PORT || 8080;

// listen port
app.listen(PORT, () => {
    console.log(`server is running...! ${PORT}`);
})

