// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./sockets/socketManager.js";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());

initializeSocket(io);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
