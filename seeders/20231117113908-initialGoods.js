'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Goods', [
      {
        id : 1,
        productName : "아이폰15 PRO",
        content : "미개봉 새상품이요.",
        status : "판매중",
        userId : "1",
      },
      {
        id : 2,
        productName : "아이폰14 mini",
        content : "버리기 직전 상태입니다.",
        status : "판매중",
        userId : "1",
      },
      {
        id : 3,
        productName : "아이폰7",
        content : "사실 내꺼 아님.",
        status : "판매중",
        userId : "2",
      },
  ])
},

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Goods', null, {});
  }
};
