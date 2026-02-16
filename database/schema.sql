CREATE DATABASE IF NOT EXISTS marketing_analytics
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE marketing_analytics;


CREATE TABLE IF NOT EXISTS channels (
  id               INT            NOT NULL AUTO_INCREMENT,
  name             VARCHAR(50)    NOT NULL,
  total_spend      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  total_revenue    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  total_conversions INT           NOT NULL DEFAULT 0,
  roas             DECIMAL(8,2)   NOT NULL DEFAULT 0.00,
  cpa              DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  cpc              DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_channel_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS monthly_performance (
  id                 INT            NOT NULL AUTO_INCREMENT,
  month              VARCHAR(7)     NOT NULL COMMENT 'Format: YYYY-MM',
  total_spend        DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  total_revenue      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  total_conversions  INT            NOT NULL DEFAULT 0,
  roas               DECIMAL(8,2)   NOT NULL DEFAULT 0.00,
  created_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_month (month),
  INDEX idx_month (month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS campaigns (
  id             INT            NOT NULL AUTO_INCREMENT,
  channel_name   VARCHAR(50)    NOT NULL,
  campaign_name  VARCHAR(100)   NOT NULL,
  total_spend    DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  total_revenue  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  conversions    INT            NOT NULL DEFAULT 0,
  roas           DECIMAL(8,2)   NOT NULL DEFAULT 0.00,
  created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_channel_name (channel_name),
  INDEX idx_roas (roas),
  CONSTRAINT fk_campaign_channel
    FOREIGN KEY (channel_name) REFERENCES channels(name)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
