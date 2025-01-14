CREATE TABLE `verifications` (
  `id_verification` INT NOT NULL,
  `fid_area` INT NULL,
  `fid_type` INT NULL,
  `fid_reviewer` INT NULL,
  `veriification_status` VARCHAR(4) NULL,
  `verification_method` VARCHAR(4) NULL,
  `verification_submitted` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_reviewed` DATETIME NULL DEFAULT '0000-00-00 00:00:00',
  `verification_notes_public` MEDIUMTEXT NULL,
  `verification_notes_private` MEDIUMTEXT NULL,
  `verification_files` TEXT NULL,
  PRIMARY KEY (`id_verification`),
  INDEX `fid_area` (`fid_area` ASC),
  INDEX `fid_type` (`fid_type` ASC) ,
  INDEX `fid_reviewer` (`fid_reviewer` ASC) ,
  INDEX `verification_status` (`veriification_status` ASC) ,
  INDEX `verification_method` (`verification_method` ASC) ,
  INDEX `verification_submitted` (`verification_submitted` ASC) ,
  INDEX `verification_reviewed` (`verification_reviewed` DESC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;
