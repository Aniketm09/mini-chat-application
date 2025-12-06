const express = require("express");
const router = express.Router();

const {
  createChannel,
  getMyChannels,
  joinChannel,
  leaveChannel,
} = require("../controllers/channelController");

router.get("/", getMyChannels);
router.post("/", createChannel);
router.post("/:id/join", joinChannel);
router.post("/:id/leave", leaveChannel);

module.exports = router;
