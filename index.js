const cli = require("@caporal/core").default;

const commandsLoader = require("./commands");

cli
  .name("Système de Planification Générale des Cours")
  .version("0.1")
  .description("Logiciel de planification générale des cours pour l'université centrale de la république de Sealand.")
;

commandsLoader(cli);

cli.run();