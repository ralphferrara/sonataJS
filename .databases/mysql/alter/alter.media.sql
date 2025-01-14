ALTER TABLE `media`
ADD CONSTRAINT `fk_media_fid_user`
    FOREIGN KEY (`fid_user`)
    REFERENCES `users` (`id_user`)
    ON DELETE CASCADE,
ADD CONSTRAINT `fk_media_fid_folder`
    FOREIGN KEY (`fid_folder`)
    REFERENCES `folders` (`id_folder`)
    ON DELETE SET NULL;