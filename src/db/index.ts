import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

export const createPool = () => {
  return new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL || "postgresql://postgres:Aditya%409942180655@db.lvdxuaoafxesoqlmywap.supabase.co:5432/postgres",
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });

