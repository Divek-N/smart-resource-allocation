const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "divek@9905",
    database: "smart_resource_allocation",
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error("❌ DB Error:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

/* Health */
app.get("/", (req, res) => {
    res.json({ success: true, message: "Backend running" });
});

/* Get bookings */
app.get("/bookings", (req, res) => {
    db.query("SELECT * FROM bookings ORDER BY start_time", (err, results) => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, data: results });
    });
});

/* Book */
app.post("/book", (req, res) => {
    const { userId, resourceId, startTime, endTime } = req.body;

    if (!userId || !resourceId || !startTime || !endTime) {
        return res.status(400).json({ success: false });
    }

    const start = startTime.replace("T", " ") + ":00";
    const end = endTime.replace("T", " ") + ":00";

    const conflictSQL = `
        SELECT * FROM bookings
        WHERE resource_id = ?
        AND start_time < ?
        AND end_time > ?
    `;

    db.query(conflictSQL, [resourceId, end, start], (err, rows) => {
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Already booked"
            });
        }

        const insertSQL = `
            INSERT INTO bookings (user_id, resource_id, start_time, end_time)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertSQL, [userId, resourceId, start, end], err => {
            if (err) {
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        });
    });
});

/* Delete booking */
app.delete("/booking/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM bookings WHERE id = ?", [id], err => {
        if (err) {
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

/* Start server */
app.listen(3000, () => {
    console.log("🚀 Backend running at http://localhost:3000");
});
