'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
        CREATE TABLE notifications (
            id SERIAL NOT NULL,
            category VARCHAR NOT NULL,
            recipient_id UUID NOT NULL,
            new_review_id INT,
            new_follower_id UUID,
            checked boolean DEFAULT false,
            created_at TIMESTAMPTZ,
            updated_at TIMESTAMPTZ,
            PRIMARY KEY (id),
            FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (new_review_id) REFERENCES reviews(id) ON DELETE CASCADE,
            FOREIGN KEY (new_follower_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
    `)
  },

  down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('notifications');
  }
};
