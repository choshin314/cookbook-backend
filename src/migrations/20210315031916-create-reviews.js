module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE reviews (
          id SERIAL NOT NULL,
          user_id UUID NOT NULL,
          recipe_id INT NOT NULL,
          rating SMALLINT NOT NULL,
          content TEXT NOT NULL,
          headline VARCHAR(50),
          review_img TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_reviews_recipe ON reviews(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reviews');
  }
};