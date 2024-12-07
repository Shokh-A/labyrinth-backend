import { Server } from "socket.io";
import { roomController } from "../controllers/roomController.js";

export const initializeSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("ping", (startTime: number) => {
      socket.emit("pong", startTime);
    });

    roomController(io, socket);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
