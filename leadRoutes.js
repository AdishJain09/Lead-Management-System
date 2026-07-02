const express = require("express");
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateStatus,
  updateLead,
  addNote,
  getNotes,
} = require("./leadController");

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.patch("/:id/status", updateStatus);
router.patch("/:id", updateLead);
router.post("/:id/notes", addNote);
router.get("/:id/notes", getNotes);

module.exports = router;
