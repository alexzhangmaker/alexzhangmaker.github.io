
function gwRenderCanvas(cssRootElement){
    let tagCanvas = document.querySelector(cssRootElement) ;

    tagCanvas.innerHTML = `
        <style>
            .larkCanvas{
                width:100% ;
                height:100% ;

                display:flex;
                flex-direction:row;
                justify-content: space-between;
                gap:5px ;
            }

            #idWidgetContainer{
                flex-grow:1;
                /*width:65% ;*/
                height:100% ;

                overflow-y: auto; 
                overflow-x: hidden; 

                display: flex ;
                flex-direction: column ;
                gap:10px;
            }

            #idWidgetContainer::-webkit-scrollbar {
                width: 3px;
            }

            #idWidgetContainer::-webkit-scrollbar-track {
                background: #eff5ed;
                border-radius: 3px;
            }

            #idWidgetContainer::-webkit-scrollbar-thumb {
                background: #011b0e;
                border-radius: 3px;
                border: 1px solid #232E33;
            }

            #idToDoContainer{
                width:30% ;
                height:100% ;
            }

            .larkFrameCalendar{
                border-style: none ;
                width: 100%;
                height: 800px;
            }

            .larkFrameToDo{
                border-style: none ;
                width: 100%; 
                height: 100%;
            }

            .idWidgetContainer details{
                width:100% ;
            }

            .widgetDetails {
                /*margin: 1rem auto;*/
                padding: 0 1rem;
                /*width: 35em;*/
                max-width: 100% /*calc(100% - 2rem)*/;
                position: relative;
                border: 1px solid #78909C;
                border-radius: 6px;
                background-color: #ECEFF1;
                color: #263238;
                transition: background-color 0.15s;
            }
            .widgetDetails > :last-child {
                margin-bottom: 1rem;
            }
            .widgetDetails::before {
                width: 100%;
                height: 100%;
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                border-radius: inherit;
                opacity: 0.15;
                box-shadow: 0 0.25em 0.5em #263238;
                pointer-events: none;
                transition: opacity 0.2s;
                z-index: -1;
            }
            .widgetDetails[open] {
                background-color: #FFF;
            }
            .widgetDetails[open]::before {
                opacity: 0.6;
            }
            
            .widgetSummary {
                padding: 1rem 2em 1rem 0;
                display: block;
                position: relative;
                font-size: 1.33em;
                font-weight: bold;
                cursor: pointer;
            }
            .widgetSummary::before, summary::after {
                width: 0.75em;
                height: 2px;
                position: absolute;
                top: 50%;
                right: 0;
                content: "";
                background-color: currentColor;
                text-align: right;
                transform: translateY(-50%);
                transition: transform 0.2s ease-in-out;
            }
            .widgetSummary::after {
                transform: translateY(-50%) rotate(90deg);
            }
            [open] .widgetSummary::after {
                transform: translateY(-50%) rotate(180deg);
            }
            .widgetSummary::-webkit-details-marker {
                display: none;
            }

            .dailyTools{
                width:100% ;
                max-height:180px ;
                column-count: 3;
                font-size:18px ;
            }

            .dailyTools li{
                padding-top:10px ;
            }

            .dailyTools li:hover {
                cursor: pointer;
            }
            .dailyTools a{
                color:black ;
                text-decoration:none ;
            }

            .dailyTools a:hover {
                background-color: yellow;
            }

            .dailyTools #idLogDeal:focus{
                outline: none;
            }
            .dailyTools #idLogDeal{
                width:100% ;
                border:none ;
            }

            input[type="text"] {
                width: 100%; 
                border: none; /* Remove default border */
                outline: none; /* Remove default focus outline */
                border-bottom: 1px solid #ccc; /* Add underline for normal state */

            }
            
            input[type="text"]:focus {
                border-bottom: 1px solid #007bff; /* Change underline color on focus */
            }

            input::placeholder {
                font-family: 'Courier New', Courier, monospace; /* Change font family */
                font-size: 14px; /* Change font size */
                font-weight: bold; /* Make it bold */
                color: #888; /* Change text color */
            }

        </style>
        <div class="larkCanvas">
            <div id="idWidgetContainer">
                <details class="widgetDetails openWidget" open>
                    <summary class="widgetSummary">Daily toolbox</summary>
                    <div style="width:100%;padding-bottom:20px;">
                        <span>log deal as: buy/sell ticker price shares accountID</span>
                        <input type="text" id="idLogDeal" placeholder="log deal as: buy/sell ticker price shares accountID">
                    </div>
                    <div class="dailyTools">
                    </div>
                </details>
               
            </div>
            <div id="idToDoContainer">
                <iframe class="larkFrameToDo" src="http://127.0.0.1:9990/larkToDo.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
            </div>

        </div>
    ` ;

    let jsonDailyTools={
        tools:[]
    } ;
    console.log(globalNavigator.jsonMustHave);

    for(let i=0;i<globalNavigator.jsonMustHave.length;i++){
        let jsonTool={
            title:globalNavigator.jsonMustHave[i].title,
            url:globalNavigator.jsonMustHave[i].data.url
        };
        jsonDailyTools.tools.push(jsonTool) ;
    }
    //jsonGateway.jsonMustHave
    _renderDailyTools(jsonDailyTools) ;
    //_renderMemoAnywhere() ;
    //_renderTyping() ;
    _renderCalendar() ;
    _renderWidget({title:"demo Widget"}) ;

   tagCanvas.querySelector('#idLogDeal').addEventListener('keydown',_logDealFunc) ;
    
}

function _renderDailyTools(jsonDailyTools){

    let tagDailyTools = document.querySelector('.dailyTools');
    if(tagDailyTools==null)return ;
    for(let i=0;i<jsonDailyTools.tools.length;i++){
        let tagTool = document.createElement('li') ;

        tagDailyTools.appendChild(tagTool) ;
        tagTool.innerHTML = `
            <a href="${jsonDailyTools.tools[i].url}" target="_blank">${jsonDailyTools.tools[i].title}</a>
        ` ;
    }
}


function _renderCalendar(){
    let tagCalendar= document.createElement('details') ;
    let tagWidgets = document.querySelector('#idWidgetContainer') ;
    tagWidgets.appendChild(tagCalendar) ;
    tagCalendar.classList.add("widgetDetails") ;
    tagCalendar.innerHTML = `
        <summary class="widgetSummary">Penguin Calendar</summary>
        <iframe  class="larkFrameCalendar" src="http://127.0.0.1:9990/larkCalendar.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
    ` ;
}


function _renderMemoAnywhere(){
    let tagMemoAnywhere= document.createElement('details') ;
    let tagWidgets = document.querySelector('#idWidgetContainer') ;
    tagWidgets.appendChild(tagMemoAnywhere) ;
    tagMemoAnywhere.classList.add("widgetDetails") ;
    tagMemoAnywhere.innerHTML = `
        <summary class="widgetSummary">memo.anywhere</summary>
        <iframe  class="larkFrameCalendar" style="height:300px;" src="http://127.0.0.1:8999/ms_Memoanywhere.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
    ` ;
    //const isOpen = tagMemoAnywhere.hasAttribute('open'); 
    tagMemoAnywhere.open = true; 
    //document.getElementById("myDetails").open = true;

}

function _renderTyping(){
    let tagCalendar= document.createElement('details') ;
    let tagWidgets = document.querySelector('#idWidgetContainer') ;
    tagWidgets.appendChild(tagCalendar) ;
    tagCalendar.classList.add("widgetDetails") ;
    tagCalendar.innerHTML = `
        <summary class="widgetSummary">Typing Practice</summary>
        <iframe  class="larkFrameCalendar" style="height:300px;" src="http://127.0.0.1:8081/ms_Typing.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
    ` ;
}

function _renderWidget(jsonWidget){
    let tagCalendar= document.createElement('details') ;
    let tagWidgets = document.querySelector('#idWidgetContainer') ;
    tagWidgets.appendChild(tagCalendar) ;
    tagCalendar.classList.add("widgetDetails") ;
    tagCalendar.innerHTML = `
        <summary class="widgetSummary">${jsonWidget.title}</summary>
        <div>all set </div>
        ` ;
}

function dlgCheckBMFunc(jsonData){
    let jsonChange = {
        operation:'changeBookmarkMeta',
        itemID:jsonData.bookmarkID,
        title:jsonData.bookmarkTitle,
        url:jsonData.bookmarkURL,
        description:jsonData.bookmarkNote
    } ;
    logChange(jsonChange) ;
    readyToCheckIn() ;
}

function renderBookMark(jsonBookMark,tagBMContainer){
    //console.log(`will render ${JSON.stringify(jsonBookMark,null,3)}`) ;
    let tagBookMark =document.createElement('div') ;
    tagBookMark.classList.add('boxBookmark') ;

    var url = new URL(jsonBookMark.url);

    // Return true if file exists, false otherwise
    function _existsFavICON(hostName) {
        let urlFavIco = `https://${hostName}/favicon.ico`
        console.log(urlFavIco) ;
        var http = new XMLHttpRequest();
        http.open('GET', urlFavIco, true);
        http.withCredentials = "true";

        http.send();
        return http.status!=404;
    }

    function _checkFavicon(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
        
            img.onload = () => resolve(true);  // Favicon exists
            img.onerror = () => resolve(false); // Favicon does not exist
        });
    }


    //console.log(_existsFavICON(url.hostname)) ; 
    //internet-4848.png
    //https://${url.hostname}/favicon.ico
    tagBookMark.innerHTML = `
            <div class="boxBookmarkLogo">
                <img tabindex="-1" class="image-LAVC" data-ar="7:6" width="48" height="48" alt="Web" src="https://${url.hostname}/favicon.ico" draggable="false">                            
            </div>
            <div class="boxBookmarkContent">
                <div class="boxToolbar toolVisibilty">
                    <i class="bi-trash-fill"></i>
                    <i class="bi-pencil-square"></i>
                </div>
                <div class="boxBookmarkMeta">
                    <p id="idBMTitle" class="ellipses">${jsonBookMark.title}</p>
                </div>
            </div> 
    ` ;

    tagBMContainer.appendChild(tagBookMark) ;
    tagBookMark.dataset.larkID = jsonBookMark.id ;
    tagBookMark.dataset.url = jsonBookMark.url ;

    tagBookMark.querySelector('.boxBookmarkMeta').addEventListener('click',(event)=>{
        event.stopPropagation() ;
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.addEventListener('click',(event)=>{
        event.stopPropagation() ;
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.querySelector('.bi-trash-fill').addEventListener('click',(event)=>{
        event.stopPropagation() ;
        let tagBookmark = event.target.closest('.boxBookmark') ;
        tagBookmark.remove() ;
        event.preventDefault() ;
        let jsonChange = {
            operation:'removeBookmark',
            bookmarkID:tagBookmark.dataset.larkID
        } ;
        logChange(jsonChange) ;
        readyToCheckIn() ;
    }) ;


    tagBookMark.querySelector('.bi-pencil-square').addEventListener('click',(event)=>{

        let jsonBMDlg={
            checkFunc:"dlgCheckBMFunc",
            bookmarkID:tagBookMark.dataset.larkID,
            bookmark:tagBookMark,
            bookmarkTitle:tagBookMark.querySelector('#idBMTitle').innerText,
            bookmarkNote:'tbd',
            bookmarkURL:tagBookMark.dataset.url
        } ;
        renderDlg_BMEdit(jsonBMDlg) ;
        event.preventDefault() ;
    }) ;

    
    tagBookMark.addEventListener('dragstart', function(event) {
        globalDraggedItem = event.target;
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 0);
    });

    // When dragging over other items
    tagBookMark.addEventListener('dragover', function(e) {
        e.preventDefault(); // Prevent default to allow drop
    });

    // When the dragging enters a new list item
    tagBookMark.addEventListener('dragenter', function(e) {
        e.preventDefault();
        tagBookMark.style.borderTop = '2px solid #3498db';
    });

    // When dragging leaves a list item
    tagBookMark.addEventListener('dragleave', function() {
        tagBookMark.style.borderTop = '';
    });


    let faviconUrl = `https://${url.hostname}/favicon.ico` ;
    _checkFavicon(faviconUrl).then(exists => {
        if (exists) {
          //console.log("Favicon exists:", faviconUrl);
          // You can display the favicon or add it to your app here
        } else {
          //console.log("Favicon does not exist:", faviconUrl);
          // You can use a fallback icon here if desired
          tagBookMark.querySelector('.image-LAVC').src = 'http://127.0.0.1:9988/images/icons/internet-4848.png' ;
        }
    });

    return tagBookMark ;
}

document.querySelector('#idBTNToggleLeftPannel').addEventListener('click',(event)=>{
    let tagLeftPanel = document.querySelector('.leftPanel') ;
    //tagLeftPanel.classList.toggle('noShow') ;
    if(tagLeftPanel.classList.contains('noShow')){
        tagLeftPanel.classList.remove('noShow') ;
    }else{
        tagLeftPanel.classList.add('noShow') ;
    }
}) ;

document.querySelector('#idBTNPlusApp').addEventListener('click',(event)=>{

    let tagCurSelected = document.querySelector('.larkSelected') ;
    let tagBookmarksUL = null ;
    if(tagCurSelected!=null){
        //tagBookmarksUL = tagCurSelected.querySelector('ul') ;
        //idBookmarks
        tagBookmarksUL = document.querySelector('#idBookmarkBrowser')
    }else{
        tagBookmarksUL = document.querySelector('#idFoldersUL') ;
    }

    let jsonBookmark={
        "id": uuid(),
        "type": "Gateway.Bookmark",
        "title": "new bookmark...",
        "data": {
         "url": "https://www.google.com"
        }
     };

     //gwRenderBookmark(jsonBookmark,tagBookmarksUL) ;
     renderBookMark(jsonBookmark,tagBookmarksUL) ;

    let jsonChange = {
        operation:'plusBookmark',
        parentID:'',                /* '' stand for root section, no parent */
        bookmark:jsonBookmark       /* json of the new plus folder */
    } ;
    if(tagCurSelected!=null){
        jsonChange.parentID = tagCurSelected.dataset.larkID ;
    }
     logChange(jsonChange) ;
     readyToCheckIn() ;
}) ;
