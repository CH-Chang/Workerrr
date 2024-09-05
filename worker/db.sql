CREATE TABLE IF NOT EXISTS TB_PUNCH_IN (punch_in_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, punch_in_type TEXT, punch_in_account TEXT, punch_in_password TEXT, punch_in_enable TEXT, punch_in_batch INTEGER , notify_email TEXT);
CREATE TABLE IF NOT EXISTS TB_PUNCH_IN_LOG (punch_in_log_id INTEGER PRIMARY KEY AUTOINCREMENT, punch_in_id INTEGER, punch_in_datetime TEXT, punch_in_status TEXT, punch_in_memo TEXT);
CREATE TABLE IF NOT EXISTS TB_EMAIL_LOG (email_id INTEGER PRIMARY KEY AUTOINCREMENT, [to] TEXT, subject TEXT, content TEXT, success TEXT, [message] TEXT, datetime TEXT);
CREATE TABLE IF NOT EXISTS TB_USER (user_id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, password TEXT, name TEXT, email TEXT);
CREATE TABLE IF NOT EXISTS TB_CRON (cron_id INTEGER PRIMARY KEY AUTOINCREMENT, cron_key TEXT, cron_task TEXT, cron_arguments TEXT);
CREATE TABLE IF NOT EXISTS TB_PUNCH_IN_MANUAL (punch_in_manual_id INTEGER PRIMARY KEY AUTOINCREMENT, punch_in_id INTEGER, punch_in_manual_date TEXT, punch_in_manual_type TEXT, punch_in_manual_argument TEXT);
CREATE TABLE IF NOT EXISTS TB_SCHEDULE (schedule_id INTEGER PRIMARY KEY AUTOINCREMENT, schedule_token TEXT, punch_in_id INTEGER, schedule_expiration_datetime TEXT);
CREATE TABLE IF NOT EXISTS TB_OTP (otp_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, otp_key TEXT, otp TEXT, otp_type TEXT, otp_purpose TEXT, otp_argument TEXT, otp_expiration_datetime TEXT);
