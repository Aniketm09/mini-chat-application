const Channel = require("../models/Channel");
const ChannelMember = require("../models/ChannelMember");

// CREATE CHANNEL
exports.createChannel = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const channel = await Channel.create({ name, description });

    // auto-join creator
    await ChannelMember.create({
      channel: channel._id,
      user: req.user.id,
    });

    res.json(channel);
  } catch (err) {
    console.error("CREATE CHANNEL ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL CHANNELS OF USER (WITH MEMBER COUNT)
exports.getMyChannels = async (req, res) => {
  try {
    const memberships = await ChannelMember
      .find({ user: req.user.id })
      .populate("channel");

    const channels = await Promise.all(
      memberships.map(async (m) => {
        const count = await ChannelMember.countDocuments({
          channel: m.channel._id,
        });

        return {
          _id: m.channel._id,
          name: m.channel.name,
          description: m.channel.description,
          memberCount: count,
        };
      })
    );

    res.json(channels);
  } catch (err) {
    console.error("GET CHANNELS ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// JOIN CHANNEL
exports.joinChannel = async (req, res) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const existing = await ChannelMember.findOne({
      channel: channelId,
      user: req.user.id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already a member" });
    }

    await ChannelMember.create({
      channel: channelId,
      user: req.user.id,
    });

    res.json({ message: "Joined channel successfully" });
  } catch (err) {
    console.error("JOIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.leaveChannel = async (req, res) => {
  try {
    const channelId = req.params.id;

    // Check membership
    const membership = await ChannelMember.findOne({
      channel: channelId,
      user: req.user.id,
    });

    if (!membership) {
      return res.status(400).json({ message: "You are not a member" });
    }

    // Delete membership
    await ChannelMember.deleteOne({
      channel: channelId,
      user: req.user.id,
    });

    res.json({ message: "Left channel successfully" });
  } catch (err) {
    console.error("LEAVE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
