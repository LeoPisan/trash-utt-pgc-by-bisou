const { parseCruFilesInDirectory, getCruDirectoryForCourse} = require("../utils/cruUtils");
const colorInfo = require("../utils/colorInfo");

function getRoom(cli) {
    cli
    .command("getroom", "Gives the rooms associated with a course or a time slot.")
    .option("--class <class>", "The course that we want to know the rooms.")
    .option("--hours <hours>", "The time slot to check for available rooms in D HH:MM-HH:MM format.")
    .action(({ options, logger }) => {
        if (Object.keys(options).length === 2) {
            return logger.error(colorInfo("Please choose either a" + " <class> ".bold + "or a" + " <hours>".bold + ".", "yellow"));
        } else if (options.class !== undefined) {
            try {
                const course = options.class.toUpperCase();
                const dataDir = "data";
                const directoryPath = getCruDirectoryForCourse(course, dataDir);
                const parser = parseCruFilesInDirectory(directoryPath);
                const edt = parser.parsedData.find((edt) => edt.name === course);

                if (!edt) {
                    return logger.error(colorInfo(`Course ${course} not found.`, "yellow", "SRUPC_1_E1"));
                }

                let rooms = "";
                const seen = new Set();
                const uniqueRooms = edt.sessions.filter((session) => {
                    const isDuplicate = seen.has(session.room);

                    seen.add(session.room);
                    return !isDuplicate;
                });
                
                uniqueRooms.forEach((session) => {
                    return rooms += `\nRoom: ${session.room} | Capacity: ${session.capacity}`;
                });

                logger.info(
                    "\n" +
                    "────────────────────────────────────────" + "\n" +
                    colorInfo(`${course} `.yellow + "associated room(s):", "bold") + "\n" +
                    rooms + "\n" +
                    "────────────────────────────────────────"
                );
            } catch (error) {
                logger.error(colorInfo(error.message, "red"));
            }
        } else if (options.hours !== undefined) {
            const hoursRegex = /^(L|MA|ME|J|V|S|D) \d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
            const hours = options.hours;

            if (!hoursRegex.test(hours)) {
                return logger.error(colorInfo("Invalid time slot format." + " Expected format: D HH:MM-HH:MM.".italic, "yellow", "SRUPC_2_E1"));
            }

            try {
                const dataDir = "data";
                const parser = parseCruFilesInDirectory(dataDir);
                const availableRooms = parser.availableRooms(hours);

                if (availableRooms.length === 0) {
                    return logger.error(colorInfo("No available rooms found for the given time slot.", "yellow"));
                } else {
                    let rooms = "";

                    availableRooms.forEach((room, i) => {
                        if (i === availableRooms.length - 1) {
                            return rooms += room + ".";
                        } else if (room === null ) {
                            return "";
                        } else {
                            return rooms += room + ", ";
                        }
                    });

                    logger.info(
                        "\n" +
                        "────────────────────────────────────────" + "\n" +
                        colorInfo("Available rooms for " + `${options.hours}`.yellow + ":", "bold") + "\n \n" +
                        rooms + "\n" +
                        "────────────────────────────────────────"
                    );
                }
            } catch (error) {
                logger.error(colorInfo(error.message, "red"));
            }
        } else if (Object.keys(options).length <= 1) {
            return logger.error(colorInfo("Missing required argument. Please choose either a" + " <class> ".bold + "or a" + " <hours>".bold + ".", "yellow"));
        }
    })
}

module.exports = getRoom;
