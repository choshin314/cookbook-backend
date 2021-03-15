module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE likes (
          user_id UUID NOT NULL,
          recipe_id INT NOT NULL,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (user_id, recipe_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_likes_user_id ON likes(user_id);
      CREATE INDEX idx_likes_recipe_id ON likes(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('likes');
  }
};