
/**
 * @typedef {Object} StateData
 * @prop {RegExp} accept
 * @prop {number} charlimit
 * @prop {string} name
 * @prop {StateData} __parent
 * @prop {boolean} totalEnd
 * */


/**
 * @typedef {{[name: string]: StateData}} StateObj
 * @prop {RegExp} accept
 * @prop {number} charlimit
 * @prop {string} name
 * @prop {StateData} __parent
 * @prop {boolean} totalEnd
 * */

const BRACKETS = {
    "{": "}",
    "(": ")",
    "[": "]"
};

/** @type {StateObj} **/
const STATE = {
    name: "none",
    "/": {
        "/": {
            name: "COMMENT",
            accept: /[^\n]/,
            totalEnd: true
        },
        "*": {
            name: "COMMENT",
            "*": {
                "/": {
                    totalEnd: true,
                    accept: /[^\w\W]/
                },
                charlimit: 1
            }
        },
        charlimit: 1
    },
    "\"": {
        name: "STRING",
        accept: /[^"\n]/,
        "\\": {
            accept: /[^\n]/,
            charlimit: 1
        }
    },
    "'": {
        name: "STRING",
        accept: /[^'\n]/,
        "\\": {
            accept: /[^\n]/,
            charlimit: 1
        }
    }
}
/**
 * 
 * @param {Object} object
 */
function makeParents(object) {
    if (typeof object.name != "string") {
        if (object.__parent) {
            Object.defineProperty(object, "name", {
                get: function () { return this.__parent.name; }
            });
        }
        else {
            object.name = "";
        }
    }
    for (let name in object) {
        if (name != "__parent" && object.hasOwnProperty(name)) {
            if (typeof object[name] == "object") {
                object[name].__parent = object;
                makeParents(object[name]);
            }
        }
    }
}
makeParents(STATE);

/**
 * 
 * @param {string} string
 * @param {number} startPosition
 */
function findNextBracket(string, startPosition) {
    const startBracket = string[startPosition];
    const searchedBracket = BRACKETS[startBracket];
    if (searchedBracket == null) {
        throw new Error("Bad bracket position.");
    }
    /** @type {StateData|StateObj} **/
    let state = STATE;

    const BRACKET_COUNT = {
        "{": 0,
        "(": 0,
        "[": 0
    }
    function bracketDecrementor(name) {
        return function (value) {
            var diff = BRACKET_COUNT[name] - value;
            BRACKET_COUNT[name] += diff;
            return BRACKET_COUNT[name];
        }
    }

    Object.defineProperty(BRACKET_COUNT, "}", { set: bracketDecrementor("{"), get: () => BRACKET_COUNT["{"] });
    Object.defineProperty(BRACKET_COUNT, ")", { set: bracketDecrementor("("), get: () => BRACKET_COUNT["("] });
    Object.defineProperty(BRACKET_COUNT, "]", { set: bracketDecrementor("["), get: () => BRACKET_COUNT["["] });

    //used for states with char limit
    let charcount = 0;
    for (let i = startPosition, l = string.length; i < l; ++i) {
        const character = string[i];
        if ((typeof BRACKET_COUNT[character] == "number")) {
            BRACKET_COUNT[character]++;
            //console.log("Bracket update: ",character, BRACKET_COUNT);
        }

        if (state[character]) {
            state = state[character];
            //console.log("[" + i + "] Enter state " + state.name + " through character " + character, state);
            charcount = 0;
        }
        else if (charcount > state.charlimit) {
            const oldstate = state;
            state = endState(state);
            //console.log("[" + i + "] Exit state (charcount) " + oldstate.name + " to state " + state.name, state);
        }
        else if (state.accept && !state.accept.test(character)) {
            const oldstate = state;
            state = endState(state);
            //console.log("[" + i + "] Exit state (match) " + oldstate.name + " to state " + state.name, state);
        }
        if (state.name != "COMMENT" && state.name != "STRING") {
            if (character == searchedBracket && BRACKET_COUNT[startBracket]==0) {
                return i;
            }
        }
        charcount++;
    }
    throw new Error("Unmatched bracket: " + searchedBracket);
}

/**
 * 
 * @param {StateData} state
 * @returns {StateData|StateObj}
 */
function endState(state) {
    return state.totalEnd ? STATE : state.__parent;
}

//export default findNextBracket;
module.exports = findNextBracket;