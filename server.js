const http = require('http');
const app = require('./app');

let port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

app.set('port', port);
const server = http.createServer(app);

let io = require('socket.io').listen(server);
module.exports.io = io;
// io.sockets.on('connection',(socket) => {

//   socket.on('sending message', (bar_info) => {
//      io.sockets.emit('new message', bar_info);
//   });
// });


server.listen(port, ipaddress, (err, res) => {
  console.log(`Listening on ${ipaddress}, port ${port}`)
});