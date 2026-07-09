const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = require("../config/adminConfig");

/**
 * Ensures exactly one canonical admin account exists.
 * Removes duplicate admin accounts and upserts the canonical one.
 */
async function ensureCanonicalAdmin() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const removed = await User.deleteMany({
    role: "admin",
    email: { $ne: ADMIN_EMAIL },
  });

  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      status: "active",
      isEmailVerified: true,
      twoFactorEnabled: false,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    admin,
    removedDuplicates: removed.deletedCount,
    email: ADMIN_EMAIL,
  };
}

module.exports = { ensureCanonicalAdmin };
