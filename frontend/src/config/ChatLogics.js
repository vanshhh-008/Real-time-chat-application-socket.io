export const getSender = (loggedInUserName, users) => {
 
  return users.find((user) => user.name !== loggedInUserName)?.name || "Unknown";
  


};

export const getSenderPic = (loggedInUserName, users) => {

  return users.find((user) => user.name !== loggedInUserName)?.pic || "Unknown";

};


export const getSenderEmail = (loggedInUserName, users) => {

  return users.find((user) => user.name !== loggedInUserName)?.email || "Unknown";

};

export const isSameSender = (messages,m,i,userId)=>{
  return(
i < messages.length-1 &&
  (messages[i+1].sender._id !== m.sender._id || 
    messages[i+1].sender._id === undefined) && messages[i].sender._id !== userId

  );
}


export const isLastMessage = (messages,i,userId) =>{
  return(

    i === messages.length - 1 && messages[messages.length-1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  )
}




