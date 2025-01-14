CREATE TABLE `statuses` (
  `id_status` int(11) NOT NULL AUTO_INCREMENT,
  `status_area` varchar(60) DEFAULT NULL,
  `status_code` varchar(6) DEFAULT NULL,
  `status_description` varchar(60) DEFAULT NULL,
  `status_iserror` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id_status`),
  KEY `status_area` (`status_area`),
  KEY `status_code` (`status_code`),
  KEY `status_iserror` (`status_iserror`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
