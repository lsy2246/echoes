-- 自定义类型定义
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('contributor', 'administrator');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'private', 'hidden');

-- 用户表
CREATE TABLE users
(
    username      VARCHAR(100) PRIMARY KEY,
    avatar_url    VARCHAR(255),
    email         VARCHAR(255) UNIQUE NOT NULL,
    profile_icon  VARCHAR(255),
    password_hash VARCHAR(255)        NOT NULL,
    role          user_role           NOT NULL DEFAULT 'contributor',
    created_at    TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP
);

-- 页面表
CREATE TABLE pages
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_keywords    VARCHAR(255) NOT NULL,
    meta_description VARCHAR(255) NOT NULL,
    title            VARCHAR(255) NOT NULL,
    content          TEXT         NOT NULL,
    template         VARCHAR(50),
    custom_fields    JSON,
    status           content_status DEFAULT 'draft'
);

-- 文章表
CREATE TABLE posts
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id        VARCHAR(100) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    cover_image      VARCHAR(255),
    title            VARCHAR(255) NOT NULL,
    meta_keywords    VARCHAR(255) NOT NULL,
    meta_description VARCHAR(255) NOT NULL,
    content          TEXT         NOT NULL,
    status           content_status   DEFAULT 'draft',
    is_editor        BOOLEAN          DEFAULT FALSE,
    draft_content    TEXT,
    created_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    published_at     TIMESTAMP,
    CONSTRAINT check_update_time CHECK (updated_at >= created_at)
);

-- 标签表
CREATE TABLE tags
(
    name VARCHAR(50) PRIMARY KEY CHECK (LOWER(name) = name),
    icon VARCHAR(255)
);

-- 文章标签关联表
CREATE TABLE post_tags
(
    post_id UUID REFERENCES posts (id) ON DELETE CASCADE,
    tag_id  VARCHAR(50) REFERENCES tags (name) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 分类表
CREATE TABLE categories
(
    name      VARCHAR(50) PRIMARY KEY,
    parent_id VARCHAR(50),
    FOREIGN KEY (parent_id) REFERENCES categories (name)
);

-- 文章分类关联表
CREATE TABLE post_categories
(
    post_id     UUID REFERENCES posts (id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES categories (name) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- 资源库表
CREATE TABLE resources
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    VARCHAR(100) NOT NULL REFERENCES users (username) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    size_bytes   BIGINT       NOT NULL,
    storage_path VARCHAR(255) NOT NULL UNIQUE,
    file_type    VARCHAR(50)  NOT NULL,
    category     VARCHAR(50),
    description  VARCHAR(255),
    created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);
-- 配置表
CREATE TABLE settings
(
    key  VARCHAR(50) PRIMARY KEY CHECK (LOWER(key) = key),
    data JSON
);