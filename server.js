const http = require('http');
const app = require('./app');

let port = process.env.PORT || 8080;

app.set('port', port);
const server = http.createServer(app);

server.listen(port, (err, res) => {
  console.log(`Listening on port ${port}`)
});