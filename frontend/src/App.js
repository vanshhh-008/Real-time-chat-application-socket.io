import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Chats from "./Chats";
import ChatProvider from "./context/chatProvider";

function App() {
  return (

      <ChatProvider>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chats" element={<Chats />} />
        </Routes>
      </ChatProvider>
  
  );
}

export default App;
