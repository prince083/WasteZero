const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/role");

// Protect all admin routes
router.use(auth);
router.use(authorizeRoles("admin"));

router.get("/users", adminController.getUsers);
router.put("/suspend/:userId", adminController.suspendUser);
router.put("/unsuspend/:userId", adminController.unsuspendUser);
router.get("/logs", adminController.getLogs);
router.get("/logs/download", adminController.downloadLogs);
router.get("/logs/download-pdf", adminController.downloadLogsPDF);
router.get("/stats", adminController.getPlatformStats);
router.get("/reports/platform", adminController.downloadPlatformReport);
router.delete("/opportunities/:opportunityId", adminController.deleteOpportunity);

module.exports = router;