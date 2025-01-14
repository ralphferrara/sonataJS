CREATE TABLE `merchant_sites` (
  `id_merchantsite` INT NOT NULL AUTO_INCREMENT,
  `fid_merchant` INT NULL,
  `url` VARCHAR(128) NULL,
  PRIMARY KEY (`id_merchantsite`),
  INDEX `fid_merchant` (`fid_merchant` ASC),
  INDEX `url` (`url` ASC));
