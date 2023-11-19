const jwt = require("jsonwebtoken");

const db = require("../models/index.js");
const { User } = db;

module.exports = async (req, res, next) => {
    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");
    
    if(authType !== "Bearer" || !authToken) {
        res.status(400).send({
            message : "로그인 후 사용 가능합니다.(토큰 타입, 토큰 없음)"
        });
        return;
    }

    try {
        const decoded = jwt.verify(authToken, "sparta-secret-key");
        const user = await User.findOne({where:{id :decoded.userId}});
       
        res.locals.user = user;
        req.user = user.id
        next();

    } catch(err) {
        res.status(400).send({
            message : `로그인 후 사용 가능합니다. 
            errorMessage : ${err}`
            
        })
    }

    // res.send();
    // return;
}