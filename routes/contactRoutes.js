// Update your contactRoutes.js file to include the new route

const express = require("express");
const router = express.Router();
const {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  sendReply, // Add this import
} = require("../controllers/ContactControllers");

// Public route for submitting contact form
router.post("/", submitContact);

// Admin routes (you should add authentication middleware in a real app)
router.get("/", getContacts);
router.get("/:id", getContactById);
router.put("/:id", updateContactStatus);
router.delete("/:id", deleteContact);
router.post("/:id/reply", sendReply); // Add this new route

module.exports = router;
