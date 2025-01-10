const colors = require("colors");

/**
 *
 * @param message {string} - Message à afficher
 * @param color {string} - Code couleur du message à afficher
 * @param code {string} - Code d'erreur associé au message (optionnel)
 * @returns {string} - Message formaté
 */
function colorInfo(message, color, code = null) {
  return code!==null ? `[${code}] `.bold + colors[color](message) : colors[color](message);
}

module.exports = colorInfo;