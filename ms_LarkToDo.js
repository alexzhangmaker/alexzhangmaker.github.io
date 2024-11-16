const express = require('express');
const fs = require('fs');
var path = require('path');
var cors = require('cors')

var bodyParser = require('body-parser');
const libToDos = require('./ms_LibToDo.js') ;
const libCalendar=require('./ms_LibCalendar.js') ;



const app = express();
app.use(express.static('./')) ;
app.use(cors()) ;
app.use(express.json({limit: '50mb'}));

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const userID = 'alexszhang@gmail.com' ;
const port = 9990 ;//parseInt(process.env.YouTubePort);

console.log(`port:${port}`) ;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});


//app.get('/publish.V1', fetchAccountHoldings) ;                        // http://127.0.0.1:9990/fetchProjects.V2
app.get('/fetchPendingToDo.V1/', fetchPendingToDoV1) ;                  //http://127.0.0.1:9990/fetchPendingToDo.V1/
app.get('/fetchPendingToDosOf.V1/:project', fetchPendingToDosOfV1) ;    //http://127.0.0.1:9990/fetchPendingToDosOf.V1/:Penguin.V3
app.post('/newToDo.V1/', newToDoV1) ;                                   //http://127.0.0.1:9990/newToDo.V1/
app.post('/doneWithToDo.V1/', doneWithToDoV1) ;


app.get('/fetchAllPendingEvents.V1/', fetchAllPendingEventsV1) ;       //http://127.0.0.1:9990/fetchAllPendingEvents.V1/
app.get('/fetchEvent.V1/:id', fetchEventV1) ;       //http://127.0.0.1:9990/fetchAllPendingEvents.V1/
app.post('/newCalendarEvent.V1/', newCalendarEventV1) ;
app.post('/doneWithEvent.V1/', doneWithEventV1) ;
/*
app.post('/fetchBookmarkV1.V1/', fetchBookmarkV1) ;
app.post('/addBookmark.V1/', addBookmarkV1) ;
app.post('/removeBookmark.V1/', removeBookmarkV1) ;


//fetchUserFoldersV1
app.get('/fetchUserFolders.V1/:user', fetchUserFoldersV1) ;    //http://127.0.0.1:9988/fetchUserFolders.V1/:alexszhang
app.post('/updateUserFolders.V1/', updateUserFoldersV1) ;


app.post('/newMustHave.V1/', newMustHaveV1) ;
app.post('/removeMustHave.V1/', removeMustHaveV1) ;

*/

async function fetchPendingToDoV1(request, response) {
    let jsonToDos = await libToDos.fetchAllPendingToDos() ;
    response.json(jsonToDos) ;
}


async function fetchPendingToDosOfV1(request, response) {
    const {project } = request.params;
    let cProject = project.replace(':','') ;
    let jsonToDos = await libToDos.fetchPendingToDosOf(cProject) ;
    response.json(jsonToDos) ;
}

async function newToDoV1(request, response) {
  let jsonToDo = request.body ;
  //console.log(`updateGatewayV1:${jsonData}`) ;
  console.log(JSON.stringify(jsonToDo,null,3)) ;
  await libToDos.newToDo(jsonToDo) ;
  response.json({ retCode: '200' }) ;
}


async function doneWithToDoV1(request, response) {
    let jsonToDo = request.body ;
    //console.log(`updateGatewayV1:${jsonData}`) ;
    //console.log(JSON.stringify(jsonData,null,3)) ;
    await libToDos.doneWithToDo(jsonToDo) ;
    response.send({ retCode: '200' }) ;
}




async function fetchAllPendingEventsV1(request, response) {
    let jsonEvents = await libCalendar.fetchAllPendingEvents() ;
    console.log(jsonEvents) ;
    response.json(jsonEvents) ;
}

async function fetchEventV1(request, response) {
  const {id } = request.params;
  let cID = id.replace(':','') ;
  console.log(`fetchEventV1 for ${cID}`) ;
  let jsonEvent = await libCalendar.fetchEvent(parseInt(cID)) ;
  console.log(jsonEvent) ;
  response.json(jsonEvent) ;
}


async function newCalendarEventV1(request, response) {
    let jsonEvent = request.body ;
    //console.log(`updateGatewayV1:${jsonData}`) ;
    //console.log(JSON.stringify(jsonData,null,3)) ;
    await libCalendar.newCalendarEvent(jsonEvent) ;
    response.send({ retCode: '200' }) ;
  }
  
  
  async function doneWithEventV1(request, response) {
      let jsonEvent = request.body ;
      //console.log(`updateGatewayV1:${jsonData}`) ;
      //console.log(JSON.stringify(jsonData,null,3)) ;
      await libCalendar.doneWithEvent(jsonEvent) ;
      response.send({ retCode: '200' }) ;
  }
  
/*
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
*/