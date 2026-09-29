import express from "express";
import cors from "cors";
import { query } from "./config/db.js";

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        const result = await query("SELECT NOW()"); 
        res.json({ status: "OK", timestamp: result.rows[0].now });
    } catch (error) {
        console.error("Error occurred while checking health:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default app;