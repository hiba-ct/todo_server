require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// ✅ CORS: Allow only your Vercel frontend domain
app.use(cors({
  origin: "https://todo-frontend-chi-sepia.vercel.app", // ✅ Replace with your frontend domain
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ MySQL connection (Railway)
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // e.g., caboose.proxy.rlwy.net
  user: process.env.DB_USER,     // e.g., root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, // e.g., railway
  port: process.env.DB_PORT      // e.g., 35791
});

// ✅ Connect to database
db.connect((err) => {
  if (!err) {
    console.log("✅ Connected to MySQL database.");
  } else {
    console.error("❌ DB Connection Error:", err.message);
  }
});

// ✅ Home route (test)
app.get('/', (req, res) => {
  res.send("<h1 style='color:green'>🟢 Server is running and connected to MySQL</h1>");
});

// ✅ Read all tasks
app.get('/read-tasks', (req, res) => {
  const q = "SELECT * FROM todos";
  db.query(q, (err, result) => {
    if (err) {
      console.error("❌ Error fetching tasks:", err.message);
      return res.status(500).send("Server error");
    }
    res.json(result);
  });
});

// ✅ Add a new task
app.post('/new-task', (req, res) => {
  const { task } = req.body;

  console.log("📦 Task received from frontend:", task);

  if (!task) {
    return res.status(400).send("Task field is required");
  }

  const q = "INSERT INTO todos (task, createdAt, status) VALUES (?, ?, ?)";
  const values = [task, new Date(), "active"];

  db.query(q, values, (err, result) => {
    if (err) {
      console.error("❌ Failed to insert task:", err.message);
      return res.status(500).send("Insert failed");
    }
    console.log("✅ Task inserted successfully");
    db.query('SELECT * FROM todos', (e, newList) => res.send(newList));
  });
});

// ✅ Update a task
app.post('/update-task', (req, res) => {
  const { id, task } = req.body;
  const q = "UPDATE todos SET task = ? WHERE id = ?";
  db.query(q, [task, id], (err, result) => {
    if (err) {
      console.error("❌ Update failed:", err.message);
      return res.status(500).send("Update error");
    }
    res.send("✅ Task updated");
  });
});

// ✅ Delete a task
app.post('/delete-task', (req, res) => {
  const { id } = req.body;
  const q = "DELETE FROM todos WHERE id = ?";
  db.query(q, [id], (err, result) => {
    if (err) {
      console.error("❌ Delete failed:", err.message);
      return res.status(500).send("Delete error");
    }
    db.query('SELECT * FROM todos', (e, newList) => res.send(newList));
  });
});

// ✅ Mark task as complete
app.post('/complete-task', (req, res) => {
  const { id } = req.body;
  const q = "UPDATE todos SET status = ? WHERE id = ?";
  db.query(q, ["completed", id], (err, result) => {
    if (err) {
      console.error("❌ Completion failed:", err.message);
      return res.status(500).send("Complete error");
    }
    db.query('SELECT * FROM todos', (e, newList) => res.send(newList));
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
