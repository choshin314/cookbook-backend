module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE tokens (
          id SERIAL NOT NULL,
          user_id UUID NOT NULL,
          refresh_key UUID NOT NULL,
          PRIMARY KEY (user_id, refresh_key),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_tokens_user_id ON tokens(user_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tokens');
  }
};