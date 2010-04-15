# WebSocket Server

`websocket` is a simple wrapper around tcp.createServer that abstracts away the details of a browser WebSocket.  It's designed to be a drop in replacement for a regular TCP server, but be accessible from a browser that supports WebSocket.

    var websocket = require("websocket");
    var server = websocket.createServer(function (socket) {

      socket.write("hello\r\n");

      socket.addListener("data", function (data) {
        socket.write(data);
      });
      socket.addListener("end", function () {
        socket.write("goodbye\r\n");
        socket.end();
      });
    });
    server.listen(7000, "localhost");
  
This implementation is quick and dirty and skips over a lot of details.  For example it doesn't validate any of the same origin stuff.

For a more fleshed out implementation, but with a larger api, please see <http://github.com/guille/node.websocket.js/>