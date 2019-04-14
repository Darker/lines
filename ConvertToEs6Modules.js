//import findNextBracket from "./BracketFinder.js";
//import fs from "fs";

const findNextBracket = require("./BracketFinder");
const fs = require('fs');
const path = require("path");

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});



const testFolder = '.';
const directoryReady = PromiseMkdirs("ES6", true);
fs.readdir(testFolder, async (err, files) => {


    for (let i = 0, l = files.length; i < l; ++i) {
        const filename = files[i];
        if (!filename.endsWith(".js") || filename != "game.js") {
            continue;
        }
        await directoryReady;
        const result = await convertor(filename, files);
        fs.writeFile("ES6/" + filename, result, function () { });
    }
    console.log("End");
});

(async () => {

})();

function PromiseMkdir(path) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(path, function (error) {
            if (error)
                reject(error);
            else
                resolve();
        });
    });
}
/**
 * Makes directory path recursively.
 * if isDir is true, the last segment of path is also a directory **/
async function PromiseMkdirs(filename, isDir) {
    var segments = filename.split("/");
    var path = "";
    for (var i = 0, l = segments.length; i < l; ++i) {
        // isDir iot true then nthe last segment is not a directory
        if (i + 1 == l && isDir !== true)
            return true;
        path += segments[i] + "/";
        var exists = await PromiseFileExists(path);
        if (!exists)
            await Mkdir(path);
    }
}

function PromiseFileExists(filename) {
    return new Promise((resolve, reject) => {
        fs.exists(filename, (doesExist) => {
            resolve(doesExist);
        });
    });
}

function PromiseReadFile(filename, options=null) {
  return new Promise((resolve, reject)=>{
    fs.readFile(filename, options, (err, res)=>{
      if(err)
          reject(err)
      else
          resolve(res);
    });
  });
};



const REGEX_DEFINE = /define\s*\(\s*(?:(\[(?:"[^"\]]+"\s*,?\s*)+\]\s*)\s*,|)\s*function\s*\(((?:[^\s,)]+\s*,?\s*)*)\)\s*\{/i
//const RE =                  /define\(\s*(?:(\[(?:"[^"\]]+"\s*,?\s*)+\]\s*)\s*,|)\s*function\s*\(((?:[^\s,)]+\s*,?\s*)*)\)\s*\{/i



/**
 * @param {string} file
 * @param {string[]} otherFiles
**/
async function convertor(file, otherFiles) {
    const filedata = (await PromiseReadFile(file)).toString();
    return await ES5classToES6(filedata, otherFiles);
}

async function convertRequireJStoES6modules(filedata, otherFiles) {
    // If true, modules will be resolved
    const resolveModule = true;

    // find beginning of the define()
    console.log("Trying to find module definition:")
    let defineMatch = null;
    while (defineMatch = REGEX_DEFINE.exec(filedata)) {
        //console.log("Found module definition: ",defineMatch);
        const defineStart = defineMatch.index;
        const defineBracket = defineStart + defineMatch[0].length - 1;
        console.log("Finding next bracket for " + filedata[defineBracket] + " (at " + defineBracket + ")");
        const endBracket = findNextBracket(filedata, defineBracket);
        /** @type {string[]} **/
        const importedModulePaths = defineMatch[1].length > 0 ? JSON.parse(defineMatch[1]) : [];
        const importedModuleNames = defineMatch[2].split(/[\s\n]*,[\s\n]*/);

        if (importedModulePaths.length < importedModuleNames.length) {
            throw new Error("Module requires other modules but does not import them.");
        }
        if (importedModulePaths.length > importedModuleNames.length) {
            throw new Error("Module does not assign some of the imported modules.");
        }
        // add the imports
        var resultString = filedata.substr(0, defineStart);
        for (let i = 0, l = importedModuleNames.length; i < l; ++i) {
            let filename = importedModulePaths[i];
            if (!filename.endsWith(".js")) {
                filename += ".js";
            }
            if (await PromiseFileExists(filename)) {
                resultString += "import * as " + importedModuleNames[i] + " from \"" + filename + "\";\n";
                continue;
            }
            else {
                // Use original path
                resultString += "import * as " + importedModuleNames[i] + " from \"" + importedModulePaths[i] + "\";\n";
            }
        }

        const startDefineCode = defineStart + defineMatch[0].length;
        resultString += filedata.substr(startDefineCode, endBracket - startDefineCode);
        let startAfterDefine = endBracket;
        for (; filedata[startAfterDefine] != ")" && filedata[startAfterDefine] != ";" && startAfterDefine < filedata.length; startAfterDefine++);
        if (startAfterDefine < filedata.length) {
            resultString += filedata.substr(startAfterDefine);
        };

        filedata = resultString;
    }

    return filedata;
}

/**
 * @typedef {{match:RegExpMatchArray, isClass: boolean, methods:RegExpMatchArray[], classDef: string}} functionMatchInfo
 * 
 * */
/**
 * 
 * @param {string} filedata
 */
function ES5classToES6(filedata) {
    const REGEX_NAMED_FUNCTION = /function\s*([a-zA-Z_][a-zA-Z_0-9]*)\s*\(((?:\s*,?\s*[a-zA-Z_][a-zA-Z_0-9]*\s*)*)\)\s*\{/g;
    const REGEX_PROTOTYPE_METHOD = /([a-zA-Z_][a-zA-Z_0-9]*)\.prototype\.([a-zA-Z_][a-zA-Z_0-9]*)\s*=\s*function\s*\(((?:\s*,?\s*[a-zA-Z_][a-zA-Z_0-9]*\s*)*)\)\s*\{/g;

    /** @type {{[name:string]:functionMatchInfo}} **/
    const functions = {};
    /** @type {functionMatchInfo[]} **/
    const classes = [];
    let fnmatch = null;
    let fnCount = 0;
    // get a list of all defined functions
    while (fnmatch = REGEX_NAMED_FUNCTION.exec(filedata)) {
        functions[fnmatch[1]] = {
            match: fnmatch,
            isClass: false,
            methods: []
        };
        fnCount++;
    }
    console.log("Found ", fnCount, " functions in the code.");
    // Find prototype definitions
    let protomatch = null;
    while (protomatch = REGEX_PROTOTYPE_METHOD.exec(filedata)) {
        if (functions[protomatch[1]]) {
            const fnDef = functions[protomatch[1]];
            if (!fnDef.isClass)
                classes.push(fnDef);
            fnDef.isClass = true;
            fnDef.methods.push(protomatch);
        }
        else {
            console.warn("Undefined prototype of ", protomatch[1], " is being assigned a method.");
        }
    }
    console.log(" - ", classes.length, " are classes.");
    let result = "";
    // create constructors from classes and assemble the whole class definitions
    for (let i = 0, l = classes.length; i < l; ++i) {
        const funcInfo = classes[i];
        if (!funcInfo.isClass) {
            continue;
        }
        let classCode = "\nclass " + funcInfo.match[1] + " {\n";
        // create constructor
        classCode += "   constructor(" + funcInfo.match[2] + ") {\n";
        // find and insert ctor code
        const startCtorBracketPos = funcInfo.match.index + funcInfo.match[0].length-1;
        const endCtorBracketPos = findNextBracket(filedata, startCtorBracketPos);
        /** @type {string} **/
        const ctorCode = filedata.substr(startCtorBracketPos+1, endCtorBracketPos - startCtorBracketPos);
        classCode += "   " + ctorCode.split(/\r?\n/g).join("\n    ")+"\n";

        // add methods
        for (let i2 = 0, l2 = funcInfo.methods.length; i2 < l2; ++i2) {
            const item = funcInfo.methods[i2];
            let methodCode = "\n    " + item[2] + "(" + item[3] + ") {\n";
            const startMethodBracketPos = item.index + item[0].length - 1;
            const endMethodBracketPos = findNextBracket(filedata, startMethodBracketPos);

            methodCode += filedata.substr(startMethodBracketPos + 1, endMethodBracketPos - startMethodBracketPos);
            classCode += methodCode;
        }

        classCode += "}";
        result += classCode;
    }
    return result;
}
