var express = require("express");
var app     = express();
var connectApiApp = express();
var zlib    = require('zlib');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

var config = require(process.env.GALAXYBOARD_CONFIG);
var board = require("./galaxyboard")(
    {
        "board": {
            "pepper": "hItwrGnDOsiDtm02"    //  Passwords are salted & peppered. This is our pepper.
        },
        "mysql": config.db
    }
);

app.use(bodyParser.urlencoded({extended:true}));      //  parsing POST
app.use(cookieParser());    //  parse cookies
app.use(morgan('combined'));

////  Fehler per Mail senden
////  Generelle Fehler abfangen
//process.on('uncaughtException', function(err) {
//    console.log("uncaughtException");
//    console.log(err.stack);
//
//
//    var transporter = nodemailer.createTransport(smtpTransport({
//        host: config.error.mail.host,
//        port: config.error.mail.port
//    }));
//    var mailOptions = errorConfig.mail.message;
//    mailOptions.text = JSON.stringify(err.stack);
//    transporter.sendMail(mailOptions,
//        function(error, success){
//            console.log("sendmail::error",error);
//            console.log("sendmail::success",success);
//            console.log('Message ' + (success ? 'sent' : 'failed'));
//        }
//    );
//});

//  Serve "index.html" and process AJAX-Crawls for index-page
app.get('/', function(req, res){
    res.header('Content-Type', 'text/html; charset=UTF-8');
    res.sendFile(__dirname + '/htdocs/index.html');
});

app.get('/flags.js', function(req, res){
    res.sendFile(__dirname + '/galaxyboard/Flags.js');
});


//  Server css/gfx
app.get('/static/*', function(req, res){
    var filePath = __dirname + '/htdocs/static/' + req.params[0];
    console.log('loading asset: ' + filePath);
    res.sendFile(filePath);
});

//  Manage API-Calls
app.post('/api', function(req, res){
    //  Process commands:
    board.processCommands(req, res, function(amJSON){
        //  Set Content-Type
        res.header('Content-Type', 'text/json; charset=UTF-8');

        //  Check4Compression
        var acceptEncoding = req.headers['accept-encoding'] || '';

        // Note: this is not a conformant accept-encoding parser.
        // See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
        if (acceptEncoding.match(/\bdeflate\b/)) {
            res.header('content-encoding', 'deflate');
            zlib.deflate(JSON.stringify(amJSON), function(err,result){
                res.send(result);
            })
        } else if (acceptEncoding.match(/\bgzip\b/)) {
            res.header('content-encoding', 'gzip');
            zlib.gzip(JSON.stringify(amJSON), function(err,result){
                res.send(result);
            })
        } else {
            res.send(amJSON);
        }

    });
});

app.listen(config.port, config.host);


//connectApiApp.add(bodyParser.json);
//require('./conect_api')(connectApiApp, config);
//connectApiApp.listen(config.connectApi.port, config.connectApi.host);

process.on('SIGTERM', function () {
    app.close(function () {
        process.exit(0);
    });
});
