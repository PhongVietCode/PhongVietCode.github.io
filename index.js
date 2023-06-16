const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: ['https://digitalauto.netlify.app/model/gvizddVi65gftkk3a1GO/library/prototype/6CfdPB3AMp0yoNPlC4D1/view/run']
});
let baseInfo = [
                {name: "car1", des: { lat: 10.772792, lng:  106.656383 }, location: {lat: 10.772597,lng:  106.655907}, heading: 70, rv: false },
                {name: "car2", des: { lat: 10.772864790082545,  lng: 106.65601236901561}, location: {lat: 10.772497248846493, lng: 106.65615661445692}, heading: 340, rv: false },
                {name: "car3", location: { lat: 10.772864790082545,  lng: 106.65601236901561}, des: {lat: 10.772497248846493, lng: 106.65615661445692}, heading: 160, rv: true },
                {name: "car4", location: { lat: 10.772792, lng:  106.656383 }, des: {lat: 10.772597,lng:  106.655907}, heading: 250, rv: true },
                ];
let i = 0;
let markers = [];
io.on('connection',(socket)=> {
  console.log(`user connected ${socket.id}`)
  socket.on("requestMarker", () => {
    markers.push(baseInfo[i]);
    while (markers.length > io.engine.clientsCount) {
      markers.pop();
    }
    socket.emit("getMarker", baseInfo[i]); // 1. give the only one client the marker
    socket.broadcast.emit("sendMarker", baseInfo[i]); //2. truyen marker di
    // i = (i + 1) % baseInfo.length;
  })

  socket.on("requestUpdate", () => {
    socket.emit("addNearby", markers); // 3. give the recent the marker list
  })
  setInterval(function() {
    io.sockets.emit("addNearby", markers);
  }, 3000)
  i = io.engine.clientsCount - 1;
  
  console.log(`client: ${io.engine.clientsCount}, marker count: ${markers.length} ${i}`)
  console.log(markers)
})
server.listen(3000, () => {
  console.log('listening on *:3000');
});
