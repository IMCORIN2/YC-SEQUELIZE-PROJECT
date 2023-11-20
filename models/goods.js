'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Goods extends Model {}
  Goods.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    productName: DataTypes.STRING,
    content: DataTypes.STRING, 
    status: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Goods',
  });
  return Goods;
};