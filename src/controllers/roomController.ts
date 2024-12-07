import { nanoid } from "nanoid";
import { Server, Socket } from "socket.io";
import IPlayer from "../interfaces/IPlayer";

const rooms: Map<string, IPlayer[]> = new Map();

const EVENTS = {
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  ROOM_CREATED: "roomCreated",
  ROOM_JOINED: "roomJoined",
  READY: "ready",

  ERROR: "error",
};

export const roomController = (io: Server, socket: Socket) => {
  socket.on(EVENTS.CREATE_ROOM, (playerData, callback) => {
    const player = {
      id: socket.id,
      name: playerData.name,
      score: 0,
    };

    const roomId = nanoid(8);
    rooms.set(roomId, [player]);
    socket.join(roomId);

    callback({
      message: "Room created successfully",
      roomId,
      players: rooms.get(roomId),
    });
  });

  socket.on(EVENTS.JOIN_ROOM, (data, callback) => {
    const roomId = data.roomId;
    if (!rooms.has(roomId)) {
      socket.emit(EVENTS.ERROR, { message: "Room not found" });
    } else if (rooms.get(roomId) && rooms.get(roomId)!.length >= 4) {
      socket.emit(EVENTS.ERROR, { message: "Room is full" });
    } else {
      const player = {
        id: socket.id,
        name: data.player.name,
        score: 0,
      };

      rooms.get(roomId)?.push(player);
      socket.join(roomId);

      callback({
        message: "Room joined successfully",
        players: rooms.get(roomId),
      });
      io.emit("playerJoined", { players: rooms.get(roomId) });
    }
  });

  socket.on("leaveRoom", (data) => {
    const roomId = data.roomId;
    rooms.forEach((players, roomId) => {
      const playerIndex = players.findIndex(
        (player) => player.id === socket.id
      );
      if (playerIndex !== -1) {
        players.splice(playerIndex, 1);
        io.to(roomId).emit("playerLeft", { players });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from the room.");

    rooms.forEach((players, roomId) => {
      const playerIndex = players.findIndex(
        (player) => player.id === socket.id
      );
      if (playerIndex !== -1) {
        players.splice(playerIndex, 1);
        io.to(roomId).emit("playerLeft", { players });
      }
    });
  });
};
