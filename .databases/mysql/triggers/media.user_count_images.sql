DELIMITER $$
CREATE TRIGGER media_update_user_count_images AFTER INSERT ON media
FOR EACH ROW
BEGIN
    IF NEW.media_type = 'P' THEN
        UPDATE users
        SET user_count_images = user_count_images + 1
        WHERE id_user = NEW.fid_user;
    END IF;
END$$
DELIMITER ;