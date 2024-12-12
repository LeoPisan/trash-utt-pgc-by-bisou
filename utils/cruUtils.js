const fs = require("fs");
const path = require("path");
const CruParser = require("../parsers/CruParser");

function checkDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        throw new Error(`The folder ${directory} does not exist.`);
    }
}

function findCruFiles(directory) {
    checkDirectoryExists(directory);

    let cruFiles = [];
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            cruFiles = cruFiles.concat(findCruFiles(filePath));
        } else if (file.endsWith(".cru")) {
            cruFiles.push(filePath);
        }
    });

    return cruFiles;
}

function parseCruFilesInDirectory(directory) {
    const files = findCruFiles(directory);

    if (files.length === 0) {
        throw new Error(`No .cru files found in directory: ${directory}`);
    }

    const parser = new CruParser();

    files.forEach((filePath) => {
        const data = fs.readFileSync(filePath, "utf8");
        parser.parse(data);
    });

    return parser;
}

function getCruDirectoryForCourse(courseName, directory) {
    checkDirectoryExists(directory);

    const firstLetter = courseName[0];
    const letterPairs = fs
        .readdirSync(directory)
        .filter((folder) => /^[A-Z]{2}$/.test(folder));

    const targetFolder = letterPairs.find((pair) => pair.includes(firstLetter));

    if (!targetFolder) {
        throw new Error(`No folder found for courses starting with '${firstLetter}'`);
    }

    const folderPath = path.join(directory, targetFolder);

    return folderPath;
}

function getCruFilePathForCourse(courseName, directory) {
    checkDirectoryExists(directory);

    const firstLetter = courseName[0];
    const letterPairs = fs
        .readdirSync(directory)
        .filter((folder) => /^[A-Z]{2}$/.test(folder));

    const targetFolder = letterPairs.find((pair) => pair.includes(firstLetter));

    if (!targetFolder) {
        throw new Error(`No folder found for courses starting with '${firstLetter}'`);
    }

    const folderPath = path.join(directory, targetFolder);

    checkDirectoryExists(folderPath);

    const cruFile = fs
        .readdirSync(folderPath)
        .find((file) => file.endsWith(".cru"));

    if (!cruFile) {
        throw new Error(`No .cru file found in folder ${folderPath}`);
    }

    return path.join(folderPath, cruFile);
}

module.exports = { findCruFiles, parseCruFilesInDirectory, getCruFilePathForCourse, getCruDirectoryForCourse };
