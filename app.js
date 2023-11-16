const express = require("express");
const app = express();
const db = require("./models/index.js");

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

})

app.listen(3000,(req, res)=>{
    console.log("Server is listening...");
});