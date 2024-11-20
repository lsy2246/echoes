CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE privilege_level AS ENUM ( 'contributor', 'administrators');
CREATE TABLE persons
(
    person_name       VARCHAR(100) PRIMARY KEY,
    person_avatar     VARCHAR(255),
    person_email      VARCHAR(255) UNIQUE NOT NULL,
    person_icon       VARCHAR(255),
    person_password   VARCHAR(255)        NOT NULL,
    person_created_at TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    person_updated_at TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    person_role       VARCHAR(50),
    person_last_login TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    person_level      privilege_level     NOT NULL DEFAULT 'contributor'
);
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'private','hide');
CREATE TABLE pages
(
    page_id               SERIAL PRIMARY KEY,
    page_meta_keywords    VARCHAR(255) NOT NULL,
    page_meta_description VARCHAR(255) NOT NULL,
    page_title            VARCHAR(255) NOT NULL,
    page_content          TEXT         NOT NULL,
    page_mould            VARCHAR(50),
    page_fields           JSON,
    page_status           publication_status DEFAULT 'draft'
);
CREATE TABLE posts
(
    post_author           VARCHAR(100) NOT NULL REFERENCES persons (person_name) ON DELETE CASCADE,
    post_id               UUID PRIMARY KEY   DEFAULT gen_random_uuid(),
    post_picture          VARCHAR(255),
    post_title            VARCHAR(255) NOT NULL,
    post_meta_keywords    VARCHAR(255) NOT NULL,
    post_meta_description VARCHAR(255) NOT NULL,
    post_content          TEXT         NOT NULL,
    post_status           publication_status DEFAULT 'draft',
    post_editor           BOOLEAN            DEFAULT FALSE,
    post_unsaved_content  TEXT,
    post_created_at       TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    post_updated_at       TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,
    post_published_at     TIMESTAMP,
    CONSTRAINT post_updated_at_check CHECK (post_updated_at >= post_created_at)
);
CREATE TABLE tags
(
    tag_name VARCHAR(50) PRIMARY KEY CHECK (LOWER(tag_name) = tag_name),
    tag_icon VARCHAR(255)
);
CREATE TABLE post_tags
(
    post_id  UUID REFERENCES posts (post_id) ON DELETE CASCADE,
    tag_name VARCHAR(50) REFERENCES tags (tag_name) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_name)
);
CREATE TABLE categories
(
    category_name        VARCHAR(50) PRIMARY KEY,
    parent_category_name VARCHAR(50),
    FOREIGN KEY (parent_category_name) REFERENCES categories (category_name)
);
CREATE TABLE post_categories
(
    post_id     UUID REFERENCES posts (post_id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES categories (category_name) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);
CREATE TABLE library
(
    library_author       VARCHAR(100) NOT NULL REFERENCES persons (person_name) ON DELETE CASCADE,
    library_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_name         VARCHAR(255) NOT NULL,
    library_size         BIGINT       NOT NULL,
    library_storage_path VARCHAR(255) NOT NULL UNIQUE,
    library_type         VARCHAR(50)  NOT NULL,
    library_class        VARCHAR(50),
    library_description  VARCHAR(255),
    library_created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE config
(
    config_name   VARCHAR(50) PRIMARY KEY CHECK (LOWER(config_name) = config_name),
    config_config JSON
);
