const mongoose = require("mongoose");
const connectDB = async()=>{
    try{
         const conn = await mongoose.connect(process.env.MONG_CONN);

         console.log(`MongoDb connected : ${conn.connection.host}`);

    }catch(error){
    console.log(`Error ${error.message}`);
    process.exit();
    }
}

module.exports = connectDB;