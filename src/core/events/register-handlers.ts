import { Server } from "socket.io";
import { AUTH } from "../../config";
import dispatcher from "./dispatcher";
import { DOMAIN_EVENTS } from "./events";

let isRegistered = false;

export const registerDomainEventHandlers = ({ io }: { io: Server }) => {
  if (isRegistered) return;

  dispatcher.on(DOMAIN_EVENTS.NEW_ADMIN_NOTIFICATIONS, payload => {
    io.to(`role:${AUTH.ROLES.ADMIN}`).emit("new_notifications", payload);
  });
  dispatcher.on(DOMAIN_EVENTS.NEW_USER_NOTIFICATIONS, ({ toUserId, ...payload }) => {
    io.to(`user:${toUserId}`).emit("new_notifications", payload);
  });

  isRegistered = true;
};
