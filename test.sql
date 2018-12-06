START TRANSACTION;

CREATE DATABASE IF NOT EXISTS `test`;
USE `test`;

CREATE TABLE IF NOT EXISTS `test_data` (
  `id` int(11) NOT NULL,
  `ctime` int(10) UNSIGNED NOT NULL,
  `stub` varchar(10) NOT NULL DEFAULT 'stub'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `test_data`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `test_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

INSERT INTO `test_data` VALUES(null, 0, 'stub0');
INSERT INTO `test_data` VALUES(null, 0, 'stub1');
INSERT INTO `test_data` VALUES(null, 0, 'stub2');

COMMIT;
