import express from "express";
import axios from "axios";
import cors from "cors";
import pg from 'pg';  
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js"; // Подключаем конфиг

dotenv.config();

console.log("🚀 Сервер перезапущен и готов к работе!");

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8086;

const corsOrigins = process.env.CORS_ORIGINS || "http://localhost:8086,https://region42.onrender.com";

app.use(cors({
  origin: corsOrigins.split(','),
}));

app.use(express.json());

// Подключение к базе данных PostgreSQL
const { Client } = pg;
const db = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000, // Таймаут подключения
  idleTimeoutMillis: 10000,      // Таймаут для неактивных соединений
  ssl: {
    rejectUnauthorized: false // ⚠️ Можно использовать в dev-режиме
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ Ошибка подключения к базе данных PostgreSQL:", err);
    process.exit(1); // Завершаем процесс, если не удалось подключиться
  }
  console.log("✅ Подключение к базе данных PostgreSQL успешно!");
});

// ✅ Настройки Яндекс Саджест
const API_KEY = process.env.API_KEY;
const SUGGEST_URL = "https://suggest-maps.yandex.ru/v1/suggest";

async function fetchSuggestions(query, types) {
  try {
    const response = await axios.get("https://suggest-maps.yandex.ru/v1/suggest", {
      params: {
        apikey: process.env.API_KEY,  // или config.apis.yandexApiKey
        text: query,
        lang: "ru_RU",
        types: types,
      },
    });

    return response.data.results.map(item => item.title.text);
  } catch (error) {
    console.error("❌ Ошибка при запросе к Яндекс API:");
    if (error.response) {
      console.error("Статус ответа:", error.response.status);
      console.error("Данные ответа:", error.response.data);
    } else {
      console.error("Сообщение ошибки:", error.message);
    }
    throw new Error("Ошибка получения подсказок от Яндекса");
  }
}

// ✅ Маршрут получения подсказок
app.get("/api/suggest", async (req, res) => {
  const { query, type, city, street } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Запрос пуст" });
  }

  let types;
  let fullQuery = query;

  switch (type) {
    case "city":
      types = "geo";
      break;
    case "street":
      if (!city) return res.status(400).json({ error: "Город обязателен для поиска улиц" });
      types = "street";
      fullQuery = `${city} ${query}`;
      break;
    case "house":
      if (!city || !street) return res.status(400).json({ error: "Город и улица обязательны для поиска домов" });
      types = "house";
      fullQuery = `${city} ${street} ${query}`;
      break;
    default:
      return res.status(400).json({ error: "Некорректный тип поиска" });
  }

  const suggestions = await fetchSuggestions(fullQuery, types);
  res.json({ suggestions });
});

// Настройка SMTP для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // Автоматическое определение secure
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API для подачи заявки
app.post("/api/applications", (req, res) => {
  const { type, description, date, time, phone } = req.body;

  console.log("Полученные данные заявки:", req.body);

  if (!description) {
    return res.status(400).json({ message: "Описание проблемы обязательно" });
  }

  const sql = "INSERT INTO Applications (type, description, date, time, phone) VALUES (?, ?, ?, ?, ?)";
  const params = [type, description, date, time, phone];

  console.log("Запрос к базе данных:", sql);
  console.log("Параметры запроса:", params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ Ошибка записи в базу данных:", err);
      return res.status(500).json({ error: "Ошибка сервера. Не удалось сохранить заявку." });
    }

    console.log("✅ Заявка успешно записана в базу данных");
    res.json({ message: "Заявка принята!" });

    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!notifyEmail) {
      console.error("❌ Не задан email для уведомлений (NOTIFY_EMAIL)");
      return;
    }

    const typeLabels = {
      plumbing: "Сантехника",
      electrical: "Электрика",
      construction: "Строительные работы",
      other: "Другое",
    };    

    const translatedType = typeLabels[type] || type;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: notifyEmail,
      subject: "Новая заявка на ремонт",
      text: `Новая заявка на ремонт:\n
Тип: ${translatedType}
Описание: ${description}
Дата: ${date || "не указана"}
Время: ${time || "не указано"}
Телефон: ${phone || "не указан"}\n
Пожалуйста, свяжитесь с клиентом.`,
    };

    console.log("Параметры отправки email:", mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Ошибка отправки email:", error);
        return;
      }
      console.log("📩 Email отправлен:", info.response);
    });
  });
});

app.post("/api/login", (req, res) => {
  const { loginType, city, street, house, apartment, contract, accountNumber } = req.body;

  console.log("Запрос на логин:", req.body);

  let query;
  let values;

  if (loginType === "address") {
    if (!city || !street || !house || !apartment || !contract) {
      return res.status(400).json({ error: "Недостаточно данных для входа по адресу" });
    }

    query = `
      SELECT user_id, is_special_user FROM users
      WHERE city = ? AND street = ? AND house = ? AND apartment = ? AND contract_number = ?
    `;
    values = [city, street, house, apartment, contract];
  } else if (loginType === "account") {
    if (!accountNumber) {
      return res.status(400).json({ error: "Не указан номер лицевого счёта" });
    }

    query = `
      SELECT user_id, is_special_user FROM users
      WHERE account_number = ?
    `;
    values = [accountNumber];
  } else {
    return res.status(400).json({ error: "Некорректный тип логина" });
  }

  console.log("Запрос:", query);
  console.log("Значения:", values);

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Ошибка при запросе к базе:", err);
      return res.status(500).json({ error: "Ошибка сервера при логине" });
    }

    console.log("Результаты запроса:", results);

    if (results.length > 0) {
      const user = results[0];
      console.log("Данные пользователя:", user);

      res.json({
        success: true,
        userId: user.user_id,
        isSpecialUser: Boolean(Number(user.is_special_user)),
      });
    } else {
      console.log("Пользователь не найден");
      res.status(401).json({ success: false, error: "Пользователь не найден" });
    }
  });
});

// Пример API для получения данных пользователя по лицевому счету
app.post('/api/getUserAddress', async (req, res) => {
  const { accountNumber } = req.body;
  try {
    const user = await User.findOne({ accountNumber });
    console.log(user); // Логируем данные пользователя
    if (user) {
      res.json({
        city: user.city,
        street: user.street,
        house: user.house,
        apartment: user.apartment
      });
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// ✅ Получение всех новостей
app.get("/api/news", (req, res) => {
  db.query("SELECT * FROM news ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ Ошибка загрузки новостей:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
    res.json(results);
  });
});

// ✅ Добавление новости (только для specialUser)
app.post("/api/news", (req, res) => {
  const { title, content, userId } = req.body;
  
  if (!title || !content || !userId) {
    return res.status(400).json({ error: "Заголовок, текст и userId обязательны" });
  }

  const checkUserQuery = "SELECT is_special_user FROM users WHERE user_id = ?";
  db.query(checkUserQuery, [userId], (err, results) => {
    if (err) {
      console.error("❌ Ошибка при проверке пользователя:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (results.length === 0 || !results[0].is_special_user) {
      return res.status(403).json({ error: "Нет прав на добавление новостей" });
    }

    const insertQuery = "INSERT INTO news (title, content) VALUES (?, ?)";
    db.query(insertQuery, [title, content], (err) => {
      if (err) {
        console.error("❌ Ошибка при добавлении новости:", err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }
      console.log("✅ Новость добавлена!");
      res.json({ success: true, message: "Новость добавлена" });
    });
  });
});

// Маршрут для удаления новости
app.delete("/api/news/:id", (req, res) => {
  const { id } = req.params;  // Получаем ID новости из параметров URL
  const { userId } = req.query; // Получаем userId из query-параметра

  if (!userId) {
    return res.status(400).json({ error: "Не указан userId" });
  }

  // Проверка, является ли пользователь особым (specialUser)
  const checkUserQuery = "SELECT is_special_user FROM users WHERE user_id = ?";
  db.query(checkUserQuery, [userId], (err, results) => {
    if (err) {
      console.error("❌ Ошибка при проверке пользователя:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (results.length === 0 || !results[0].is_special_user) {
      return res.status(403).json({ error: "Нет прав на удаление новостей" });
    }

    // Удаление новости из базы данных
    const deleteQuery = "DELETE FROM news WHERE id = ?";
    db.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("❌ Ошибка при удалении новости:", err);
        return res.status(500).json({ error: "Ошибка при удалении новости" });
      }
      res.json({ success: true, message: "Новость удалена" });
    });
  });
});

// ✅ Получение последних показаний
app.get("/api/meter-readings", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Не указан userId" });
  }

  // Запрос на получение двух последних показаний за разные месяцы
  const query = `
    SELECT hot_water, cold_water, electricity, reading_date
    FROM meter_readings
    WHERE user_id = ?
    ORDER BY reading_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Ошибка при получении показаний:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (results.length === 0) {
      return res.json({
        currentReadings: { hot_water: 0, cold_water: 0, electricity: 0 },
        previousReadings: { hot_water: 0, cold_water: 0, electricity: 0 },
        difference: { hot_water: 0, cold_water: 0, electricity: 0 }
      });
    }

    // Группируем показания по месяцам
    const groupedReadings = {};
    results.forEach((reading) => {
      const monthKey = reading.reading_date.toISOString().slice(0, 7); // Формат YYYY-MM
      if (!groupedReadings[monthKey]) {
        groupedReadings[monthKey] = reading;
      }
    });

    // Берем два последних месяца
    const sortedMonths = Object.keys(groupedReadings).sort().reverse();
    const currentMonthKey = sortedMonths[0];
    const previousMonthKey = sortedMonths[1] || null;

    const currentReadings = groupedReadings[currentMonthKey] || { hot_water: 0, cold_water: 0, electricity: 0 };
    const previousReadings = groupedReadings[previousMonthKey] || { hot_water: 0, cold_water: 0, electricity: 0 };

    // Вычисляем разницу
    const difference = {
      hot_water: currentReadings.hot_water - previousReadings.hot_water,
      cold_water: currentReadings.cold_water - previousReadings.cold_water,
      electricity: currentReadings.electricity - previousReadings.electricity
    };

    res.json({ currentReadings, previousReadings, difference });
  });
});

// ✅ Добавление или обновление показаний
app.post("/api/meter-readings", (req, res) => {
  const { userId, hotWater, coldWater, electricity, readingDate } = req.body;

  if (!userId || !readingDate) {
    return res.status(400).json({ error: "Не указан userId или дата показаний" });
  }

  // Преобразуем дату в формат YYYY-MM для сравнения только по месяцу
  const formattedDate = readingDate.substring(0, 7); // Например: "2025-03"

  // 1️⃣ Получаем последние 2 записи
  const checkQuery = `
    SELECT id, reading_date FROM meter_readings
    WHERE user_id = ?
    ORDER BY reading_date DESC
  `;

  db.query(checkQuery, [userId], (err, results) => {
    if (err) {
      console.error("❌ Ошибка при проверке существующих показаний:", err);
      return res.status(500).json({ error: "Ошибка при проверке существующих показаний" });
    }

    // Удаляем старые показания, если их больше 2
    if (results.length >= 2) {
      const oldestId = results[results.length - 1].id;
      const deleteQuery = `DELETE FROM meter_readings WHERE id = ?`;

      db.query(deleteQuery, [oldestId], (err) => {
        if (err) {
          console.error("❌ Ошибка при удалении старых показаний:", err);
          return res.status(500).json({ error: "Ошибка при удалении старых показаний" });
        }
        console.log("🗑 Старые показания удалены");
      });
    }

    // Проверяем, есть ли уже запись за этот месяц
    const existingRecord = results.find((r) => 
      new Date(r.reading_date).toISOString().substring(0, 7) === formattedDate
    );    

    if (existingRecord) {
      // Если запись за месяц уже есть, обновляем её
      const updateQuery = `
        UPDATE meter_readings
        SET hot_water = ?, cold_water = ?, electricity = ?, reading_date = ?
        WHERE id = ?
      `;

      const updateValues = [hotWater, coldWater, electricity, readingDate, existingRecord.id];

      db.query(updateQuery, updateValues, (err) => {
        if (err) {
          console.error("❌ Ошибка при обновлении показаний:", err);
          return res.status(500).json({ error: "Ошибка при обновлении показаний" });
        }
        
        res.json({ success: true });
      });
    } else {
      // Если записи за месяц нет, добавляем новую
      const insertQuery = `
        INSERT INTO meter_readings (user_id, hot_water, cold_water, electricity, reading_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      const insertValues = [userId, hotWater, coldWater, electricity, readingDate];

      db.query(insertQuery, insertValues, (err) => {
        if (err) {
          console.error("❌ Ошибка при добавлении показаний:", err);
          return res.status(500).json({ error: "Ошибка при добавлении показаний" });
        }
        res.json({ success: true });
      });
    }
  });
});

app.get("/api/calculate-payment", async (req, res) => {
  const { userId, selectedServices } = req.query;

  if (!userId || !selectedServices) {
    return res.status(400).json({ error: "Не указан userId или выбранные услуги" });
  }

  const selectedServicesArray = selectedServices.split(",").map(s => s.trim()).filter(Boolean);
  let totalAmount = 0;

  const tariffs = {
    heating: 500,
    maintenance: 300,
    hot_water: 17.51,
    cold_water: 80.69,
    electricity: 4.70
  };

  if (selectedServicesArray.includes("heating")) totalAmount += tariffs.heating;
  if (selectedServicesArray.includes("maintenance")) totalAmount += tariffs.maintenance;

  // Получаем список оплаченных месяцев (с использованием reading_date)
  const paidMonthsQuery = `
    SELECT reading_date FROM paid_services WHERE user_id = ?
  `;

  db.query(paidMonthsQuery, [userId], (err, paidResults) => {
    if (err) {
      console.error("Ошибка при получении оплаченных месяцев:", err);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    const paidMonths = paidResults.map(row => row.reading_date);

    // Получаем последние два показания счетчиков
    const readingsQuery = `
      SELECT hot_water, cold_water, electricity, reading_date
      FROM meter_readings
      WHERE user_id = ?
      ORDER BY reading_date DESC
      LIMIT 2
    `;

    db.query(readingsQuery, [userId], (err, results) => {
      if (err) {
        console.error("Ошибка при получении данных о показаниях:", err);
        return res.status(500).json({ error: "Ошибка при получении показаний" });
      }

      if (results.length === 0) {
        return res.json({
          totalAmount: totalAmount.toFixed(2),
          paidMonths,
          warning: "Нет данных о предыдущих показаниях"
        });
      }

      const current = results[0];
      const previous = results[1] || { hot_water: 0, cold_water: 0, electricity: 0 };

      const consumption = {
        hot_water: Math.max(parseFloat(current.hot_water || 0) - parseFloat(previous.hot_water || 0), 0),
        cold_water: Math.max(parseFloat(current.cold_water || 0) - parseFloat(previous.cold_water || 0), 0),
        electricity: Math.max(parseFloat(current.electricity || 0) - parseFloat(previous.electricity || 0), 0)
      };

      if (selectedServicesArray.includes("hot_water")) {
        totalAmount += isNaN(consumption.hot_water) ? 0 : consumption.hot_water * tariffs.hot_water;
      }
      if (selectedServicesArray.includes("cold_water")) {
        totalAmount += isNaN(consumption.cold_water) ? 0 : consumption.cold_water * tariffs.cold_water;
      }
      if (selectedServicesArray.includes("electricity")) {
        totalAmount += isNaN(consumption.electricity) ? 0 : consumption.electricity * tariffs.electricity;
      }

      res.json({
        totalAmount: totalAmount.toFixed(2),
        paidMonths,
        details: {
          heating: selectedServicesArray.includes("heating") ? tariffs.heating : 0,
          maintenance: selectedServicesArray.includes("maintenance") ? tariffs.maintenance : 0,
          hot_water: selectedServicesArray.includes("hot_water") ? (consumption.hot_water * tariffs.hot_water) : 0,
          cold_water: selectedServicesArray.includes("cold_water") ? (consumption.cold_water * tariffs.cold_water) : 0,
          electricity: selectedServicesArray.includes("electricity") ? (consumption.electricity * tariffs.electricity) : 0
        }
      });
    });
  });
});

app.post("/api/payments", (req, res) => {
  const { userId, readingDate, services, totalAmount, paymentMethod } = req.body;

  if (!userId || !readingDate || !services || services.length === 0 || !totalAmount || !paymentMethod) {
    return res.status(400).json({ error: "Некорректные данные" });
  }

  // Преобразуем строку в дату и получаем месяц (например, 3 для марта)
  const date = new Date(readingDate);  // readingDate будет вида '2025-03-17'
  const monthNumber = date.getMonth() + 1;  // getMonth() возвращает месяц от 0 до 11, поэтому прибавляем 1

  const checkQuery = `
    SELECT reading_date FROM paid_services
    WHERE user_id = ? AND MONTH(reading_date) = ?
  `;

  db.query(checkQuery, [userId, monthNumber], (err, results) => {
    if (err) {
      console.error("Ошибка при проверке оплаченных месяцев:", err);
      return res.status(500).json({ error: "Ошибка сервера при проверке оплат" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Оплата за этот месяц уже произведена" });
    }

    // Если оплаты не было, добавляем в БД
    const insertQuery = `
      INSERT INTO paid_services (user_id, reading_date, services, sum, payment_method)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [userId, readingDate, JSON.stringify(services), totalAmount, paymentMethod], (err) => {
      if (err) {
        console.error("Ошибка при записи оплаты в БД:", err);
        return res.status(500).json({ error: "Ошибка сервера при сохранении оплаты" });
      }

      res.json({ success: true, message: "Оплата успешно сохранена" });
    });
  });
});

app.post("/api/save-payment", (req, res) => {
  const { userId, selectedMonth, selectedServices, totalAmount, paymentMethod } = req.body;

  // Проверка на корректность данных
  if (!userId || !selectedMonth || !selectedServices || totalAmount === undefined || !paymentMethod) {
    return res.status(400).json({ error: "Некорректные данные" });
  }

  // Получаем текущую дату для 'reading_date' в формате 'YYYY-MM-DD HH:MM:SS'
  const readingDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Примерный запрос для вставки данных в таблицу 'paid_services'
  const insertQuery = `
    INSERT INTO paid_services 
    (user_id, cold_water, hot_water, electricity, reading_date, sum, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Используем данные, полученные из расчетов платежа
  const coldWaterAmount = selectedServices.includes("cold_water") ? totalAmount * 0.2 : 0; // Примерная логика для расчета стоимости
  const hotWaterAmount = selectedServices.includes("hot_water") ? totalAmount * 0.3 : 0;
  const electricityAmount = selectedServices.includes("electricity") ? totalAmount * 0.5 : 0;

  // Преобразуем текущую дату для 'created_at' в формат 'YYYY-MM-DD HH:MM:SS'
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Избавляемся от суффикса 'Z' и T

  db.query(insertQuery, [
    userId,
    coldWaterAmount,
    hotWaterAmount,
    electricityAmount,
    readingDate,
    totalAmount,
    currentDate
  ], (err) => {
    if (err) {
      console.error("Ошибка при сохранении данных в БД:", err);
      return res.status(500).json({ error: "Ошибка сервера при сохранении данных оплаты" });
    }

    // Отправка ответа о успешной операции
    res.json({ success: true });
  });
});

app.get("/api/paid-months", (req, res) => {
  const { userId } = req.query;

  // Проверка на наличие userId
  if (!userId) {
    return res.status(400).json({ error: "Отсутствует идентификатор пользователя" });
  }

  // Запрос для получения уникальных оплаченных месяцев для данного пользователя
  const query = `
    SELECT DISTINCT DATE_FORMAT(reading_date, '%Y-%m') AS paid_month
    FROM paid_services
    WHERE user_id = ?
    ORDER BY paid_month DESC;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Ошибка при извлечении данных о месяцах:", err);
      return res.status(500).json({ error: "Ошибка сервера при извлечении данных" });
    }

    // Если данные найдены
    if (results.length > 0) {
      // Возвращаем список оплаченных месяцев
      const paidMonths = results.map(row => row.paid_month);
      return res.json({ paidMonths });
    }

    // Если нет данных о платежах
    res.status(404).json({ error: "Не найдены оплаченные месяцы для данного пользователя" });
  });
});

// Получение данных профиля
app.get('/api/user/profile/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM user_profiles WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении профиля:', err);
      return res.status(500).json({ error: 'Ошибка при получении профиля' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Профиль не найден' });
    }

    res.json(results[0]);
  });
});

// Сохранение или обновление данных профиля (POST)
app.post('/api/user/profile', (req, res) => {
  const { userId, lastName, firstName, middleName, phone, email } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId обязателен' });
  }

  // 1. Удаляем старые данные
  const deleteQuery = 'DELETE FROM user_profiles WHERE user_id = ?';

  db.query(deleteQuery, [userId], (err) => {
    if (err) {
      console.error('Ошибка при удалении старых данных профиля:', err);
      return res.status(500).json({ error: 'Ошибка при удалении старых данных профиля' });
    }

    // 2. Добавляем новые данные
    const insertQuery = `
      INSERT INTO user_profiles (user_id, last_name, first_name, middle_name, phone, email)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [userId, lastName, firstName, middleName, phone, email], (err) => {
      if (err) {
        console.error('Ошибка при сохранении профиля:', err);
        return res.status(500).json({ error: 'Ошибка при сохранении профиля' });
      }

      res.json({ message: 'Данные профиля сохранены' });
    });
  });
});

// Подсказка ФИО через Dadata
app.get("/api/suggest-fio", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Необходимо указать параметр query" });
  }

  try {
    const response = await axios.post(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio",
      { query },
      {
        headers: {
          Authorization: `Token ${process.env.DADATA_API_KEY}`,
        },
      }
    );

    console.log("✅ Ответ от Dadata:", response.data);
    const suggestions = Array.isArray(response.data.suggestions) ? response.data.suggestions : [];
    res.json({ suggestions });
  } catch (error) {
    console.error("❌ Ошибка при запросе к Dadata API:", error.message);
    if (error.response) {
      console.error("Ответ ошибки от Dadata API:", error.response.data);
    }
    res.status(500).json({ error: "Ошибка при запросе к Dadata API" });
  }
});

const buildPath = path.resolve(__dirname, './dist');

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Старт сервера
app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${config.port}`);
});
