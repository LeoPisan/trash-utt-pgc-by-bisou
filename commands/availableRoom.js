const { parseCruFilesInDirectory } = require("../utils/cruUtils");

function availableRoom(cli) {
    cli
    .command("availability", "Check the availability of a room.")
    .argument("<room>", "The name of the room to check availability for.")
    .action(({ args, logger }) => {
        try {
            const room = args.room;
            const dataDir = "data";
            const roomRegex = /^[A-Z]{1}\d{3}|EXT\d+$/;

            if (!roomRegex.test(room)) {
                return logger.error("SRUPC_3_E1: Invalid room format. Expected format: ABC123");
            }

            const parser = parseCruFilesInDirectory(dataDir);
            const availability = parser.getRoomAvailability(room);

            if (Object.keys(availability).length === 0) {
                logger.info(`No availability found for room: ${room}`);
            } else {
                logger.info(`Availability for room ${room}:`);
                Object.keys(availability).forEach((day) => {
                    logger.info(`${day}:`);
                    availability[day].forEach((slot) => {
                        logger.info(`  ${slot.start} - ${slot.end}`);
                    });
                });
            }
        } catch (error) {
            logger.error(error.message);
        }
    });
}

module.exports = availableRoom;
