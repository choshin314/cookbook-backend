module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE tags (
          id SERIAL NOT NULL,
          recipe_id INT NOT NULL,
          content TEXT NOT NULL,
          PRIMARY KEY (id),
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_tags_content ON tags(content);
      CREATE INDEX idx_tags_recipe_id ON tags(recipe_id);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tags');
  }
};