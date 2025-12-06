const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/messageController");

router.get("/:channelId", getMessages);
router.post("/:channelId", sendMessage);

module.exports = router;
