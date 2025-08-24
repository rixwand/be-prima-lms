import express from "express";
import api from "./routes";
import { errorMiddleware } from "../middlewares/error.middleware";
const web = express();

web.use(express.json());

web.use("/api", api);

web.use(errorMiddleware);

export default web;
