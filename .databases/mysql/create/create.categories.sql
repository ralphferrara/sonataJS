CREATE TABLE `categories` (
  `id_category` int(11) NOT NULL AUTO_INCREMENT,
  `fid_category` int(11) DEFAULT NULL,
  `category_name` varchar(128) DEFAULT NULL,
  `category_area` varchar(4) DEFAULT NULL,
  `category_order` int(11) DEFAULT NULL,
  `category_slug` varchar(128) DEFAULT NULL,
  `category_json` text DEFAULT '{}',
  PRIMARY KEY (`id_category`),
  KEY `fid_category` (`fid_category`),
  KEY `category_area` (`category_area`),
  KEY `category_order` (`category_order`),
  KEY `category_slug` (`category_slug`)
);