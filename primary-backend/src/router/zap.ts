import { Router } from "express";
import { authMiddleware } from "../middleware";

// const router = Router();

// router.post("/", authMiddleware, (req, res) => {
//   console.log("create a zap");
// });

// router.get("/", authMiddleware, (req, res) => {
//   console.log("get a zap");
// });

// router.get("/:zapId", authMiddleware, (req, res) => {
//   console.log("get a zap");
// });

// export const zapRouter = router;


export const zapRouter = () => {
  console.log("create a zap");
}