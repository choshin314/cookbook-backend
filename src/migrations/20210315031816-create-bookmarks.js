module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE bookmarks (
          user_id UUID NOT NULL,
          recipe_id INT NOT NULL,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (user_id, recipe_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_bookmark_user ON bookmarks(user_id);
      CREATE INDEX idx_bookmark_recipe ON bookmarks(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookmarks');
  }
};
