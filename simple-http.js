define("simple-http", ["mime", "fs"], function(mime, fs) {
  console.log("Starting simple server in "+process.cwd());
  function simpleHTTPServer(req, resp) { 
    path  = unescape(process.cwd() + req.url)
    var code = 200
    if(fs.existsSync(path)) {
        if(fs.lstatSync(path).isDirectory()) {
            if(fs.existsSync(path+"index.html")) {
                path += "index.html"
            } else {
                code = 403
                resp.writeHead(code, {"Content-Type": "text/plain"});
                resp.end(code+" Access denied "+req.url);
            }
        }
        // Check for cache
       var reqModDate = req.headers["if-modified-since"] || req.headers["If-Modified-Since"];
       var stats = fs.statSync(path);

       //check if if-modified-since header is the same as the mtime of the file 
       if (reqModDate!=null) {
           reqModDate = new Date(reqModDate);
           //console.log("if-modified-since:", reqModDate.toUTCString(), "(",reqModDate.getTime(),")");
           if((reqModDate.getTime()/1000)>=Math.round(stats.mtime.getTime()/1000)) {
             //console.log("Not modified.");
             //Yes: then send a 304 header without image data (will be loaded by cache)
             //console.log("CACHE "+path);
             resp.writeHead(304, {
                 //"Last-Modified": stats.mtime.toUTCString()
             });
             resp.end();
             return;
           }
           //else
           //  console.log("Modified at      :",stats.mtime.toUTCString(), "(",stats.mtime.getTime(),")");
        }
        else {
          //console.log("No if-modified header.");
        }
        //console.log("DISK "+path);
        resp.writeHead(code, {
          "Content-Type": mime.lookup(path),
          "Content-Length": stats.size,
          "Cache-Control": "public, max-age=1, must-revalidate",
          "Last-Modified": stats.mtime.toUTCString()
        });
        
        fs.createReadStream(path).pipe(resp);
        /*fs.readFile(path, function (e, r) {
           resp.end(r);
        });*/
    } else {
        code = 404
        resp.writeHead(code, {
           "Content-Type":"text/plain"
        });
        resp.end(code+" Not found "+req.url);
    }
    //console.log("GET "+code+" "+req.url)
  }
  return simpleHTTPServer;
});