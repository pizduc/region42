import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const config = {
  port: process.env.PORT || 10000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: isProduction ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  apis: {
    dadataApiKey: process.env.DADATA_API_KEY,
    yandexApiKey: process.env.YANDEX_API_KEY,
  },
  cors: {
    origins: isProduction 
      ? ["https://best-yard.onrender.com"]
      : ["http://localhost:8080"],
  },
};

export default config;
