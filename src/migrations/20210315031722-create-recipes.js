module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE recipes (
          id SERIAL NOT NULL,
          user_id UUID NOT NULL,
          title VARCHAR(50) NOT NULL,
          slug TEXT NOT NULL,
          intro TEXT NOT NULL,
          cover_img TEXT NOT NULL,
          servings INT NOT NULL,
          prep_time INT NOT NULL,
          cook_time INT NOT NULL,
          created_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ,
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_recipes_title ON recipes(title);
      CREATE INDEX idx_recipes_user_id ON recipes(user_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('recipes');
  }
};