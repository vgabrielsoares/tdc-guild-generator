// Database runtime configuration
export const DB_NAME = "guild-generator-db";
export const DB_VERSION = 1;

// Transaction timeout in milliseconds
export const TRANSACTION_TIMEOUT_MS = 30_000;

// Simple in-memory cache configuration
export const CACHE_ENABLED = true;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Backup settings
export const AUTO_BACKUP_ENABLED = true;
export const AUTO_BACKUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
