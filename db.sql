CREATE TABLE IF NOT EXISTS TB_PUNCH_IN (punch_in_id INTEGER PRIMARY KEY, user_id INTEGER, punch_in_type TEXT, punch_in_account TEXT, punch_in_password TEXT, notify_email TEXT);
CREATE TABLE IF NOT EXISTS TB_USER (user_id INTEGER PRIMARY KEY, account TEXT, password TEXT, email TEXT)
