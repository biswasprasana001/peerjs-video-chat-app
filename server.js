// server.js

// Import the express module
const express = require('express')

// Create a new express application
const app = express()

// Create a new HTTP server and pass the express app to it
const server = require('http').Server(app)

// Create a new Socket.IO instance and pass the HTTP server to it
const io = require('socket.io')(server)

// Import the UUID module
const { v4: uuidV4 } = require('uuid')

// Set the view engine to EJS
app.set('view engine', 'ejs')

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Define a route handler for the home page
app.get('/', (req, res) => {
  // Redirect to a new room
  res.redirect(`/${uuidV4()}`)
})

// Define a route handler for rooms
app.get('/:room', (req, res) => {
  // Render the room view and pass the room ID to it
  res.render('room', { roomId: req.params.room })
})

// When a client connects
io.on('connection', socket => {
  // When a client wants to join a room
  socket.on('join-room', (roomId, userId) => {
    // Join the room
    socket.join(roomId)

    // Notify the other clients in the room that a new user has connected
    socket.broadcast.to(roomId).emit('user-connected', userId)

    // When the client disconnects
    socket.on('disconnect', () => {
      // Notify the other clients in the room that the user has disconnected
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})

// Start the server on port 3000
server.listen(3000)