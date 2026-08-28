import express from "express";
import {
  getClients,
  createClient,
  deleteClient,
  downloadClientConfig,
} from "../controllers/client.controller";

const router = express.Router();

router.get("/", getClients);

router.post("/", createClient);

router.delete("/:id", deleteClient);

router.get("/:id/config", downloadClientConfig);

export default router;
