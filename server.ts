import express from "express";
import path from "path";

const app = express();
const PORT = parseInt(process.env.PORT || "8080", 10);

// Serve static files from the project root
app.use(express.static(path.join(__dirname, ".."), {
  extensions: ["html"],
  index: "index.html",
}));

// Fallback: serve index.html for unknown routes (SPA-style)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
