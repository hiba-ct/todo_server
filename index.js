require('dotenv').config(); // must be at the top

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (!err) {
    console.log("✅ Connected to database successfully");
  } else {
    console.error("❌ Database connection failed:", err.message);
  }
});

app.get('/', (req, res) => {
  res.status(200).send('<h1 style="color:red;">Server running successfully starting</h1>');
});

// Add all your routes like /new-task, /read-task etc. (no change needed except fixed bug mentioned)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
