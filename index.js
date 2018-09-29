const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

//Instantiate the HTTP request
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

//Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log('The server is listening on port ' + config.httpPort + ' in ' + config.envName + ' mode');
})

//Instantiate the HTTPS request
const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
})

//Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
    console.log('The server is listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode');
})

//All the server login for both the http and https server
const unifiedServer = function (req, res) {
    //Get the URL and parase it
    const parsedUrl = url.parse(req.url, true);

    //Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get the method
    const method = req.method.toLowerCase();

    //Get the query string as an object
    const queryStringObject = parsedUrl.query;

    //Get the header as an object
    const headers = req.headers;

    //Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = ''
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        //Choose the handle this request should go to. If one is not found, use the notFound handle
        const chooseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construt the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            headers,
            method,
            payload: buffer
        }

        //Route the request to the handle specified in the router
        chooseHandler(data, function (statusCode, payload) {
            //Use the status code called back by the handler, or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            //Use the payload called back by the handle, or default to empty object
            payload = typeof (payload) === 'object' ? payload : {};
            //Convert the payload to string
            const payloadString = JSON.stringify(payload);

            //Send the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the request path
            console.log('Returning this response', statusCode, payloadString);
        });
    })
};

//Defines handlers
const handlers = {};

//Sample handler
handlers.sample = function (data, callback) {
    //Callback a http status code, and a payload object
    callback(406, { 'name': 'sample handler' })
}

//Not found handler
handlers.notFound = function (data, callback) {
    callback(404)
}

//Ping handler
handlers.ping = function (data, callback) {
    callback(200);
}

//Wecome handler
handlers.welcome = function (data, callback) {
    callback(200, { message: 'Hello World'});
}

const router = {
    'sample': handlers.sample,
    'ping': handlers.ping,
    'hello': handlers.welcome
}