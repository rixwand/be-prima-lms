import { createServer } from "http";
import web from "./web";
const server = createServer(web);

export default server;
