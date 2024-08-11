CREATE TABLE IF NOT EXISTS TB_PUNCH_IN (punch_in_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, punch_in_type TEXT, punch_in_account TEXT, punch_in_password TEXT, notify_email TEXT);
CREATE TABLE IF NOT EXISTS TB_PUNCH_IN_LOG (punch_in_log_id INTEGER PRIMARY KEY AUTOINCREMENT, punch_in_id INTEGER, punch_in_datetime TEXT, punch_in_status TEXT, punch_in_memo TEXT);
CREATE TABLE IF NOT EXISTS TB_USER (user_id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, password TEXT, email TEXT)
