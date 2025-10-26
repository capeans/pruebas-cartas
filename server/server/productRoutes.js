import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/products", async (req, res) => {
  const { ids } = req.query;

  if (ids) {
    const list = ids
      .split(",")
      .map(x => parseInt(x, 10))
      .filter(Boolean);

    const products = await prisma.product.findMany({
      where: { id: { in: list } },
    });
    return res.json(products);
  }

  const products = await prisma.product.findMany();
  res.json(products);
});

export default router;
