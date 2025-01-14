-- Add foreign key constraint for fid_category
ALTER TABLE categories
ADD CONSTRAINT fk_categories_fid_category
FOREIGN KEY (fid_category)
REFERENCES categories(id_category)
ON DELETE CASCADE;