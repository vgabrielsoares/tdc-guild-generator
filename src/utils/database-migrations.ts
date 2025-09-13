import { DB_STORES } from "./database-schema";

export interface MigrationContext {
  db: IDBDatabase;
  oldVersion: number;
  newVersion: number;
}

// Lista de migrations indexadas por versão alvo
type MigrationFn = (ctx: MigrationContext) => void;

const migrations: Record<number, MigrationFn> = {
  1: () => {
    // Versão inicial: stores já serão criadas pelo schema, nada a migrar
  },
};

export function applyMigrations(
  db: IDBDatabase,
  oldVersion: number,
  newVersion: number
) {
  const ctx: MigrationContext = { db, oldVersion, newVersion };
  for (let v = oldVersion + 1; v <= newVersion; v++) {
    const fn = migrations[v];
    if (fn) fn(ctx);
  }
}

export function getInitialStores() {
  return DB_STORES;
}
