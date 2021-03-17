module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN qty TYPE VARCHAR(30);
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN unit TYPE VARCHAR(30);
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN unit DROP NOT NULL;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN content TYPE VARCHAR(255);
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN qty TYPE VARCHAR(10);
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN unit TYPE VARCHAR(20);
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN unit SET NOT NULL;
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE ingredients
      ALTER COLUMN content TYPE VARCHAR(50);
    `)
  }
};