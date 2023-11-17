const express = require("express");
const app = express();
const db = require("./models/index.js");
const jwt = require("jsonwebtoken");

const { User } = db;


app.use(express.json());

// user 기본화면 모든 유저 띄우기
app.get("/users", async (req ,res)=>{
    const allUser = await User.findAll();
    res.send(allUser)
})

// 회원가입
app.post("/users", async (req, res)=>{
    const { email, nickname, password, confirmPassword } = req.body;
    
    if(password !== confirmPassword) {
        res.status(400).send({ message : "비밀번호와 확인 비밀번호가 일치하지 않습니다."})
        return;
    }
    if(password.length < 6){
        res.status(400).send({ message : "비밀번호는 6자리 이상이어야 합니다."})
        return;
    }

    const existEmail = await User.findOne({ where : { email }});
    const existNickname = await User.findOne({ where : { nickname }});
    // const existUser = await User.findOne({
    //     $or : [{email : email}, {nickname : nickname}] 
    // });

    if(existEmail || existNickname) {
        res.status(400).send({ message : "이미 사용중인 이메일이거나, 이미 사용중인 닉네임입니다."})
    } else {
        const newUser = req.body;
        const user = await User.build(newUser);
        await user.save();
        // const user = awiat User.create(newUser);
        res.status(201).send(newUser);
    }

});

// 로그인
app.post("/auth", async(req, res)=>{
    const { email, password } = req.body;
    const userHadEmail = await User.findOne({ where : {email} });

    if(!userHadEmail) {
        res.status(400).send({ message : "입력하신 이메일이 존재하지 않습니다."});
        return;
    }
    if(password !== userHadEmail.password) {
        console.log("1",userHadEmail.password)
        res.status(400).send({ message : `비밀번호가 틀렸습니다. ${userHadEmail.password}`});
        return;
    }
    if(userHadEmail && password === userHadEmail.password){
        const user = await User.findOne({ where : { email }});
        const token = jwt.sign({ userId : user.id }, "sparta-secret-key",{expiresIn : "12h"})
        
        const expires = new Date();
        expires.setHours(expires.getHours() + 12);

        res.cookie("authorization",`Bearer + ${token}`,{
            "expires" : expires,
        })
        res.status(200).send({ "token" : token });
    }
})

const authMiddleware = require("./middlewares/auth-middleware.js");

// 인증 성공시 /me 경로에 내 정보 전달
app.get("users/me", authMiddleware, async (req, res)=>{
    res.send({ user : res.locals.user})
})

//상품 생성
app.post("/goods", authMiddleware, async (req, res)=> {
    const good = req.body;
})


app.listen(3000,(req, res)=>{
    console.log("Server is listening...");
});