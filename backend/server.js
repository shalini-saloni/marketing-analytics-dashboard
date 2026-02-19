require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const apiRoutes = require("./routes/api");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.use("/api", apiRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`\n Marketing Analytics API running at http://localhost:${PORT}`);
  console.log(`   API base:  http://localhost:${PORT}/api`);
  console.log(`   Dashboard: http://localhost:${PORT}\n`);
});
