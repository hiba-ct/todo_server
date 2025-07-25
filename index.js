require('dotenv').config(); // Load environment variables at top

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MySQL Connection using Railway DB credentials
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// ✅ Connect to DB
db.connect((err) => {
  if (!err) {
    console.log("✅ Connected to database successfully");
  } else {
    console.error("❌ Database connection failed:", err.message);
  }
});

// ✅ Home route for testing
app.get('/', (req, res) => {
  res.status(200).send('<h1 style="color:red;">Server running successfully starting</h1>');
});

// ✅ Read all tasks
app.get('/read-tasks', (req, res) => {
  const q = 'SELECT * FROM todos';
  db.query(q, (err, result) => {
    if (err) {
      console.log("❌ Failed to read tasks:", err);
      return res.status(500).send("Error reading tasks");
    } else {
      console.log("✅ Tasks fetched");
      res.json(result);
    }
  });
});

// ✅ Add new task
app.post('/new-task', (req, res) => {
  const q = 'INSERT INTO todos (task, createdAt, status) VALUES (?, ?, ?)';
  const values = [req.body.task, new Date(), 'active'];

  db.query(q, values, (err, result) => {
    if (err) {
      console.log("❌ Failed to store task:", err);
      return res.status(500).send("Task creation failed");
    } else {
      console.log("✅ Task saved");
      db.query('SELECT * FROM todos', (e, newList) => {
        res.send(newList);
      });
    }
  });
});

// ✅ Update task
app.post('/update-task', (req, res) => {
  const { id, task } = req.body;
  const q = 'UPDATE todos SET task = ? WHERE id = ?';

  db.query(q, [task, id], (err, result) => {
    if (err) {
      console.error("❌ Failed to update task:", err);
      return res.status(500).json({ message: 'Update failed' });
    } else {
      console.log("✅ Task updated");
      res.json({ message: 'Task updated successfully' });
    }
  });
});

// ✅ Delete task
app.post('/delete-task', (req, res) => {
  const q = 'DELETE FROM todos WHERE id = ?';

  db.query(q, [req.body.id], (err, result) => {
    if (err) {
      console.log("❌ Failed to delete task:", err);
      return res.status(500).send("Delete failed");
    } else {
      console.log("✅ Task deleted");
      db.query('SELECT * FROM todos', (e, newList) => {
        res.send(newList);
      });
    }
  });
});

// ✅ Mark task as completed
app.post('/complete-task', (req, res) => {
  const q = 'UPDATE todos SET status = ? WHERE id = ?';

  db.query(q, ['completed', req.body.id], (err, result) => {
    if (err) {
      console.log("❌ Failed to complete task:", err);
      return res.status(500).send("Complete failed");
    } else {
      console.log("✅ Task marked as completed");
      db.query('SELECT * FROM todos', (e, newList) => {
        res.send(newList);
      });
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
