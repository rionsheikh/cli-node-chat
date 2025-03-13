const net = require("net");
const crypto = require("crypto");

const PORT = 3000;
const HOST = "127.0.0.1";

const server = net.createServer();
const clients = [];

server.on("connection", (socket) => {
  const randomUUIDLength = 7;
  const clientId = crypto.randomUUID().slice(0, randomUUIDLength);

  socket.write(JSON.stringify({ idOnly: true, clientId: clientId }));
  clients.push({ clientId, socket });

  //Notify all other clients when new user joins
  setTimeout(() => {
    clients.map((client) => {
      if (client.socket !== socket) {
        client.socket.write(
          JSON.stringify({
            clientId: "Server",
            message: `New User  ${clientId} Joined`,
          })
        );
      }
    });
  }, 1);

  socket.on("data", (data) => {
    try {
      const parseData = JSON.parse(data.toString("utf-8").trim());
      const clientId = parseData.clientId;
      const message = parseData.message;

      if (message === "/users") {
        socket.write(
          JSON.stringify({
            clientId: "Server",
            message: `Connected Users \n ${clients
              .map((client) => client.clientId)
              .join("\n")}`,
          })
        );
        return;
      } else if (message === "/exit") {
        socket.end();
      }

      //Send private message
      if (message.startsWith("@") && message.length >= randomUUIDLength + 1) {
        const recipientId = message.substring(1, 8);
        const recipient = clients.find(
          (client) => client.clientId === recipientId
        );
        const recipientMessage = message + "_private";
        if (recipient) {
          recipient.socket.write(
            JSON.stringify({ clientId, message: recipientMessage })
          );

          socket.write(
            JSON.stringify({
              clientId: "Server",
              message: `Sent to ${recipientId} _private`,
            })
          );
        } else {
          socket.write(
            JSON.stringify({ clientId: "Server", message: "User not found! " })
          );
        }
      } else {
        clients.map((client) => {
          client.socket.write(JSON.stringify({ clientId, message }));
        });
      }
    } catch (error) {
      socket.write(
        JSON.stringify({ clientId: "Server", message: "An error occured " })
      );
    }
  });

  socket.on("end", () => {
    clients.splice(
      clients.findIndex((client) => client.socket == socket),
      1
    );
    clients.map((client) => {
      client.socket.write(
        JSON.stringify({
          clientId: "Server",
          message: `User ${clientId} has left the chat! `,
        })
      );
    });
  });

  socket.on("error", (err) => {
    socket.destroy();
    clients.splice(
      clients.findIndex((client) => client.socket === socket),
      1
    );
  });
});

server.listen(PORT, HOST, () => {
  console.log("Server is running on ", server.address());
});
