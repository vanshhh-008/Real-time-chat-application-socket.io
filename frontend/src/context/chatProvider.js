import { createContext, useContext, useEffect, useState } from "react";

const chatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [container, setContainer] = useState(true);
  const [spin, setSpin] = useState(false);
  const [profileDialogGroup, setProfileDialogGroup] = useState(false);
  const [picPresent, setPic] = useState(null);
  const [user, setUser] = useState();
    const[notifications,setNotifications] = useState([]);
  const[container2,setContainer2] = useState(false);

  
  useEffect(() => {
    // Retrieve user details from localStorage
    // const storedUserId = localStorage.getItem("userId");
    // const storedName = localStorage.getItem("LoggedInUser");
    // const storedToken = localStorage.getItem("token");
    // const storedPic = localStorage.getItem("pic");

    // If essential fields are available, set user
    // if (storedUserId && storedName && storedToken) {
    //   setUser({
    //     _id: storedUserId,
    //     name: storedName,
    //     token: storedToken,
    //     pic: storedPic || null,
    //   });
    // }

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
  }, []);

  return (
    <chatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        spin,
        setSpin,
        picPresent,
        setPic,
        profileDialogGroup,
        setProfileDialogGroup,
        container,
        setContainer,
        user,
        setUser,
        container2,setContainer2,
        notifications,setNotifications,
      }}
    >
      {children}
    </chatContext.Provider>
  );
};

export const ChatState = () => useContext(chatContext);

export default ChatProvider;
