CREATE TABLE `methods` (
  `id_method` INT NOT NULL AUTO_INCREMENT,
  `method_website` VARCHAR(128) NULL,
  `method_user` TExT NULL,
  `method_data` TEXT NULL,
  `method_last4` VARCHAR(4) NULL,
  `method_status` VARCHAR(10) NULL,
  `method_timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_method`),
  INDEX `method_website` (`method_status`, `method_website`),
  INDEX `method_user` (`method_user`),
  INDEX `method_status` (`method_status`),
  INDEX `method_timestamp` (`method_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;