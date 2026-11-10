from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `upload_records` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `filename` VARCHAR(255) NOT NULL,
    `total_size` BIGINT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `chunkrecord` (
    `id` CHAR(36) NOT NULL PRIMARY KEY,
    `chunk_number` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `upload_id` CHAR(36) NOT NULL,
    CONSTRAINT `fk_chunkrec_upload_r_85354dfa` FOREIGN KEY (`upload_id`) REFERENCES `upload_records` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `aerich` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `version` VARCHAR(255) NOT NULL,
    `app` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL
) CHARACTER SET utf8mb4;
CREATE TABLE IF NOT EXISTS `bird_species` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID,也是训练的ID',
    `chinese_name` VARCHAR(100) NOT NULL COMMENT '中文名',
    `english_name` VARCHAR(100) NOT NULL COMMENT '英文名',
    `scientific_name` VARCHAR(150) NOT NULL COMMENT '学名',
    `bird_order` VARCHAR(50) NOT NULL COMMENT '目',
    `family` VARCHAR(50) NOT NULL COMMENT '科',
    `residency_type` VARCHAR(20) COMMENT '居留类型（留/（春/夏/秋/冬）/旅）',
    `protection_level` VARCHAR(10) COMMENT '保护级别（国家一级/国家二级/三有动物）'
) CHARACTER SET utf8mb4 COMMENT='鸟类物种信息表';
CREATE TABLE IF NOT EXISTS `detection_records` (
    `id` CHAR(36) NOT NULL PRIMARY KEY COMMENT '主键UUID',
    `video_url` VARCHAR(500) NOT NULL COMMENT '视频文件地址',
    `frame_number` INT NOT NULL COMMENT '检测帧序号',
    `species_id` INT NOT NULL COMMENT '物种分类ID',
    `confidence` DOUBLE NOT NULL COMMENT '检测置信度',
    `timestamp` DATETIME(6) NOT NULL COMMENT '检测时间戳' DEFAULT CURRENT_TIMESTAMP(6),
    KEY `idx_detection_r_video_u_bbf475` (`video_url`, `frame_number`),
    KEY `idx_detection_r_species_11822d` (`species_id`, `timestamp`)
) CHARACTER SET utf8mb4 COMMENT='鸟类检测记录模型';
CREATE TABLE IF NOT EXISTS `cameras` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `alias` VARCHAR(50) NOT NULL UNIQUE,
    `location` JSON NOT NULL,
    `upload_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `is_active` BOOL NOT NULL DEFAULT 1,
    `created_by_id` INT NOT NULL,
    UNIQUE KEY `uid_cameras_alias_a1bdde` (`alias`, `created_by_id`),
    CONSTRAINT `fk_cameras_user_39976141` FOREIGN KEY (`created_by_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
