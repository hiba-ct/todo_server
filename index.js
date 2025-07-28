require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());


//railway connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// ✅ MySQL Connection
/* const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql123@hiba',
  database: 'sys',
}); */

db.connect((err) => {
  if (!err) {
    console.log("✅ Connected to database successfully");
  } else {
    console.log("❌ Database connection failed");
  }
});

// ✅ Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // format: "Bearer <token>"
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // contains { id: user.id }
    next();
  });
}

// ✅ Test route
app.get('/', (req, res) => {
  res.send('<h1 style="color:red;">Server running successfully</h1>');
});

// ✅ Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const checkUser = "SELECT * FROM users WHERE email = ?";
  db.query(checkUser, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = `INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, NOW())`;

    db.query(insertUser, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const userId = result.insertId;
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ message: "User registered successfully", token });
    });
  });
});

// ✅ Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // ✅ Send both token and user info
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name // optional
      }
    });
  });
});



// ✅ Add task (logged-in user)
 app.post("/new-task", verifyToken, (req, res) => {
  const { task, status } = req.body;
  const user_id = req.user.id;
  const createdAt = new Date();

  const sql = "INSERT INTO todos (task, createdAt, status, user_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [task, createdAt, status, user_id], (err, result) => {
    if (err) {
      console.error("❌ Insert error:", err);
      return res.status(500).json({ error: err });
    }
    return res.json({ message: "✅ Task added", result });
  });
}); 
// ✅ Read tasks for logged-in user
app.get('/read-tasks/:id', verifyToken, (req, res) => {
  const requestedId = parseInt(req.params.id);  // from URL like /read-tasks/14
  const userId = req.user.id;                   // from token

  // ✅ Optional: Secure check to prevent other users from accessing
  if (requestedId !== userId) {
    return res.status(403).send("Forbidden: Cannot access another user's tasks");
  }

  const q = 'SELECT * FROM todos WHERE user_id = ?';
  db.query(q, [requestedId], (err, result) => {
    if (err) {
      console.log("❌ Failed to read tasks:", err);
      return res.status(500).send("Error reading tasks");
    } else {
      res.json(result);
    }
  });
});


// ✅ Update task (check user ownership)
app.post('/update-task', verifyToken, (req, res) => {
  const { id, task } = req.body;
  const user_id = req.user.id;

  const q = 'UPDATE todos SET task = ? WHERE id = ? AND user_id = ?';
  db.query(q, [task, id, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Update failed', error: err });
    res.json({ message: '✅ Task updated' });
  });
});

// ✅ Delete task (check user ownership)
app.post('/delete-task', verifyToken, (req, res) => {
  const { id } = req.body;
  const user_id = req.user.id;

  const q = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
  db.query(q, [id, user_id], (err, result) => {
    if (err) return res.status(500).send("❌ Delete failed");
    res.json({ message: '✅ Task deleted' });
  });
});

// ✅ Mark task as completed
app.post('/complete-task', verifyToken, (req, res) => {
  const { id } = req.body;
  const user_id = req.user.id;

  const q = 'UPDATE todos SET status = ? WHERE id = ? AND user_id = ?';
  db.query(q, ['completed', id, user_id], (err, result) => {
    if (err) return res.status(500).send("❌ Complete failed");
    res.json({ message: '✅ Task marked as completed' });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
