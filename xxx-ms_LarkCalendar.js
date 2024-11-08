const express = require('express');
const fs = require('fs');
var path = require('path');
var cors = require('cors')


var bodyParser = require('body-parser');
const libGatewayDB = require('./ms_LibGateway.js') ;



const app = express();
app.use(express.static('./')) ;
app.use(cors()) ;
app.use(express.json({limit: '50mb'}));

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
app.get('/fetchGateway.V1/:user', fetchGatewayV1) ;    //http://127.0.0.1:9988/fetchGateway.V1/:alexszhang@gmail.com
app.post('/updateGateway.V1/', updateGatewayV1) ;


app.post('/fetchBookmarkV1.V1/', fetchBookmarkV1) ;
app.post('/addBookmark.V1/', addBookmarkV1) ;
app.post('/removeBookmark.V1/', removeBookmarkV1) ;


//fetchUserFoldersV1
app.get('/fetchUserFolders.V1/:user', fetchUserFoldersV1) ;    //http://127.0.0.1:9988/fetchUserFolders.V1/:alexszhang
app.post('/updateUserFolders.V1/', updateUserFoldersV1) ;


app.post('/newMustHave.V1/', newMustHaveV1) ;
app.post('/removeMustHave.V1/', removeMustHaveV1) ;



async function fetchGatewayV1(request, response) {
    const {user } = request.params;
    let cUser = user.replace(':','') ;
    let jsonGateway = await libGatewayDB.fetchGateway(cUser) ;
    //console.log(JSON.stringify(jsonGateway,null,3)) ;
    response.json(jsonGateway.Gateway) ;
}


async function updateGatewayV1(request, response) {
  let jsonData = request.body ;
  //console.log(`updateGatewayV1:${jsonData}`) ;
  //console.log(JSON.stringify(jsonData,null,3)) ;
  await libGatewayDB.updateGateway(jsonData) ;
  response.send({ retCode: '200' }) ;
}


async function newMustHaveV1(request, response) {
  let jsonBMOperation = request.body ;
  //console.log(`updateGatewayV1:${jsonData}`) ;
  console.log(JSON.stringify(jsonBMOperation,null,3)) ;
  await libGatewayDB.newMustHaveV1(jsonBMOperation) ;
  response.send({ retCode: '200' }) ;
}


async function removeMustHaveV1(request, response) {
  let jsonBMOperation = request.body ;
  //console.log(`updateGatewayV1:${jsonData}`) ;
  //console.log(JSON.stringify(jsonData,null,3)) ;
  await libGatewayDB.removeMustHaveV1(jsonBMOperation) ;
  response.send({ retCode: '200' }) ;
}



async function addBookmarkV1(request, response) {
  let jsonData = request.body ;
  console.log(JSON.stringify(jsonData,null,3)) ;
  await libGatewayDB.addBookmark(jsonData) ;
  response.send({ retCode: '200' }) ;
}


async function removeBookmarkV1(request, response) {
  let jsonBMOperation = request.body ;
  console.log(JSON.stringify(jsonBMOperation,null,3)) ;
  await libGatewayDB.removeBookmarkV1(jsonBMOperation) ;
  response.send({ retCode: '200' }) ;
}

async function fetchUserFoldersV1(request, response) {
  const {user } = request.params;
  let cUser = user.replace(':','') ;
  let jsonUserFolder = await libGatewayDB.fetchUserFoldersV1(cUser) ;
  response.json(jsonUserFolder) ;
}

async function fetchBookmarkV1(request, response) {
  let jsonBMOperation = request.body ;
  let jsonBMs =  await libGatewayDB.fetchBookmarkV1(jsonBMOperation) ;
  response.json(jsonBMs) ;
}



async function updateUserFoldersV1(request, response) {
  let jsonFolders = request.body ;
  //console.log(`updateGatewayV1:${jsonData}`) ;
  //console.log(JSON.stringify(jsonData,null,3)) ;
  await libGatewayDB.newUpdateUserFolderV1(jsonFolders) ;
  response.send({ retCode: '200' }) ;
}