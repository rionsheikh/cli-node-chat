const net = require("net");
const readline = require("readline/promises");

const PORT = 3000;
const HOST = "127.0.0.1";
const colorText = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = net.createConnection({ host: HOST, port: PORT }, async () => {
  console.log(colorText("Connected to the server!",32));

  let clientId = null;

  const sendMessage = async () => {
    const message = await rl.question(colorText("Your message ❯ ",33));
    if (!message.trim()) {
      return sendMessage();
    }
    socket.write(JSON.stringify({ clientId, message }));
  };

  socket.on("data", (data) => {
    try {
      let recievedData = JSON.parse(data.toString("utf-8").trim());
      if (recievedData.idOnly) {
        clientId = recievedData.clientId;
        console.log(colorText(`Your User ID is ${clientId}`,32));
      } else {
        if (recievedData.clientId !== clientId) {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0); 

          console.log(colorText(recievedData.clientId,33)+" : "+ colorText(recievedData.message,1));
        }
      }
      sendMessage();
    } catch (err) {
      console.log(colorText("Connection error!",31));
      process.exit(1);
    }
  });

  socket.on("end", () => {
    console.log(colorText("Connection error!",31));
    process.exit(0)
  });

  socket.on("error",(err)=>{
    console.log(colorText("ERR!",31))
    process.exit(1)
  })
});
