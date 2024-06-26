const express = require('express');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const userModel = require('./models/UserModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const ws = require('ws');
 
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
const bcryptSalt = bcrypt.genSaltSync(10);

app.get('/test', (req,res)=>{
    res.json('test ok');
})

app.get('/profile', (req,res)=>{
    const token =req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecret, {}, (err,userData)=>{
            if(err) throw err;
            // const {id, username} = {userData};
            res.json({
                userData
            })
        });
    } else {
        res.status(401).json('no token');
    }
    
})

app.post('/login', async(req,res)=>{
    try {
        const {username,password} = req.body;
    const foundUser = await userModel.findOne({username});
    if(foundUser){
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if(passOk){
            jwt.sign({userId:foundUser._id,username},jwtSecret,{},(err,token) =>{
                res.cookie('token', token, {sameSite:'none', secure:true}).json({
                    id: foundUser._id
                })
            })
        }
    }
    } catch (error) {
        console.log(err)
        res.status(500).json('error')
    }
    }
    )

app.post('/register', async (req,res)=>{
    const {username, password} = req.body;
    try {
        const hashedPass = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await userModel.create({
            username: username,
            password:hashedPass});
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

const server = app.listen(4000);

const wss = new ws.WebSocketServer({server});
wss.on('connection', (connection, req) => {
    // now wss provides us way to see online ip, but to show which user is online, we grab all
    //cookie from header and then decode it to get username.
    const cookies = req.headers.cookie;
    if (cookies){
        consttokenCookieString = cookies.split(';').find(str => str.startsWith('token='))
        // console.log(consttokenCookieString)
        if (consttokenCookieString){
            const token = consttokenCookieString.split('=')[1];
            if(token){
                // console.log(token);
                jwt.verify(token, jwtSecret, {}, (err, userData)=>{
                    if(err) throw err;
                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                })
            }
        }
    }
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c=>({userId:c.userId, username:c.username})),
            
    }))
    })
});
