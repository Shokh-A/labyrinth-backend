import { nanoid } from "nanoid";
import { Socket } from "socket.io";
import IPlayer from "../interfaces/IPlayer";

const rooms: Map<string, IPlayer[]> = new Map();

const EVENTS = {
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  ROOM_CREATED: "roomCreated",
  ROOM_JOINED: "roomJoined",
  ROOM_NOT_FOUND: "roomNotFound",
};

export const roomController = (socket: Socket) => {
  socket.on(EVENTS.CREATE_ROOM, (playerData) => {
    const roomId = nanoid(8);
    const player = {
      id: socket.id,
      name: playerData.name,
      score: 0,
    };
    rooms.set(roomId, [player]);
    socket.join(roomId);

    console.log("Room created with id:", roomId);
    socket.emit(EVENTS.ROOM_CREATED, roomId);
  });

  socket.on(EVENTS.JOIN_ROOM, (data) => {
    const roomId = data.roomId;
    if (rooms.has(roomId)) {
      const player = {
        id: socket.id,
        name: data.player.name,
        score: 0,
      };
      rooms.get(roomId)?.push(player);
      console.log(`${player.name} joined the room with id: ${roomId}`);
      socket.emit(EVENTS.ROOM_JOINED);
    } else {
      console.log("Room not found");
      socket.emit(EVENTS.ROOM_NOT_FOUND, { message: "Room not found" });
    }
  });
};
