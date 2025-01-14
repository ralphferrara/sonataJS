CREATE TABLE `times` (
  `id_time` INT NOT NULL,
  `time_start` DATETIME NULL,
  `time_end` DATETIME NULL,
  `time_zone` TINYINT UNSIGNED NULL,
  PRIMARY KEY (`id_time`),
  INDEX `time_start` (`time_start` ASC),
  INDEX `time_end` (`time_end` ASC),
  INDEX `time_zone` (`time_zone` ASC)
);