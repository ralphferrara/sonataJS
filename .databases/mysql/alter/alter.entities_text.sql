ALTER TABLE entities_text
ADD CONSTRAINT fk_fid_entity
FOREIGN KEY (fid_entity)
REFERENCES entities(id_entity)
ON DELETE CASCADE;