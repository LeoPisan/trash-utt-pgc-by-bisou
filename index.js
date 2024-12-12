const cli = require("@caporal/core").default;

const commandsLoader = require("./commands");

cli
.version("cru-parser-cli")
.version("0.1")
;

commandsLoader(cli);

cli.run();