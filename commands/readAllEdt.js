const { parseCruFilesInDirectory } = require("../utils/cruUtils");

/**
 * Fournis la commande readAllEdt permettant de lire tous les fichiers au format CRU d'un répertoire
 * @param cli {Program} Programme Caporal JS
 */
function readAllEdt(cli) {
    cli
    .command("readAllEdt", "Read and parse all .cru files from the given directory.")
    .argument("<directory>", "The directory containing .edt.cru files.")
    .option("-t, --showTokenize", "Log the tokenization results.", {
        validator: cli.BOOLEAN,
        default: false,
    })
    .action(({ args, options, logger }) => {
        try {
            const parser = parseCruFilesInDirectory(args.directory, options.showTokenize);

            logger.info(JSON.stringify(parser.parsedData, null, 2));
        } catch (error) {
            logger.error(error.message);
        }
    });
}

module.exports = readAllEdt;