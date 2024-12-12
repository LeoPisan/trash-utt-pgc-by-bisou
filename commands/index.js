const readAllEdt = require("./readAllEdt");
const getRoom = require("./getRoom");
const checkRoom = require("./checkRoom");
const availableRoom = require("./availableRoom");

module.exports = (cli) => {
    readAllEdt(cli);
    getRoom(cli);
    checkRoom(cli);
    availableRoom(cli);
};