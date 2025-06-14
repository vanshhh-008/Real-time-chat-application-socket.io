import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './Auth/Login'; 
import Signup from './Auth/Signup';
import Chats from './Chats';
import ChatProvider from './context/chatProvider'; 
import RefreshHandler from './RefreshHandler';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ChatProvider>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chats"
          element={
            isAuthenticated ? <Chats /> : <Navigate to="/" />
          }
        />
      </Routes>
    </ChatProvider>
  );
}

export default App;
