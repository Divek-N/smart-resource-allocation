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
        console.error("❌ MySQL connection failed:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

/* ===================== */
/* HEALTH CHECK */
/* ===================== */
app.get("/", (req, res) => {
    res.json({ success: true });
});

/* ===================== */
/* GET BOOKINGS */
/* ===================== */
app.get("/bookings", (req, res) => {
    db.query("SELECT * FROM bookings ORDER BY start_time", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, data: rows });
    });
});

/* ===================== */
/* CREATE BOOKING */
/* ===================== */
app.post("/book", (req, res) => {
    const { userId, resourceId, startTime, endTime } = req.body;

    if (!userId || !resourceId || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // ✅ SAFE LOCAL DATETIME (NO UTC)
    const startSQL = startTime.replace("T", " ") + ":00";
    const endSQL = endTime.replace("T", " ") + ":00";

    if (endSQL <= startSQL) {
        return res.status(400).json({
            success: false,
            message: "End time must be after start time"
        });
    }

    // ✅ CORRECT CONFLICT CHECK
    const conflictSQL = `
        SELECT id FROM bookings
        WHERE resource_id = ?
        AND start_time < ?
        AND end_time > ?
    `;

    db.query(
        conflictSQL,
        [resourceId, endSQL, startSQL],
        (err, conflicts) => {
            if (err) {
                console.error("❌ Conflict error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Conflict check failed"
                });
            }

            if (conflicts.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Hall already booked for this time"
                });
            }

            // ✅ INSERT
            const insertSQL = `
                INSERT INTO bookings (user_id, resource_id, start_time, end_time)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertSQL,
                [userId, resourceId, startSQL, endSQL],
                err => {
                    if (err) {
                        console.error("❌ Insert error:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Insert failed"
                        });
                    }

                    res.json({
                        success: true,
                        message: "Booking successful"
                    });
                }
            );
        }
    );
});

/* ===================== */
/* DELETE BOOKING */
/* ===================== */
app.delete("/bookings/:id", (req, res) => {
    db.query(
        "DELETE FROM bookings WHERE id = ?",
        [req.params.id],
        err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

/* ===================== */
/* START SERVER */
/* ===================== */
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
