const fs = require("fs");
const { parseCruFilesInDirectory, getCruDirectoryForCourse} = require("../utils/cruUtils");

function checkRoom(cli) {
    cli
    .command("checkRoom", "Check the room and the capacity of a course.")
    .argument("<name>", "The course that we want to know the room.")
    .action(({ args, logger }) => {
        try {
            const courseName = args.name.toUpperCase();
            const dataDir = "data";
            const filePath = getCruDirectoryForCourse(courseName, dataDir);

            const parser = parseCruFilesInDirectory(filePath);

            const edt = parser.parsedData.find((edt) => edt.name === courseName);
            if (!edt) {
                return logger.info(`Course ${courseName} not found.`);
            }

            logger.info(`${courseName} informations :`);
            edt.sessions.forEach((session) => {
                logger.info(`Room: ${session.room}, Capacity: ${session.capacity}`);
            });
        } catch (error) {
            logger.error(error.message);
        }
    });
}

module.exports = checkRoom;
