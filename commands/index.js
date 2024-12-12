const readAllEdt = require("./readAllEdt");
const getRoom = require("./getRoom");
const availableRoom = require("./availableRoom");

module.exports = (cli) => {
    readAllEdt(cli);
    getRoom(cli);
    availableRoom(cli);
};