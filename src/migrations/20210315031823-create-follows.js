module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE follows (
          follower_id UUID NOT NULL,
          followee_id UUID NOT NULL,
          followee_notified boolean DEFAULT false,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (follower_id, followee_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
          FOREIGN KEY (followee_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
      );
      
      CREATE INDEX idx_follower_id ON follows(follower_id);
      CREATE INDEX idx_followee_id ON follows(followee_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('follows');
  }
};

