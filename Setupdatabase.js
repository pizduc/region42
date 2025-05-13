import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Убирай, если работаешь локально
});

// SQL-запросы по отдельности
const alterColumnSQL = `
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'login_type'
    ) THEN
      ALTER TABLE users ADD COLUMN login_type VARCHAR(50);
    END IF;
  END
  $$;
`;

const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(100) NOT NULL,
    house VARCHAR(50) NOT NULL,
    apartment VARCHAR(50) NOT NULL,
    contract_number VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) UNIQUE,
    is_special_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    login_type VARCHAR(50)
  );

  CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_verification (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS meter_readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    hot_water DECIMAL(10, 2) NOT NULL,
    cold_water DECIMAL(10, 2) NOT NULL,
    electricity DECIMAL(10, 2) NOT NULL,
    reading_date TIMESTAMP NOT NULL,
    reading_year INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM reading_date)::INT) STORED,
    reading_month INT GENERATED ALWAYS AS (EXTRACT(MONTH FROM reading_date)::INT) STORED,
    UNIQUE (user_id, reading_year, reading_month)
  );

  CREATE TABLE IF NOT EXISTS paid_services (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cold_water DECIMAL(10, 2),
    hot_water DECIMAL(10, 2),
    electricity DECIMAL(10, 2),
    reading_date TIMESTAMP NOT NULL,
    sum DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    services TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications2 (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    description TEXT NOT NULL,
    date VARCHAR(50),
    time VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const insertUserSQL = `
  INSERT INTO users (
    city, street, house, apartment, contract_number, account_number, is_special_user
  )
  VALUES (
    'Кемерово', 'Комсомольский проспект', '11', '217', '000000000000', '5597530942348642', true
  )
  ON CONFLICT (account_number) DO NOTHING;
`;

async function setup() {
  try {
    await client.connect();
    await client.query(createTablesSQL);
    await client.query(alterColumnSQL); // Выполняем отдельно!
    await client.query(insertUserSQL);
    console.log("✅ Таблицы успешно созданы и данные добавлены!");
  } catch (err) {
    console.error("❌ Ошибка при инициализации базы данных:", err);
  } finally {
    await client.end();
  }
}

setup();
