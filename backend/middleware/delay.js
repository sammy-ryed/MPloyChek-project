// middleware/delay.js – injects configurable API latency
// Usage: add ?delay=<ms> to any request (max 10 000 ms for safety)

const MAX_DELAY = 10000;

module.exports = function delayMiddleware(req, res, next) {
  const requested = parseInt(req.query.delay, 10);
  if (!requested || isNaN(requested) || requested <= 0) {
    return next();
  }
  const ms = Math.min(requested, MAX_DELAY);
  setTimeout(next, ms);
};
