const colors = require("colors");

function colorInfo(message, color, code = null) {
  return code!==null ? `[${code}] `.bold + colors[color](message) : colors[color](message);
}

module.exports = colorInfo;