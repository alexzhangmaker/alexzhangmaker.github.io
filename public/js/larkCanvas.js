
function gwRenderCanvas(cssRootElement){
    let tagCanvas = document.querySelector(cssRootElement) ;

    tagCanvas.innerHTML = `
        <div id="idBookmarkBrowser">
            <div><span>folderName</span></div>
            <ul id="idBookmarks">
                <li>
                    <!------
                    <div class="boxBookmark">
                        <div>
                            <img tabindex="-1" class="image-LAVC" data-ar="7:6" width="56" height="48" alt=" " src="https://rdl.ink/render/https%3A%2F%2Fwww.w3schools.com%2Fimages%2Fw3schools_logo_436_2.png?mode=crop&amp;fill=solid&amp;width=56&amp;ar=7:6&amp;dpr=1.7999999523162842" draggable="false">                            
                        </div>

                        <div class="boxBookmarkMeta">
                            <span>Brookfield</span>
                            <div>Brookfield homepage ....</div>
                            <div>https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors</div>
                        </div>
                        <div class="boxToolbar toolVisibilty">
                            <i class="bi-google"></i>
                            <i class="bi-trash-fill"></i>
                            <i class="bi-pencil-square"></i>
                        </div>
                    </div>
                    ---->
                    
                </li>
            </ul>
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
    let tagBookMark =document.createElement('li') ;
    tagBookMark.innerHTML = `
        <div class="boxBookmark">
            <div>
                <img tabindex="-1" class="image-LAVC" data-ar="7:6" width="56" height="48" alt=" " src="https://rdl.ink/render/https%3A%2F%2Fwww.w3schools.com%2Fimages%2Fw3schools_logo_436_2.png?mode=crop&amp;fill=solid&amp;width=56&amp;ar=7:6&amp;dpr=1.7999999523162842" draggable="false">                            
            </div>

            <div class="boxBookmarkMeta">
                <span id="idBMTitle">${jsonBookMark.title}</span>
                <div id="idBMURL">${jsonBookMark.data.url}</div>
            </div>
            <div class="boxToolbar toolVisibilty">
                <i class="bi-google"></i>
                <i class="bi-trash-fill"></i>
                <i class="bi-pencil-square"></i>
            </div>
        </div>
        
    ` ;

    tagBMContainer.appendChild(tagBookMark) ;
    tagBookMark.classList.add('larkDraggable') ;
    tagBookMark.setAttribute('draggable', true);

    tagBookMark.dataset.larkID = jsonBookMark.id ;
    tagBookMark.dataset.url = jsonBookMark.data.url ;

    tagBookMark.querySelector('.boxBookmarkMeta').addEventListener('click',(event)=>{
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.querySelector('.bi-google').addEventListener('click',(event)=>{
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.querySelector('.bi-trash-fill').addEventListener('click',(event)=>{
        let tagBookmark = event.target.closest('li') ;
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
            bookmarkURL:tagBookMark.querySelector('#idBMURL').innerText
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
        tagBookmarksUL = document.querySelector('#idBookmarks')
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
