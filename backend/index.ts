import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import formRoutes from "./src/routes/routes";  // your routes file
import userRoutes from "./src/routes/userRoutes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Use your form routes under /api/form
app.use("/api/form", formRoutes);
app.use("/api/users", userRoutes); 
// Health check endpoint
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 3001;
async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to MongoDB via Prisma");
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

startServer();

