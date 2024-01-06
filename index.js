const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const axios = require("axios");
const cors = require("cors");

const {
  CONNECTION,
  DISCONNECT,
  JOIN_EVENT,
  LEAVE_EVENT,
  NEW_MESSAGE
} = require("./utils/constants");
const { sendMessage } = require("./service/messaging.service");
dotenv.config();

const app = express();
app.use(cors());
var httpServer = http.createServer(app);
httpServer.listen(9090, () => {
  console.log("your socket listen at port 9090");
});

var io = require("socket.io")(httpServer, {
  reconnection: true
});

io.on(CONNECTION, (socket) => {
  const userID = socket.handshake.query["userID"];
  const token = socket.handshake.query["token"];
  socket.data.userID = userID;
  //   socket.data.token = token;
  console.log("user connected ...");
  socket.on(DISCONNECT, () => {
    try {
      console.log("disconnected user: ", userID);
    } catch (err) {
      console.error(err);
    }
    // Remove all event listeners from the socket to avoid a memory leak
    socket.removeAllListeners();
  });

  // When a user joins a room, have the socket join the room and emit a message to the room
  socket.on(JOIN_EVENT, ({ convId, userID }) => {
    try {
      console.log("socket of join ", socket.id);
      socket.join(convId);

      io.to(convId).emit(JOIN_EVENT, `hi, i'm : ${userID}`);
      console.log("A user joined chatroom: " + convId);
    } catch (err) {
      console.error(err);
    }
  });

  // When a user leaves a room, have the socket leave the room
  socket.on(LEAVE_EVENT, ({ convId }) => {
    try {
      socket.leave(convId);
      console.log("A user left chatroom: " + convId);
    } catch (err) {
      console.error(err);
    }
  });
  socket.on(NEW_MESSAGE, async ({ userID, eventId, convId, message }) => {
    console.log("a new message " + convId);
    const responseMessage = await sendMessage(eventId, convId, userID, message);
    const dataToSend = {
      userID: userID,
      convId: convId,
      message: message,
      eventId: eventId
    };
    console.log(responseMessage);
    io.to(convId).emit("new_message_sent", responseMessage["conversation"].messages);
    //socket.broadcast.to(convId).emit(NEW_MESSAGE, responseMessage["conversation"]); // this is broadcasting for a specefic room.
  });
});
