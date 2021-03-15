module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE ingredients (
        id SERIAL NOT NULL, 
        recipe_id INT NOT NULL,
        qty VARCHAR(10) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        content VARCHAR(50) NOT NULL,
        position INT NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    
      CREATE INDEX idx_ings_recipe_id ON ingredients(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ingredients');
  }
};
