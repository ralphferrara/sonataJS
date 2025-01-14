ALTER TABLE `partners`
ADD CONSTRAINT `fk_partner_fid_user`
FOREIGN KEY (`fid_user`)
REFERENCES `users` (`id_user`)
ON DELETE CASCADE;