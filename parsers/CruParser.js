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
        return new Session(
            parts[0],
            parts[1],
            this.extractValue(parts[2]),
            this.extractValue(parts[3]),
            parts[4],
            this.extractRoom(parts[5])
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
     * Extracts the room name from a given string.
     * @param {string} input - Text containing "S=XXX".
     * @returns {string|null} Room name or null.
     */
    extractRoom(input) {
        const match = input.match(/S=([A-Z0-9]+)/);
        return match ? match[1] : null;
    }

    /**
     * Retrieves the rooms available for a given time slot.
     * @param {string} hours - Time range in "HH:MM-HH:MM" format.
     * @returns {string[]} List of available rooms.
     */
    availableRooms(hours) {
        const [start, end] = hours.split("-");
        const availableRooms = new Set();

        this.parsedData.forEach((edt) => {
            edt.sessions.forEach((session) => {
                const [sessionStart, sessionEnd] = session.time.split("-");
                if (
                    (end <= sessionStart || start >= sessionEnd) &&
                    session.capacity !== "0"
                ) {
                    availableRooms.add(session.room);
                }
            });
        });

        return Array.from(availableRooms);
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