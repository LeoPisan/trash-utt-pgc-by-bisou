const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { createEvents } = require("ics");
const { parseCruFilesInDirectory } = require("../utils/cruUtils");
const colorInfo = require("../utils/colorInfo");

/**
 * Fournis la commande "icalendar" permettant de générer un fichier iCalendar à partir des données chargées en mémoire
 * @param cli {Program} - Programme Caporal JS
 */
function iCalendar(cli) {
    cli
    .command("icalendar", "Allows to generate an icalendar file based on the user's courses.")
    .argument("<start>", "Start date in YYYY-MM-DD format.")
    .argument("<end>", "End date in YYYY-MM-DD format.")
    .argument("<courses>", "List of courses (ex: MA03, AP03...).")
    .option("--output [output]", "Output path for the icalendar file.")
    .action(({ args, options, logger}) => {
        const courses = args.courses;
        const output = options.output;

        const startDate = new Date(args.start);
        const endDate = new Date(args.end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            return logger.error(colorInfo("Invalid date range. Ensure dates are in YYYY-MM-DD format and start is before end.", "yellow", "SRUPC_4_E2"));
        }

        const courseList = courses.split(",").map((course) => course.trim().toUpperCase());

        if (courseList.length === 0) {
            return logger.error(colorInfo("No courses provided. Provide at least one course.", "yellow"));
        }

        try {
            const dataDir = "data";
            const parser = parseCruFilesInDirectory(dataDir);
            const events = [];

            parser.parsedData.forEach((edt) => {
                if (courseList.includes(edt.name)) {
                    edt.sessions.forEach((session) => {
                        const [dayOfWeek, timeRange] = session.time.split(" ");
                        const [startTime, endTime] = timeRange.split("-");
                        const sessionDate = calculateNextDate(dayOfWeek, startDate);

                        if (sessionDate >= startDate && sessionDate <= endDate) {
                            const [startHour, startMinute] = startTime.split(":").map(Number);
                            const [endHour, endMinute] = endTime.split(":").map(Number);

                            events.push({
                                start: [
                                    sessionDate.getFullYear(),
                                    sessionDate.getMonth() + 1,
                                    sessionDate.getDate(),
                                    startHour,
                                    startMinute,
                                ],
                                end: [
                                    sessionDate.getFullYear(),
                                    sessionDate.getMonth() + 1,
                                    sessionDate.getDate(),
                                    endHour,
                                    endMinute,
                                ],
                                title: `${session.sessionType} - ${edt.name}`,
                                description: `Room: ${session.room}, Capacity: ${session.capacity}`,
                                location: session.room,
                            });
                        }
                    });
                }
            });

            if (events.length === 0) {
                return logger.info("SRUPC_4_E1: No courses found for the specified date range.");
            }

            createEvents(events, (error, value) => {
                if (error) {
                    return logger.error(colorInfo(`Error generating iCalendar: ${error.message}`, "red"));
                }

                let filePath;
                const fileName = "icalendar-" + Date.now() + ".ics";

                if (output !== undefined) {
                    if (!existsSync(`${output}`)) {
                        return logger.error(colorInfo("The specified output is incorrect. Please use a valid path.", "yellow", "SRUPC_4_E3"));
                    }
                    filePath = (output.slice(-1) === "/" ? output : output + "/") + fileName;
                } else {
                    if (!existsSync("./icalendar/")) {
                        mkdirSync("./icalendar/");
                    }
                    filePath =  "./icalendar/" + fileName;
                }

                writeFileSync(filePath, value);
                logger.info(`iCalendar file successfully created at ${filePath}`);
            });
        } catch (error) {
            logger.error(colorInfo(error.message, "red"));
        }
    });
}

function calculateNextDate(dayOfWeek, startDate) {
    const daysMap = { L: 1, MA: 2, ME: 3, J: 4, V: 5, S: 6, D: 0 };
    const targetDay = daysMap[dayOfWeek];
    const currentDay = startDate.getDay();

    const diff = targetDay >= currentDay ? targetDay - currentDay : 7 - (currentDay - targetDay);
    const nextDate = new Date(startDate);
    nextDate.setDate(startDate.getDate() + diff);
    return nextDate;
}

module.exports = iCalendar;