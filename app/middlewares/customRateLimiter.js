const { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } = require("../../config/config");

const requestLogs = {};

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();

  if (!requestLogs[ip]) {
    requestLogs[ip] = [];
  }


  requestLogs[ip] = requestLogs[ip].filter(timestamp => currentTime - timestamp < RATE_LIMIT_WINDOW);

//   console.log('requestLogs ', requestLogs);
  
  if (requestLogs[ip].length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ message: "Too many requests. Try again later." });
  }

  requestLogs[ip].push(currentTime);
  next();
}

module.exports = rateLimiter;
