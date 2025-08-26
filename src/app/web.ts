import cookieParser from "cookie-parser";
import express from "express";
import { errorMiddleware } from "../middlewares/error.middleware";
import api from "./routes";
const web = express();

web.use(express.json());
web.use(cookieParser());

web.use("/api", api);

web.use(errorMiddleware);

export default web;
