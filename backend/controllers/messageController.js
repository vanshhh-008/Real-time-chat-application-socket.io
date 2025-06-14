const chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("INVALID DETAILS");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message,{
      path:'chat.users',
      select:'name pic email',
    })

    await chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.status(200).json(message); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// const sendMessage = async (req, res) => {
//   const { content, chatId } = req.body;

//   if (!content || !chatId) {
//     console.log("INVALID DETAILS");
//     return res.sendStatus(400);
//   }

//   const newMessage = {
//     sender: req.user._id,
//     content: content,
//     chat: chatId,
//   };

//   try {
//     let message = await Message.create(newMessage);

//     message = await message.populate("sender", "name pic");

//     // Manually fetch the chat with full user info
//     const fullChat = await chat.findById(chatId).populate("users", "name pic email");

//     message = message.toObject(); // convert from Mongoose doc to plain object
//     message.chat = fullChat; // override message.chat with full version

//     await chat.findByIdAndUpdate(chatId, {
//       latestMessage: message._id,
//     });

//     res.status(200).json(message); // fully enriched message
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to send message" });
//   }
// };


const allMessages = async(req,res)=>{
try{
       const messages = await Message.find({chat: req.params.chatId})
       .populate("sender","name pic email")
       .populate("chat")
       res.json(messages);
}
catch(error){
    console.log(error);
}
}

module.exports = { sendMessage ,allMessages};
