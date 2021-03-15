module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE instructions (
          id SERIAL NOT NULL,
          recipe_id INT NOT NULL,
          content TEXT NOT NULL,
          position SMALLINT NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('instructions');
  }
};
