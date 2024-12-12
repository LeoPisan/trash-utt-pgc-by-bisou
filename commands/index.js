const readAllEdt = require("./readAllEdt");
const getRoom = require("./getRoom");
const availableRoom = require("./availableRoom");
const icalendar = require("./icalendar");

module.exports = (cli) => {
    readAllEdt(cli);
    getRoom(cli);
    availableRoom(cli);
    icalendar(cli);
};