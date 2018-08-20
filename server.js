const http = require('http');
const app = require('./app');

let port = process.env.PORT || 3000 ;
app.set('port', port);
const server = http.createServer(app);

let io = require('socket.io').listen(server);
module.exports.io = io;
// io.sockets.on('connection',(socket) => {

//   socket.on('sending message', (bar_info) => {
//      io.sockets.emit('new message', bar_info);
//   });
// });


server.listen(port, (err, res) => {
  console.log(res,port)
});