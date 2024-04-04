// public\script.js

// Establish a connection to the server
const socket = io('/')

// Get the HTML element with the ID 'video-grid'
const videoGrid = document.getElementById('video-grid')

// Create a new Peer object
const myPeer = new Peer()

// Create a new video element
const myVideo = document.createElement('video')

// Mute our own video stream so we don't hear ourselves
myVideo.muted = true

// Create an object to keep track of peers
const peers = {}

// Request access to the user's video and audio
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  // Add our video stream to the video element and play it
  addVideoStream(myVideo, stream)

  // When we receive a call
  myPeer.on('call', call => {
    // Answer the call with our stream
    call.answer(stream)

    // Create a new video element
    const video = document.createElement('video')

    // When we receive their stream
    call.on('stream', userVideoStream => {
      // Add their video stream to the video element and play it
      addVideoStream(video, userVideoStream)
    })
  })

  // When a new user connects
  socket.on('user-connected', userId => {
    // Connect to the new user
    connectToNewUser(userId, stream)
  })
})

// When a user disconnects
socket.on('user-disconnected', userId => {
  // If we have information on that peer, close the connection
  if (peers[userId]) peers[userId].close()
})

// When our peer connection is open
myPeer.on('open', id => {
  // Join the room and send our ID
  socket.emit('join-room', ROOM_ID, id)
})

// Function to connect to a new user
function connectToNewUser(userId, stream) {
  // Call the new user with our stream
  const call = myPeer.call(userId, stream)

  // Create a new video element
  const video = document.createElement('video')

  // When we receive their stream
  call.on('stream', userVideoStream => {
    // Add their video stream to the video element and play it
    addVideoStream(video, userVideoStream)
  })

  // When the call ends
  call.on('close', () => {
    // Remove their video element
    video.remove()
  })

  // Add the call to our peers object
  peers[userId] = call
}

// Function to add a video stream
function addVideoStream(video, stream) {
  // Set the source of the video element to our stream
  video.srcObject = stream

  // When the video data is loaded
  video.addEventListener('loadedmetadata', () => {
    // Play the video
    video.play()
  })

  // Add the video element to the video grid
  videoGrid.append(video)
}