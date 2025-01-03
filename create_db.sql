-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema fitter
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema fitter
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `fitter`;
USE `fitter` ;

-- -----------------------------------------------------
-- Table `fitter`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `hashed_password` BINARY(60) NOT NULL,
  `firstname` VARCHAR(255) NOT NULL,
  `lastname` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `date_joined` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `follower_count` INT NOT NULL DEFAULT '0',
  `following_count` INT NOT NULL DEFAULT '0',
  `country` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(255) NULL DEFAULT NULL,
  `pfp_path` VARCHAR(1024) NULL DEFAULT NULL,
  `access_token` VARCHAR(255) NULL DEFAULT NULL,
  `refresh_token` VARCHAR(255) NULL DEFAULT NULL,
  `strava_id` BIGINT NULL DEFAULT NULL,
  `token_expiration` BIGINT NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`));


-- -----------------------------------------------------
-- Table `fitter`.`activity`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`activity` (
  `activity_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `post_id` INT NULL DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `start_date` DATETIME NOT NULL,
  `elapsed_time` INT NOT NULL,
  `calories` FLOAT NULL DEFAULT NULL,
  `distance` FLOAT NULL DEFAULT NULL,
  `average_speed` FLOAT NULL DEFAULT NULL,
  `average_watts` FLOAT NULL DEFAULT NULL,
  `max_speed` FLOAT NULL DEFAULT NULL,
  `max_watts` FLOAT NULL DEFAULT NULL,
  `strava_id` BIGINT NOT NULL,
  PRIMARY KEY (`activity_id`),
  CONSTRAINT `user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE);

CREATE INDEX `user_id_idx` ON `fitter`.`activity` (`user_id` ASC) ;


-- -----------------------------------------------------
-- Table `fitter`.`post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`post` (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `activity_id` INT NULL DEFAULT NULL,
  `body` TEXT NULL DEFAULT NULL,
  `date_posted` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `like_count` INT NOT NULL DEFAULT '0',
  `comment_count` INT NULL DEFAULT '0',
  PRIMARY KEY (`post_id`),
  CONSTRAINT `activity_id`
    FOREIGN KEY (`activity_id`)
    REFERENCES `fitter`.`activity` (`activity_id`)
    ON DELETE RESTRICT,
  CONSTRAINT `poster_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE);

CREATE INDEX `user_id_idx` ON `fitter`.`post` (`user_id` ASC) ;

CREATE INDEX `activity_id_idx` ON `fitter`.`post` (`activity_id` ASC) ;


-- -----------------------------------------------------
-- Table `fitter`.`comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`comment` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `body` TEXT NULL DEFAULT NULL,
  `date_commented` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `like_count` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`comment_id`),
  CONSTRAINT `commenter_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `postcommented_id`
    FOREIGN KEY (`post_id`)
    REFERENCES `fitter`.`post` (`post_id`)
    ON DELETE CASCADE);

CREATE INDEX `commenter_id_idx` ON `fitter`.`comment` (`user_id` ASC) ;

CREATE INDEX `postcommented_id_idx` ON `fitter`.`comment` (`post_id` ASC) ;


-- -----------------------------------------------------
-- Table `fitter`.`comment_like`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`comment_like` (
  `comment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  CONSTRAINT `commentliked_id`
    FOREIGN KEY (`comment_id`)
    REFERENCES `fitter`.`comment` (`comment_id`)
    ON DELETE CASCADE,
  CONSTRAINT `commentliker_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE);

CREATE INDEX `commentliked_id_idx` ON `fitter`.`comment_like` (`comment_id` ASC) ;

CREATE INDEX `commentliker_id_idx` ON `fitter`.`comment_like` (`user_id` ASC) ;


-- -----------------------------------------------------
-- Table `fitter`.`follower`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`follower` (
  `user_id` INT NOT NULL,
  `follower_id` INT NOT NULL,
  CONSTRAINT `follower_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `following_id`
    FOREIGN KEY (`follower_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE);

CREATE INDEX `follower_id_idx` ON `fitter`.`follower` (`user_id` ASC) ;

CREATE INDEX `following_id_idx` ON `fitter`.`follower` (`follower_id` ASC) ;


-- -----------------------------------------------------
-- Table `fitter`.`post_like`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fitter`.`post_like` (
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  CONSTRAINT `liker_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `fitter`.`user` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `postliked_id`
    FOREIGN KEY (`post_id`)
    REFERENCES `fitter`.`post` (`post_id`)
    ON DELETE CASCADE);

CREATE INDEX `liker_id_idx` ON `fitter`.`post_like` (`user_id` ASC) ;

CREATE INDEX `postliked_id` ON `fitter`.`post_like` (`post_id` ASC) ;

USE `fitter` ;

-- -----------------------------------------------------
-- procedure pr_apigetposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_apigetposts`()
BEGIN
	SELECT * FROM vw_allpostinfo ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_apisearchposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_apisearchposts`(search_text TEXT)
BEGIN
	SELECT * FROM vw_allpostinfo
	WHERE body LIKE CONCAT('%', search_text, '%')
	ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_deletecomment
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_deletecomment`(deleted_comment_id INT, session_user_id INT)
BEGIN
	UPDATE post
		SET comment_count = comment_count - 1
        WHERE post_id = (SELECT post_id FROM comment WHERE comment_id = deleted_comment_id);
	DELETE FROM comment
    WHERE comment_id = deleted_comment_id AND user_id = session_user_id;
    
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_deletecommentlike
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_deletecommentlike`(unliked_comment_id INT, unliker_id INT)
BEGIN
DELETE FROM comment_like
		WHERE comment_id = unliked_comment_id
		AND user_id = unliker_id;
        
UPDATE comment
		SET like_count = like_count - 1
		WHERE comment_id = unliked_comment_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_deletepost
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_deletepost`(deleted_post_id INT, session_user_id INT)
BEGIN
	DELETE FROM post
    WHERE post_id = deleted_post_id AND user_id = session_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_deletepostlike
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_deletepostlike`(unliked_post_id INT, unliker_id INT)
BEGIN
	DELETE FROM post_like
		WHERE post_id = unliked_post_id
		AND user_id = unliker_id;
                    
	UPDATE post
		SET like_count = like_count - 1
		WHERE post_id = unliked_post_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_follow
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_follow`(session_user_id INT, following_id INT)
BEGIN
	INSERT INTO follower(user_id, follower_id) VALUES (following_id, session_user_id);
    UPDATE user
		SET follower_count = follower_count + 1
        WHERE user_id = following_id;
	UPDATE user
		SET following_count = following_count + 1
        WHERE user_id = session_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_getactivities
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_getactivities`(session_user_id INT)
BEGIN
	SELECT activity_id, post_id, name, start_date, elapsed_time, calories, distance, average_speed, average_watts, max_speed, max_watts
    FROM activity
    WHERE user_id = session_user_id ORDER BY start_date DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_getlastactivity
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_getlastactivity`(session_user_id INT)
BEGIN
	SELECT start_date
    FROM activity
    WHERE user_id = session_user_id
    ORDER BY start_date DESC LIMIT 1;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_getlikedposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_getlikedposts`(session_user_id INT, profile_username VARCHAR(64))
BEGIN
SELECT *,
                    CASE 
                        WHEN session_user_id IN (SELECT user_id FROM post_like WHERE post_like.post_id = vw_allpostinfo.post_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked
FROM vw_allpostinfo
WHERE (SELECT user_id FROM user WHERE username = profile_username) IN (SELECT user_id FROM post_like WHERE post_like.post_id = vw_allpostinfo.post_id)
ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_getuserapitoken
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_getuserapitoken`(session_user_id INT)
BEGIN
	SELECT access_token, refresh_token, token_expiration FROM user
    WHERE session_user_id = user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_indexposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_indexposts`(session_user_id INT)
BEGIN
SELECT *,
                    CASE 
                        WHEN session_user_id IN (SELECT user_id FROM post_like WHERE post_like.post_id = vw_allpostinfo.post_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked
FROM vw_allpostinfo
ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_login
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_login`(login_username VARCHAR(64))
BEGIN
SELECT hashed_password, user_id, strava_id
                    FROM user 
                    WHERE username = login_username;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_makecomment
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_makecomment`(commenter_id INT, commented_post_id INT, content TEXT)
BEGIN
	INSERT INTO comment(user_id, post_id, body) VALUES (commenter_id, commented_post_id, content);
    UPDATE post
		SET comment_count = comment_count + 1
        WHERE post_id = commented_post_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_makecommentlike
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_makecommentlike`(liked_comment_id INT, liker_id INT)
BEGIN
	INSERT INTO comment_like (comment_id, user_id)
	VALUES (liked_comment_id, liker_id);
    
    UPDATE comment
		SET like_count = like_count + 1
		WHERE comment_id = liked_comment_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_makepost
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_makepost`(poster_id INT, post_text TEXT, post_activity_id INT)
BEGIN
    
	INSERT INTO post (user_id, body, activity_id)
	VALUES (poster_id, post_text, post_activity_id);
    
    SET @PostID = LAST_INSERT_ID();
    
	UPDATE activity
		SET post_id = @PostID
		WHERE activity_id = post_activity_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_makepostlike
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_makepostlike`(liked_post_id INT, liker_id INT)
BEGIN
	INSERT INTO post_like (post_id, user_id)
		VALUES (liked_post_id, liker_id);
        
	UPDATE post
		SET like_count = like_count + 1
		WHERE post_id = liked_post_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_postcomments
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_postcomments`(commented_post_id INT, session_user_id INT)
BEGIN
	SELECT c.comment_id, c.user_id, c.body, c.like_count, c.date_commented, u.username, CASE 
                        WHEN session_user_id IN (SELECT user_id FROM comment_like WHERE comment_like.comment_id = c.comment_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked
	FROM comment c
    INNER JOIN user u ON u.user_id = c.user_id
    WHERE commented_post_id = c.post_id
    ORDER BY c.date_commented DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_postinfo
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_postinfo`(requested_post_id INT, session_user_id INT)
BEGIN
	SELECT p.post_id, p.activity_id, p.user_id, p.body, p.date_posted, p.like_count, p.comment_count, u.username, a.name, a.start_date, a.elapsed_time, a.calories, a.distance, a.average_speed, a.average_watts, a.max_speed, a.max_watts,
                    CASE 
                        WHEN session_user_id IN (SELECT user_id FROM post_like WHERE post_like.post_id = requested_post_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked,
                    CASE
						WHEN session_user_id = p.user_id
                        THEN 1
                        ELSE 0
					END AS is_postedByUser
	FROM post p JOIN user u ON p.user_id = u.user_id
    LEFT JOIN activity a ON a.activity_id = p.activity_id
    WHERE p.post_id = requested_post_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_profileinfo
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_profileinfo`(profile_username VARCHAR(64), session_user_id INT)
BEGIN
	SELECT COUNT(pl.user_id) AS post_like_count, u.user_id, u.date_joined, u.follower_count, u.following_count, u.country, u.city, u.strava_id, CASE
					WHEN session_user_id IN (SELECT follower_id FROM follower WHERE follower.user_id = user_id)
                    THEN 1
                    ELSE 0
					END AS is_followed
    FROM user u
    LEFT JOIN post_like pl ON u.user_id = pl.user_id
	WHERE username = profile_username
    GROUP BY user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_profileposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_profileposts`(session_user_id INT, profile_username VARCHAR(64))
BEGIN
SELECT *,
                    CASE 
                        WHEN session_user_id IN (SELECT user_id FROM post_like WHERE post_like.post_id = vw_allpostinfo.post_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked
FROM vw_allpostinfo
WHERE username = profile_username
ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_registeruser
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_registeruser`(new_username VARCHAR(64), new_hashed_password BINARY(60), new_firstname VARCHAR(255), new_lastname VARCHAR(255), new_email VARCHAR(255))
BEGIN
INSERT INTO user
                        (username, hashed_password, firstname, lastname, email) 
                        VALUES (new_username, new_hashed_password, new_firstname, new_lastname, new_email);
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_searchedposts
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_searchedposts`(session_user_id INT, search_text VARCHAR(255))
BEGIN
SELECT *,
                    CASE 
                        WHEN session_user_id IN (SELECT user_id FROM post_like WHERE post_like.post_id = vw_allpostinfo.post_id)
                        THEN 1
                        ELSE 0
                    END AS is_liked
FROM vw_allpostinfo
WHERE body LIKE CONCAT('%', search_text, '%')
ORDER BY date_posted DESC;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_setuserstravadata
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_setuserstravadata`(session_user_id INT, atoken VARCHAR(255), rtoken VARCHAR(255), usercountry VARCHAR(255), usercity VARCHAR(255), sid INT, tokenexp BIGINT)
BEGIN
	UPDATE user 
			SET access_token = atoken, refresh_token = rtoken, country = usercountry, city = usercity, strava_id = sid, token_expiration = tokenexp
			WHERE session_user_id = user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_unfollow
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_unfollow`(session_user_id INT, unfollowed_id INT)
BEGIN
	DELETE FROM follower WHERE user_id = unfollowed_id AND follower_id = session_user_id;
    UPDATE user
		SET follower_count = follower_count - 1
        WHERE user_id = unfollowed_id;
	UPDATE user
		SET following_count = following_count - 1
        WHERE user_id = session_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure pr_updateuserapitoken
-- -----------------------------------------------------

DELIMITER $$
USE `fitter`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `pr_updateuserapitoken`(session_user_id INT, new_access_token VARCHAR(255), new_token_expiration BIGINT)
BEGIN
	UPDATE user
		SET access_token = new_access_token, token_expiration = new_token_expiration
		WHERE user_id = session_user_id;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- View `fitter`.`vw_allpostinfo`
-- -----------------------------------------------------
USE `fitter`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `fitter`.`vw_allpostinfo` AS select `p`.`post_id` AS `post_id`,`p`.`activity_id` AS `activity_id`,`p`.`body` AS `body`,`p`.`date_posted` AS `date_posted`,`p`.`like_count` AS `like_count`,`p`.`comment_count` AS `comment_count`,`u`.`username` AS `username`,`a`.`name` AS `name`,`a`.`start_date` AS `start_date`,`a`.`elapsed_time` AS `elapsed_time`,`a`.`calories` AS `calories`,`a`.`distance` AS `distance`,`a`.`average_speed` AS `average_speed`,`a`.`average_watts` AS `average_watts`,`a`.`max_speed` AS `max_speed`,`a`.`max_watts` AS `max_watts` from ((`fitter`.`post` `p` join `fitter`.`user` `u` on((`u`.`user_id` = `p`.`user_id`))) left join `fitter`.`activity` `a` on((`a`.`activity_id` = `p`.`activity_id`)));

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- Create the app user
CREATE USER IF NOT EXISTS 'fitter_app'@'localhost' IDENTIFIED BY 'password'; 
GRANT ALL PRIVILEGES ON fitter.* TO 'fitter_app'@'localhost';
