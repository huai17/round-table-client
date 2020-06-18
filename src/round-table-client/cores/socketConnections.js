import io from "socket.io-client";
import { getSeverAddress } from "../../configs/server";

import { handleConnectEvent, handleMessageEvent } from "./socketEventHandlers";

// connect with signal server
export const socket = io(getSeverAddress() + "/roundTable");

socket.on("connect", () => {
  handleConnectEvent(socket);
});

socket.on("message", (message) => {
  handleMessageEvent(message);
});

export const sendMessage = (message) => {
  if (socket) {
    console.log(`Send Message: ${message.id}`);
    socket.send(message);
  }
};
