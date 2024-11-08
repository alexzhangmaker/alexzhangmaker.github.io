const http = require('node:http');


function _existsFavICON(hostName) {
    let urlFavIco = `https://${hostName}/favicon.ico`
    console.log(urlFavIco) ;
    var http = new XMLHttpRequest();
    http.open('GET', urlFavIco, true);
    http.withCredentials = "true";

    http.send();
    return http.status!=404;
}

let url2T='https://www.svgrepo.com/' ;
var url = new URL(url2T);

//console.log(_existsFavICON(url.hostname)) ;


const options = {
    host: url.hostname,
    port: 8080,
    path: '/favicon.ico'
};
  
// Make a request
const req = http.request(options);
req.end();

req.on('information', (info) => {
    console.log(`Got information prior to main response: ${info.statusCode}`);
});