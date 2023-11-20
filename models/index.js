const Sequelize = require("sequelize");
const config = require("../config/config.json");

const {
  username, password, database, host, dialect,
} = config.development;
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
});

const User = require("./user")(sequelize, Sequelize.DataTypes);
const Goods = require("./goods")(sequelize, Sequelize.DataTypes);

// User과 Goods 테이블 연결
User.hasMany(Goods);
Goods.belongsTo(User, {
  foreignKey: "fk_nickname",
  as : "nickname"
})

const db = {};
db.User = User;
db.Goods = Goods;

module.exports = db;