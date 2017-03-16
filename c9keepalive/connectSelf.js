const phantom = require('phantom');

const START = 'http://127.0.0.1';

(async function() {
    const instance = await phantom.create();
    const page = await instance.createPage();

    async function terminate(err) {
        console.log("ERROR: "+err);
        await instance.exit();
    }
    const status = await page.open(START);
    if(status!="success") {
        return terminate("Failed:"+status);
    }
    //document.reactJSSetValue = reactJSSetValue;
    //const result = await page.evaluate(function(){
    //    return document.reactJSSetValue;
    ///});
    //console.log(result);
    while(true) {
        console.log("Awaiting login...");
        let result = await page.evaluate(function() {
            const button = document.querySelector("#speedRatio");
            return button!=null;
        });
        if(result) 
            break;
    }

    let debugInfo = await page.evaluate(function() {
        var res = [1,2,3];
        res.push(typeof window);
        
        for(var i in window) {
            //if(i.indexOf("on")!=0 && (typeof self[i]!='undefined') && self[i]!=null)
                res.push([i, self[i]])
        }
        return res;
    });
    if(debugInfo instanceof Array)
        console.log("RESULT:\n",debugInfo);//.map((e)=>{return e.join("=>")}).join("\n")
    else
        console.log("Result: ",debugInfo);
    await instance.exit();
}());