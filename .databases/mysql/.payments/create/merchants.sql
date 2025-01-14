CREATE TABLE `merchants` (
  `id_merchant` INT NOT NULL AUTO_INCREMENT,
  `merchant_code` VARCHAR(4) NULL,
  `merchant_name` VARCHAR(64) NULL,
  `merchant_url` VARCHAR(256) NULL,
  `merchant_private` VARCHAR(256) NULL,
  `merchant_username` VARCHAR(64) NULL,
  `merchant_password` VARCHAR(64) NULL,
  `merchant_active` TINYINT NULL DEFAULT 1,
  PRIMARY KEY (`id_merchant`),
  INDEX `merchant_code` (`merchant_code` ASC),
  INDEX `merchant_active` (`merchant_active` ASC));
