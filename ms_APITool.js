const express = require('express');
const fs = require('fs');
var path = require('path');
var cors = require('cors')
const axios = require('axios');
const fetch = require('node-fetch');

var bodyParser = require('body-parser');


const app = express();
app.use(express.static('./')) ;
app.use(cors()) ;
app.use(express.json({limit: '50mb'}));

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const userID = 'alexszhang@gmail.com' ;
const port = 9991 ;//parseInt(process.env.YouTubePort);

console.log(`port:${port}`) ;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});


app.post('/APIRequest.V1/', APIRequestV1) ;



let jsonRequest={
    url:'http://127.0.0.1:9989/demoAPI',
    action:'post',
    content:{
        say:'hello'
    }
}

async function APIRequestV1(request, response) {
    let jsonRequest = request.body ;
    console.log(jsonRequest) ;

    let todo = {
        userId: 123,
        title: "loren impsum doloris",
        completed: false
    };

    //const json = await fetch(url).then(res => res.json())

    let jsonResult = await fetch(jsonRequest.url, /*'https://jsonplaceholder.typicode.com/todos', */{
            method: 'POST',
            body: JSON.stringify(jsonRequest.content)/*JSON.stringify(todo)*/,
            headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()) ;
    console.log(jsonResult) ;
    let jsonResponse={
        retCode:'200',
        content:jsonResult
    }
    response.send(jsonResponse) ;
    /*.then(res =>{ 
        console.log(res) ;
        res.json() ;
    }).then(json=>{
        console.log(json);
        let jsonResponse={
            retCode:'200',
            content:json
        }
        response.send(jsonResponse) ;
    }).catch(error=>{
        console.log(error) ;
    });
    */
    
}


//https://stackabuse.com/making-http-requests-in-node-js-with-node-fetch/
function requestAPI(jsonRequest){
    let todo = {
        userId: 123,
        title: "loren impsum doloris",
        completed: false
    };
    
    fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify(todo),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json())
      .then(json => console.log(json));
}

/*
app.get('/fetchPendingToDo.V1/', fetchPendingToDoV1) ;                  //http://127.0.0.1:9990/fetchPendingToDo.V1/
app.get('/fetchPendingToDosOf.V1/:project', fetchPendingToDosOfV1) ;    //http://127.0.0.1:9990/fetchPendingToDosOf.V1/:Penguin.V3
app.post('/newToDo.V1/', newToDoV1) ;
app.post('/doneWithToDo.V1/', doneWithToDoV1) ;


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
*/
