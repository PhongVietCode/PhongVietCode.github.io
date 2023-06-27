const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: ['https://digitalauto.netlify.app/model/YzJQXfPlhrHlgmi3cM0t/library/prototype/WJUzIMs8ye6uOajo3sTk/view/run']
});
let i = 0;
let clientLocation = [];
io.on('connection', (socket) => {
    // console.log(`user connected ${socket.id}`)
  socket.emit("connected", socket.id);
  
  socket.on("initLoc", (clientLoc) => {
    var index = clientLocation.map(function(e) {
      return e.id;
    }).indexOf(clientLoc.id);

    if(index == -1 && clientLoc.loc != null)
      clientLocation.push(clientLoc);
    else {
      clientLocation.splice(index, 1, clientLoc);
    }
    console.log("-----USER-SOCKET-ID-----")
    console.log(clientLocation)
    console.log("--------------------")
  })
  socket.on("updateLoc", (clientLoc) => {
    var index = clientLocation.map(function(e) {
          return e.id;
    }).indexOf(clientLoc.id);
    clientLocation.splice(index, 1, clientLoc);
  });

  socket.on('disconnect', () => {
    console.log(socket.id + " has disconnect");
    var index = clientLocation.map(function(e) {
      return e.id;
    }).indexOf(socket.id);
    clientLocation.splice(index, 1);
    console.log("-----USER-SOCKET-ID-----")
    console.log(clientLocation)
    console.log("--------------------")
  });
  i = io.engine.clientsCount;
  console.log(`client: ${io.engine.clientsCount}`)
})
server.listen(3000, () => {
  console.log('listening on *:3000');
});
