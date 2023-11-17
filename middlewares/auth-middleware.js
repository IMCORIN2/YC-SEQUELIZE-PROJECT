const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

module.exports = async (req, res, next) => {
    const {authorization} = req.headers;
    const [authType, authToken] = authorization.split(" ");

    if(authType !== "Bearer" || !authToken) {
        res.status(400).send({
            message : "로그인 후 사용 가능합니다."
        });
        return;
    }

    try {
        const { userId } = jwt.verify(authToken, "sparta-secret-key");
        const user = User.findById(userId);
        res.locals.user = user;
        next();

    } catch(err) {
        res.status(400).send({
            message : `로그인 후 사용 가능합니다. 
            errorMessage : ${err}`
        })
    }
}