
if ("WebSocket" in window) {
  
  var ws;
  ws = new WebSocket("ws://127.0.0.1:8000/");

  ws.onopen = function () {
    console.log("Open");
    
    ws.send("I'm here");
    // Web Socket is connected. You can send data by send() method.
  };

  ws.onmessage = function (evt) {
    console.log(evt);
    var message = evt.data,
        box = document.getElementById('messages');
    box.innerHTML += message + "\n";
  };
  
  ws.onclose = function () { 
    // console.log("Socket Closed");
  };

  window.onload = function () {
    document.getElementById('form').onsubmit = function () {
      var field, value;
      field = this.message;
      value = field.value;
      field.value = "";
      field.focus();
      ws.send(value);
      return false;
    };
    document.getElementById("message").focus();
  };

} else {
  document.write("The browser doesn't support WebSocket.");
}

