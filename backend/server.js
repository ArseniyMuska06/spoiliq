import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working");
});



app.get("/api/test", (req, res) => {
  res.json({ message: "This is an answer from the backend" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});