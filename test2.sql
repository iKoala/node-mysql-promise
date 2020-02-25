START TRANSACTION;

CREATE DATABASE IF NOT EXISTS `test`;
USE `test`;

DROP TABLE IF EXISTS `test`.`test_data_2`;

CREATE TABLE IF NOT EXISTS `test_data_2` (
  `id` int(11) NOT NULL,
  `ctime` int(10) UNSIGNED NOT NULL,
  `stub` varchar(10) NOT NULL DEFAULT 'stub'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `test_data_2`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `test_data_2`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

INSERT INTO `test_data_2` VALUES(null, 0, 'stub1');
INSERT INTO `test_data_2` VALUES(null, 0, 'stub2');
INSERT INTO `test_data_2` VALUES(null, 0, 'stub3');

COMMIT;
