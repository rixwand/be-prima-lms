import { instrument } from "@socket.io/admin-ui";
import type { Server as HttpServer } from "http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { CLIENT_URL } from "../common/utils/env";
import { ApiError } from "../common/utils/http";
import { AUTH } from "../config";
import { authenticateAccessToken, parseBearerToken } from "../middlewares/auth.middleware";
import { RequestUser } from "../types/global";

let io: Server | null = null;

type SocketType = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, { user: RequestUser }>;
type SocketAuthErrorData = {
  status: number;
  code: string;
  message: string;
};

const toSocketConnectError = (error: unknown): Error & { data?: SocketAuthErrorData } => {
  const apiError = error instanceof ApiError ? error : new ApiError(500, "Something went wrong");
  const socketError = new Error(apiError.message) as Error & { data?: SocketAuthErrorData };
  socketError.data = {
    status: apiError.status,
    code: String(apiError.status),
    message: apiError.message,
  };

  return socketError;
};

export const initSocket = (server: HttpServer): Server => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: [CLIENT_URL, "http://localhost:3000", "https://admin.socket.io"],
      credentials: true,
    },
  });

  io.use(async (socket: SocketType, next) => {
    try {
      const authHeaderToken = parseBearerToken(socket.handshake.headers.authorization);
      const handshakeTokenRaw =
        typeof socket.handshake.auth.accessToken === "string" ? socket.handshake.auth.accessToken.trim() : "";
      const handshakeToken = parseBearerToken(handshakeTokenRaw) ?? (handshakeTokenRaw || null);
      const token = handshakeToken ?? authHeaderToken;

      if (!token) throw new ApiError(401, "Unathorized");
      socket.data.user = await authenticateAccessToken(token);
      next();
    } catch (error) {
      next(toSocketConnectError(error));
    }
  });

  io.on("connection", (socket: SocketType) => {
    const userId = socket.data.user.id;
    const isAdmin = socket.data.user.role == AUTH.ROLES.ADMIN;
    if (typeof userId === "number") {
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      if (isAdmin) socket.join(`role:${AUTH.ROLES.ADMIN}`);
      console.log("socket connected user:", userId, "joined room:", userRoom);
      return;
    }
    console.log("socket connected without valid user id");
  });

  // io.on("")
  instrument(io, { auth: false });

  return io;
};

export const getSocket = (): Server => {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
};
