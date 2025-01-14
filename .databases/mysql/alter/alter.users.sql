ALTER TABLE users
ADD CONSTRAINT fk_users_fid_media_profile FOREIGN KEY (fid_media_profile) REFERENCES media (id_media) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_fid_media_cover FOREIGN KEY (fid_media_cover) REFERENCES media (id_media) ON DELETE SET NULL;