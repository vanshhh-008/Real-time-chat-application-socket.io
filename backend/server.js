const express = require('express');
const connectDB = require("./db");
const bodyParser = require('body-parser');
const AuthRouter = require('./routes/AuthRouter');
const chatRoutes = require('./chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 
app.use('/auth', AuthRouter);
app.use('/auth/chat',chatRoutes);
app.use('/auth/message',messageRoutes);
const dotenv = require('dotenv');
dotenv.config();


connectDB();
const PORT = process.env.PORT || 9000;

const server = app.listen(9000,console.log(`Server started on port ${PORT}`));

const io = require('socket.io')(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000",

    }
})

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id); 
        socket.emit("connected");
      });
      
    socket.on('join chat',(room)=>{

        socket.join(room);
        console.log("User Joined Room = " + room);
    })

    socket.on("typing", ({ chatId, senderId }) => {
      socket.to(chatId).emit("typing", { chatId, senderId });
    });
    
    socket.on("stop typing", ({ chatId, senderId }) => {
      socket.to(chatId).emit("stop typing", { chatId, senderId });
    });
    



    socket.on('new message', (newMessageReceived) => {
        const chat = newMessageReceived.chat;
      
        if (!chat?.users) {
          console.log(" newMessageReceived.chat.users not defined");
          return;
        }
      
        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;
      
          console.log(`Sending message to user ${user._id}`);
          socket.to(user._id).emit('Message Received', newMessageReceived); 
        });
      });
      
      
      
    
  });