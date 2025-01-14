ALTER TABLE `settings`
ADD CONSTRAINT `fk_user_settings`
FOREIGN KEY (`fid_user`)
REFERENCES `users` (`id_user`)
ON DELETE CASCADE;