const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");

router.get("/", clientController.getClients);

router.post("/", clientController.createClient);

router.delete("/:id", clientController.deleteClient);

// This route is commented out due to instability issue with wireguard system. For simplicity and security, configs are generated once and not stored server-side.
//router.get("/:id/config", clientController.downloadClientConfig);

module.exports = router;
