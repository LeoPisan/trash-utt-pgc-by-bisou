const readAllEdt = require("./readAllEdt");
const getRoom = require("./getRoom");
const availableRoom = require("./availableRoom");
const icalendar = require("./icalendar");
const datavis = require("./datavis");
const loadCal = require("./loadCal");

// Fournis une source pour importer en une fois toutes les commandes du logiciel
module.exports = (cli) => {
    readAllEdt(cli);
    getRoom(cli);
    availableRoom(cli);
    icalendar(cli);
    datavis(cli);
    loadCal(cli);
};