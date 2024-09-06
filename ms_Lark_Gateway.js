const express = require('express');
const fs = require('fs');
var path = require('path');


var bodyParser = require('body-parser');

const libGatewayDB = require('./ms_Lib_Gateway.js') ;



const app = express();
app.use(express.static('./public')) ;

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const userID = 'alexszhang@gmail.com' ;
const port = 9988 ;//parseInt(process.env.YouTubePort);

console.log(`port:${port}`) ;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});


//app.get('/publish.V1', fetchAccountHoldings) ;             // http://127.0.0.1:8180/fetchProjects.V2
app.get('/fetchGateway.V1/:user', fetchGatewayV1) ;    //http://127.0.0.1:9988/fetchGateway.V1/:alexszhang@gmail.com




async function fetchGatewayV1(request, response) {
    const {user } = request.params;
    let cUser = user.replace(':','') ;
    let jsonGateway = await libGatewayDB.fetchGateway(cUser) ;
    console.log(JSON.stringify(jsonGateway,null,3)) ;
    response.send(jsonGateway.Gateway) ;
}

