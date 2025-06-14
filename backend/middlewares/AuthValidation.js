const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
//signup    

const signupValidation = (req,res,next)=>{
    const schema= Joi.object({
        name:Joi.string().min(3).max(100).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(4).max(100).required(),
        pic: Joi.string().uri().optional() 
     

    });
    const {error}=schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"Bad Request",error});
    }
    next();


}
//login
const loginValidation = (req,res,next)=>{
    const schema= Joi.object({
        email:Joi.string().email().required(),
        password:Joi.string().min(4).max(100).required()
    });
    const {error}=schema.validate(req.body);
    if(error){
        return res.status(400).json({message:"Bad Request",error});
    }
    next();


}




module.exports={
    signupValidation,
    loginValidation,

 
}