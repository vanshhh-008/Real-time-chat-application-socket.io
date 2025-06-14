import React from 'react'

import SideDrawer from './miscellaneous/SideDrawer';
import MyChats from './miscellaneous/MyChats';
import ChatBox from './miscellaneous/ChatBox';
const Chats = () => {


  return (

    <div style={{width:'100%'}}>

<SideDrawer/>

<div className=" d-flex justify-content-between w-100 h-91.5vh p-10px ">
<MyChats/>
<ChatBox/> 

{/* </div> */}
</div>
    </div>
   
  )
}

export default Chats