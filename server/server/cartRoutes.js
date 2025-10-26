import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "./middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

async function getOrCreatePendingOrder(userId) {
  let order = await prisma.order.findFirst({
    where: { userId, status: "pending_payment" },
    include: { orderItems: true }
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        userId,
        status: "pending_payment",
        shipName: "",
        shipAddress: "",
        shipCity: "",
        shipZip: "",
        shipPhone: "",
        totalCents: 0
      },
      include: { orderItems: true }
    });
  }

  return order;
}

router.post("/cart/sync", requireAuth, async (req, res) => {
  const { items } = req.body;
  const order = await getOrCreatePendingOrder(req.userId);

  await prisma.orderItem.deleteMany({
    where: { orderId: order.id }
  });

  for (const it of items) {
    if (!it.qty || it.qty < 1) continue;
    const prod = await prisma.product.findUnique({ where: { id: it.productId }});
    if (!prod) continue;
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: prod.id,
        quantity: it.qty,
        priceCents: prod.priceCents
      }
    });
  }

  res.json({ ok: true });
});

router.get("/cart", requireAuth, async (req, res) => {
  const order = await getOrCreatePendingOrder(req.userId);
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
    include: { product: true }
  });

  const detailed = items.map(it => ({
    productId: it.productId,
    name: it.product.name,
    imageUrl: it.product.imageUrl,
    priceCents: it.priceCents,
    qty: it.quantity,
    subtotalCents: it.priceCents * it.quantity
  }));

  res.json(detailed);
});

router.post("/cart/item", requireAuth, async (req, res) => {
  const { productId, qty } = req.body;
  const order = await getOrCreatePendingOrder(req.userId);

  const prod = await prisma.product.findUnique({ where: { id: productId }});
  if (!prod) return res.status(400).json({ error: "Producto no existe" });

  if (!qty || qty < 1) {
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id, productId }
    });
  } else {
    const existing = await prisma.orderItem.findFirst({
      where: { orderId: order.id, productId }
    });

    if (existing) {
      await prisma.orderItem.update({
        where: { id: existing.id },
        data: {
          quantity: qty,
          priceCents: prod.priceCents
        }
      });
    } else {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId,
          quantity: qty,
          priceCents: prod.priceCents
        }
      });
    }
  }

  res.json({ ok: true });
});

router.delete("/cart/item", requireAuth, async (req, res) => {
  const { productId } = req.body;
  const order = await getOrCreatePendingOrder(req.userId);

  await prisma.orderItem.deleteMany({
    where: { orderId: order.id, productId }
  });

  res.json({ ok: true });
});

export default router;
