CREATE DATABASE IF NOT EXISTS marketing_analytics
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE marketing_analytics;

CREATE TABLE IF NOT EXISTS channels (
  id                INT          NOT NULL AUTO_INCREMENT,
  name              VARCHAR(50)  NOT NULL,
  total_spend       DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_revenue     DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_conversions INT          NOT NULL DEFAULT 0,
  roas              DECIMAL(8,4) NOT NULL DEFAULT 0,
  cpa               DECIMAL(10,2) NOT NULL DEFAULT 0,
  cpc               DECIMAL(10,2) NOT NULL DEFAULT 0,
  avg_ctr           DECIMAL(8,4) NOT NULL DEFAULT 0,
  avg_cvr           DECIMAL(8,4) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_channel_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS monthly_performance (
  id                INT          NOT NULL AUTO_INCREMENT,
  month             VARCHAR(7)   NOT NULL,
  total_spend       DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_revenue     DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_conversions INT          NOT NULL DEFAULT 0,
  roas              DECIMAL(8,4) NOT NULL DEFAULT 0,
  mom_spend_pct     DECIMAL(8,2) DEFAULT NULL,
  mom_revenue_pct   DECIMAL(8,2) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_month (month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaigns (
  id                INT           NOT NULL AUTO_INCREMENT,
  channel_name      VARCHAR(50)   NOT NULL,
  campaign_name     VARCHAR(100)  NOT NULL,
  total_spend       DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_revenue     DECIMAL(14,2) NOT NULL DEFAULT 0,
  conversions       INT           NOT NULL DEFAULT 0,
  roas              DECIMAL(8,4)  NOT NULL DEFAULT 0,
  cpa               DECIMAL(10,2) NOT NULL DEFAULT 0,
  cpc               DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campaign (channel_name, campaign_name),
  KEY idx_channel (channel_name),
  KEY idx_roas (roas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS insights (
  id           INT          NOT NULL AUTO_INCREMENT,
  content      TEXT         NOT NULL,
  generated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
