import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "./middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/orders
router.get("/orders", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId, status: { not: "pending_payment" } },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  const simplified = orders.map(o => ({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    totalCents: o.totalCents,
    items: o.orderItems.map(it => ({
      name: it.product.name,
      qty: it.quantity,
      priceCents: it.priceCents
    })),
    shipName: o.shipName,
    shipAddress: o.shipAddress,
    shipCity: o.shipCity,
    shipZip: o.shipZip,
    shipPhone: o.shipPhone
  }));

  res.json(simplified);
});

export default router;
