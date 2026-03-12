const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin");
const clientController = require("../controllers/client.controller");

// Admin only routes
router.get("/", requireAdmin, clientController.getAllClients);

router.get("/status", requireAdmin, clientController.getAllClientsStatus);

// Routes accessible to authenticated users (both admin and regular users)
router.post("/", clientController.createClient);

router.get("/me", clientController.getUserClients);

router.delete("/:id", clientController.deleteClient);

router.get("/:id/config", clientController.getClientConfig);

router.get("/:id/status", clientController.getClientStatus);

module.exports = router;
