CREATE TABLE `settings` (
  `id_setting` INT NOT NULL AUTO_INCREMENT,
  `fid_user` INT NULL DEFAULT NULL,
  `setting_area` VARCHAR(10) NULL,
  `setting_name` VARCHAR(24) NULL,
  `setting_enabled` TINYINT NULL DEFAULT 0,
  PRIMARY KEY (`id_setting`),
  UNIQUE INDEX `id_setting_UNIQUE` (`id_setting` ASC),
  INDEX `fid_user` (`fid_user` ASC),
  INDEX `setting_area` (`setting_area` ASC),
  INDEX `setting_name` (`setting_name` ASC),
  INDEX `setting_enabled` (`setting_enabled` ASC)
);