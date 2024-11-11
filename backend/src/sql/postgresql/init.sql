--- 安装自动生成uuid插件
CREATE EXTENSION IF NOT EXISTS pgcrypto;
--- 网站信息表
CREATE TABLE settings
(
    settings_keys   VARCHAR(255) PRIMARY KEY,
    settings_values TEXT NOT NULL
);
--- 页面状态枚举
CREATE TYPE publication_status AS ENUM ('draft', 'published', 'private','hide');
--- 独立页面表
CREATE TABLE pages
(
    page_id               SERIAL PRIMARY KEY,                --- 独立页面唯一id主键
    page_meta_keywords    VARCHAR(255) NOT NULL,             ---页面mata关键字
    page_meta_description VARCHAR(255) NOT NULL,             ---页面mata描述
    post_title            VARCHAR(255) NOT NULL,             --- 文章标题
    page_content          TEXT         NOT NULL,             --- 独立页面内容
    page_mould            VARCHAR(50),                       --- 独立页面模板名称
    page_fields           JSON,                              --- 自定义字段
    page_path             VARCHAR(255),                      --- 文章路径
    page_status           publication_status DEFAULT 'draft' --- 文章状态
);
--- 文章表
CREATE TABLE posts
(
    post_id               UUID PRIMARY KEY   DEFAULT gen_random_uuid(),         --- 文章主键
    post_title            VARCHAR(255) NOT NULL,                                --- 文章标题
    post_meta_keywords    VARCHAR(255) NOT NULL,                                ---文章mata关键字
    post_meta_description VARCHAR(255) NOT NULL,                                ---文章mata描述
    post_content          TEXT         NOT NULL,                                --- 文章内容
    post_status           publication_status DEFAULT 'draft',                   --- 文章状态
    post_editor           BOOLEAN            DEFAULT FALSE,                     --- 文章是否编辑未保存
    posts_unsaved_content TEXT,                                                 --- 未保存的文章
    posts_path            VARCHAR(255),                                         --- 文章路径
    post_created_at       TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,         --- 文章创建时间
    post_updated_at       TIMESTAMP          DEFAULT CURRENT_TIMESTAMP,         --- 文章更新时间
    post_published_at     TIMESTAMP,                                            --- 文章发布时间
    CONSTRAINT post_updated_at_check CHECK (post_updated_at >= post_created_at) --- 文章时间约束
);
--- 标签表
CREATE TABLE tags
(
    tag_name VARCHAR(50) PRIMARY KEY CHECK (LOWER(tag_name) = tag_name) --- 标签名称主键
);
--- 文章与标签的关系表
CREATE TABLE post_tags
(
    post_id  UUID REFERENCES posts (post_id) ON DELETE CASCADE,        --- 外键约束，引用posts的主键
    tag_name VARCHAR(50) REFERENCES tags (tag_name) ON DELETE CASCADE, --- 外键约束，引用tag的主键
    PRIMARY KEY (post_id, tag_name)                                    --- 复合主键
);
--- 分类表
CREATE TABLE categories
(
    category_name        VARCHAR(50) PRIMARY KEY,                            ---分类表名称主键
    parent_category_name VARCHAR(50),                                        -- 父类分类 ID（可以为空）
    FOREIGN KEY (parent_category_name) REFERENCES categories (category_name) -- 外键约束，引用同一表的 category_id
);
--- 文章与分类的关系表
CREATE TABLE post_categories
(
    post_id     UUID REFERENCES posts (post_id) ON DELETE CASCADE,                   --- 外键约束，引用posts的主键
    category_id VARCHAR(50) REFERENCES categories (category_name) ON DELETE CASCADE, --- 外键约束，引用categories的主键
    PRIMARY KEY (post_id, category_id)                                               --- 复合主键
);
--- 资源库
CREATE TABLE library
(
    library_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                     --- 资源ID
    library_name         VARCHAR(255) NOT NULL,                                                          --- 资源名称
    library_size         BIGINT       NOT NULL,                                                          --- 大小
    library_storage_path VARCHAR(255) NOT NULL UNIQUE,                                                   --- 储存路径
    library_type         VARCHAR(50)  NOT NULL REFERENCES library_type (library_type) ON DELETE CASCADE, --- 资源类别
    library_description  VARCHAR(255),                                                                   --- 资源描述
    library_created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP                                      --- 创建时间

);
--- 资源库类别
CREATE TABLE library_type
(
    library_type        VARCHAR(50) PRIMARY KEY, --- 资源类别
    library_description VARCHAR(200)             --- 资源类别描述
);
--- 配置文件库
CREATE TABLE config
(
    config_name   VARCHAR(50) PRIMARY KEY, --- 配置文件名称
    config_config JSON                     --- 配置文件
)
