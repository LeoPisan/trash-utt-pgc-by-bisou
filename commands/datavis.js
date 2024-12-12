const { parseCruFilesInDirectory } = require("../utils/cruUtils");
const { existsSync, mkdirSync } = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

function datavis(cli) {
    cli
    .command("datavis", "Generates a CSV table which represents the rank of rooms by capacity.")
    .option("--output [output]", "Output path for the csv file.")
    .action(({ options, logger }) => {
        const output = options.output;

        try {
            const dataDir = "data";
            const parser = parseCruFilesInDirectory(dataDir);
            const roomData = [];

            parser.parsedData.forEach((edt) => {
                edt.sessions.forEach((session) => {
                    const room = session.room;
                    const capacity = session.capacity;

                    if (room && capacity) {
                        const existingRoom = roomData.find((r) => r.name === room);

                        if (existingRoom) {
                            existingRoom.capacity = Math.max(existingRoom.capacity, capacity);
                        } else {
                            roomData.push({ name: room, capacity });
                        }
                    }
                });
            });

            roomData.sort((a, b) => b.capacity - a.capacity);

            let filePath;
            const fileName = "datavis-" + Date.now() + ".csv";

            if (output) {
                if (!existsSync(`${output}`)) {
                    return logger.error("SRUPC_7_E1: The specified output is incorrect. Please use a valid path.");
                }
                filePath = (output.slice(-1) === "/" ? output : output + "/") + fileName;
            } else {
                if (!existsSync("./datavis/")) {
                    mkdirSync("./datavis/");
                }
                filePath =  "./datavis/" + fileName;
            }
            const csvWriter = createCsvWriter({
                path: filePath,
                header: [
                    { id: "name", title: "Nom de la salle" },
                    { id: "capacity", title: "Capacité d’accueil" },
                ],
            });

            csvWriter
                .writeRecords(roomData)
                .then(() => {
                    logger.info(`CSV file successfully created at ${filePath}`);
                })
                .catch((err) => {
                    logger.error(`Error generating CSV file: ${err.message}`);
                });
        } catch (error) {
            logger.error(error.message);
        }
    });
}

module.exports = datavis;