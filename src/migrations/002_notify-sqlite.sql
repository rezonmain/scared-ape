ALTER TABLE scraper ADD COLUMN shouldNotifyChanges INTEGER NOT NULL DEFAULT 0;
PRAGMA user_version = 2;