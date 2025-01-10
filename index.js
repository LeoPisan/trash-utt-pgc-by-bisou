const cli = require("@caporal/core").default;

const commandsLoader = require("./commands");

// Paramétrage des informations à propos du logiciel
cli
  .name("Système de Planification Générale des Cours")
  .version("0.1")
  .description("Logiciel de planification générale des cours pour l'université centrale de la république de Sealand.")
;

// Chargement des commandes dans le programme
commandsLoader(cli);

cli.run();