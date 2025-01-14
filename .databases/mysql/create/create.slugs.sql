CREATE TABLE `slugs` (
  `id_slug` int(11) NOT NULL AUTO_INCREMENT,
  `fid_area` int(11) DEFAULT NULL,
  `slug_area` varchar(4) DEFAULT NULL,
  `slug_slug` varchar(128) DEFAULT NULL,
  `slug_previous` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id_slug`),
  UNIQUE KEY `slug_slug_UNIQUE` (`slug_slug`),
  KEY `fid_area` (`fid_area`),
  KEY `slug_area` (`slug_area`),
  KEY `slug_slug` (`slug_slug`),
  KEY `slug_previous` (`slug_previous`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
