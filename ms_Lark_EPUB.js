const express = require('express');
const fs = require('fs');
var path = require('path');


var bodyParser = require('body-parser');




const app = express();
app.use(express.static('./public')) ;

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const userID = 'alexszhang@gmail.com' ;
const port = 9989 ;//parseInt(process.env.YouTubePort);

console.log(`port:${port}`) ;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});


//app.get('/publish.V1', fetchAccountHoldings) ;             // http://127.0.0.1:8180/fetchProjects.V2
app.get('/fetchePub.V1/:user', fetchEPubV1) ;    //http://127.0.0.1:9988/fetchGateway.V1/:alexszhang@gmail.com




async function fetchEPubV1(request, response) {
    /*
    const {user } = request.params;
    let cUser = user.replace(':','') ;
    let jsonGateway = await libGatewayDB.fetchGateway(cUser) ;
    console.log(JSON.stringify(jsonGateway,null,3)) ;
    response.send(jsonGateway.Gateway) ;
    */
}

