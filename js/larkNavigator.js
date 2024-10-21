let globalDraggedItem   =   null;
let globalTargetItem    =   null ;

let globalChanges=[] ;
let _global_OnClickBookmark = 'onClickBookmark' ;

function gwRenderNavigator(cssRootElement){
    _gwRenderNavigator(globalNavigator,cssRootElement) ;
}

function _gwRenderNavigator(jsonGateway,cssRootElement){
    let tagRoot=document.querySelector(cssRootElement) ;
    let tagMustHave = tagRoot.querySelector('.mustHave') ;
    let tagFolders = tagRoot.querySelector('.Folders') ;

    tagMustHave.innerHTML = `
    <style>
        #idMustHaveBar{
            display:flex;
            flex-direction:row ;
            justify-content:space-between ;
            padding-right:10px;
            padding-bottom:5px ;
        }

        #idMustHaveBar span{
            color:grey ;
        }

        #idMustHaveBar #idBTNPlusMustHave{
            color:grey ;
            font-size:14px !important;
        }
    </style>
    <div id="idMustHaveBar">
        <span>Daily Apps</span>
        <i class="bi-plus-lg larkBTN" id="idBTNPlusMustHave"></i>
    </div>
    <ul>
        <style>
            .larkMustHaveBM{
                display:flex;
                flex-direction:row ;
                justify-content:space-between ;

                padding-right:10px;
            }
        </style>
    </ul>
    ` ;

    if(jsonGateway.jsonMustHave.length>0){
        let tagMustHaveUL = tagMustHave.querySelector('ul') ;
        for(let i=0;i<jsonGateway.jsonMustHave.length;i++){
            gwRenderBookmark(jsonGateway.jsonMustHave[i],tagMustHaveUL) ;
        }
    }else{
        tagMustHave.classList.add('noShow') ;
    }
    tagMustHave.querySelector('#idBTNPlusMustHave').addEventListener('click',clickPlusMustHave) ;


    tagFolders.innerHTML = `
        <style>
            #idFoldersBar{
                display:flex;
                flex-direction:row ;
                justify-content:space-between ;
                padding-right:10px;
                padding-bottom:5px ;
            }

            #idFoldersBar span{
                color:grey ;
            }

            #idFoldersBar #idBTNPlusFolder{
                color:grey ;
                font-size:14px !important;
            }

        </style>
        <div id="idFoldersBar">
            <span>Folders</span>
            <i class="bi-plus-lg larkBTN" id="idBTNPlusFolder"></i>
        </div>
        <ul id="idFoldersUL"></ul>
    ` ;
    let tagFoldersUL = tagFolders.querySelector('ul') ;
    for(i=0;i<jsonGateway.jsonFolders.length;i++){
        if(jsonGateway.jsonFolders[i].type == "Gateway.Folder"){
            gwRenderFolder(jsonGateway.jsonFolders[i],tagFoldersUL) ;
        }else{
            gwRenderBookmark(jsonGateway.jsonFolders[i],tagFoldersUL) ;
        }
    }

    tagFolders.querySelector('#idBTNPlusFolder').addEventListener('click',clickPlusFolder) ;
}


function onClickBookmark(jsonBookmark){
    window.open(jsonBookmark.data.url, '_blank').focus();
}


function readyToCheckIn(){
    let tagBTNCheckIn = document.querySelector('#idBTNCheckInChanges') ;
    if(tagBTNCheckIn.classList.contains('noShow')==true){
        tagBTNCheckIn.classList.remove('noShow') ;
    }
}

document.querySelector('#idBTNCheckInChanges').addEventListener('click',(event)=>{
    checkInChanges() ;
    let tagBTNCheckIn = event.target ;
    if(tagBTNCheckIn.classList.contains('noShow')!=true){
        //alert('will check in changes') ;
        tagBTNCheckIn.classList.add('noShow') ;
    }
}) ;



/*
{
    "id": "b93f4a8f-6412-4e60-bc6b-aee013745e00",
    "type": "Gateway.Bookmark",
    "title": "云雀.todos",
    "data": {
        "url": "http://124.156.193.78:8080/app_todo.html"
    }
}
*/
function callback_PlusMustHave(jsonFormData){
    console.log(jsonFormData) ;
    
    let jsonBMOperation={
        operation:'addMustHave',
        userID:'alexszhang',
        folderID:'NO NEED',
        jsonBookmark:{
            "id": "TBD",
            "type": "Gateway.Bookmark",
            "title": jsonFormData.title,
            "data": {
                "url": jsonFormData.url
            }
        }
    } ;

    let urlPlusMustHave = `/newMustHave.V1/` ;

    fetch(urlPlusMustHave, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation)
    }).then(res => res.json())
    .then(res => console.log(res));
}

function clickPlusMustHave(event){
    //alert('clickPlusMustHave TBD') ;
    let jsonDialog={
        cssContainer:'#idDlgContainer',
        theme:{
            backgroundColor:'aqua',
            border:'black'
        },
        layout:{
            width:800,
            height:300
        },
        content:{
            title:'demo Title',
            fields:[
                {
                    label:'url',
                    content:{
                        type:'input.Text',
                        default:'demo input',
                        name:'url'
                    }
                },{
                    label:'title',
                    content:{
                        type:'input.Text',
                        default:'demo input',
                        name:'title'
                    }
                }
            ]
        },
        callback:{
            commitFunc:'callback_PlusMustHave'
        }
    } ;
    
    let tagID = createLarkDialog(jsonDialog) ;
}

function clickPlusFolder(event){
    let tagCurSelected = document.querySelector('.larkSelected') ;
    let jsonFolder = {
        "id": uuid(),
        "type": "Gateway.Folder",
        "title": "...new folder",
        "Contents": []
    } ;
    
    let jsonChange = {
        operation:'plusFolder',
        parentID:'',            /* '' stand for root section, no parent */
        siblingID:'',           /* '' stand for none sibling, thus append to the last */
        folder:jsonFolder       /* json of the new plus folder */
    } ;

    let tagParent = null ;
    if(tagCurSelected == null){
        tagParent = document.querySelector('#idFoldersUL') ;
        gwRenderFolder(jsonFolder,tagParent) ;
    }else{
        tagParent = tagCurSelected.closest('ul') ;
        gwRenderFolder(jsonFolder,tagParent,tagCurSelected) ;

        jsonChange.siblingID = tagCurSelected.dataset.larkID ;
        if(tagParent.id != 'idFoldersUL'){//plus to non-root folder
            jsonChange.parentID = tagParent.closest('.folder').dataset.larkID ;
        }
    }
    logChange(jsonChange) ;
    readyToCheckIn() ;
}


document.querySelector('#idBTNPersonal').addEventListener('click',(event)=>{
    alert('idBTNPersonal TBD') ;
}) ;

document.querySelector('#idBTNSetting').addEventListener('click',(event)=>{
    dlgWorkBench() ;
}) ;


function gwRenderBookmark(jsonBookmark,tagParent){
    let tagBookMark = document.createElement('li') ;
    tagBookMark.classList.add('larkMustHaveBM') ;
    tagBookMark.innerHTML=`
        <style>
            .mustHaveTools .bi-recycle{
                visibility: hidden;
            }

            .mustHaveTools:hover .bi-recycle{
                visibility: visible;
            }
        </style>
        <div>
            <i class="bi-journal-bookmark-fill"></i>
            <span>${jsonBookmark.title}</span>
        </div>
        <div class="mustHaveTools">
            <i class="bi-recycle"></i>
        </div>
    ` ;
    tagParent.appendChild(tagBookMark) ;
    tagBookMark.classList.add('bookmark') ;

    tagBookMark.classList.add('larkDraggable') ;
    tagBookMark.setAttribute('draggable', true);

    //bookmark
    tagBookMark.dataset.url = jsonBookmark.data.url ;
    tagBookMark.dataset.larkID = jsonBookmark.id ;

    tagBookMark.querySelector('.bi-recycle').addEventListener('click',(event)=>{
        event.stopPropagation() ;

        let jsonBMOperation={
            operation:'removeMustHave',
            userID:'alexszhang',
            folderID:'NO NEED',
            jsonBookmark:{
                "id": tagBookMark.dataset.larkID //"TBD"//dataset.larkID
            }
        } ;
    
        let urlPlusMustHave = `/removeMustHave.V1/` ;
    
        fetch(urlPlusMustHave, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonBMOperation)
        }).then(res => res.json())
        .then(res => console.log(res));

        tagBookMark.remove() ;
    }) ;
    tagBookMark.addEventListener('click',(event)=>{
        let tagBookMark = event.target.closest('li') ;
        let url = tagBookMark.dataset.url ;
        let tagCurSelected = document.querySelector('.larkSelected') ;
        if(tagCurSelected!=null){
            if(tagCurSelected!= tagBookMark){
                tagCurSelected.classList.remove('larkSelected') ;
            }
        }
        tagBookMark.classList.add('larkSelected') ;
        if(tagCurSelected!=tagBookMark){
            eval(_global_OnClickBookmark)(jsonBookmark) ;
        }
    }) ;
}

function getParentFolder(tagFolder){
    if(tagFolder==null)return null ;

    let tagParentFolder = tagFolder.parentNode.closest('.folder') ;
    if(tagParentFolder == null){
        tagParentFolder = document.querySelector('.Folders').querySelector('#idFoldersUL') ;
    }
    return tagParentFolder ;
}

function appendChildFolder(tagFolder,tagChildFolder){
    let tagRootFolders = document.querySelector('.Folders').querySelector('#idFoldersUL') ;

    if(tagFolder == tagRootFolders){
        tagRootFolders.appendChild(tagChildFolder) ;
    }else{
        let tagFolderUL = tagFolder.querySelector('.larkDroppable') ;
        tagFolderUL.appendChild(tagChildFolder) ;
    }
}

function insertChildFolderBefore(tagFolder,tagChildFolder, tagChildBefore){
    let tagRootFolders = document.querySelector('.Folders').querySelector('#idFoldersUL') ;

    if(tagFolder == tagRootFolders){
        tagRootFolders.insertBefore(tagChildFolder,tagChildBefore) ;
    }else{
        let tagFolderUL = tagFolder.querySelector('ul') ;
        tagFolderUL.insertBefore(tagChildFolder,tagChildBefore) ;
    }
}


async function renderFolderContents(jsonFolder){

    let jsonBMOperation={
        operation:'fetchBookmarks',
        userID:'alexszhang',
        folderID:jsonFolder.id
    } ;
    let urlFetchBMs = `/fetchBookmarkV1.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation,null,3)
    } ;
    let response = await fetch(urlFetchBMs, jsonRequest);
    let jsonBookmarks = await response.json() ;


    let tagBMContainer = document.querySelector('#idBookmarks') ;
    tagBMContainer.innerHTML = `` ;
    for(let i=0 ;i<jsonBookmarks.length;i++){
        renderBookMark(jsonBookmarks[i],tagBMContainer) ;
    }
}

function dlgCheckFunc(jsonData){
    let jsonChange = {
        operation:'changeTitle',
        itemID:jsonData.itemID,
        title:jsonData.title
    } ;
    logChange(jsonChange) ;
    readyToCheckIn() ;
}


function gwRenderFolder(jsonFolder,tagParent,tagSibling=null){
    let tagBookFolder = document.createElement('details') ;
    tagBookFolder.innerHTML=`
            <summary class="folderSummary">
                <div>
                    <i class="bi-folder2-open"></i>
                    <span>
                        ${jsonFolder.title}
                    </span>
                </div>
                <div  class="boxToolbar toolVisibilty">
                    <i class="bi-trash-fill" id="idBTNDelete"></i>
                    <i class="bi-pencil-square" id="idBTNEdit"></i>
                    <i class="bi-node-plus" id="idBTNMore"></i>   

                </div>
            </summary>
            <ul></ul>
    ` ;

    if(tagSibling != null){
        tagParent.insertBefore(tagBookFolder,tagSibling) ;
    }else{
        tagParent.appendChild(tagBookFolder) ;
    }
    tagBookFolder.classList.add('folder') ;
    tagBookFolder.classList.add('larkDroppable');
    tagBookFolder.classList.add('larkDraggable') ;
    tagBookFolder.setAttribute('draggable', true);
    tagBookFolder.dataset.larkID = jsonFolder.id ;

    tagBookFolder.addEventListener('click',async (event)=>{
        let tagBookFolder = event.target.closest('details') ;
        let tagCurSelected = document.querySelector('.larkSelected') ;
        if(tagCurSelected!=null){
            if(tagCurSelected!= tagBookFolder){
                tagCurSelected.classList.remove('larkSelected') ;
            }
        }
        tagBookFolder.classList.add('larkSelected') ;
        let tagDetails = null ;
        if(event.target.tagName == 'DETAILS'){
            tagDetails = event.target ;
        }else{
            tagDetails = event.target.closest('details') ;
        }

        let tagUL = tagDetails.querySelector('ul') ;
        if(tagUL.querySelectorAll('details').length==0){
            event.preventDefault() ;
        }

        let jsonItem = findJSONUsingID(tagBookFolder.dataset.larkID) ;
        console.log(jsonItem) ;
        await renderFolderContents(jsonItem) ;
    }) ;

    tagBookFolder.querySelector('#idBTNEdit').addEventListener('click',(event)=>{
        //alert('idBTNEdit TBD') ;
        let jsonDlg={
            checkFunc:"dlgCheckFunc",
            folderID:tagBookFolder.dataset.larkID,
            folder:tagBookFolder,
            folderName:tagBookFolder.querySelector('.folderSummary').querySelector('span').innerText
        } ;
        renderDlg_FolderEdit(jsonDlg) ;
    }) ;

    tagBookFolder.querySelector('#idBTNMore').addEventListener('click',(event)=>{
        event.preventDefault() ;
        event.stopPropagation() ;

        let jsonFolder = {
            "id": uuid(),
            "type": "Gateway.Folder",
            "title": "...new folder",
            "Contents": []
        } ;

        let jsonChange = {
            operation:'plusFolder',
            parentID:tagBookFolder.dataset.larkID,
            siblingID:'',
            folder:jsonFolder       /* json of the new plus folder */
        } ;

        gwRenderFolder(jsonFolder,tagBookFolder.querySelector('ul')) ;

        logChange(jsonChange) ;
        readyToCheckIn() ;

    }) ;

    
    tagBookFolder.querySelector('#idBTNDelete').addEventListener('click',(event)=>{
        event.preventDefault() ;
        let tagBookFolder = null ;
        if(event.target.tagName == 'DETAILS'){
            tagBookFolder = event.target ;
        }else{
            tagBookFolder = event.target.closest('details') ;
        }

        tagBookFolder.remove() ;
        
        let jsonChange = {
            operation:'removeFolder',
            folderID:tagBookFolder.dataset.larkID
        } ;
        logChange(jsonChange) ;
        readyToCheckIn() ;
    }) ;

    tagBookFolder.addEventListener('dragstart', function(event) {
        globalDraggedItem = event.target;
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 0);
    });

    // When dragging over other items
    tagBookFolder.addEventListener('dragover', function(e) {
        e.preventDefault(); // Prevent default to allow drop
    });

    // When the dragging enters a new list item
    tagBookFolder.addEventListener('dragenter', function(event) {
        event.preventDefault();
        event.stopPropagation() ;
        tagBookFolder.style.borderTop = '2px solid #3498db';
    });

    // When dragging leaves a list item
    tagBookFolder.addEventListener('dragleave', function(event) {
        event.stopPropagation() ;
        tagBookFolder.style.borderTop = '';
    });

    // When the item is dropped
    tagBookFolder.addEventListener('drop', function(event) {
        console.log(event) ;
        tagBookFolder/*event.target*/.style.borderTop = '';
        //event.preventDefault() ;
        event.stopPropagation() ;
        if(globalDraggedItem == null){
            console.log('null globalDraggedItem');
            return ;
        }
        
        let targetFolder = null ;
        if(event.target.classList.contains('folder')){
            targetFolder = event.target ;
        }else{
            targetFolder = event.target.closest('.folder') ;
        }

        console.log(targetFolder.querySelector('.folderSummary').innerText) ;

        if(targetFolder!=null){
            if(globalDraggedItem.classList.contains('folder')){
                let parentFolder = getParentFolder(targetFolder) ;
                insertChildFolderBefore(parentFolder,globalDraggedItem,targetFolder) ;

                let jsonChange = {
                    operation:'insertFolderBefore',
                    siblingID:targetFolder.dataset.larkID,
                    folderID:globalDraggedItem.dataset.larkID
                } ;
                logChange(jsonChange) ;
                readyToCheckIn() ;
                console.log(globalDraggedItem) ;
            }else{
                let bookmarkID = globalDraggedItem.dataset.larkID ;
                let folderID = targetFolder.dataset.larkID ;
                console.log(`will move ${bookmarkID} in JSON array to ${folderID}`) ;

                let jsonChange={
                    operation:'moveBookmark',
                    folderID:folderID,
                    bookmarkID:bookmarkID
                } ;
                //_moveBookmark(bookmarkID,folderID) ;
                logChange(jsonChange) ;
                readyToCheckIn() ;
                globalDraggedItem.remove() ;
                console.log(globalDraggedItem) ;
            }
        }
    });

    // When the drag ends
    tagBookFolder.addEventListener('dragend', function(event) {
        event.stopPropagation() ;

        setTimeout(() => {
            globalDraggedItem.style.display = 'block';
            globalDraggedItem = null;
        }, 0);
    });


    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == 'Gateway.Folder'){
            gwRenderFolder(jsonFolder.Contents[i],tagBookFolder.querySelector('ul')) ;
        }else{
            //gwRenderBookmark(jsonFolder.Contents[i],tagBookFolder.querySelector('ul'))
        }
    }
}


let globalLogID = 0 ;
function logChange(jsonChange){
    jsonChange.logID = globalLogID ;
    globalLogID = globalLogID + 1 ;
    globalChanges.push(jsonChange) ;
}

function _plusFolder(jsonRootFolder,parentID,siblingID,jsonFolder){
    if(jsonRootFolder.id == parentID){
        if(siblingID == ''){
            jsonRootFolder.Contents.push(jsonFolder) ;
            return true ;
        }

        for(let i=0;i<jsonRootFolder.Contents.length;i++){
            if(jsonRootFolder.Contents[i].id == siblingID){
                jsonRootFolder.Contents.splice(i,0,jsonFolder) ;
                return true ;
            }
        }
        jsonRootFolder.Contents.push(jsonFolder) ;
        return true ;
    }

    //"type": "Gateway.Folder",
    for( let i=0;i<jsonRootFolder.Contents.length;i++){
        if(jsonRootFolder.Contents[i].type == "Gateway.Folder"){
            let bResult = _plusFolder(jsonRootFolder.Contents[i],parentID,siblingID,jsonFolder) ;
            if(bResult == true) return true ;
        }
    }
    return false ;
}

function checkPlusFolder(jsonChange){
    if(jsonChange.parentID==''){
        if(jsonChange.siblingID == ''){
            globalNavigator.jsonFolders.push(jsonChange.folder) ;
            return ;
        }
        
        for(let i=0;i<globalNavigator.jsonFolders.length;i++){
            if(globalNavigator.jsonFolders[i].id == jsonChange.siblingID){
                globalNavigator.jsonFolders.splice(i,0,jsonChange.folder) ;
                return ;
            }
        }

        //not found sibling using sibling ID, still append to the end
        globalNavigator.jsonFolders.push(jsonChange.folder) ;
        return ;
    }

    for(let i=0;i<globalNavigator.jsonFolders.length;i++){
        if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
            let bResult = _plusFolder(globalNavigator.jsonFolders[i],
                jsonChange.parentID,
                jsonChange.siblingID,
                jsonChange.folder) ;
            if(bResult == true) return ;
        }
    }

    //failed all other options, append to the last of []
    globalNavigator.jsonFolders.push(jsonChange.folder) ;    
}


function _removeFolder(jsonRootFolder,folderID){
    for(let i=0;i<jsonRootFolder.Contents.length;i++){
        if(jsonRootFolder.Contents[i].id == folderID){
            jsonRootFolder.Contents.splice(i,1) ;
            return true ;
        }
        if(jsonRootFolder.Contents[i].type == "Gateway.Folder"){
            let bResult = _removeFolder(jsonRootFolder.Contents[i],folderID) ;
            if(bResult == true) return true ;
        }
    }
    return false ;
}

function checkRemoveFolder(jsonChange){
    for(let i=0;i<globalNavigator.jsonFolders.length;i++){
        if(globalNavigator.jsonFolders[i].id == jsonChange.folderID){
            globalNavigator.jsonFolders.splice(i,1) ;
            return ;
        }

        if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
            let bResult = _removeFolder(globalNavigator.jsonFolders[i],jsonChange.folderID) ;
            if(bResult == true) return ;
        }
    }
    alert('can not find folder to remove') ;
}

function _grabFolderIn(jsonRoot,folderID){
    let jsonFolder = null ;
    for(let i=0;i<jsonRoot.Contents.length;i++){
        if(jsonRoot.Contents[i].id == folderID){
            jsonFolder = jsonRoot.Contents.splice(i,1) ;
            return jsonFolder[0] ;
        }

        if(jsonRoot.Contents[i].type == "Gateway.Folder"){
            jsonFolder = _grabFolderIn(jsonRoot.Contents[i],folderID) ;
            if(jsonFolder != null) return jsonFolder ;
        }
    }
    return null ;
}

function _grabFolderForMoving(folderID){
    let jsonFolder = null ;
    for(let i=0;i<globalNavigator.jsonFolders.length;i++){
        if(globalNavigator.jsonFolders[i].id == folderID){
            jsonFolder = globalNavigator.jsonFolders.splice(i,1) ;
            return jsonFolder[0] ;
        }

        if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
            jsonFolder = _grabFolderIn(globalNavigator.jsonFolders[i],folderID) ;
            if(jsonFolder!= null)return jsonFolder ;
        }
    }

    return null ;
}

function _insertFolderIn(jsonRoot,siblingID,jsonFolder){
    let bResult = false ;
    for(let i=0;i<jsonRoot.Contents.length;i++){
        if(jsonRoot.Contents[i].id == siblingID ){
            jsonRoot.Contents.splice(i,0,jsonFolder) ;
            bResult = true ;
            return bResult ;
        }

        if(jsonRoot.Contents[i].type == 'Gateway.Folder'){
            bResult = _insertFolderIn(jsonRoot.Contents[i],siblingID,jsonFolder) ;
            if(bResult == true) return true ;
        }
    }

    return false ;
}


function checkInsertFolder(jsonChange){

    let jsonFolder = _grabFolderForMoving(jsonChange.folderID) ;
    if(jsonFolder == null){
        alert('folder not found, sth wrong') ;
        return ;
    }
    console.log(jsonFolder) ;

    for(let i=0;i<globalNavigator.jsonFolders.length;i++){
        if(globalNavigator.jsonFolders[i].id == jsonChange.siblingID){
            globalNavigator.jsonFolders.splice(i,0,jsonFolder) ;
            return ;
        }

        if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
            let bResult = false ;
            bResult = _insertFolderIn(globalNavigator.jsonFolders[i],jsonChange.siblingID,jsonFolder) ;
            if(bResult == true)return ;
        }
    }

    globalNavigator.jsonFolders.push(jsonFolder) ;
    return ;
}


function checkMoveBookmark(jsonChange){
    _moveBookmark(jsonChange.bookmarkID,jsonChange.folderID) ;
}


async function checkRemoveBookmark(jsonChange){

    let jsonBMOperation={
        operation:'removeBM',
        userID:'alexszhang',
        folderID:'not NEED',
        jsonBookmark:{
            "id": jsonChange.bookmarkID
        }
    } ;

    let urlRemoveBM = `http://127.0.0.1:9988/removeBookmark.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(urlRemoveBM, jsonRequest);
    await response.json() ;

    console.log(globalNavigator);
    /*
    for(let i=0;i<globalNavigator.data.Folders.length;i++){
        if(globalNavigator.jsonFolders[i].id == jsonChange.bookmarkID){
            globalNavigator.jsonFolders.splice(i,1) ;
            return ;
        }

        if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
            let removeBM = _removeBookmark(globalNavigator.jsonFolders[i],jsonChange.bookmarkID) ;
            if(removeBM != null) return ;
        }
    }
    */

    //alert('not found Bookmark to remove') ;
}


function checkPlusBookmark(jsonChange){
    let jsonFolder = findJSONUsingID(jsonChange.parentID) ;
    if(jsonFolder!=null){
        jsonFolder.Contents.push(jsonChange.bookmark) ;
    }else{
        globalNavigator.data.Folders.push(jsonChange.bookmark) ;
    }
}


function checkChangeTitle(jsonChange){
    let jsonNode = findJSONUsingID(jsonChange.itemID) ;
    if(jsonNode == null){
        alert('not found,sth wrong') ;
        return ;
    }

    jsonNode.title = jsonChange.title ;
}


function checkChangeBMMeta(jsonChange){
    let jsonNode = findJSONUsingID(jsonChange.itemID) ;
    if(jsonNode == null){
        alert('not found,sth wrong') ;
        return ;
    }

    jsonNode.title = jsonChange.title ;
    jsonNode.data.url = jsonChange.url ;
    jsonNode.data.extendData = jsonChange.description ;
}


async function checkInChanges(){
    for(let i=0;i<globalChanges.length;i++){
        switch(globalChanges[i].operation){
            case "plusFolder":
                checkPlusFolder(globalChanges[i]) ;
                break ;
            case "removeFolder":
                checkRemoveFolder(globalChanges[i]) ;
                break ;
            case "insertFolderBefore":
                checkInsertFolder(globalChanges[i]) ;
                break ;

            /*
            case "plusBookmark":
                checkPlusBookmark(globalChanges[i]) ;
                break ;
            case "moveBookmark":
                checkMoveBookmark(globalChanges[i]) ;
                break ;
            */
            case "removeBookmark":
                await checkRemoveBookmark(globalChanges[i]) ;
                break ;
            
            case "changeTitle":
                checkChangeTitle(globalChanges[i]) ;
                break ;
            case "changeBookmarkMeta":
                checkChangeBMMeta(globalChanges[i]) ;
                break ;
            default:
                break ;
        }
    }

    globalChanges=[];
    console.log(globalNavigator) ;

    let tagBTNCheckIn = document.querySelector('#idBTNCheckInChanges') ;
    if(tagBTNCheckIn.classList.contains('noShow')!=true){
        tagBTNCheckIn.classList.add('noShow') ;
    }

    //globalNavigator
    /*
    let jsonGatewayDB={
        user:await readUserValue(),
        Gateway:globalNavigator
    };
    */
    //let urlGatewayJSON = `http://127.0.0.1:9988/updateGateway.V1/` ;
    let urlUpdateFolders = `http://127.0.0.1:9988/updateUserFolders.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(globalNavigator,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(urlUpdateFolders, jsonRequest);
    await response.json() ;
}

function _removeBookmark(jsonFolder,bookmarkID){
    let jsonBookmark = null ;
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].id==bookmarkID && jsonFolder.Contents[i].type == "Gateway.Bookmark"){
            jsonBookmark = jsonFolder.Contents[i] ;
            jsonFolder.Contents.splice(i,1) ;
            return jsonBookmark ;
        }else if(jsonFolder.Contents[i].type != "Gateway.Bookmark"){
            jsonBookmark = _removeBookmark(jsonFolder.Contents[i],bookmarkID) ;
            if(jsonBookmark !=null) return jsonBookmark ;
        }
    }
    return null ;
}

function _addBookmark(jsonFolder,folderID,jsonBookmark){
    let opJSONFolder = null ;
    if(jsonFolder.id == folderID){
        jsonFolder.Contents.push(jsonBookmark) ;
        opJSONFolder = jsonFolder ;
        return opJSONFolder;
    }

    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == "Gateway.Folder"){
            opJSONFolder = _addBookmark(jsonFolder.Contents[i],folderID,jsonBookmark) ;
            if(opJSONFolder != null)return opJSONFolder ;
        }
    }

    return null ;
}

function _moveBookmark(bookmarkID,folderID){
    let jsonBookmark = null ;
    for(let i=0;i<globalNavigator.data.Folders.length;i++){
        jsonBookmark = _removeBookmark(globalNavigator.data.Folders[i],bookmarkID) ;
        if(jsonBookmark!=null)break ;
    }

    if(jsonBookmark == null){
        alert('something wrong') ;
        return ;
    }

    let jsonFolderOp = null ;
    for(i=0;i<globalNavigator.data.Folders.length;i++){
        jsonFolderOp = _addBookmark(globalNavigator.data.Folders[i],folderID,jsonBookmark) ;
        if(jsonFolderOp!=null)return ;
    }

    alert('something wrong 2') ;
    
}

function findJSONUsingID(id){
    for(let i=0;i<globalNavigator.jsonMustHave.length;i++){
        if(globalNavigator.jsonMustHave[i].id == id){
            return globalNavigator.jsonMustHave[i] ;
        }else{
            if(globalNavigator.jsonMustHave[i].type == "Gateway.Folder"){
                let jsonItem = _findJSONUsingIDIn(globalNavigator.jsonMustHave[i],id) ;
                if(jsonItem!=null) return jsonItem ;
            }
        }
    }

    for(i=0;i<globalNavigator.jsonFolders.length;i++){
        if(globalNavigator.jsonFolders[i].id == id){
            return globalNavigator.jsonFolders[i] ;
        }else{
            if(globalNavigator.jsonFolders[i].type == "Gateway.Folder"){
                let jsonItem = _findJSONUsingIDIn(globalNavigator.jsonFolders[i],id) ;
                if(jsonItem!=null) return jsonItem ;
            }
        }
    }
    return null ;
}


function _findJSONUsingIDIn(jsonFolder,id){
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].id == id){
            return jsonFolder.Contents[i] ;
        }else{
            if(jsonFolder.Contents[i].type == "Gateway.Folder"){
                let jsonItem =  _findJSONUsingIDIn(jsonFolder.Contents[i],id) ;
                if(jsonItem !=null) return jsonItem ;
            }
        }
    }
    return null ;
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function loadJSONNavigator(jsonData){
    //jsonGateway
    globalNavigator = jsonData ;
}