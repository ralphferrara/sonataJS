CREATE TABLE `attempts` (
  `id_attempt` INT NOT NULL AUTO_INCREMENT,
  `fid_merchant` INT NULL,
  `fid_subscription` INT NULL,
  `attempt_timestamp` TIMESTAMP NOT NULL,
  `attempt_status` VARCHAR(10) NOT NULL,
  `attempt_amount` DECIMAL(10, 2) NULL,  -- Adjust precision as necessary
  `attempt_data` TEXT NULL,
  PRIMARY KEY (`id_attempt`),
  INDEX `fid_merchant` (`fid_merchant` ASC),
  INDEX `fid_subscription` (`fid_subscription` ASC),
  INDEX `attempt_status_timestamp` (`attempt_status`, `attempt_timestamp`) -- Composite index
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;