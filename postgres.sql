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

CREATE TABLE tokens (
    id SERIAL NOT NULL,
    user_id UUID NOT NULL,
    refresh_key UUID NOT NULL,
    PRIMARY KEY (user_id, refresh_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tokens_user_id ON tokens(user_id);

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

CREATE TABLE follows (
    follower_id UUID NOT NULL,
    followee_id UUID NOT NULL,
    followee_notified boolean DEFAULT false,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON UPDATE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES users(id) ON UPDATE CASCADE
);

CREATE INDEX idx_follower_id ON follows(follower_id);
CREATE INDEX idx_followee_id ON follows(followee_id);

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

CREATE TABLE instructions (
    id SERIAL NOT NULL,
    recipe_id INT NOT NULL,
    content TEXT NOT NULL,
    position SMALLINT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);

CREATE TABLE tags (
    id SERIAL NOT NULL,
    recipe_id INT NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX idx_tags_content ON tags(content);
CREATE INDEX idx_tags_recipe_id ON tags(recipe_id);