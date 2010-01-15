var tcp = require('tcp'),
    sys = require('sys'),

    // what the request headers should match
    requestHeaders = new RegExp(
      "^GET (\/[^\s]*) HTTP\/1\.1\r\n" +
      "Upgrade: WebSocket\r\n" +
      "Connection: Upgrade\r\n" +
      "Host: (.+)\r\n" +
      "Origin: (.+)\r\n\r\n"
    ),

    // what the response headers should be
    responseHeaders =
      "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
      "Upgrade: WebSocket\r\n" +
      "Connection: Upgrade\r\n" +
      "WebSocket-Origin: {origin}\r\n" +
      "WebSocket-Location: {protocol}://{host}{resource}\r\n\r\n";

exports.createServer = function (on_connect) {
  var server = tcp.createServer(function (socket) {
    socket.setTimeout(0);

    var websocket = new process.EventEmitter();

    // Wrap some of the tcp socket methods.
    websocket.send = function (data) {
      try {
        sys.debug(sys.inspect(data));
        socket.send('\u0000' + data + '\uffff');
      } catch(e) {
        sys.debug(sys.inspect(e));
        if (e.message === 'Socket is not open for writing') {
          setTimeout(function () {
            websocket.send(data);
          }, 100);
        } else {
          throw e;
        }
      }
    };
    websocket.close = function () {
      socket.close();
    };

    socket.setEncoding("utf8");

    socket.addListener("receive", function (data) {
      var matches = data.match(requestHeaders);
      var chunks;
      if (matches) {
        handshake(matches);

        on_connect(websocket);
      } else {
        chunks = data.split('\ufffd');
        chunks.pop();
        chunks.forEach(function (chunk) {
          if (chunk[0] != '\u0000') {
            throw "Invalid chunk";
          }
          websocket.emit('receive', chunk.substr(1, chunk.length));
        });
      }
    });

    socket.addListener("eof", function () {
      websocket.emit('eof');
    });

    function handshake(matches) {
      var response = responseHeaders.
        replace("{resource}", matches[1]).
        replace("{host}", matches[2]).
        replace("{origin}", matches[3]).
        replace("{protocol}", 'ws')
      socket.send(response);
    }

  });

  return {
    listen: function (port, host) {
      server.listen(port || 8080, host || "127.0.0.1");
    }
  };
};
