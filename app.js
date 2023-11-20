const express = require("express");
const app = express();
const db = require("./models/index.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { User } = db;
const { Goods } = db;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));

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

        // res.cookie("authorization",`Bearer + ${token}`,{
        //     "expires" : expires,
        // })
        res.status(200).send({ "token" : token });
    }
})

const authMiddleware = require("./middlewares/auth-middleware.js");

// 인증 성공시 /me 경로에 내 정보 전달
app.post("/users/me", authMiddleware, async (req, res)=>{

    res.send({ user : res.locals.user })
})

//상품 생성
app.post("/goods", authMiddleware, async (req, res)=> {
    const { productName, content, status} = req.body;
    
    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");
    const decoded = jwt.verify(authToken, "sparta-secret-key");

    const productStatus = ["판매중", "판매완료"];

    if(!productStatus.includes(status)) {
        res.status(400).send({ message : "잘못된 상품 상태입니다. 판매중 혹은 판매완료로 등록하세요."})
        return;
    }
    const newGood = { 
        productName : productName,
        content : content,
        status : status,
        userId : decoded.userId
    }

    const good = await Goods.build(newGood);
    await good.save();
     // const user = awiat User.create(newUser);
    res.status(201).send({ newGood })
})

// 상품 수정
app.put("/goods/:id/:productId", authMiddleware, async (req, res)=>{
    const { id, productId } = req.params;
    const newGoodInfo = req.body;
    const { status } = req.body;

    const productStatus = ["판매중", "판매완료"];

    if(!productStatus.includes(status)) {
        res.status(400).send({ message : "잘못된 상품 상태입니다. 판매중 혹은 판매완료로 등록하세요."})
    }

    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");
    const decoded = jwt.verify(authToken, "sparta-secret-key");

    const existGood = await Goods.findOne({ where : { id : productId } })

    if(status)
    
    if(!existGood) {
        res.status(404).send({ message : "상품 조회에 실패하였습니다."})
        return;
    }

    if(decoded.userId !== Number(id)) {

        res.status(404).send({ message : "사용자가 등록한 상품이 없습니다."})
        return;
    } else {
        const updatedGood = await Goods.update(newGoodInfo, { where : { id : productId } });
        res.status(200).send({ message : `${productId}번 상품이 정상적으로 수정되었습니다.`})
    }
    // 사용자의 id를 params로 받아오는게 아니라면 (/goods/:productId만 있다면)(프론트에서 id값을 따로 넘겨주는게 아니라면?)
    // 그런데 이게 더 맞을듯? 왜냐하면 상품에서 작성한 사람을 직접 찾아오는거니까?

    // const good = await Goods.findOne({ where : { id : productId } });
    // const id = good.userId;
    // const { productId } = req.params;

    // const {authorization} = req.headers;
    // const [authType, authToken] = authorization.split(" ");
    // const decoded = jwt.verify(authToken, "sparta-secret-key");
    // const existGood = await Goods.findOne({ where : { id : productId } })
    
    // if(!existGood) {
    //     res.status(404).send({ message : "상품 조회에 실패하였습니다."})
    //     return;
    // }

    // if(decoded.userId !== id) {
    //     res.status(404).send({ message : "사용자가 등록한 상품이 없습니다."})
    // } else {
    //     const updatedGood = await Goods.update({ where : { id : productId} });

    //     res.status(200).send({ message : `${updatedGood[0]}번 상품이 정상적으로 삭제되었습니다.`})
    // }
})

// 상품 삭제
app.delete("/goods/:id/:productId", authMiddleware, async (req, res)=>{
    const { id , productId } = req.params;

    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");
    const decoded = jwt.verify(authToken, "sparta-secret-key");

    const existGood = await Goods.findOne({ where : { id : productId } })
    
    if(!existGood) {
        res.status(404).send({ message : "상품 조회에 실패하였습니다."})
        return;
    }

    if(decoded.userId !== Number(id)) {
        res.status(404).send({ message : "사용자가 등록한 상품이 없습니다."})
    } else {
        const deleteGood = await Goods.destroy({ where : { id : productId} });

        res.status(200).send({ message : `${productId}번 상품이 정상적으로 삭제되었습니다.`})
    }
    // 사용자의 id를 params로 받아오는게 아니라면 (/goods/:productId만 있다면)
    // 그런데 이게 더 맞을듯? 왜냐하면 상품에서 작성한 사람을 직접 찾아오는거니까?

    // const good = await Goods.findOne({ where : { id : productId } });
    // const id = good.userId;
    // const { productId } = req.params;

    // const {authorization} = req.headers;
    // const [authType, authToken] = authorization.split(" ");
    // const decoded = jwt.verify(authToken, "sparta-secret-key");
    // const existGood = await Goods.findOne({ where : { id : productId } })
    
    // if(!existGood) {
    //     res.status(404).send({ message : "상품 조회에 실패하였습니다."})
    //     return;
    // }

    // if(decoded.userId !== id) {
    //     res.status(404).send({ message : "사용자가 등록한 상품이 없습니다."})
    // } else {
    //     const deleteGood = await Goods.destroy({ where : { id : productId} });

    //     res.status(200).send({ message : `${deleteGood}번 상품이 정상적으로 삭제되었습니다.`})
    // }

})

// 상품 상세 조회
app.get("/goods", async(req, res)=>{
    // 여기서 작성자명까지 표시해야 하는데 표시하려면 Table간의 Join이 필요하다.
    // Table Join 후에 QueryString으로 sort 항목을 받아서 정렬을 해주어야 한다.
    const allGoods = await Goods.findAll({
        include: [
            { model: Users, as: "user", attributes: ["nickName"] }
        ],
        order: [["createdAt", "DESC"]]
    });

    res.send(allGoods);
})

app.listen(3000,(req, res)=>{
    console.log("Server is listening...");
});