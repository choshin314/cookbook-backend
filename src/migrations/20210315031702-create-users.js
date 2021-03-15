module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE users (
        id UUID DEFAULT uuid_generate_v4(),
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL, 
        username VARCHAR(30) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio VARCHAR(255),
        profile_pic TEXT,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ,
        PRIMARY KEY (id)
      );
      CREATE INDEX idx_users_id ON users(id);
      CREATE INDEX idx_users_username ON users(username);
      CREATE INDEX idx_users_fullname ON users((first_name || ' ' || last_name));
    `)
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};