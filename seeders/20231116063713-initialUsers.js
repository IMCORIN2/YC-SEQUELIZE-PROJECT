'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Users', [
      {
        id : 1,
        email : "zzz@gmail.com",
        nickname : "zzz",
        password : "zzz123",
      },
      {
        id : 2,
        email : "abc@naver.com",
        nickname : "abc",
        password : "abc123",
      },
      {
        id : 3,
        email : "qwer@daum.net",
        nickname : "qwer",
        password : "qwer123",
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Users', null, {});
  }
};
