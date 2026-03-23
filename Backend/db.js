const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Residentevil5_??',
  database: process.env.DB_NAME || 'catalog_db'
})

async function initDb() {
  console.log('Initializing DB...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS process_steps (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      step_order INTEGER NOT NULL,
      previous_step_id INTEGER REFERENCES process_steps(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS process_steps_step_order_key
    ON process_steps(step_order);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS process_step_history (
      id BIGSERIAL PRIMARY KEY,
      step_id INTEGER,
      action TEXT NOT NULL,
      old_data JSONB,
      new_data JSONB,
      changed_by TEXT,
      changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  console.log('DB initialized successfully')
}

module.exports = {
  pool,
  initDb
}