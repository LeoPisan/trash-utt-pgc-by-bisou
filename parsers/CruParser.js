const EDT = require("./EDT");
const Session = require("./Session");

class CruParser {
    /**
     * Parser to analyze .cru files.
     * @param {boolean} showTokenize - Indicates if tokenization steps should be displayed.
     */
    constructor(showTokenize = false) {
        this.parsedData = [];
        this.showTokenize = showTokenize;
        this.errorCount = 0;
    }

    /**
     * Tokenize : transforms the input data into filtered list.
     * @param {string} data - Raw data to analyze.
     * @returns {string[]} List of filtered lines.
     */
    tokenize(data) {
        const separator = /(\r\n|: )/;
        let lines = data.split(separator).filter((line) => !line.match(separator));

        return lines.filter((line) =>
            line.trim() &&
            !line.includes("Page") &&
            !line.startsWith("+UVUV") &&
            !line.startsWith("Seance") &&
            !line.endsWith("sec")
        );
    }

    /**
     * Parse : Parses the data by calling the first non-terminal rule.
     * @param {string} data - Raw data to analyze.
     */
    parse(data) {
        const tokenizedData = this.tokenize(data);
        if (this.showTokenize) {
            console.log("Tokenized Data:", tokenizedData);
        }
        this.listEdt(tokenizedData);
    }

    /**
     * Error message to display when parsing fails.
     * @param {string} msg - Error message to display.
     * @param {string} input - Input data that caused the error.
     */
    errMsg(msg, input) {
        this.errorCount++;
        console.log("Parsing Error ! on " + input + " -- msg : " + msg);
    }

    /**
     * ListEdt : Parses the session list and creates EDT objects.
     * @param {string[]} input - List of lines to analyze.
     */
    listEdt(input) {
        let currentEDT = null;

        input.forEach((line) => {
            if (line.startsWith("+")) {
                if (currentEDT) this.parsedData.push(currentEDT);
                currentEDT = new EDT(line.substring(1), []);
            } else if (currentEDT) {
                currentEDT.sessions.push(this.parseSession(line));
            }
        });

        if (currentEDT) this.parsedData.push(currentEDT);
    }

    /**
     * ParseSession : Parses a session in the format "X,X,P=X,H=X X:XX-X:XX,XX,S=XXX//".
     * @param {string} input - Line describing a session.
     * @returns {Session} Session object analyzed.
     */
    parseSession(input) {
        const parts = input.split(",");
        if (parts.length !== 6) {
            this.errMsg("Invalid session format", input);
            return null;
        }
        const [part1, part2, part3, part4, part5, part6] = parts;
        if (!/^\d$/.test(part1)) {
            this.errMsg("Invalid format for id", part1);
            return null;
        }

        if (!/^[A-Z0-9]\d$/.test(part2)) {
            this.errMsg("Invalid format for sessionType", part2);
            return null;
        }

        if (!/^P=\d{1,3}$/.test(part3)) {
            this.errMsg("Invalid format for capacity", part3);
            return null;
        }

        if (!/^H=(L|MA|ME|J|V|S|D) \d{2}:\d{2}-\d{2}:\d{2}$/.test(part4)) {
            this.errMsg("Invalid format for time", part4);
            return null;
        }

        if (!/^[A-Z]\d+$/.test(part5)) {
            this.errMsg("Invalid format for subgroup", part5);
            return null;
        }

        if (!/^S=[A-Z]\d{3}\/\/$/.test(part6)) {
            this.errMsg("Invalid format for room", part6);
            return null;
        }

        return new Session(
            part1,
            part2,
            this.extractValue(part3),
            this.extractValue(part4),
            part5,
            this.extractValue(part6)
        );
    }

    /**
     * Extracts a value in "key=value" format.
     * @param {string} input - Text in “key=value” format.
     * @returns {string} Extracted value.
     */
    extractValue(input) {
        return input.split("=")[1];
    }

    /**
     * Retrieves the rooms available for a given time slot.
     * @param {string} hours - Time range in "D HH:MM-HH:MM" format.
     * @returns {string[]} List of available rooms.
     */
    availableRooms(dayAndHours) {
        const [day, hours] = dayAndHours.split(" ");
        const [start, end] = hours.split("-").map((time) => {
            const [hour, minute] = time.split(":").map(Number);
            return hour * 60 + minute;
        });

        const occupiedRooms = new Set();

        this.parsedData.forEach((edt) => {
            edt.sessions.forEach((session) => {
                const [sessionDay, sessionHours] = session.time.split(" ");
                const [sessionStart, sessionEnd] = sessionHours.split("-").map((time) => {
                    const [hour, minute] = time.split(":").map(Number);
                    return hour * 60 + minute;
                });

                if (sessionDay === day && !(end <= sessionStart || start >= sessionEnd)) {
                    occupiedRooms.add(session.room);
                }
            });
        });

        const allRooms = new Set(
            this.parsedData.flatMap((edt) => edt.sessions.map((session) => session.room))
        );
        const availableRooms = Array.from(allRooms).filter((room) => !occupiedRooms.has(room));

        return availableRooms;
    }

    /**
     * Retrieves the availability of a given room for each day.
     * @param {string} room - Name of the room.
     * @returns {object} Room availability per day.
     */
    getRoomAvailability(room) {
        const sessions = this.parsedData.flatMap((edt) => edt.sessions);
        const startHour = "08:00";
        const endHour = "20:00";
        const daysOfWeek = ["L", "MA", "ME", "J", "V", "S", "D"];
        const availability = {};

        daysOfWeek.forEach((day) => {
            availability[day] = [{ start: startHour, end: endHour }];
        });

        sessions.forEach((session) => {
            if (session.room === room) {
                const [day, time] = session.time.split(" ");
                const [sessionStart, sessionEnd] = time.split("-");

                if (availability[day]) {
                    const updatedAvailability = [];

                    availability[day].forEach((slot) => {
                        if (sessionStart >= slot.end || sessionEnd <= slot.start) {
                            updatedAvailability.push(slot);
                        } else {
                            if (sessionStart > slot.start) {
                                updatedAvailability.push({ start: slot.start, end: sessionStart });
                            }
                            if (sessionEnd < slot.end) {
                                updatedAvailability.push({ start: sessionEnd, end: slot.end });
                            }
                        }
                    });

                    availability[day] = updatedAvailability;
                }
            }
        });

        return availability;
    }
}

module.exports = CruParser;