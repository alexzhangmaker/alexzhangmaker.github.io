const express = require('express');
const fs = require('fs');
var path = require('path');
var cors = require('cors')


var bodyParser = require('body-parser');

const libGatewayDB = require('./ms_Lib_Gateway.js') ;



const app = express();
app.use(express.static('./')) ;
app.use(cors()) ;

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
app.post('/updateGateway.V1/', updateGatewayV1) ;




async function fetchGatewayV1(request, response) {
    const {user } = request.params;
    let cUser = user.replace(':','') ;
    let jsonGateway = await libGatewayDB.fetchGateway(cUser) ;
    console.log(JSON.stringify(jsonGateway,null,3)) ;
    response.json(jsonGateway.Gateway) ;
}


async function updateGatewayV1(request, response) {
  let jsonData = request.body ;
  console.log(`updateGatewayV1:${jsonData}`) ;
  console.log(JSON.stringify(jsonData,null,3)) ;
  await libGatewayDB.updateGateway(jsonData) ;
  response.send({ retCode: '200' }) ;
}
