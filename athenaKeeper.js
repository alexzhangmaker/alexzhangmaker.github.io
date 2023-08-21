console.log('entering athenaKeeper.js') ;



let gloablAthena= {
    "meta":{
        "application":"athena",
        "version":"1.0.01",
        "author":"alexszhang@gmail.com"
    },
    "data":{
        "mustHave":[
            {
                "appName":"Googe Search",
                "url":"https://www.google.com"
            },{
                "appName":"Googe Transalte",
                "url":"https://www.google.com"
            },{
                "appName":"Googe Classroom",
                "url":"https://classroom.google.com"
            }
        ],
        "channels":[
            
            {
               "channelID":"Channel_2",
               "channelTitle":"技术与开发",
               "tags":[
                   {
                       "tagID":"Channel_2__tag001",
                       "tagTitle":"node.js",
                       "Bookmarks":[]
                    },{
                        "tagID":"Channel_2__tag002",
                        "tagTitle":"flutter",
                        "Bookmarks":[]
                    },{
                        "tagID":"Channel_2__tag003",
                        "tagTitle":"CSS/Bootstrap",
                        "Bookmarks":[]
                    },{
                        "tagID":"Channel_2__tag004",
                        "tagTitle":"python",
                        "Bookmarks":[]
                    },{
                        "tagID":"Channel_2__tag005",
                        "tagTitle":"APIs",
                        "Bookmarks":[]
                    },{
                        "tagID":"Channel_2__tag006",
                        "tagTitle":"Dev.Source",
                        "Bookmarks":[]
                    }
                ]
            },
            {
                "channelID":"Channel_3",
                "channelTitle":"财经与投资",
                "tags":[
                    {
                        "tagID":"Channel_3__tag001",
                        "tagTitle":"交易所",
                        "Bookmarks":[]
                     },{
                         "tagID":"Channel_3__tag002",
                         "tagTitle":"非银金融",
                         "Bookmarks":[
                            {
                                "bookmarkID":"bookmark001",
                                "title":"Quizizzz",
                                "url":"https://www.quizlet.com",
                                "description":"the best quiz web app for life long learning",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark002",
                                "title":"Brookfield",
                                "url":"https://bn.brookfield.com/",
                                "description":"Brookfield公司投资者关系网站",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark003",
                                "title":"Quizizzz",
                                "url":"https://www.quizlet.com",
                                "description":"the best quiz web app for life long learning",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark004",
                                "title":"Brookfield",
                                "url":"https://bn.brookfield.com/",
                                "description":"Brookfield公司投资者关系网站",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark005",
                                "title":"Quizizzz",
                                "url":"https://www.quizlet.com",
                                "description":"the best quiz web app for life long learning",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark006",
                                "title":"Brookfield",
                                "url":"https://bn.brookfield.com/",
                                "description":"Brookfield公司投资者关系网站",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark007",
                                "title":"Quizizzz",
                                "url":"https://www.quizlet.com",
                                "description":"the best quiz web app for life long learning",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark008",
                                "title":"Brookfield",
                                "url":"https://bn.brookfield.com/",
                                "description":"Brookfield公司投资者关系网站",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark009",
                                "title":"Quizizzz",
                                "url":"https://www.quizlet.com",
                                "description":"the best quiz web app for life long learning",
                                "date":"20230819"
                            },{
                                "bookmarkID":"bookmark0010",
                                "title":"Brookfield",
                                "url":"https://bn.brookfield.com/",
                                "description":"Brookfield公司投资者关系网站",
                                "date":"20230819"
                            }
                        ]
                     },{
                        "tagID":"Channel_3__tag003",
                        "tagTitle":"另类投资",
                        "Bookmarks":[]
                    }
                ]
             }
        ]
        
        
    }
};




function buildRelation(jsonMeta,jsonBookmarks){

    //return gloablAthena.relations ;
}


//idPanel: idAthenaPanel
function renderPanel(jsonAthena,idPanel){
    //let tagPanel = document.getElementById(idPanel) ;
    console.log(JSON.stringify(jsonAthena,null,3));
    renderMustHave(jsonAthena.data.mustHave,'idAthenaPanelMust') ;

    for(let i=0;i<jsonAthena.data.channels.length;i++){
        renderChannel(jsonAthena.data.channels[i],'idAthenaPanelChannels') ;
    }
}

function renderMustHave(jsonMustHaves,idPanelMust){
    let tagMushHave = document.getElementById(idPanelMust) ;
    for(let i=0;i<jsonMustHaves.length;i++){
        let tagListItem = document.createElement('li') ;
        tagMushHave.appendChild(tagListItem) ;
        tagListItem.classList.add("list-group-item") ;
        tagListItem.innerHTML = `<a href="${jsonMustHaves[i].url}" target="_blank">${jsonMustHaves[i].appName}</a>` ;
    }
}


let gFuncModalSave = null ;
//idPannel = idAthenaPanelChannels
function renderChannel(jsonChannel,idPannel){
    console.log(JSON.stringify(jsonChannel,null,3));

    let tagChannelsDIV = document.getElementById(idPannel) ;

    let tagChannel = document.createElement('div') ;
    tagChannelsDIV.appendChild(tagChannel) ;
    tagChannel.classList.add("accordion-item") ;
    tagChannel.id = jsonChannel.channelID;
    //data-TagID=""
    tagChannel.dataset.ChannelID = tagChannel.id ;
    console.log(tagChannel.dataset.ChannelID) ;



    let cHeadID = `head_${jsonChannel.channelID}` ;
    let cChannelBodyID = `collapse_${jsonChannel.channelID}` ;
    //let cChannelBodyDIVID = `cardBody_${jsonChannel.channelID}` ;
    

    let tagHead = document.createElement('h2');
    tagHead.classList.add('accordion-header') ;
    tagHead.id = cHeadID ;
    tagChannel.appendChild(tagHead) ;
    tagHead.innerHTML=`<button type="button" class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#${cChannelBodyID}">${jsonChannel.channelTitle}</button>` ;
    
    let tagAccordionBodyDIV = document.createElement('div') ;
    tagAccordionBodyDIV.id = cChannelBodyID ;
    tagAccordionBodyDIV.classList.add(['accordion-collapse','collapse']) ;
    tagAccordionBodyDIV.setAttribute('data-bs-parent',`#${idPannel}`) ;
    tagChannel.appendChild(tagAccordionBodyDIV) ;

    let tagCardBodyDIV = document.createElement('div') ;
    tagCardBodyDIV.classList.add('card-body') ;
    tagAccordionBodyDIV.appendChild(tagCardBodyDIV) ;

    let tagUL = document.createElement('ul') ;
    tagUL.classList.add(["list-group", "list-group-flush"]) ;
    tagCardBodyDIV.appendChild(tagUL) ;

    for(let i=0;i<jsonChannel.tags.length;i++){
        let tagLI = document.createElement('li') ;
        tagUL.appendChild(tagLI) ;
        
        tagLI.classList.add("list-group-item") ;
        tagLI.classList.add("d-flex") ;//                                       "d-flex", 
        tagLI.classList.add("justify-content-between") ;//                      "justify-content-between", 
        tagLI.classList.add("align-items-center") ;//                           "align-items-center", 
        tagLI.classList.add("athena-Panel-li") ;//                              "athena-Panel-li"]);

        tagLI.id = jsonChannel.tags[i].tagID ;
        tagLI.innerHTML=`${jsonChannel.tags[i].tagTitle}
                        <i class="bi-plus-square athena-ICON"></i>
                        ` ;
        
        let tagPlusICON = tagLI.querySelector('.bi-plus-square') ;
        tagPlusICON.addEventListener('click',(event)=>{
            event.stopPropagation() ;

            console.log('.bi-plus-square clicked') ;

            var thisPlusICON = event.target ;
            //let tagRowClicked = thisAddICON.parent.parent ;
            let tagLiClicked = thisPlusICON.closest('li') ;
            console.log(`${tagLiClicked.dataset.tagID}`) ;
            let tagChannel = thisPlusICON.closest('.accordion-item');//accordion-item
            console.log(`${tagChannel.dataset.ChannelID}`) ;

            //event.preventDefault() ;
            let gBookmark= {
                "bookmarkID":genBookmarkID(),
                "title":"BlackStone",
                "url":"https://ir.blackstone.com/overview/default.aspx",
                "description":"Blackstone Second Quarter 2023 Earnings",
                "date":new Date().toLocaleDateString() 
            } ;

            var tagModalBookmark = new bootstrap.Modal(document.getElementById("idModalAddBookmark"));
            let tagModalTitle = document.getElementById('idModalInputTitle') ;
            tagModalTitle.value = gBookmark.title ;
            let tagModalURL = document.getElementById('idModalInputURL') ;
            tagModalURL.value = gBookmark.url ;
            let tagModalDes = document.getElementById('idModalDescription') ;
            tagModalDes.value = gBookmark.description ;
            let tagModalConsole = document.getElementById('idConsole') ;
            tagModalConsole.innerText =  `id=${gBookmark.bookmarkID}, data:${gBookmark.date}`;


            gFuncModalSave = function funcModalSave(event){
                console.log('modal save clicked') ;

                let tagModalSaveBtn = event.target ;
                tagModalSaveBtn.removeEventListener('click',funcModalSave) ;
                event.preventDefault() ;
                tagModalBookmark.hide();

                gBookmark.title = document.getElementById('idModalInputTitle').value ;
                gBookmark.url = document.getElementById('idModalInputURL').value ;
                gBookmark.description = document.getElementById('idModalDescription').value ;
                addBookmark(gBookmark,tagChannel.dataset.ChannelID,tagLiClicked.dataset.tagID) ;
            } ;

            document.getElementById('idModalSave').addEventListener('click',gFuncModalSave) ;
            /*
            document.getElementById('idModalSave').addEventListener('click',function funcModalSave(event){
                console.log('modal save clicked') ;

                let tagModalSaveBtn = event.target ;
                tagModalSaveBtn.removeEventListener('click',funcModalSave) ;
                event.preventDefault() ;
                tagModalBookmark.hide();
                addBookmark(gBookmark,tagChannel.dataset.ChannelID,tagLiClicked.dataset.tagID) ;
            }) ;
            gFuncModalSave = funcModalSave ;
            */

            //idModalCancel
            document.getElementById('idModalCancel').addEventListener('click',(event)=>{
                console.log('modal cancel clicked') ;

                //let tagModalCancelBtn = event.target ;
                if(gFuncModalSave!=null){
                    document.getElementById('idModalSave').removeEventListener('click',gFuncModalSave)
                    console.log('idModalSave.removeEventListener(gFuncModalSave) ') ;
                }
                //event.preventDefault() ;
                //tagModalBookmark.hide();
            }) ;

            /*
            tagModalBookmark.addEventListener("shown.bs.modal", function() {
                alert("Modal window has been completely shown.");
            });
            */

            tagModalBookmark.show();
        }) ;

        tagLI.dataset.tagID = jsonChannel.tags[i].tagID ;
        console.log(tagLI.dataset.tagID) ;
        console.log('about to addListener to tagLI') ;

        tagLI.addEventListener('click',(event)=>{
    
            let thisListItem = event.target ;
            let tagChannel = thisListItem.closest('.accordion-item') ;
            console.log(`clicked on ${tagChannel.dataset.ChannelID}, ${thisListItem.dataset.tagID}`) ;
            renderBookmarks(gloablAthena,tagChannel.dataset.ChannelID,thisListItem.dataset.tagID,'idAthenaBookmarks') ;


        }) ;
    }
}


function renderBookmarks(jesonAthena,idChannel,idTag,idBookmarksUL){
    console.log(`renderBookmarks: ${idChannel},${idChannel},${idBookmarksUL}`) ;

    let tagUL = document.getElementById(idBookmarksUL);
    tagUL.innerHTML = "" ;
    for(let i=0;i<jesonAthena.data.channels.length;i++){
        if(jesonAthena.data.channels[i].channelID == idChannel){

            for(let j=0;j<jesonAthena.data.channels[i].tags.length;j++){
                if(jesonAthena.data.channels[i].tags[j].tagID == idTag){
                    //jesonAthena.data.channels[i].tags[j].Bookmarks
                    for(let k=0;k<jesonAthena.data.channels[i].tags[j].Bookmarks.length;k++){

                        renderABookmark(jesonAthena.data.channels[i].tags[j].Bookmarks[k],
                            jesonAthena.data.channels[i].channelID,
                            jesonAthena.data.channels[i].tags[j].tagID) ;
                        /*
                        let tagLI = document.createElement('li') ;
                        tagUL.appendChild(tagLI) ;
                        tagLI.classList.add("list-group-item") ;
                        tagLI.classList.add("d-flex") ;
                        tagLI.classList.add("justify-content-between") ;
                        tagLI.classList.add("align-items-center") ;
                        tagLI.classList.add("athena-Bookmark-li") ;
                        tagLI.innerHTML = `
                                <div>
                                    <a href="${jesonAthena.data.channels[i].tags[j].Bookmarks[k].url}" target="_blank"><h6>${jesonAthena.data.channels[i].tags[j].Bookmarks[k].title}</h4></a>
                                    <p>${jesonAthena.data.channels[i].tags[j].Bookmarks[k].description}
                                        <i class="bi-pencil-square athena-ICON"></i>
                                    </p>
                                </div>
                                <i class="bi-x-square-fill athena-ICON" style="font-size: 16px;"></i>
                        ` ;
                        let tagDeleteICON = tagLI.querySelector('.bi-x-square-fill') ;
                        tagDeleteICON.addEventListener('click',async (event)=>{
                            console.log('.bi-x-square-fill clicked') ;
                        }) ;

                        let tagEditICON = tagLI.querySelector('.bi-pencil-square') ;
                        tagEditICON.addEventListener('click',async (event)=>{
                            console.log('.bi-pencil-square clicked') ;
                        }) ;
                        */
                    }
                }
            }
            return ;
        }
    }
}


function hashCode(str, seed = 0){
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function genBookmarkID(){
    let objMoment = new Date() ;
    //let cBookmarkID = `${objMoment.toLocaleTimeString()}` ;
    let cBookmarkID = hashCode(objMoment.toLocaleTimeString()) + Math.round(Math.random()*100);
    
    console.log(cBookmarkID) ;
    return cBookmarkID.toString() ;
}


function renderABookmark(jsonBookmark,cChannelID,cTagID){
    let tagUL = document.getElementById('idAthenaBookmarks');

    let tagLI = document.createElement('li') ;
    tagUL.appendChild(tagLI) ;
    tagLI.classList.add("list-group-item") ;
    tagLI.classList.add("d-flex") ;
    tagLI.classList.add("justify-content-between") ;
    tagLI.classList.add("align-items-center") ;
    tagLI.classList.add("athena-Bookmark-li") ;
    tagLI.dataset.ChannelID = cChannelID ;
    tagLI.dataset.TagID = cTagID ;
    tagLI.dataset.BookmarkID = jsonBookmark.bookmarkID ;
    tagLI.innerHTML = `
            <div>
                <a href="${jsonBookmark.url}" target="_blank"><h6>${jsonBookmark.title}</h4></a>
                <p>${jsonBookmark.description}
                    <i class="bi-pencil-square athena-ICON"></i>
                </p>
            </div>
            <i class="bi-x-square-fill athena-ICON" style="font-size: 16px;"></i>
    ` ;
    let tagDeleteICON = tagLI.querySelector('.bi-x-square-fill') ;
    tagDeleteICON.addEventListener('click',async (event)=>{
        console.log('.bi-x-square-fill clicked, will remove this bookmark') ;
        let tagDeleteICON = event.target ;
        let tagBookmark = tagDeleteICON.closest('li') ;

        removeBookmark( tagBookmark.dataset.ChannelID,
                        tagBookmark.dataset.TagID,
                        tagBookmark.dataset.BookmarkID) ;
        
        tagBookmark.remove() ;
    }) ;

    let tagEditICON = tagLI.querySelector('.bi-pencil-square') ;
    tagEditICON.addEventListener('click',async (event)=>{
        console.log('.bi-pencil-square clicked') ;
    }) ;
}

function addBookmark(jsonBookmark,cChannelID,cTagID){
    console.log(`${JSON.stringify(jsonBookmark,null,3)}`) ; 
    console.log(`to add to: ${cChannelID},${cTagID}`) ;

    //gloablAthena
    AthenaAddBookmark(jsonBookmark,cChannelID,cTagID) ;

    //logOperation
    AthenaLogOperation(1,jsonBookmark,cChannelID,cTagID)

    //apend a li to ui
    renderABookmark(jsonBookmark,cChannelID,cTagID) ;

}

function removeBookmark(cChannelID,cTagID,cBookmarkID){

    //gloablAthena
    AthenaRemoveBookmark(cChannelID,cTagID,cBookmarkID) ;

    //logOperation
    let jsonBookmark = {
        "bookmarkID":cBookmarkID,
        "title":"whatever",
        "url":"whatever",
        "description":"whatever",
        "date":"whatever"
    } ;

    AthenaLogOperation(-1,jsonBookmark,cChannelID,cTagID) ;
}

function AthenaRemoveBookmark(cChannelID,cTagID,cBookmarkID){
    console.log(`Athena to remove: ${cChannelID},${cTagID},${cBookmarkID}`) ;

    for(let i=0;i<gloablAthena.data.channels.length;i++){
        if(gloablAthena.data.channels[i].channelID == cChannelID){
            for(let j=0;j<gloablAthena.data.channels[i].tags.length;j++){
                if(gloablAthena.data.channels[i].tags[j].tagID == cTagID){
                    for(let k=0;k<gloablAthena.data.channels[i].tags[j].Bookmarks.length;k++){
                        if(gloablAthena.data.channels[i].tags[j].Bookmarks[k].bookmarkID == cBookmarkID){

                            gloablAthena.data.channels[i].tags[j].Bookmarks.splice(k,1) ;
                            return ;
                        }
                    }
                    
                }
            }
        }
    }
    console.log('something wrong here in AthenaRemoveBookmark') ;
}

function AthenaAddBookmark(jsonBookmark,cChannelID,cTagID){
    for(let i=0;i<gloablAthena.data.channels.length;i++){
        if(gloablAthena.data.channels[i].channelID == cChannelID){
            for(let j=0;j<gloablAthena.data.channels[i].tags.length;j++){
                if(gloablAthena.data.channels[i].tags[j].tagID == cTagID){
                    gloablAthena.data.channels[i].tags[j].Bookmarks.push(jsonBookmark) ;
                    return ;
                }
            }
        }
    }
    console.log('something wrong here in AthenaAddBookmark') ;

}

async function AthenaLogOperation(nOpCode,jsonBookmark,cChannelID,cTagID){
     console.log('about to log Operation so that backend server can rebuild data') ;

     //
     logLocalStorage(nOpCode,jsonBookmark,cChannelID,cTagID) ;
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("document.addEventListener DOMContentLoaded");

    gloablAthena = await loadAthenaJSON('https://alexzhangmaker.github.io/json/athenaBookmarks.json') ;
    let localAthena = loadAthenaFromLocal() ;
    if(localAthena == null){
        syncAthenaToLocalStorage();
    }else{
        let localTime = new Date(localAthena.meta.timestamp) ;
        let serverTime = new Date(localAthena.meta.timestamp) ;
        if(localTime>serverTime){
            gloablAthena = localAthena ;
        }
    }
    

    renderPanel(gloablAthena,'idAthenaPanel') ;

    var tagModal = document.getElementById("idModalAddBookmark");

    tagModal.addEventListener("show.bs.modal", function(event){        
        // Get the button that triggered the modal
        //var button = event.relatedTarget;
        
        // Extract value from the custom data-* attribute
        //var titleData = button.getAttribute("data-title");

        // Change modal title
        tagModal.querySelector(".modal-title").innerText = 'Athena Bookmark Editor';
    });

    //tbLocalStorage() ;
    
});

//https://alexzhangmaker.github.io/json/athenaBookmarks.json
async function loadAthenaJSON(url){
    const response = await fetch(url);
    const jsonAthena = await response.json();
    console.log(JSON.stringify(jsonAthena,null,3));
    return jsonAthena ;
}


let jsonLogs=[] ;
const logKey = "AthenaLogs" ;
const athenaKey = "AthenaData"

function logLocalStorage(nOpCode,jsonBookmark,cChannelID,cTagID){
    console.log(`logLocalStorage: ${nOpCode},${JSON.stringify(jsonBookmark,null,3)},${cChannelID},${cTagID}`) ;
    //let cLog = `log: ${nOpCode},${JSON.stringify(jsonBookmark,null,3)},${cChannelID},${cTagID}` ;
    let jsonLog = {
        "code":nOpCode,
        "bookmark":JSON.stringify(jsonBookmark,null,3),
        "ChannelID":cChannelID,
        "tagID":cTagID
    } ;

    let cLogs = localStorage.getItem(logKey);
    if(cLogs != null){
        jsonLogs = JSON.parse(cLogs) ;
    }
    jsonLogs.push(jsonLog) ;

    localStorage.setItem(logKey, JSON.stringify(jsonLogs));

}

function syncAthenaToLocalStorage(){
    //gloablAthena
    let objMoment = new Date() ;

    if(gloablAthena.meta.timestamp ==""){
        gloablAthena.meta.timestamp = objMoment.toLocaleTimeString() ;
    }else{
        let objAthenaTime = new Date(gloablAthena.meta.timestamp) ;
        if(objMoment>objAthenaTime) gloablAthena.meta.timestamp = objMoment.toLocaleTimeString() ;
    }
    localStorage.setItem(athenaKey, JSON.stringify(gloablAthena));
}

function loadAthenaFromLocal(){
    let cAthena = localStorage.getItem(athenaKey);
    if(cAthena!=null){
        let jsonAthena = JSON.parse(cAthena) ;
        console.log(jsonAthena.meta) ;
        console.log(jsonAthena.data.mustHave) ;
        console.log(jsonAthena.data.channels) ;
        //let localAthenaTime = new Date(jsonAthena.meta.timestamp) ;
        //if(jsonAthena.meta.timestamp)
        return jsonAthena ;
    }
    return null ;
}

function tbLocalStorage(){

    let jsonBookmark = {
        "bookmarkID":"bookmark001",
        "title":"Quizizzz",
        "url":"https://www.google.com",
        "description":"the best search web app for life long learning",
        "date":"20230819"
    } ;
    let cChannelID = 'testChannel001';
    let cTagID = 'testTag001' ;
    logLocalStorage(1,jsonBookmark,cChannelID,cTagID) ;

    syncAthenaToLocalStorage() ;

}



//https://stackoverflow.com/questions/27730224/how-to-upload-json-file-to-google-drive-using-google-javascript-librarygapi
//https://github.com/RickMohr/jsGoogleDriveDemo
async function uploadAthenaJSON(jsonAthena,url){
    const APIKey = "AIzaSyCkX2knhdqaJpvIVLx2MQ9i_tGpVhbyc-A" ;

}