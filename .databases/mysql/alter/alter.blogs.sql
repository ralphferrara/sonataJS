ALTER TABLE `blogs`
ADD CONSTRAINT `fk_user`
FOREIGN KEY (`fid_user`)
REFERENCES `users` (`id_user`) -- Replace `users`(`id`) with your actual users table and primary key column name
ON DELETE CASCADE;