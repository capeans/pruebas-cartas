import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./auth.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import checkoutRoutes from "./stripeCheckout.js";
import orderRoutes from "./orderRoutes.js";
import webhookRouter from "./stripeWebhook.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.post(
  "/api/checkout/webhook",
  express.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", checkoutRoutes);
app.use("/api", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend escuchando en puerto " + PORT);
});
