const http = require('http');
const app = require('./app');

let port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, function () {
  console.log("The YelpCamp Server Has Started!");
});

//server.listen();

