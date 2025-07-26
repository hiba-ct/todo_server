require('dotenv').config(); // Load environment variables at top

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());


// ✅ MySQL Connection using Railway DB credentials
 const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});
 
// ✅ Connect to DB
/* const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql123@hiba',
    database: 'sys'
});

db.connect((err)=>{
    if(!err){
      console.log("connected to database successfully")  
    }else{
        console.log("connected to database failed");
    }
})
 */

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








// ✅ Register route
// REGISTER
 app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (results.length > 0) return res.status(400).send("User already exists");

    const insertQuery = 'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [name, email, password, new Date()], (err, result) => {
      if (err) return res.status(500).send("Registration error");
      res.send("User registered successfully");
    });
  });
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const q = 'SELECT * FROM users WHERE email = ?';
  db.query(q, [email], (err, results) => {
    if (results.length === 0) return res.status(401).send("Invalid email");
    if (results[0].password !== password) return res.status(401).send("Invalid password");

    res.json({
      message: "Login successful",
      user: {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email
      }
    });
  });
});
 






// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}); 