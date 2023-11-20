'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Goods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productName: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.fn("now")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue : Sequelize.fn("now")
      }
    })
    // user table의 nickName 추가
    await queryInterface.addColumn(
      "Goods",
      "fk_nickName",
      {
        type : Sequelize.STRING,
        references: {
          model: "Users",
          key: "nickname"
        }
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Goods');
  }
};