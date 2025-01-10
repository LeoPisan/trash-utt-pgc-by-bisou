const fs = require("fs");
const CruParser = require("../parsers/CruParser");
const colorInfo = require("../utils/colorInfo");

let loadedCal = null;

function loadCal(cli) {
  cli
  .command("loadcal", "Load a calendar from a cru file into memory.")
  .argument("[filePath]", "Path to the cru file to load (default: './data/test.cru').")
  .action(({ args, logger }) => {
    const filePath = args.filePath || "./data/test.cru";

    if (!fs.existsSync(filePath)) {
      return logger.error(colorInfo(`File not found: ${filePath}. Please target a cru file.`, "yellow", "SRUPC_5_E1"));
    }

    try {
      const data = fs.readFileSync(filePath, "utf8");

      const parser = new CruParser();
      parser.parse(data);

      if (checkOverlappingSlots(parser.parsedData)) {
        return logger.error(colorInfo("Overlapping time slots detected. Please fix the cru file.", "yellow", "SRUPC_5_E3"));
      }

      loadedCal = parser.parsedData;

      logger.info(`Calendar successfully loaded from ${filePath}.`);
    } catch (error) {
      logger.error(`SRUPC_5_E2: Error loading calendar: ${error.message}.`); //TODO Ce cas ne couvre pas les erreurs attendues pour le code indiqué (il devrait apparaître dès qu'un chemin invalide est donné en entrée)
    }
  });
}

function checkOverlappingSlots(calendarData) {
  const sessionsByRoom = {};

  calendarData.forEach((edt) => {
    edt.sessions.forEach((session) => {
      const room = session.room;
      const [day, timeRange] = session.time.split(" ");
      const [start, end] = timeRange.split("-").map(parseTimeToMinutes);

      if (!sessionsByRoom[room]) {
        sessionsByRoom[room] = [];
      }

      const overlaps = sessionsByRoom[room].some((existingSession) => {
        return (
          existingSession.day === day &&
          !(end <= existingSession.start || start >= existingSession.end)
        );
      });

      if (overlaps) {
        return true;
      }

      sessionsByRoom[room].push({ day, start, end });
    });
  });

  return false;
}

function parseTimeToMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

module.exports = loadCal;