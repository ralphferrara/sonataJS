CREATE TABLE `sonata_payments`.`statuses` (
  `id_status` INT NOT NULL AUTO_INCREMENT,
  `status_code` VARCHAR(4) NULL,
  `status_area` VARCHAR(64) NULL,
  `status_description` VARCHAR(64) NULL,
  PRIMARY KEY (`id_status`),
  INDEX `status_code` (`status_code` ASC),
  INDEX `status_area` (`status_area` ASC));

INSERT INTO `sonata_payments`.`statuses` (`status_code`, `status_area`, `status_description`) VALUES ('PAPR', 'attempts', 'Payment Approved');
INSERT INTO `sonata_payments`.`statuses` (`status_code`, `status_area`, `status_description`) VALUES ('PDE', 'attempts', 'Payment Declinded - Expired');
INSERT INTO `sonata_payments`.`statuses` (`status_code`, `status_area`, `status_description`) VALUES ('PDS', 'attempts', 'Payment Declined - Security');
INSERT INTO `sonata_payments`.`statuses` (`status_code`, `status_area`, `status_description`) VALUES ('PDF', 'attempts', 'Paynent Declined Failed');
