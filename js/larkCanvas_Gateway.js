
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
            .larkFrameCalendar{
                border-style: none ;
                /*width: 65%; */
                flex-grow:1;
                height: 100%;
            }

            .larkFrameToDo{
                border-style: none ;
                width: 30%; 
                height: 100%;
            }
        </style>
        <div class="larkCanvas">
            <iframe class="larkFrameCalendar" src="http://127.0.0.1:9990/larkCalendar.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
            <iframe class="larkFrameToDo" src="http://127.0.0.1:9990/larkToDo.html" title="calendar" frameborder="0" border="0" cellspacing="0"></iframe>
        </div>
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
    console.log(`will render ${JSON.stringify(jsonBookMark,null,3)}`) ;
    let tagBookMark =document.createElement('div') ;
    tagBookMark.classList.add('boxBookmark') ;

    var url = new URL(jsonBookMark.url);
    /*
    url.protocol;  // "http:"
    url.hostname;  // "aaa.bbb.ccc.com"
    url.pathname;  // "/asdf/asdf/sadf.aspx"
    url.search;    // "?blah"
    */

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
    //tagBookMark.classList.add('larkDraggable') ;
    //tagBookMark.setAttribute('draggable', true);

    tagBookMark.dataset.larkID = jsonBookMark.id ;
    tagBookMark.dataset.url = jsonBookMark.url ;

    tagBookMark.querySelector('.boxBookmarkMeta').addEventListener('click',(event)=>{
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.addEventListener('click',(event)=>{
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
          console.log("Favicon exists:", faviconUrl);
          // You can display the favicon or add it to your app here
        } else {
          console.log("Favicon does not exist:", faviconUrl);
          // You can use a fallback icon here if desired
          tagBookMark.querySelector('.image-LAVC').src = '/images/icons/internet-4848.png' ;
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
