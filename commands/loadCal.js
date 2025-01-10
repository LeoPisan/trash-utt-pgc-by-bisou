const fs = require("fs");
const CruParser = require("../parsers/CruParser");
const colorInfo = require("../utils/colorInfo");

let loadedCal = null;

/**
 * Fournis la commande loadcal permettant de charger un fichier CRU en mémoire
 * @param cli {Program} - Programme Caporal JS
 */
function loadCal(cli) {
  cli
  .command("loadcal", "Load a calendar from a cru file into memory.")
  .argument("[filePath]", "Path to the cru file to load (default: './data/test.cru').")
  .action(({ args, logger }) => {
    const filePath = args.filePath || "./data/test.cru";

    if (!fs.existsSync(filePath)) {
      return logger.error(colorInfo(`File not found: ${filePath}. Please target a cru file.`, "yellow", "SRUPC_5_E1"));
    }
    if (!filePath.endsWith(".cru")) {
      return logger.error('SRUPC_5_E2: Format error. Please provide a valid .cru file.');
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const parser = new CruParser();
      parser.parse(data);

      if (parser.errorCount > 0) {
        return logger.error("SRUPC_5_E2: Format error. Please provide a valid .cru file.");
      }
      
      if (checkOverlappingSlots(parser.parsedData)) {
        return logger.error(colorInfo("Overlapping time slots detected. Please fix the cru file.", "yellow", "SRUPC_5_E3"));
      }

      loadedCal = parser.parsedData;

      logger.info(`Calendar successfully loaded from ${filePath}.`);
    } catch (error) {
      logger.error(colorInfo(`Error loading calendar: ${error.message}.`, "red"));
    }
  });
}

function checkOverlappingSlots(calendarData) {
  const sessionsByRoom = {};

  calendarData.forEach((edt) => {
    const name = edt.name;
    edt.sessions.forEach((session) => {
      const room = session.room;
      const [day, timeRange] = session.time.split(" ");
      const [start, end] = timeRange.split("-").map(parseTimeToMinutes);

      if (!sessionsByRoom[room]) {
        sessionsByRoom[room] = [];
      }
      sessionsByRoom[room].push({ name, day, start, end });
    });
  });

  for (const room in sessionsByRoom){
    const sessions = sessionsByRoom[room];
    const overlap = sessions.some((session, index) => {
      return sessions.some((otherSession, otherIndex) => {
        if (index !== otherIndex) {
          return (
            session.day === otherSession.day &&
            !(session.end <= otherSession.start || session.start >= otherSession.end)
          );
        }
      })
  });

  if (overlap){
    return true;
  }
  }

  return false;
}

function parseTimeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

module.exports = loadCal;
