import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const prisma=new PrismaClient();
const router=express.Router();
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
router.post("/checkout/webhook",async(req,res)=>{
  const sig=req.headers["stripe-signature"];
  let event;
  try{
    event=stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }catch(err){
    console.error("Webhook signature failed:",err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if(event.type==="checkout.session.completed"){
    const session=event.data.object;
    const stripeId=session.id;
    const order=await prisma.order.findFirst({
      where:{stripeId},
      include:{orderItems:{include:{product:true}}}
    });
    if(order && order.status==="pending_payment"){
      await prisma.order.update({
        where:{id:order.id},
        data:{status:"pending_shipment"}
      });
      for(const it of order.orderItems){
        await prisma.product.update({
          where:{id:it.productId},
          data:{stock:{decrement:it.quantity}}
        });
      }
    }
  }
  res.json({received:true});
});
export default router;