const WebSocket = require('ws');
const axios = require('axios');

module.exports = (server) => {
  // Create a new instance of the WebSocket server
  const wss = new WebSocket.Server({ server, path: '/socket.io' });

  // Listen for a new connection
  wss.on('connection', (socket) => {
    // Log the unique ID of the new client
    console.log(`New client connected with id ${socket._socket.remoteAddress}:${socket._socket.remotePort}`);

    // Initialize the hasRegistered property for the new client
    socket.hasRegistered = false;

    // Initialize the userDetails property for the new client
    socket.userDetails = null;

    // Listen for messages from the client
    socket.on('message', (message) => {
      const data = JSON.parse(message);

      // Handle different types of messages
      switch (data.event) {
        case 'registered':
          // Log the unique ID of the registered client
          console.log(`Client with id ${socket._socket.remoteAddress}:${socket._socket.remotePort} is registered.`);

          // Set the hasRegistered property to true when the client registers
          socket.hasRegistered = true;
          break;

        case 'userDetails':
          // Store the userDetails on the socket
          // userDetails should be an object with phoneNumber and name properties
          socket.userDetails = data.payload;
          break;

        default:
          // Handle unrecognized events
          console.log(`Received unrecognized event from client with id ${socket._socket.remoteAddress}:${socket._socket.remotePort}`);
          break;
      }
    });

    // Listen for the 'close' event
    socket.on('close', () => {
      // Log the unique ID of the disconnected client
      console.log(`Client with id ${socket._socket.remoteAddress}:${socket._socket.remotePort} disconnected`);

      // After a delay, check if the client has registered
      setTimeout(async () => {
        if (!socket.hasRegistered) {
          // If the client did not register, log their unique ID and send an API request
          console.log(`Client with id ${socket._socket.remoteAddress}:${socket._socket.remotePort} did not register. Perform the action here.`);
          try {
            const payload = {
              chat_id: socket.userDetails ? socket.userDetails.chat_id : null,
              caption: socket.userDetails ? socket.userDetails.caption : null,
            };

            // Send a POST request to the specified URL with the payload
            await axios.post(`https://api.whatsgenie.com/send_message?access_token=${socket.userDetails ? socket.userDetails.access_token : ""}&instance_id=${socket.userDetails ? socket.userDetails.instance_id : ""}`, payload);
          } catch (error) {
            // If the API request fails, log the error
            console.error('API Request Error:', error);
          }
        }
      }, 10000); // The delay is 10 seconds
    });

    // Listen for the 'error' event
    socket.on('error', (error) => {
      // If an error occurs, log the error
      console.error('Socket error:', error);
    });
  });
};
