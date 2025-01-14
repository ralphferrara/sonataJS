CREATE TABLE `entities_text` (
  `id_entitytext` INT NOT NULL AUTO_INCREMENT,
  `fid_entity` INT NULL,
  `entitiestext_type` VARCHAR(24) NULL,
  `entitiestext_value` TEXT NULL,
  PRIMARY KEY (`id_entitytext`),
  INDEX `fid_entity` (`fid_entity` ASC) ,
  INDEX `entitiestext_type` (`entitiestext_type`) ,
  FULLTEXT INDEX `entitiestext_value` (`entitiestext_value`)
  );
