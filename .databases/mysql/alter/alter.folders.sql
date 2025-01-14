ALTER TABLE folders
    ADD CONSTRAINT fk_folders_fid_user FOREIGN KEY (fid_user) REFERENCES users(id_user) ON DELETE CASCADE,
    ADD CONSTRAINT fk_folders_fid_media_cover FOREIGN KEY (fid_media_cover) REFERENCES media(id_media) ON DELETE SET NULL;
