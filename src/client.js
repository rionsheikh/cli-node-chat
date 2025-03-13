const net = require("net");
const readline = require("readline/promises");

const PORT = 3000;
const HOST = "127.0.0.1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = net.createConnection({ host: HOST, port: PORT }, async () => {
  console.log("Connected to the server!");

  let clientId = null;

  const sendMessage = async () => {
    const message = await rl.question("Your message ❯ ");
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
        console.log(`Your User ID is ${clientId}`);
      } else {
        if (recievedData.clientId !== clientId) {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0); 

          console.log(`${recievedData.clientId} : ${recievedData.message}`);
        }
      }
      sendMessage();
    } catch (err) {
      console.log("Connection error!");
      process.exit(1);
    }
  });

  socket.on("end", () => {
    console.log("Connection closed!");
    process.exit(0)
  });

  socket.on("error",(err)=>{
    console.log("Error!")
    process.exit(1)
  })
});
