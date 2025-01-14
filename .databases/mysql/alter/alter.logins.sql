ALTER TABLE `logins`
ADD CONSTRAINT `fk_fid_user`
FOREIGN KEY (`fid_user`)
REFERENCES `users` (`id_user`)
ON DELETE CASCADE;