const socketIO = require('socket.io');
const axios = require('axios');

module.exports = (server) => {
  const io = socketIO(server, {
    path: '/socket.io',
    cors: {
      origin: "*",
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected with id ${socket.id}`);
    socket.emit('debug', `New client connected with id ${socket.id}`);

    socket.hasRegistered = false;
    socket.userDetails = null;

    socket.on('registered', () => {
      console.log(`Client with id ${socket.id} is registered.`);
      socket.emit('debug', `Client with id ${socket.id} is registered.`);
      socket.hasRegistered = true;
    });

    socket.on('userDetails', (userDetails) => {
      socket.userDetails = userDetails;
      socket.emit('debug', `Received userDetails: ${JSON.stringify(userDetails)}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client with id ${socket.id} disconnected`);
      socket.broadcast.emit('debug', `Client with id ${socket.id} disconnected`);

      setTimeout(async () => {
        if (!socket.hasRegistered) {
          console.log(`Client with id ${socket.id} did not register. Perform the action here.`);
          try {
            const payload = {
              chat_id: socket.userDetails ? socket.userDetails.chat_id : null,
              caption: socket.userDetails ? socket.userDetails.caption : null,
            };

            await axios.post(`https://api.whatsgenie.com/send_message?access_token=${socket.userDetails ? socket.userDetails.access_token : ""}&instance_id=${socket.userDetails ? socket.userDetails.instance_id : ""}`, payload);
          } catch (error) {
            console.error('API Request Error:', error);
          }
        }
      }, 10000);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('debug', `Socket error: ${error}`);
    });
  });
};
