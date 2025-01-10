const { parseCruFilesInDirectory } = require("../utils/cruUtils");
const { existsSync, mkdirSync } = require("fs");
const colorInfo = require("../utils/colorInfo");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

function datavis(cli) {
    cli
    .command("datavis", "Generates a CSV table which represents the rank of rooms by capacity.")
    .argument("<type>", "Choose between the 'occupation' and the 'capacity' datavis.")
    .option("--output [output]", "Output path for the csv file.")
    .action(({ args, options, logger }) => {
        const output = options.output;
        const type = args.type;
        const fileName = (type === "capacity" || "c" ? "datavis-capacity-" + Date.now() + ".csv" : "datavis-occupation-" + Date.now() + ".csv");
        let filePath;

        try {
            const dataDir = "data";
            const parser = parseCruFilesInDirectory(dataDir);

            if (type === "capacity" || type === "c") {
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

                if (output) {
                    if (!existsSync(`${output}`)) {
                        return logger.error(colorInfo("The specified output is incorrect. Please use a valid path.", "yellow", "SRUPC_7_E1"));
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
                        logger.info(`CSV file successfully created at ${filePath}.`);
                    })
                    .catch((err) => {
                        logger.error(colorInfo(`Error generating CSV file: ${err.message}.`, "red"));
                    });
            } else if (type === "occupation" || type === "o") {
                const roomOccupancy = {};

                parser.parsedData.forEach((edt) => {
                    edt.sessions.forEach((session) => {
                        const room = session.room;
                        const [day, timeRange] = session.time.split(" ");
                        const [start, end] = timeRange.split("-");
                        const duration = parseTimeToMinutes(end) - parseTimeToMinutes(start);

                        if (!roomOccupancy[room]) {
                            roomOccupancy[room] = { room, occupiedTime: 0, totalTime: 0 };
                        }

                        const dayTime = 12 * 60;
                        roomOccupancy[room].totalTime += dayTime;
                        roomOccupancy[room].occupiedTime += duration;
                    });
                });

                const occupancyRates = Object.values(roomOccupancy).map((room) => ({
                    room: room.room,
                    occupancyRate: ((room.occupiedTime / room.totalTime) * 100).toFixed(2),
                }));

                occupancyRates.sort((a, b) => a.occupancyRate - b.occupancyRate);

                if (output) {
                    if (!existsSync(`${output}`)) {
                        return logger.error(colorInfo("The specified output is incorrect. Please use a valid path.", "yellow", "SRUPC_6_E1"));
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
                        { id: "room", title: "Nom de la salle" },
                        { id: "occupancyRate", title: "Taux d’occupation (%)" },
                    ],
                });

                csvWriter
                    .writeRecords(occupancyRates)
                    .then(() => {
                        logger.info(`CSV file successfully created at ${filePath}.`);
                    })
                    .catch((err) => {
                        logger.error(colorInfo(`Error generating CSV file: ${err.message}.`, "red"));
                    });
            } else {
                logger.error(colorInfo("Please choose a value between 'occupation' and 'capacity'.", "yellow"));
            }
        } catch (error) {
            logger.error(colorInfo(error.message, "red"));
        }
    });
}

function parseTimeToMinutes(time) {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
}

module.exports = datavis;