const express = require('express');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const userModel = require('./models/UserModel')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors');
 
dotenv.config({ path: `${__dirname}/config.env` });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL,
}));
mongoose
    .connect(process.env.MONGO_DB)
    .then(()=> console.log(`connected to db`))
    .catch((err)=> console.log(err))

const jwtSecret = process.env.JWT_SECRET;

app.get('/test', (req,res)=>{
    res.json('test ok');
})

app.get('/profile', (req,res)=>{
    const token =req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecret, {}, (err,userData)=>{
            if(err) throw err;
            // const {id, username} = {userData};
            res.json({userData})
        });
    } else {
        res.status(401).json('no token');
    }
    
})
app.post('/register', async (req,res)=>{
    const {username, password} = req.body;
    try {
        const createdUser = await userModel.create({username,password});
        jwt.sign({userId:createdUser._id, username},jwtSecret,{}, (err,token)=>{
            if(err) throw err;
            res.cookie('token',token, {sameSite:'none', secure:true}).status(201).json({
                id: createdUser._id,
                username,

            })
        })
    } catch (err) {
        if (err) throw err;
        res.status(500).json('error')
    }
    
});

app.listen(4000);