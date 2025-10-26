import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "./middleware.js";
dotenv.config();
const prisma=new PrismaClient();
const router=express.Router();
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
router.post("/checkout/start",requireAuth,async(req,res)=>{
  const {shipName,shipAddress,shipCity,shipZip,shipPhone}=req.body;
  let order=await prisma.order.findFirst({
    where:{userId:req.userId,status:"pending_payment"},
    include:{orderItems:{include:{product:true}}}
  });
  if(!order||order.orderItems.length===0){
    return res.status(400).json({error:"Carrito vacío"});
  }
  let totalCents=0;
  order.orderItems.forEach(it=>{totalCents+=it.priceCents*it.quantity;});
  order=await prisma.order.update({
    where:{id:order.id},
    data:{
      shipName,shipAddress,shipCity,shipZip,shipPhone,totalCents
    },
    include:{orderItems:{include:{product:true}}}
  });
  const line_items=order.orderItems.map(it=>({
    price_data:{
      currency:"eur",
      product_data:{name:it.product.name,images:[it.product.imageUrl],},
      unit_amount:it.priceCents
    },
    quantity:it.quantity
  }));
  const session=await stripe.checkout.sessions.create({
    payment_method_types:["card"],
    mode:"payment",
    line_items,
    success_url:`${process.env.FRONTEND_URL}/gracias.html`,
    cancel_url:`${process.env.FRONTEND_URL}/cart.html`,
    metadata:{orderId:String(order.id),userId:String(req.userId)}
  });
  await prisma.order.update({
    where:{id:order.id},
    data:{stripeId:session.id}
  });
  res.json({url:session.url});
});
export default router;