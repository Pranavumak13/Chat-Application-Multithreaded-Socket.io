document.addEventListener('DOMContentLoaded', () => {
  // Rest of your client-side code

const socket = io();

// client connected to server
socket.on("connect", () => {
  console.log(socket.id);
});

// msg from client
const sendButton = document.getElementById("send-message");
const messageInput = document.getElementById("message");

sendButton.addEventListener("click", () => {
  sendMessage();
});

// Detect Enter key press in the message input field
messageInput.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    // Check if the pressed key is Enter (key code 13)
    event.preventDefault(); // Prevent the default Enter key behavior (form submission)
    sendMessage();
  }
});

function sendMessage() {
  // Get the message from the input field
  const message = messageInput.value.trim(); // Trim any leading/trailing whitespace

  // Check if the message is not empty
  if (message !== "") {
    // Send the message to the server
    socket.emit("message", message);

    // Clear the input field
    messageInput.value = "";
  }
}

socket.on("historical_messages", (mssgs) => {
  // Display the broadcasted message in the UI
  for(let mssg of mssgs){
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("p");
    messageElement.textContent = "Message: " + mssg;
    messagesDiv.appendChild(messageElement);
  }
});


socket.on("broadcastMessage", (data) => {
  // Display the broadcasted message in the UI
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("p");
  messageElement.textContent = "Message: " + data;
  messagesDiv.appendChild(messageElement);
});

// msg from server | Handles multiple clients
// const listener = (eventName, ...args) => {
//   console.log(eventName, args);
// };

// socket.onAny(listener);


});