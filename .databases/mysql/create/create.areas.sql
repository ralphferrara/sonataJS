CREATE TABLE `areas` (
  `id_area` int(11) NOT NULL AUTO_INCREMENT,
  `area_code` varchar(2) NOT NULL,
  `area_description` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id_area`),
  KEY `area_code` (`area_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
