import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { CLIENT_URL } from "../common/utils/env";
import { errorMiddleware } from "../middlewares/error.middleware";
import api from "./routes";
const web = express();

web.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

web.use(express.json());
web.use(cookieParser());

web.use("/api", api);

web.use(errorMiddleware);

export default web;
