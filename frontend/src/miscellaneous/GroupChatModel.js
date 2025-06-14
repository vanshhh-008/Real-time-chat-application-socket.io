import React, { useState, useEffect } from 'react';
import './GroupChatModel.css';
import Avatar from 'react-avatar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChatState } from '../context/chatProvider';
import { FaUserPlus } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import axios from 'axios';
import { IoCloseSharp } from "react-icons/io5";
import { toast, Toaster } from 'react-hot-toast';


const GroupChatModal = ({ onClose }) => {
    const [groupChatName, setGroupchatName] = useState();
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const { chats, setChats ,setSelectedChat,selectedChat} = ChatState();
    const token = localStorage.getItem("token");

    useEffect(() => {

   
    }, []);

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
            const { data } = await axios.get(`https://real-time-chat-application-socket-io-17xp.onrender.com/auth?search=${query}`, config);
            console.log(data);
            setSearchResult(data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load search results");
            console.error(error);
            setLoading(false);
        }
    };

    const HandleSubmit = async() => {

        if(!groupChatName || !selectedUser){
            toast.error("Fill all the required feilds");
            return;
        }

        try{
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.post(`https://real-time-chat-application-socket-io-17xp.onrender.com/auth/chat/group`,{
                name:groupChatName,
                users:JSON.stringify(selectedUser.map((user)=>user._id))
            },config);
           
     setChats([data, ...chats]);
     setSelectedChat(data);
     onClose();
     toast.success("Hurray! Group chat created successfully");

        }catch(error){
        toast.error("Error while creating chat group");
        console.log(error);
        }
        
    };

    const handleGroup = (userToAdd) => {
        if (selectedUser.some(u => u._id === userToAdd._id)) {
            toast.error("User Already Added");
            return;
        }

        setSelectedUser([...selectedUser, userToAdd]);
        setSearch("");
        setSearchResult([]);
    };

    const HandleDelete = (userToDelete) => {
        setSelectedUser(selectedUser.filter((sel) => sel._id !== userToDelete._id));
    };

    return (
        <>
            <Toaster />
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3 style={{ fontFamily: 'work sans', textAlign: 'center' }}>Create Group Chat</h3>
                    <hr></hr>
                    <div className='d-flex justify-content-between'>
                        <IoIosChatboxes style={{ fontSize: '30px' }} /> 
                        <input
                            placeholder='Enter chat name'
                            style={{
                                marginBottom: '5%', height: '40px', width: '85%', padding: '10px 10px', fontSize: '20px', borderRadius: '10px',
                                border: '2px solid gray',
                            }}
                            onChange={(e) => { setGroupchatName(e.target.value) }}
                            value={groupChatName || ''}
                        ></input>
                    </div>
                    <div className='d-flex justify-content-between'>
                        <FaUserPlus style={{ fontSize: '30px' }} />
                        <input
                            placeholder='Enter users name eg. Jhon'
                            style={{
                                marginBottom: '5%', height: '40px', width: '85%', padding: '10px 10px', fontSize: '15px', borderRadius: '10px',
                                border: '2px solid gray',
                            }}
                            onChange={(e) => { HandleSearch(e.target.value) }}
                            value={search}
                        ></input>
                    </div>

                    <div className="selected-users-display d-flex flex-wrap mb-3">
                        {selectedUser.map((user) => (
                            <div
                                style={{
                                    margin: '5px',
                                    padding: '8px 8px',
                                    borderRadius: '15px',
                                    border: '1px solid #7B1FA2',
                                    color: 'white',
                                    backgroundColor: '#9C27B0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                                key={user._id}
                                onClick={() => HandleDelete(user)}
                            >
                                  <Avatar name={user.name} src={user.pic} size="35" round />
                                <strong style={{ marginRight: '8px',marginLeft:'8%' }}>{user.name}</strong>
                                <IoCloseSharp style={{ fontSize: '18px' }} />
                            </div>
                        ))}
                    </div>

                    <div className='d-flex justify-content-between'>
                        <button className="btn btn-primary" onClick={HandleSubmit}>Create Chat</button>
                        <button className="bt btn-danger" onClick={onClose}>Close</button>


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
                </div>
            </div>



      
        </>
    );
};

export default GroupChatModal;