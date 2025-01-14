ALTER TABLE entities
  ADD CONSTRAINT fk_entities_fid_user
  FOREIGN KEY (fid_user)
  REFERENCES users(id_user)
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_entities_fid_media_profile
  FOREIGN KEY (fid_media_profile)
  REFERENCES media(id_media)
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_entities_fid_media_cover
  FOREIGN KEY (fid_media_cover)
  REFERENCES media(id_media)
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_fid_time
  FOREIGN KEY (fid_time)
  REFERENCES times(id_time)
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_fid_contact
  FOREIGN KEY (fid_contact)
  REFERENCES contacts(id_contact)
  ON DELETE CASCADE;