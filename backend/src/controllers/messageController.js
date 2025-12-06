const Message = require("../models/Message");
const ChannelMember = require("../models/ChannelMember");

// GET /api/messages/:channelId?page=1&limit=20
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Only members should see messages (optional check)
    const membership = await ChannelMember.findOne({
      channel: channelId,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    const total = await Message.countDocuments({ channel: channelId });

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })          // newest first
      .skip(skip)
      .limit(limit)
      .populate("sender", "name")       // get sender name
      .lean();

    // Reverse so frontend shows oldest → newest in correct order
    const ordered = messages.reverse();

    res.json({
      messages: ordered,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("Get messages error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/messages/:channelId
exports.sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // ensure user is member (optional but good)
    const membership = await ChannelMember.findOne({
      channel: channelId,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    let message = await Message.create({
      channel: channelId,
      sender: req.user.id,
      text: text.trim(),
    });

    message = await message.populate("sender", "name");

    res.status(201).json(message);
  } catch (err) {
    console.error("Send message error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
