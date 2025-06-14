import React, { useEffect, useState } from 'react';
import { ChatState } from '../context/chatProvider';
import './GroupChatModel.css';
import "./Spinner.css";
import Skeleton from 'react-loading-skeleton';
import { IoMdPersonAdd } from "react-icons/io";
import { IoCloseSharp } from 'react-icons/io5';
import { FaUserPlus } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";
import Avatar from 'react-avatar';
import { toast, Toaster } from 'react-hot-toast';
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import axios from 'axios';
import { RxCross1 } from "react-icons/rx";

const UpdateGroupChatModel = ({fetchMessages}) => {
  const [loading, setLoading] = useState(false);
  const [groupChatName, setGroupchatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);

  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    profileDialogGroup,
    setProfileDialogGroup,
    spin,
    setSpin
  } = ChatState();

  const token = localStorage.getItem("token");
  const getId = localStorage.getItem("id");


  const HandleRemove = async (memberToRemove) => {
    if (!selectedChat?.groupAdmin?._id || !getId) {
      toast.error("Missing user or group admin info.");
      return;
    }

    const isAdmin = String(selectedChat.groupAdmin._id) === String(getId);
    const removingSelf = String(memberToRemove._id) === String(getId);

    if (!isAdmin && !removingSelf) {
      toast.error("Only admins can remove users!");
      return;
    }

    try {
      setSpin(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const requestBody = {
        chatId: selectedChat._id,
        userId: memberToRemove._id,
      };

      const { data } = await axios.put(
        "http://localhost:9000/auth/chat/groupremove",
        requestBody,
        config
      );

      if (removingSelf) {
        setSelectedChat(null);
        toast.success("You have left the group successfully!");
      } else {
        setSelectedChat(data);
        toast.success(`${memberToRemove.name} removed from group`);
      }

      setChats((prevChats) => {
        if (removingSelf) {
          return prevChats.filter(chat => String(chat._id) !== String(selectedChat._id));
        } else {
          return prevChats.map(chat =>
            String(chat._id) === String(data._id) ? data : chat
          );
        }
      });
      fetchMessages();
    } catch (error) {
      toast.error("Failed to remove user");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setSpin(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      toast.error("Please enter the name to update");
      return;
    }

    try {
      setSpin(true);
      setRenameLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        "http://localhost:9000/auth/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === data._id ? data : chat
        )
      );

      toast.success("Group name updated!");
      setGroupchatName("");
      setProfileDialogGroup(false);
    } catch (error) {
      toast.error("Error in updating group chat name");
      console.error(error);
    } finally {
      setRenameLoading(false);
      setSpin(false);
    }
  };

  const HandleSearch = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResult([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:9000/auth?search=${query}`, config);
      setSearchResult(data);
    } catch (error) {
      toast.error("Failed to load search results");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroup = async (userToAdd) => {
    if (selectedChat.users?.find((u) => String(u._id) === String(userToAdd._id))) {
      toast.error("User Already Added");
      return;
    }

    if(selectedChat?.groupAdmin?._id !== getId){
      toast.error("Only amins can add members")
    }

    try {
      setSpin(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put("http://localhost:9000/auth/chat/groupadd", {
        chatId: selectedChat._id,
        userId: userToAdd._id,
      }, config);

      setSelectedChat(data);
    } catch (error) {
      toast.error("Error while adding user");
      console.error(error);
    } finally {
      setSpin(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="modal-overlay">
        <div className="modal-content" style={{ overflowY: 'scroll' }}>
          <div className="d-flex justify-content-between">
            <h2 style={{ textAlign: 'center', fontFamily: 'Work Sans' }}>
              {selectedChat?.chatName?.toUpperCase()}
            </h2>
            <span onClick={() => setProfileDialogGroup(false)}>
              <RxCross1 style={{ fontSize: '25px' }} />
            </span>
          </div>

          <h5 className="mt-3 mb-2" style={{ fontWeight: 'bold' }}>Group Members</h5>
          <div className="selected-users-display d-flex flex-wrap mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {selectedChat.users?.map((member) => (
              <div
                key={member._id}
                style={{
                  margin: '5px',
                  padding: '4px 8px',
                  borderRadius: '15px',
                  border: '1px solid #7B1FA2',
                  color: 'white',
                  backgroundColor: '#9C27B0',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Avatar name={member.name} src={member.pic} size="35" round />
                <strong style={{ marginRight: '8px', marginLeft: '8%' }}>
                  {member.name}
                  {selectedChat.groupAdmin._id === member._id ? ' (Admin)' : ''}
                </strong>
                <IoCloseSharp
                  style={{ fontSize: '18px', cursor: 'pointer' }}
                  onClick={() => HandleRemove(member)}
                />
              </div>
            ))}
          </div>

          <div className='d-flex justify-content-between'>
            <FaRegMessage style={{ fontSize: '25px', margin: '1.5%' }} />
            <input
              placeholder='Update group chat name'
              style={{
                marginBottom: '5%',
                height: '40px',
                width: '65%',
                padding: '10px 10px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '2px solid gray',
              }}
              value={groupChatName}
              onChange={(e) => setGroupchatName(e.target.value)}
            />
            <button className='btn btn-success' style={{ height: '40px', borderRadius: '15px' }} onClick={handleRename}>
              <MdOutlineDriveFileRenameOutline style={{ fontSize: '30px' }} />
            </button>
          </div>

          <div className='d-flex justify-content-between'>
            <FaUserPlus style={{ fontSize: '25px', margin: '1.5%' }} />
            <input
              placeholder='Enter user name e.g., John'
              style={{
                marginBottom: '5%',
                height: '40px',
                width: '65%',
                padding: '10px 10px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '2px solid gray',
              }}
              onChange={(e) => HandleSearch(e.target.value)}
              value={search}
            />
            <span className='btn btn-success' style={{ height: '40px', borderRadius: '15px', fontSize: '25px', padding: '5px 15px' }}>
              <IoMdPersonAdd />
            </span>
          </div>

          <div className="overflow-auto mt-3">
            {loading ? (
              <Skeleton height={50} count={3} className="mb-2" />
            ) : (
              searchResult.slice(0, 4).map((user, index) => (
                <div
                  key={index}
                  className="p-2 mb-2 border rounded d-flex align-items-center justify-content-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleGroup(user)}
                >
                  <div>
                    <Avatar name={user.name} src={user.pic} size="35" round />
                    <strong style={{ marginLeft: '5%' }}>{user.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.9rem', marginLeft: '25%' }}>{user.email}</div>
                  </div>
                </div>
              ))
            )}
            {!loading && search.trim() !== "" && searchResult.length === 0 && (
              <div className="text-center text-muted mt-3">No users found.</div>
            )}
          </div>
          <button
  className='btn btn-danger'
  onClick={() => {
    const currentUser = selectedChat.users.find(u => String(u._id) === String(getId));
    HandleRemove(currentUser);
  }}
>

        
            Leave Group
          </button>

          {(renameLoading || spin) && (
            <div className="spinner-container mt-3">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateGroupChatModel;
