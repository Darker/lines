const phantom = require('phantom');
const LOGIN_DETAILS = require("./login");

function reactJSSetValue(elm, value) {
    elm.value = value;
    elm.defaultValue = value;
    elm.dispatchEvent(new Event("input", {bubbles: true, target: elm, data: value}));
}
function findOpenButtonFor(projectName) {
    try {
        return Array.prototype.filter.call(
            document.querySelectorAll("#workspace-card-"+projectName+" a.button.solid"),
            function(elm){return elm.innerHTML.indexOf("Open")!=-1;}
        )[0];
    } catch(e) {
        return null;
    }
}

class TimeoutPromise extends Promise {
    constructor(timeout) {
        super(function(resolve, reject) {
            setTimeout(resolve, timeout);
        });
    }
}
class DefineFunctionPromise extends Promise {
    constructor(page, func) {
        super(async function(resolve, reject) {
            const str = func.toString()+" \nself."+func.name+" = "+func.name+";";
            //console.log("Running code: "+str);
            const result = await page.evaluate(new Function(str));
            resolve(result);
        });
    }
}
class PageEventPromise extends Promise {
    constructor(page, event) {
        super(function(resolve, reject) {
            let callback = function() {
                let args = [];
                args.push.apply(args, arguments);
                page.off(event, callback);
                resolve(args);
            }
            page.on(event, callback);
        });
    }
}
class PagePollPromise extends Promise {
    constructor(page, arrayName) {
        super(async function(resolve, reject) {
            var result = await page.evaluate(function(name) {
                name = name.split(".");
                var object = self;
                for (var i=0,l=name.length; i<l; i++)
                {
                    object = object[name[i]];
                    if(object==null)
                        return ["Undefined!!!"];
                }
                if(!(object instanceof Array)) {
                    return ["NOT AN ARRAY"];
                }
                if(object.length==0)
                    return object;
                var ar = object;
                object = [];
                return ar;
            }, arrayName);
            resolve(result);
        });
    }
}


const START = 'https://c9.io/login';
//const START = '127.0.0.1';

(async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    async function terminate(err) {
        console.log("ERROR: "+err);
        await instance.exit();
    }
    const status = await page.open(START);

    const content = await page.property('content');

    await page.evaluate(new Function("self.LOGIN_DETAILS = "+JSON.stringify(LOGIN_DETAILS)+";"));
    await new DefineFunctionPromise(page, reactJSSetValue);
    await new DefineFunctionPromise(page, findOpenButtonFor);
    //document.reactJSSetValue = reactJSSetValue;
    //const result = await page.evaluate(function(){
    //    return document.reactJSSetValue;
    ///});
    //console.log(result);
    let result = await page.evaluate(function() {
        try {
            reactJSSetValue(document.querySelector("#id-username"), LOGIN_DETAILS.name);
            reactJSSetValue(document.querySelector("#id-password"), LOGIN_DETAILS.password);
            document.querySelector("fieldset div.wrap button").click();
            return true;
        }
        catch(e) {
            return e+"";
        }
    });
    if(result!==true) {
        await terminate("Cannot find and submit login form: "+result);
        return;
    }

    while(true) {
        console.log("Awaiting login...");
        await new TimeoutPromise(500);
        let result = await page.evaluate(function() {
            const button = findOpenButtonFor("lines");
            return button!=null;
        });
        if(result) 
            break;
    }
    //await page.on("onResourceRequested", function(requestData) {
    //    console.info('Requesting', requestData.url)
    //});
    // Click open button
    await page.evaluate(function() {
        const button = findOpenButtonFor("lines");
        button.target = "";
        button.click();
    });
    // wait for the IDE to load
    let time = 0;
    while(true) {
        console.log("Awaiting IDE...");
        await new TimeoutPromise(time+=500);
        let result = await page.evaluate(function() {
            const log = document.querySelector("div.ace_layer.ace_text-layer");
            return log!=null;
        });

        if(result) 
            break;
        else if(time>5000) {
            let result = await page.evaluate(function() {
                const button = findOpenButtonFor("lines");
                return button!=null;
            });
            if(result==true) {
                await terminate("Open button didn't work!");
                return;
            }
        }
    }
    // All done, poll for log changes
    let evtPromise = new PagePollPromise(page, "CHANGE_POLL");
    await page.evaluate(function() {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
             // Only emit event for child edditions/deletions
             if(mutation.type != "childList")
                 return;
             for (var i=0,l=mutation.addedNodes.length; i<l; i++)
             {
                 const node = mutation.addedNodes[i];
                 if(node.querySelector("span")!=null)
                    continue;
                 console.log(node.innerText);
                 window.CHANGE_POLL.push(node.innerText);
                 // This is how I try to emit events from the page to NodeJS. It does not work
                 //self.dispatchEvent(new Event("logEntry", {text: node.innerText}));
                 // I did this to confirm that it does not work (I can see the errors in console)
                 // throwing error after timeout does not cause trouble in nodejs
                 //setTimeout(function() {throw new Error("DATA:"+node.innerText);}, 0);
             }
          });    
        });
        window.CHANGE_POLL = [];
        var config = { attributes: !true, childList: true, characterData: !true };
        observer.observe(document.querySelector("div.ace_layer.ace_text-layer"), config);
    });
    // I process events one by one. The reason is that I plan to implement
    // condition for breaking this loop and terminating the program
    while(true) {
         console.log("Still running.");
         //let logEntry = await evtPromise;
         //evtPromise = new PagePollPromise(page, "CHANGE_POLL");
         //logEntry.forEach((entry)=>{console.log("LOG: ", entry)});
         
         await new TimeoutPromise(1000);
    }

    await instance.exit();
}());