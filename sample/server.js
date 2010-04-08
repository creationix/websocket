// Run this file using node and then open index.html in a websocket enabled browser.
// Tested on latest Chrome under OSX.

var websocket = require('../lib/websocket'),
    sys = require('sys'),
    listeners = [],
    names = ["Bob", "Fred", "Jake", "John", "Peter", "Susan", "Jessica", "Nathan"],
    colors = ["red", "green", "blue", "orange", "purple", "black", "#08e", "#e80"];

websocket.createServer(function (socket) {

  // Assume an identity from the lists
  var self = {
    name: names.pop(),
    color: colors.pop()
  };
  // Recycle the name and color
  names.unshift(self.name);
  colors.unshift(self.color);

  sys.debug("New client connected");

  function on_message(data) {
    socket.write(data);
  }
  
  listeners.push(on_message);
  
  socket.addListener("data", function (data) {
    data = data.
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/\"/g, "&quot;");
    listeners.forEach(function (listener) {
      listener('<span style="color:' + self.color + ';">' + self.name + ": " + data + '</span>');
    });
  });

  socket.addListener("end", function () {
    sys.debug("Client left");
    // Remove this connection from the listeners array
    listeners.splice(listeners.indexOf(on_message), 1);
    // And close the connection
    socket.end();
  });
  
  // // Close the socket after 10 seconds
  // setTimeout(function () {
  //   socket.end();
  // }, 10000)

}).listen(8000, "0.0.0.0");
