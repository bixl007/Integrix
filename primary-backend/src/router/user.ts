import { Router } from "express";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "../db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { Request, Response } from "express";

const router = Router();

// @ts-ignore
router.post("/signup", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid data",
    });
  }

  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
    },
  });

  if (userExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  await prismaClient.user.create({
    data: {
      email: parsedData.data.username,
      password: parsedData.data.password, // TODO: hash password
      name: parsedData.data.name,
    },
  });

  // await sendEmail();

  return res.json({
    message: "Please verify your account by checking your email",
  });
});

// @ts-ignore
router.post("/signin", async (req: Request, res: Response) => {
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid data",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    JWT_PASSWORD
  );

  return res.json({
    token,
  });
});

// @ts-ignore
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  // @ts-ignore
  const id = req.id;
  const user = await prismaClient.user.findFirst({
    where: {
      id: id,
    },
    select: {
      name: true,
      email: true,
    },
  });

  return res.json({
    user,
  });
});

export const userRouter = router;
