import React, { useEffect, useState, useRef } from "react";
import { ChatState } from "../context/chatProvider";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Lottie from "react-lottie";
import "./Spinner2.css";
import { io } from "socket.io-client";
import { useMediaQuery } from "react-responsive";
import { IoSend } from "react-icons/io5";
import ScrollableFeed from "react-scrollable-feed";
import { FaEye, FaArrowLeft } from "react-icons/fa";
import { getSender, getSenderEmail, getSenderPic } from "../config/ChatLogics";
import Avatar from "react-avatar";
import GroupChatModal from "./GroupChatModel";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import animationData from "../animations/typing.json"
const ENDPOINT = "https://real-time-chat-application-socket-io-17xp.onrender.com";
let selectedChatCompare;

const MyChats = () => {
  const [loggedUser, setLoggedUser] = useState("");
  const [picPresent, setPic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [socket, setSocket] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingChatId, setTypingChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const lastTypingTimeRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDesktop = useMediaQuery({ minWidth: 768 });

  const {
    selectedChat,
    setSelectedChat,
    profileDialogGroup,
    setProfileDialogGroup,
    chats,
    setChats,
    spin,
    setSpin,
    container,
    setContainer,
    container2,
    setContainer2,
    notifications,
    setNotifications    
  } = ChatState();

  const defaultOptions = {
    loop:true,
    autoplay:true,
    animationData:animationData,
    rendererSettings:{
preserveAspectRatio:"xMidYMid slice",
    }
  }
  const token = localStorage.getItem("token");
  const getId = localStorage.getItem("id");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const user = localStorage.getItem("LoggedInUser");
    const pic = localStorage.getItem("pic");
    if (pic && pic !== "null") setPic(pic);
    setLoggedUser(user);
    fetchChats();
  }, []);

  useEffect(() => {
    const newSocket = io(ENDPOINT, {
      transports: ["websocket"],  
      withCredentials: true,     
    });
    setSocket(newSocket);
  
    newSocket.emit("setup", {
      _id: getId,
      name: loggedUser,
      email,
      pic: picPresent,
    });

    newSocket.on("connected", () => setSocketConnected(true));

    return () => {
      newSocket.disconnect();
    };
  }, [getId, loggedUser, email, picPresent]);

  useEffect(() => {
    if (!socket) return;
  
    socket.on("typing", (data) => {
      if (!data) return;
      const { chatId, senderId } = data;
      if (chatId === selectedChat?._id && senderId !== getId) {
        setTypingChatId(chatId);
        setIsTyping(true);
      }
    });
  
    socket.on("stop typing", (data) => {
      if (!data) return;
      const { chatId, senderId } = data;
      if (chatId === selectedChat?._id && senderId !== getId) {
        setTypingChatId(null);
        setIsTyping(false);
      }
    });
  
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat]);
  

  useEffect(() => {
    if (!socket) return;

    socket.on("Message Received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Optional: show notification
        if(!notifications.includes(newMessageReceived)){
          setNotifications([newMessageReceived,...notifications]);
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    return () => socket.off("Message Received");
  }, [socket, selectedChat]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);


  console.log("notifications-------",notifications)
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `https://real-time-chat-application-socket-io-17xp.onrender.com/auth/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoadingChat(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Error in fetching messages");
      setLoadingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessages.trim()) {
      toast.error("Cannot send empty message");
      return;
    }
    setIsTyping(false);
    socket.emit("stop typing", {
      chatId: selectedChat._id,
      senderId: getId,
    });
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      setLoadingChat(true);
      const { data } = await axios.post(
        "https://real-time-chat-application-socket-io-17xp.onrender.com/auth/message",
        {
          content: newMessages,
          chatId: selectedChat._id,
        },
        config
      );

      data.chat = selectedChat;
      socket.emit("new message", data);
     
      setMessages((prevMessages) => [...prevMessages, data]);
      setNewMessages("");
      setLoadingChat(false);
    } catch (error) {
      toast.error("Error Occurred");
      setLoadingChat(false);
    }
  };
  const typingHandler = (e) => {
    setNewMessages(e.target.value);
  
    if (!socketConnected) return;
  
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: selectedChat._id,
        senderId: getId,
      });
    }
  
    if (lastTypingTimeRef.current) clearTimeout(lastTypingTimeRef.current);
  
    lastTypingTimeRef.current = setTimeout(() => {
      socket.emit("stop typing", {
        chatId: selectedChat._id,
        senderId: getId,
      });
      setTyping(false);
    }, 3000);
  };
  


  const fetchChats = async () => {
    try {
      setSpin(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get("https://real-time-chat-application-socket-io-17xp.onrender.com/auth/chat", config);
      setChats(data);
      setSpin(false);
      setContainer(false);
      setContainer2(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setSpin(false);
    }
  };

  const getChatStyle = (isSelected) => ({
    cursor: "pointer",
    backgroundColor: isSelected ? "#38B2AC" : "#E8E8E8",
    color: isSelected ? "white" : "black",
    borderRadius: "10px",
    marginTop: "3%",
    height: "65px",
    padding: "5px 10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });

  useEffect(() => {
    return () => {
      if (socket) {
        socket.off("connected");
        socket.off("Message Received");
      }
    };
  }, [socket]);




  return (
    <>
      <Toaster />
      {isGroupModalOpen && <GroupChatModal onClose={() => setIsGroupModalOpen(false)} />}

      {selectedChat ? (
        <>
          {isMobile &&(
            container ? (
              <div className="chat-container" style={{ paddingTop: "75px" }}>
                <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>My Chats</h3>
                  <button
                    className="group-chat-btn"
                    onClick={() => setIsGroupModalOpen(true)}
                  >
                    <i className="fas fa-plus"></i> Create Group Chat
                  </button>
                </div>

                {chats && chats.length > 0 ? (
                  <div style={{ overflowY: "auto", height: "91.5vh" }}>
                    {chats.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          setContainer(false);
                        }}
                        style={getChatStyle(selectedChat?._id === chat._id)}
                      >
                        <Avatar
                          src={
                            !chat.isGroupChat
                              ? getSenderPic(loggedUser, chat.users)
                              : chat.pic
                          }
                          name={
                            !chat.isGroupChat
                              ? getSender(loggedUser, chat.users)
                              : chat.chatName
                          }
                          size="40"
                          round
                        />
                        <div>
                          <h5 style={{ margin: 0 }}>
                            {!chat.isGroupChat
                              ? getSender(loggedUser, chat.users)
                              : chat.chatName}
                          </h5>
                          <strong>Sender: {loggedUser}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No chats available</p>
                )}
              </div>
            ) : (
              <div className="chat-container2" style={{ marginTop: "75px" }}>
                <div className="chat-header2">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      style={{ borderRadius: "15px" }}
                      onClick={() => setContainer(true)}
                    >
                      <FaArrowLeft style={{ fontSize: "25px" }} />
                    </button>

                    <strong style={{ marginLeft: "5%", fontSize: "30px" }}>
                      {!selectedChat.isGroupChat
                        ? getSender(loggedUser, selectedChat.users)
                        : selectedChat.chatName.toUpperCase()}
                    </strong>

                    {!selectedChat.isGroupChat ? (
                      <>
                        <button style={{ borderRadius: "15px" }}>
                          <FaEye
                            style={{ fontSize: "20px" }}
                            onClick={() => setProfileDialog(true)}
                          />
                        </button>
                        {profileDialog && (
                          <div className="modal-overlay">
                            <div className="modal-content">
                              <h2 style={{ textAlign: "center" }}>Profile Details</h2>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  marginTop: "50px",
                                }}
                              >
                                <Avatar
                                  src={
                                    !selectedChat.isGroupChat
                                      ? getSenderPic(loggedUser, selectedChat.users)
                                      : selectedChat.pic
                                  }
                                  name={
                                    !selectedChat.isGroupChat
                                      ? getSender(loggedUser, selectedChat.users)
                                      : selectedChat.chatName
                                  }
                                  size="120"
                                  round
                                />
                                <div
                                  style={{
                                    marginTop: "20px",
                                    textAlign: "center",
                                  }}
                                >
                                  <strong
                                    style={{
                                      fontSize: "28px",
                                      display: "block",
                                      marginBottom: "10px",
                                    }}
                                  >
                                    Username:{" "}
                                    {!selectedChat.isGroupChat
                                      ? getSender(loggedUser, selectedChat.users)
                                      : selectedChat.chatName.toUpperCase()}
                                  </strong>
                                  <strong
                                    style={{
                                      fontSize: "24px",
                                      color: "gray",
                                    }}
                                  >
                                    Email:{" "}
                                    {!selectedChat.isGroupChat
                                      ? getSenderEmail(loggedUser, selectedChat.users)
                                      : "GROUP@CHAT.COM"}
                                  </strong>
                                </div>
                              </div>

                              <button
                                className="btn btn-danger"
                                style={{ marginTop: "5%" }}
                                onClick={() => setProfileDialog(false)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <button style={{ borderRadius: "15px" }}>
                          <FaEye
                            style={{ fontSize: "20px" }}
                            onClick={() => setProfileDialogGroup(true)}
                          />
                        </button>

                        {profileDialogGroup && (
                          <div className="modal-overlay">
                            <div className="modal-content">
                              <UpdateGroupChatModel fetchMessages={fetchMessages} />
                              <button
                                className="btn btn-danger"
                                style={{ marginTop: "5%" }}
                                onClick={() => setProfileDialogGroup(false)}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="box">
                  {loadingChat ? (
                    <div className="spinner-container mt-3">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <ScrollableFeed>
                    {messages &&
                      messages.map((m) => {
                        const isSender = m.sender?._id === getId;
                  
                        return (
                          <div
                            key={m._id}
                            style={{
                              display: "flex",
                              justifyContent: isSender ? "flex-end" : "flex-start",
                              marginBottom: "10px",
                              padding: "0 10px",
                            }}
                          >
                            {!isSender && (
                              <Avatar
                                src={m.sender?.pic || ""}
                                name={m.sender?.name || "User"}
                                size="35"
                                round
                                style={{ marginRight: "10px" }}
                              />
                            )}
                  
                            <div
                              style={{
                                backgroundColor: isSender ? "#DCF8C6" : "#E8E8E8",
                                color: "black",
                                borderRadius: "15px",
                                padding: "10px 15px",
                                maxWidth: "65%",
                                wordWrap: "break-word",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "5px" }}>
                                {m.sender?.name}
                              </div>
                              <div style={{ fontSize: "16px" }}>{m.content}</div>
                            </div>
                  
                            {isSender && (
                              <Avatar
                                src={m.sender?.pic || ""}
                                name={m.sender?.name || "User"}
                                size="35"
                                round
                                style={{ marginLeft: "10px" }}
                              />
                            )}
                          </div>
                        );
                      })}
                  </ScrollableFeed>
                  
                  )}

                  
{isTyping && selectedChat && typingChatId === selectedChat._id && (
  <div className="d-flex justify-content-around">
     <Avatar
                                 src={
                                  getSenderPic(loggedUser, selectedChat.users)
                              }
                              name={
                               
                                  getSender(loggedUser, selectedChat.users)
                                 
                              }
                                  size="35"
                                  round
                                />
 
  <div className="typing-indicator">
    <div className="typing-indicator-bubble">
      <Lottie
        options={defaultOptions}
        width={60}
        height={35}
      />
    </div>
  </div>
 
  </div>
)}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    marginTop: "10px",
                  }}
                >


                  <input
                    placeholder="Enter your message"
                    value={newMessages}
                    onChange={typingHandler}
                    style={{
                      flexGrow: 1,
                      marginRight: "10px",
                      height: "40px",
                      padding: "12px 10px",
                      fontSize: "20px",
                      borderRadius: "10px",
                      border: "1px solid gray",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      fontSize: '24px',
                      height: '40px',
                      width: '50px',
                      color: 'white',
                      cursor: 'pointer',
                      backgroundColor: '#38B2AC',
                      padding: '15px 18px',
                      // borderRadius: '50%',
                      // border: '2px solid #2C7A7B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                     
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <IoSend />
                  </button>
                </div>
              </div>
            )
          )}



{isDesktop && (
            <>
              <div className="chat-container" style={{marginTop:'75px'}}>
                <div className="chat-header">
                  <h3>My Chats</h3>
                  <button className="group-chat-btn" onClick={() => setIsGroupModalOpen(true)}> 
                    <i className="fas fa-plus"></i> Create Group Chat
                  </button>
                </div>

                {chats ? (
                  <div style={{ overflowY: "auto" ,maxHeight: "520px"}}>
                    {chats.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          setContainer2(true);  
                        }}
                        style={getChatStyle(selectedChat?._id === chat._id)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar
                            src={!chat.isGroupChat ? getSenderPic(loggedUser, chat.users) : chat.pic}
                            name={!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                            size="40"
                            round
                          />
                          <div>
                            <h5 style={{ margin: 0 }}>{!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}</h5>
                            <strong>Sender: {loggedUser}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No chats available</p>
                )}
              </div>
{container2 &&(
              <div className="chat-container2" style={{marginTop:'75px'}}>
<div className="chat-header2">



 <div className="chat-header2">
  <div className="chat-header2-inner">
    <div className="left-section">
      <Avatar
        src={!selectedChat.isGroupChat ? getSenderPic(loggedUser, selectedChat.users) : selectedChat.pic}
        name={!selectedChat.isGroupChat ? getSender(loggedUser, selectedChat.users) : selectedChat.chatName}
        size="45"
        round
      />
    </div>

    <div className="center-section">
      <strong style={{ fontSize: '28px' }}>
        {!selectedChat.isGroupChat
          ? getSender(loggedUser, selectedChat.users)
          : selectedChat.chatName.toUpperCase()}
      </strong>
    </div>

    <div className="right-section">
    {!selectedChat.isGroupChat?(
<>
<button style={{borderRadius:'15px'}}><FaEye style={{fontSize:'20px'}} onClick={()=> setProfileDialog(true)}/></button>
{profileDialog && (

  <div className="modal-overlay">
<div className="modal-content">

<h2 style={{textAlign:'center'}}>Profile Details</h2>

<div style={{ alignItems: "center" }}>
<div style={{
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
marginTop: '50px'
}}>
<Avatar
src={!selectedChat.isGroupChat ? getSenderPic(loggedUser, selectedChat.users) : selectedChat.pic}
name={!selectedChat.isGroupChat ? getSender(loggedUser, selectedChat.users) : selectedChat.chatName}
size="120"
round
/>

<div style={{ marginTop: '20px', textAlign: 'center' }}>
<strong style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>
  Username: {!selectedChat.isGroupChat 
    ? getSender(loggedUser, selectedChat.users) 
    : selectedChat.chatName.toUpperCase()}
</strong>

<strong style={{ fontSize: '24px', color: 'gray' }}>
  Email: {!selectedChat.isGroupChat 
    ? getSenderEmail(loggedUser, selectedChat.users) 
    : "GROUP@CHAT.COM" }
</strong>
</div>
</div>

</div>
    <button className='btn btn-danger' style={{marginTop:'5%'}} onClick={()=>setProfileDialog(false)}>Close</button>
</div>
</div>
)}
</>

):(

  <>
<button style={{borderRadius:'15px'}}><FaEye style={{fontSize:'20px'}} onClick={()=> setProfileDialogGroup(true)}/></button>


{profileDialogGroup && (
  <div className='modal-overlay'>
  <div className='modal-content'>
  <UpdateGroupChatModel fetchMessages={fetchMessages}/>
<button className='btn btn-danger' style={{marginTop:'5%'}} onClick={()=>setProfileDialogGroup(false)}>Close</button>
</div>
</div>

)}


</>

)}



    </div>
  </div>
</div>


  







<div className="box">
                  {loadingChat ? (
                    <div className="spinner-container mt-3">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <ScrollableFeed>
                {messages && messages.map((m) => {
  const isSender = m.sender?._id === getId;

  return (
    <div
      key={m._id}
      style={{
        display: "flex",
        justifyContent: isSender ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        marginBottom: "15px",
      }}
    >
      {!isSender && (
        <Avatar
          src={m.sender?.pic || ""}
          name={m.sender?.name || "User"}
          size="35"
          round
          style={{ marginRight: "10px", alignSelf: "flex-end" }}
        />
      )}

      <div
        style={{
          backgroundColor: isSender ? "#DCF8C6" : "#E8E8E8",
          color: "black",
          borderRadius: "15px",
          padding: "10px 15px",
          maxWidth: "60%",
          wordWrap: "break-word",
          textAlign: "left",
          marginLeft: isSender ? "auto" : "0",
          marginRight: isSender ? "0" : "auto",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "5px" }}>
          {m.sender?.name}
        </div>
        <div style={{ fontSize: "16px" }}>{m.content}</div>
      </div>

      {isSender && (
        <Avatar
          src={m.sender?.pic || ""}
          name={m.sender?.name || "User"}
          size="35"
          round
          style={{ marginLeft: "10px", alignSelf: "flex-end" }}
        />
      )}
    </div>
  );
})}

                  </ScrollableFeed>
                  
                  )}

{isTyping && selectedChat && typingChatId === selectedChat._id && (
  <div className="d-flex justify-content-around">
      <Avatar
                                  src={
                                      getSenderPic(loggedUser, selectedChat.users)
                                  }
                                  name={
                                   
                                      getSender(loggedUser, selectedChat.users)
                                     
                                  }
                                  size="35"
                                 
                                  round
                                />
  <div className="typing-indicator">
    <div className="typing-indicator-bubble">
      <Lottie
        options={defaultOptions}
        width={60}
        height={35}
      />
    </div>
  </div>

 
  </div>
)}
                </div>

<div className='d-flex justify-content-around' style={{ marginBottom: '20px', marginTop: '10px' }}>
  

                <input
                  placeholder='Enter your message'
                  value={newMessages}
                  onChange={typingHandler}
                  style={{
                    marginBottom: '5%',
                    height: '40px',
                    width: '93%',
                    padding: '12px 10px',
                    fontSize: '20px',
                    borderRadius: '10px',
                    border: '1px solid gray',
                    margin: '1%',
                  }}
                />
                <button
                  onClick={sendMessage}
                  style={{
                    fontSize: '24px',
                    height: '40px',
                    width: '50px',
                    color: 'white',
                    cursor: 'pointer',
                    backgroundColor: '#38B2AC',
                    padding: '15px 18px',
                    // borderRadius: '50%',
                    // border: '2px solid #2C7A7B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <IoSend />
                </button>
              </div>



</div>

</div>
)}
            </>
          )}


        </>
      ) : (
        <>
                   {isMobile && (
                    <div className="chat-container" style={{marginTop:'75px'}}>
                     <div className="chat-header">
                       <h3>My Chats</h3>
                       <button className="group-chat-btn" onClick={() => setIsGroupModalOpen(true)}>
                         <i className="fas fa-plus"></i> Create Group Chat
                        </button>
                      </div>
                    </div>
                  )}
        
                  {isDesktop && (
                    <>
                     <div className="chat-container" style={{marginTop:'75px'}}>
                       <div className="chat-header">
                          <h3>My Chats</h3>
                         <button className="group-chat-btn" onClick={() => setIsGroupModalOpen(true)}>
                            <i className="fas fa-plus"></i> Create Group Chat
                          </button>
                        </div>
                      </div>
    
      <div className="chat-container3" style={{marginTop:'75px'}}>
                       <div className="chat-header3">
                      <div className="center-content">
                           <i className="fas fa-comment-alt"></i>
                        <span>Select User to Chat</span>
                         </div>
                        <hr />
                        </div>
                      </div>
      </>
                 )}
              </>
              )}
      </>
    
  );
};

export default MyChats;

