const { parseCruFilesInDirectory, getCruDirectoryForCourse} = require("../utils/cruUtils");

function getRoom(cli) {
    cli
    .command("getroom", "Gives the rooms associated with a course or a time slot.")
    .option("--class <class>", "The course that we want to know the rooms.")
    .option("--hours <hours>", "The time slot to check for available rooms in D HH:MM-HH:MM format.")
    .action(({ options, logger }) => {
        if (Object.keys(options).length === 2) {
            return logger.error("Please choose either a <class> or a <hours>.");
        } else if (options.class !== undefined) {
            try {
                const course = options.class.toUpperCase();
                const dataDir = "data";
                const directoryPath = getCruDirectoryForCourse(course, dataDir);
                const parser = parseCruFilesInDirectory(directoryPath);
                const edt = parser.parsedData.find((edt) => edt.name === course);

                if (!edt) {
                    return logger.error(`SRUPC_1_E1: Course ${course} not found.`);
                }

                logger.info(`${course} informations:`);
                edt.sessions.forEach((session) => {
                    logger.info(`Room: ${session.room}, Capacity: ${session.capacity}`);
                });
            } catch (error) {
                logger.error(error.message);
            }
        } else if (options.hours !== undefined) {
            const hoursRegex = /^(L|MA|ME|J|V|S|D) \d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
            const hours = options.hours;

            if (!hoursRegex.test(hours)) {
                return logger.error("SRUPC_2_E1: Invalid time slot format. Expected format: D HH:MM-HH:MM");
            }

            try {
                const dataDir = "data";
                const parser = parseCruFilesInDirectory(dataDir);
                const availableRooms = parser.availableRooms(hours);

                if (availableRooms.length === 0) {
                    logger.info("No available rooms found for the given time slot.");
                } else {
                    logger.info(`Available rooms for ${options.hours}:`);
                    availableRooms.forEach((room) => room!=null ? logger.info(room) : '');
                }
            } catch (error) {
                logger.error(error.message);
            }
        } else if (Object.keys(options).length <= 1) {
            return logger.error("Missing required argument. Please choose either a <class> or a <hours>.");
        }
    })
}

module.exports = getRoom;
