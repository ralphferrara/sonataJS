ALTER TABLE connections
  ADD CONSTRAINT fk_connections_fid_user FOREIGN KEY (fid_user) REFERENCES users(id_user) ON DELETE CASCADE,
  ADD CONSTRAINT fk_connections_fid_recipient FOREIGN KEY (fid_recipient) REFERENCES users(id_user) ON DELETE CASCADE,
  ADD INDEX idx_connections_new_fid_area_connection_area (fid_area, connection_area);
