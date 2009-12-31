# WebSocket Server

`websocket` is a simple wrapper around tcp.createServer that abstracts away the details of a browser WebSocket.  It's designed to be a drop in replacement for a regular TCP server, but be accessible from a browser that supports WebSocket.

    var websocket = require("websocket");
    var server = websocket.createServer(function (socket) {

      socket.addListener("connect", function () {
        socket.send("hello\r\n");
      });
      socket.addListener("receive", function (data) {
        socket.send(data);
      });
      socket.addListener("eof", function () {
        socket.send("goodbye\r\n");
        socket.close();
      });
    });
    server.listen(7000, "localhost");
  
This implementation is quick and dirty and skips over a lot of details.  For example it doesn't validate any of the same origin stuff.

For a more fleshed out implementation, but with a larger api, please see <http://github.com/guille/node.websocket.js/>