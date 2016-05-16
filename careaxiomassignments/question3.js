var express = require('express');
var jsdom = require('jsdom');
var request = require('request');
var url = require('url');
var app = express();
var async = require('async');
var getResult;
var promiseArray = [];
app.get('/', function(req, res) {
    res.send("hello world");
});

app.get('/I/Want/Title', function(req, res) {

    var queryObject = url.parse(req.url, true).query;
    var urls = queryObject.address;
    
    if(!(urls instanceof (Array))) {
        urls = [urls];
    }



    console.log(queryObject.address.length);
    var req1 = new Promise(function(resolve, reject) { 
      async.map(urls, getTitleMap, function(error, result){
        console.log('Inside async');
        console.log(result.length);
        if (result.length==urls.length) {
            getResult = result;
            resolve(result);
        }
        else {
            reject(Error("It broke"));
        }
        
     });
});

    console.log(req1);

req1.then(function(result) {
    console.log('Inside promisee all');
    console.log(result);
     res.end(resultContent(result));
}).catch(function(err) {
    console.log('Catch: ', err);
});

});

 

app.all('*', function(req, res) {
    res.end("Status: 404");
});

var getTitleMap = function(host, callback) {
    var address = (host.startsWith('http://') || host.startsWith('https://')) ? host : ('http://' + (host.startsWith('www') ? host : 'www.' + host))
    console.log(address);

    request({
        uri: address
    }, function(err, response, body) {
        if (err || response.statusCode !== 200) {
            var noResponseTitle = 'No Response';
            callback(null, {
                host: host,
                title: noResponseTitle
            });
            console.log("no response error");
        } else {
            var self = this;
            self.items = new Array(); //I feel like I want to save my results in an array

            //Send the body param as the HTML code we will parse in jsdom
            //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
            jsdom.env({
                html: body,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function(err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    console.log($('title').text());
                    var title = $('title').text();
                    callback(null, {
                        host: host,
                        title: title
                    });
                }
            });
        }
    });
};

var resultContent = function(addresses) {
    var html = "";
    html = html + "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>"
    for (var i=0; i<addresses.length; i++) {
        html = html + "<li>" + addresses[i].host + " - " + addresses[i].title + "</li>";
    }
    html = html + "</ul></body></html>";
    return html;
};

var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})