ALTER TABLE comments
ADD CONSTRAINT fk_comments_fid_comment FOREIGN KEY (fid_comment) REFERENCES comments(id_comment) ON DELETE CASCADE,
ADD CONSTRAINT fk_comments_fid_user FOREIGN KEY (fid_user) REFERENCES users(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_comments_fid_recipient FOREIGN KEY (fid_recipient) REFERENCES users(id_user) ON DELETE CASCADE;
