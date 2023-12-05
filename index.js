const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 5000;

app.use(express.json());

// Create a SQLite database (tasks.db) and a tasks table
const db = new sqlite3.Database("tasks.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, completed BOOLEAN DEFAULT 0, dueDate DATE)",
    );
  }
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    } else {
      res.json(rows);
    }
  });
});

// Add a new task
app.post("/api/tasks", (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ error: "Title and dueDate are required" });
  }

  db.run(
    "INSERT INTO tasks (title, description, dueDate) VALUES (?, ?, ?)",
    [title, description || "", dueDate], // Set default empty string for description if not provided
    function (err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
      } else {
        res.json({ id: this.lastID });
      }
    },
  );
});

// Update a task
app.put("/api/tasks/:id", (req, res) => {
  const { title, description, completed, dueDate } = req.body;
  const taskId = req.params.id;

  if (!title || !dueDate) {
    return res.status(400).json({ error: "Title and dueDate are required" });
  }

  db.run(
    "UPDATE tasks SET title = ?, description = ?, completed = ?, dueDate = ? WHERE id = ?",
    [title, description || "", completed, dueDate, taskId],
    (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
      } else {
        res.json({ message: "Task updated successfully" });
      }
    },
  );
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  db.run("DELETE FROM tasks WHERE id = ?", taskId, (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    } else {
      res.json({ message: "Task deleted successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
