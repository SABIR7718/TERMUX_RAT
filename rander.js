const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 8000 });

let devices = {};
let admins = [];

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    // Device connected
    if (data.type === "register_device") {
      devices[data.id] = ws;
      console.log(`Device connected: ${data.id}`);
      broadcastAdmins();
    }

    // Admin connected
    if (data.type === "register_admin") {
      admins.push(ws);
      console.log("Admin connected");
      ws.send(JSON.stringify({ type: "device_list", devices: Object.keys(devices) }));
    }

    // Admin sent command → forward to device
    if (data.type === "command" && devices[data.id]) {
      devices[data.id].send(JSON.stringify({ type: "command", command: data.command }));
    }

    // Device sent output → forward to admin
    if (data.type === "output") {
      admins.forEach((admin) => {
        admin.send(JSON.stringify({ type: "device_output", id: data.id, output: data.output }));
      });
    }
  });

  ws.on("close", () => {
    // remove closed device or admin
    Object.keys(devices).forEach((id) => {
      if (devices[id] === ws) {
        delete devices[id];
        console.log(`Device disconnected: ${id}`);
      }
    });
    admins = admins.filter((a) => a !== ws);
    broadcastAdmins();
  });
});

function broadcastAdmins() {
  admins.forEach((admin) => {
    admin.send(JSON.stringify({ type: "device_list", devices: Object.keys(devices) }));
  });
}

console.log("Server started on port", process.env.PORT || 8000);
