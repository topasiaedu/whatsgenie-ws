const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const socketServer = require("./socketServer"); // Import the Socket.io server
const express = require("express");
const port = process.env.PORT || 8000;

const app = express();

// Middleware: Morgan for logging HTTP requests
app.use(morgan("dev"));

// Middleware: Cookie Parser for parsing cookies
app.use(cookieParser());

// Middleware: CORS for enabling Cross-Origin Resource Sharing
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from all origins
      return callback(null, true);
    },
    credentials: true, // enable passing cookies from the client to the server
  })
);

// Middleware: Body Parser for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Return a json when the user hits the root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Socket.io server" });
});

// Start the server
const server = app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});

// Start the Socket.io server
socketServer(server);

module.exports = app;