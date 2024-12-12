const { parseCruFilesInDirectory } = require("../utils/cruUtils");

function getRoom(cli) {
    cli
    .command("getRoom", "Get available rooms for a given time slot.")
    .argument("<hours>", "The time slot to check for available rooms.")
    .action(({ args, logger }) => {
        try {
            const hours = args.hours;
            const dataDir = "data";
            const parser = parseCruFilesInDirectory(dataDir);

            const hoursRegex = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
            if (!hoursRegex.test(hours)) {
                return logger.error(
                    "SRUPC_2_E1: Invalid time slot format. Expected format: HH:MM-HH:MM"
                );
            }

            const availableRooms = parser.availableRooms(hours);

            if (availableRooms.length === 0) {
                logger.info("No available rooms found for the given time slot.");
            } else {
                logger.info("Available rooms:");
                availableRooms.forEach((room) => logger.info(room));
            }
        } catch (error) {
            logger.error(error.message);
        }
    });
}

module.exports = getRoom;
