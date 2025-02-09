require("dotenv").config();

module.exports = {
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) ? parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 : 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 10,
};
