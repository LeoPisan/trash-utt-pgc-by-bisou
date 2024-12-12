const readAllEdt = require("./readAllEdt");
const getRoom = require("./getRoom");
const availableRoom = require("./availableRoom");
const icalendar = require("./icalendar");
const datavis = require("./datavis");

module.exports = (cli) => {
    readAllEdt(cli);
    getRoom(cli);
    availableRoom(cli);
    icalendar(cli);
    datavis(cli);
};