import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {config} from "dotenv";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app= express();

config();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin:[process.env.CLIENT_URL],
    credentials:true
}));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.use("/ping",(req,res)=>{
    res.send("Ping-Pong");
});

// for the defined routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment",paymentRoutes);

app.all("*",(req,res)=>{
    res.status(404).send("OOPS!! Page not found");
});

app.use(errorMiddleware);

export default app;

