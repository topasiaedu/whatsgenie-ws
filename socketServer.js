const socketIO = require('socket.io');
const axios = require('axios');

module.exports = (server) => {
  // Create a new instance of the Socket.io server
  const io = socketIO(server, {
    path: '/socket.io',
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST"]
    }
  });
  

  // Listen for a new connection
  io.on('connection', (socket) => {
    // Log the unique ID of the new client
    console.log(`New client connected with id ${socket.id}`);

    // Initialize the hasRegistered property for the new client
    socket.hasRegistered = false;

    // Initialize the userDetails property for the new client
    socket.userDetails = null;

    // Listen for the 'registered' event
    socket.on('registered', () => {
      // Log the unique ID of the registered client
      console.log(`Client with id ${socket.id} is registered.`);

      // Set the hasRegistered property to true when the client registers
      socket.hasRegistered = true;
    });

    // Listen for the 'userDetails' event
    socket.on('userDetails', (userDetails) => {
      // Store the userDetails on the socket
      // userDetails should be an object with phoneNumber and name properties
      socket.userDetails = userDetails;
    });

    // Listen for the 'disconnect' event
    socket.on('disconnect', () => {
      // Log the unique ID of the disconnected client
      console.log(`Client with id ${socket.id} disconnected`);

      // After a delay, check if the client has registered
      setTimeout(async () => {
        if (!socket.hasRegistered) {
          // If the client did not register, log their unique ID and send an API request
          console.log(`Client with id ${socket.id} did not register. Perform the action here.`);
          try {
            const payload = {
              message: `User with id ${socket.id} disconnected without registering`,
              sender: 'bot',
              // Include the phone number and name in the payload
              phoneNumber: socket.userDetails ? socket.userDetails.phoneNumber : null,
              name: socket.userDetails ? socket.userDetails.name : null,
            };

            // Send a POST request to the specified URL with the payload
            await axios.post('https://api.whatsgenie.com/send-message', payload);
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
