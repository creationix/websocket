var net = require('net'),
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
      "WebSocket-Location: {protocol}://{host}{resource}\r\n\r\n",

    // Initial policy request from flash
    // TODO: find a safer match that won't grab text in the data stream
    policyRequest = /policy-file-request/,

    // Policy file needed by flash based sockets
    policyXML =
      '<?xml version="1.0"?>' +
      '<!DOCTYPE cross-domain-policy SYSTEM ' +
      'ww.macromedia.com/xml/dtds/cross-domain-policy.dtd">' +
      '<cross-domain-policy>' +
      "<allow-access-from domain='*' to-ports='*'/>" +
      '</cross-domain-policy>';


exports.createServer = function (on_connect) {
  var server = net.createServer(function (socket) {
    socket.setTimeout(0);

    var websocket = new process.EventEmitter();

    // Wrap some of the tcp socket methods.
    websocket.write = function (data) {
      try {
        socket.write('\u0000', 'binary');
        socket.write(data, 'utf8');
        socket.write('\u00ff', 'binary');
      } catch(e) {
        e.message = e.message;
        sys.debug(sys.inspect(e));
        if (e.message === 'Socket is not open for writing') {
          setTimeout(function () {
            websocket.write(data);
          }, 100);
        } else {
          throw e;
        }
      }
    };
    websocket.end = function () {
      socket.end();
    };

    socket.setEncoding("utf8");

    socket.addListener('data', function (data) {
      var matches, chunks;

      if(data.match(policyRequest)) {
        socket.write(policyXML);
        socket.end();
        return;
      }

      matches = data.match(requestHeaders);
      if (matches) {
        handshake(matches);
        on_connect(websocket);
        return;
      }

      chunks = data.split('\ufffd');
      chunks.pop();
      chunks.forEach(function (chunk) {
        if (chunk[0] != '\u0000') {
          throw "Invalid chunk";
        }
        websocket.emit('data', chunk.substr(1, chunk.length));
      });
    });

    socket.addListener('end', function () {
      websocket.emit('end');
    });

    function handshake(matches) {
      var response = responseHeaders.
        replace("{resource}", matches[1]).
        replace("{host}", matches[2]).
        replace("{origin}", matches[3]).
        replace("{protocol}", 'ws');
      socket.write(response);
    }

  });

  return {
    listen: function (port, host) {
      server.listen(port || 8080, host || "127.0.0.1");
    }
  };
};
