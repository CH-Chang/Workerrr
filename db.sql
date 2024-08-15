CREATE TABLE IF NOT EXISTS TB_PUNCH_IN (punch_in_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, punch_in_type TEXT, punch_in_account TEXT, punch_in_password TEXT, punch_in_enable TEXT, notify_email TEXT);
CREATE TABLE IF NOT EXISTS TB_PUNCH_IN_LOG (punch_in_log_id INTEGER PRIMARY KEY AUTOINCREMENT, punch_in_id INTEGER, punch_in_datetime TEXT, punch_in_status TEXT, punch_in_memo TEXT);
CREATE TABLE IF NOT EXISTS TB_EMAIL_LOG (email_id INTEGER PRIMARY KEY AUTOINCREMENT, [to] TEXT, subject TEXT, content TEXT, success TEXT, [message] TEXT, datetime TEXT);
CREATE TABLE IF NOT EXISTS TB_USER (user_id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, password TEXT, email TEXT)
CREATE TABLE IF NOT EXISTS TB_CRON (cron_id INTEGER PRIMARY KEY AUTOINCREMENT, cron_key TEXT, cron_task TEXT)
CREATE TABLE IF NOT EXISTS TB_PUNCH_IN_MANUAL (punch_in_manual_id INTEGER PRIMARY KEY AUTOINCREMENT, punch_in_id TEXT, punch_in_manual_date TEXT, punch_in_manual_type TEXT, punch_in_manual_argument TEXT);
CREATE TABLE IF NOT EXISTS TB_CACHE (cache_id INTEGER PRIMARY KEY AUTOINCREMENT, cache_key TEXT, cache_content TEXT, cache_expiration_datetime TEXT)
