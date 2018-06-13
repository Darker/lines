const testFolder = '.';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
});

function readfilePromise(filename, options=null) {
  return new Promise((resolve, reject)=>{
    fs.readFile(filename, options, (err, res)=>{
      if(err)
          reject(err)
      else
          resolve(res);
    });
  });
}

const REGEX_DEFINE = /define\(\s*\[((?:"[^"\]]+"\s*,?\s*)+)\][\s\n]*,[\s\n]*function\s*\(((?:[^\s,)]+\s*,?\s*)+)\)[\s\n]*\{/i;
/**
 * @param {string} file
 * @param {string[]} otherFiles
**/
async function convertor(file, otherFiles)  {
    const filedata = (await readFilePromise(file)).toString();
    // Convert requirejs to module imports
    // assume following nodejs modules:
    const nodejsModules = ["socket.io", "fs", "net",
        "http"
    ];
    // If true, modules will be resolved
    const resolveModule = true;

    // find beginning of the define()
    const defineMatch = REGEX_DEFINE.exec(filedata);
    if(defineMatch) {
      const defineStart = defineMatch.index;
    }
}
