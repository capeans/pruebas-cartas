import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { requireAuth } from "./middleware.js";
dotenv.config();
const prisma=new PrismaClient();
const router=express.Router();
function signToken(userId){
  return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"30d"});
}
router.post("/register",async (req,res)=>{
  const{email,password,name}=req.body;
  if(!email||!password){return res.status(400).json({error:"Faltan datos"});}
  const hash=await bcrypt.hash(password,10);
  try{
    const user=await prisma.user.create({
      data:{email,passwordHash:hash,name:name||null,},
    });
    const token=signToken(user.id);
    res.json({token,user:{email:user.email,id:user.id,name:user.name||""}});
  }catch(e){
    console.error(e);
    res.status(400).json({error:"No se pudo crear usuario (¿email ya existe?)"});
  }
});
router.post("/login",async (req,res)=>{
  const{email,password}=req.body;
  const user=await prisma.user.findUnique({where:{email}});
  if(!user){return res.status(400).json({error:"Email o contraseña incorrectos"});}
  const ok=await bcrypt.compare(password,user.passwordHash);
  if(!ok){return res.status(400).json({error:"Email o contraseña incorrectos"});}
  const token=signToken(user.id);
  res.json({token,user:{email:user.email,id:user.id,name:user.name||""}});
});
router.get("/me",requireAuth,async(req,res)=>{
  const user=await prisma.user.findUnique({where:{id:req.userId}});
  if(!user){return res.status(404).json({error:"No encontrado"});}
  res.json({
    email:user.email,
    name:user.name,
    address:user.address,
    city:user.city,
    zip:user.zip,
    phone:user.phone
  });
});
export default router;