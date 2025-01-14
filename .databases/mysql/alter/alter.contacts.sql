ALTER TABLE contacts
ADD CONSTRAINT fk_entities_fid_entity
FOREIGN KEY (fid_entity)
REFERENCES entities(id_entity)
ON DELETE CASCADE;