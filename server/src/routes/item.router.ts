import { Router } from "express";
import {
  getItemDetailHandler,
  getItemGraphHandler,
  getItemsHandler,
} from "../controllers/item.controller";

const router = Router();

router.get("/items", getItemsHandler);
router.get("/item/:id/detail", getItemDetailHandler);
router.get("/item/:id/graph", getItemGraphHandler);

export default router;
