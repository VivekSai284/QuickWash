const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema({
  challengeKey: { type: String, required: true, unique: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  sentAt: { type: Date, required: true },
  attempts: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);
