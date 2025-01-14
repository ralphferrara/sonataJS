DELIMITER $$
CREATE TRIGGER media_update_user_count_videos AFTER INSERT ON media
FOR EACH ROW
BEGIN
    IF NEW.media_type = 'V' THEN
        UPDATE users
        SET user_count_videos = user_count_videos + 1
        WHERE id_user = NEW.fid_user;
    END IF;
END$$
DELIMITER ;