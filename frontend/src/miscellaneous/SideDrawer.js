import React, { useEffect, useState } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import Avatar from 'react-avatar';
import toast, { Toaster } from "react-hot-toast";
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChatState } from '../context/chatProvider';
import "./Spinner.css"
import { RxCross1 } from "react-icons/rx";
import { getSender } from '../config/ChatLogics';

const SideDrawer = () => {
  const { setSelectedChat, chats, setChats, spin, setSpin,picPresent,setPic ,setContainer,setContainer2,notifications,setNotifications} = ChatState();
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const[not,setNot]  = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("LoggedInUser");
    const pic = localStorage.getItem("pic");

    if (pic && pic !== "null") {
      setPic(pic);
    }
    if (name) {
      setLoggedInUser(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("LoggedInUser");
    localStorage.removeItem("token");
    localStorage.removeItem("pic");
    window.location.href = "/login";
  };

  const token = localStorage.getItem("token");

  const handleSearch = async () => {
    if (!search) {
      toast.error("Enter something in search box");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`https://real-time-chat-application-socket-io-17xp.onrender.com/auth?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to load the data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post("https://real-time-chat-application-socket-io-17xp.onrender.com/auth/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);

      setContainer(true);
    
    } catch (error) {
      toast.error("Error in Fetching the Chat");
      console.log(error);
    } finally {
      setLoadingChat(false);
      setSearchBoxVisible(false); 
    }
  };

  return (
    <>
      <Toaster />
      <nav className="navbar navbar-light bg-light w-100 p-2"
       style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100, 
      }}
      
      
      
      >
        <div className="d-flex justify-content-between align-items-center w-100 flex-wrap">
          <button
            className="d-flex align-items-center gap-2"
            onClick={() => setSearchBoxVisible(true)}
          >
            <FaSearch style={{ color: 'black' }} />
            <span className='ml-2' style={{ color: 'black' }}>Search User</span>
          </button>

          {loggedInUser && (
  <div className="d-flex align-items-center gap-3 position-relative px-2">
<div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNot(true)}>
  <FaBell style={{ fontSize: '22px', color: 'black' }} />
  {notifications.length > 0 && (
    <div
      style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: 'red',
        color: 'white',
        borderRadius: '50%',
        width: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {notifications.length}
    </div>
  )}
</div>



    {not && (
      <div
        style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          maxHeight: '300px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          position: 'absolute',
          right: '0',
          top: '35px',
          zIndex: 999,
          width: '250px',
        }}
      >
        <div className="d-flex justify-content-between">
          <strong style={{ fontSize: '16px' }}>Notifications</strong>
          <RxCross1
            style={{ marginLeft: '15px', cursor: 'pointer' }}
            onClick={() => setNot(false)}
          />
        </div>

        {notifications.length === 0 ? (
          <span>No new messages</span>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                setSelectedChat(notif.chat);
                setNot(false);
                setNotifications((prev) =>
                  prev.filter((n) => n._id !== notif._id)
                );
              }}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '14px' }}>
                {notif.chat.isGroupChat
                  ? `📣 New message in ${notif.chat.chatName}`
                  : `💬 New message from ${getSender(loggedInUser, notif.chat.users)}`}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>
                {notif.content?.slice(0, 50)}
              </div>
            </div>
          ))
        )}
      </div>
    )}

    {/* Avatar + dropdown */}
    <div
      className="d-flex align-items-center gap-2"
      onClick={() => setShowDropdown(!showDropdown)}
      style={{ cursor: 'pointer' }}
    >
      <span className="text-sm text-dark px-2">{loggedInUser}</span>
      <Avatar
        name={loggedInUser}
        src={picPresent && picPresent !== "null" ? picPresent : undefined}
        size="35"
        round={true}
        style={{ marginRight: '5px' }}
      />
    </div>

    {showDropdown && (
      <div
        className="position-absolute bg-white border rounded shadow-sm"
        style={{ right: 0, top: '100%', zIndex: 10, minWidth: "100px" }}
      >
        <button
          className="w-100 text-start px-3 py-2 bg-white border-0"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    )}
  </div>
)}

        </div>
   
      </nav>
  
      <div
        className="position-fixed top-0 start-0 h-100 bg-white border-end shadow"
        style={{
          width: searchBoxVisible ? '300px' : '0',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          zIndex: 1050,
          padding: searchBoxVisible ? '20px' : '0',
        }}
      >
        <div className="d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-3" style={{paddingTop:'75px'}}>
            <h5>Search Users</h5>
            <button className="btn-close" onClick={() => setSearchBoxVisible(false)}>Back</button>
          </div>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Enter name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary ml-2" onClick={handleSearch}>
              Go
            </button>
          </div>

          <div className="overflow-auto">
            {loading ? (
              <Skeleton height={50} count={3} className="mb-2" />
            ) : (
              searchResult.map((user, index) => (
                <div
                  key={index}
                  className="p-2 mb-2 border rounded d-flex align-items-center justify-content-between"
                  style={{ cursor: 'pointer', opacity: loadingChat ? 0.6 : 1 }}
                  onClick={() => accessChat(user._id)}
                >
                  <div>
                  <Avatar name={user.name} src={user.pic} size="35"  round />
                    <strong style={{marginLeft:'5%'}}>{user.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.9rem' ,marginLeft:'25%'}}>{user.email}</div>
                  </div>
             
                </div>
              ))
            )}

            {loadingChat && (
              <div className="spinner-container mt-3">
                <div className="spinner"></div>
              </div>
            )}

            {spin && (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
