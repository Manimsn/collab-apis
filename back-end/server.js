import app from "./app.js"; // Use ESM import
import connectDB from "./utils/db.js";

const PORT = process.env.PORT || 3000;

// Connect to the database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
