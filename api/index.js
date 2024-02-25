const express = require('express');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const userModel = require('./models/UserModel')
const jwt = require('jsonwebtoken')
const cors = require('cors');
 
dotenv.config({ path: `${__dirname}/config.env` });

const app = express();
app.use(express.json());
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

app.post('/register', async (req,res)=>{
    const {username, password} = req.body;
    try {
        const createdUser = await userModel.create({username,password});
        jwt.sign({userId:createdUser._id},jwtSecret,{}, (err,token)=>{
            if(err) throw err;
            res.cookie('token',token).status(201).json({
                _id: createdUser._id,
                
            })
        })
    } catch (err) {
        if (err) throw err;
        res.status(500).json('error')
    }
    
});

app.listen(4000);