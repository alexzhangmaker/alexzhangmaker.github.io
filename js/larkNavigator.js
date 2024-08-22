let globalDraggedItem = null;


document.querySelector('#idBTNToggleLeftPannel').addEventListener('click',(event)=>{
    let tagLeftPanel = document.querySelector('.leftPanel') ;
    //tagLeftPanel.classList.toggle('noShow') ;
    if(tagLeftPanel.classList.contains('noShow')){
        tagLeftPanel.classList.remove('noShow') ;
    }else{
        tagLeftPanel.classList.add('noShow') ;
    }
}) ;

document.querySelector('#idBTNPlusFolder').addEventListener('click',(event)=>{
    alert('idBTNPlusFolder TBD') ;
}) ;

document.querySelector('#idBTNPersonal').addEventListener('click',(event)=>{
    alert('idBTNPersonal TBD') ;
}) ;

document.querySelector('#idBTNSetting').addEventListener('click',(event)=>{
    alert('idBTNSetting TBD') ;
}) ;



function gwRenderBookmark(jsonBookmark,tagParent){
    let tagBookMark = document.createElement('li') ;
    tagBookMark.innerHTML=`
        <i class="bi-journal-bookmark-fill"></i>
        ${jsonBookmark.title}
    ` ;
    tagParent.appendChild(tagBookMark) ;
    tagBookMark.classList.add('bookmark') ;

    tagBookMark.classList.add('larkDraggable') ;
    tagBookMark.setAttribute('draggable', true);

    //bookmark
    tagBookMark.dataset.url = jsonBookmark.url ;
    tagBookMark.dataset.larkID = jsonBookmark.id ;

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
            window.open(url, '_blank').focus();
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
        //let tagFolderUL = tagFolder.querySelector('.larkDroppable') ;
        let tagFolderUL = tagFolder.querySelector('ul') ;
        tagFolderUL.insertBefore(tagChildFolder,tagChildBefore) ;
    }
}




/*
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
*/
function renderBookMark(jsonBookMark){
    let tagBookMark =document.createElement('li') ;
    tagBookMark.innerHTML = `
        <div class="boxBookmark">
            <div>
                <img tabindex="-1" class="image-LAVC" data-ar="7:6" width="56" height="48" alt=" " src="https://rdl.ink/render/https%3A%2F%2Fwww.w3schools.com%2Fimages%2Fw3schools_logo_436_2.png?mode=crop&amp;fill=solid&amp;width=56&amp;ar=7:6&amp;dpr=1.7999999523162842" draggable="false">                            
            </div>

            <div class="boxBookmarkMeta">
                <span>${jsonBookMark.title}</span>
                <div>Brookfield homepage ....</div>
                <div>${jsonBookMark.url}</div>
            </div>
            <div class="boxToolbar toolVisibilty">
                <i class="bi-google"></i>
                <i class="bi-trash-fill"></i>
                <i class="bi-pencil-square"></i>
            </div>
        </div>
        
    ` ;

    tagBookMark.classList.add('larkDraggable') ;
    tagBookMark.setAttribute('draggable', true);

    tagBookMark.dataset.larkID = jsonBookMark.id ;
    tagBookMark.dataset.url = jsonBookMark.url ;

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
    }) ;
    tagBookMark.querySelector('.bi-pencil-square').addEventListener('click',(event)=>{
        alert('bi-pencil-square')
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

function renderFolderContents(jsonFolder){
    let tagBMContainer = document.querySelector('#idBookmarks') ;

    tagBMContainer.innerHTML = `` ;
    for(let i=0 ;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == "Gateway.Bookmark"){
            let tagBookmark = renderBookMark(jsonFolder.Contents[i]) ;
            tagBMContainer.appendChild(tagBookmark) ;
        }
    }
}

function gwRenderFolder(jsonFolder,tagParent){
    let tagBookFolder = document.createElement('details') ;
    tagBookFolder.innerHTML=`
            <summary class="folderSummary">
                <span>
                    <i class="bi-folder2-open"></i>
                    ${jsonFolder.title}
                </span>
                <div>
                    <span id="idFolderCounter">32</span>
                    <i class="bi-three-dots" id="idBTNMore"></i>   
                </div>
            </summary>
            <ul></ul>
    ` ;

    tagParent.appendChild(tagBookFolder) ;
    tagBookFolder.classList.add('folder') ;
    tagBookFolder./*querySelector('ul').*/classList.add('larkDroppable');

    tagBookFolder.classList.add('larkDraggable') ;
    tagBookFolder.setAttribute('draggable', true);
    tagBookFolder.dataset.larkID = jsonFolder.id ;

    tagBookFolder.addEventListener('click',(event)=>{
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
            //alert('dsfsf') ;
        }

        let jsonItem = findJSONUsingID(jsonGateway,tagBookFolder.dataset.larkID) ;
        console.log(jsonItem) ;
        renderFolderContents(jsonItem) ;
    }) ;

    tagBookFolder.querySelector('#idBTNMore').addEventListener('click',(event)=>{
        event.preventDefault() ;
        alert('TBD') ;
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
    tagBookFolder.addEventListener('dragenter', function(e) {
        e.preventDefault();
        tagBookFolder.style.borderTop = '2px solid #3498db';
    });

    // When dragging leaves a list item
    tagBookFolder.addEventListener('dragleave', function() {
        tagBookFolder.style.borderTop = '';
    });

    // When the item is dropped
    tagBookFolder.addEventListener('drop', function(event) {
        event.target.style.borderTop = '';
        if(globalDraggedItem==null){
            console.log('null globalDraggedItem');
            return ;
        }

        /*
        if(globalDraggedItem.classList.contains('folder')!=true){
            alert('sth wrong') ;
            return ;
        }
        */
        
        let targetFolder = null ;
        if(event.target.classList.contains('folder')){
            targetFolder = event.target ;
            //let parentFolder = getParentFolder(event.target) ;
            //insertChildFolderBefore(parentFolder,globalDraggedItem,event.target) ;
            //event.target.insertBefore(globalDraggedItem, this);
        }else{
            targetFolder = event.target.closest('.folder') ;
        }

        if(targetFolder!=null){
            if(globalDraggedItem.classList.contains('folder')){
                let parentFolder = getParentFolder(targetFolder) ;
                insertChildFolderBefore(parentFolder,globalDraggedItem,targetFolder) ;
            }else{
                let bookmarkID = globalDraggedItem.dataset.larkID ;
                let folderID = targetFolder.dataset.larkID ;
                console.log(`will move ${bookmarkID} in JSON array to ${folderID}`) ;
                moveBookmark(jsonGateway,bookmarkID,folderID) ;
                globalDraggedItem.remove() ;
            }
            
        }
        /*
        if(event.target.classList.contains('larkDroppable')){
            event.target.insertBefore(globalDraggedItem, this);
        }else{
            let tagParentFolder = getParentFolder(tagBookFolder) ;
            //tagBookFolder.parentNode.insertBefore(globalDraggedItem, this);
            appendChildFolder(tagParentFolder,globalDraggedItem) ;
        }
        */
    });

    // When the drag ends
    tagBookFolder.addEventListener('dragend', function() {
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

function gwRenderDesktop(jsonGateway,cssRootElement){
    let tagRoot=document.querySelector(cssRootElement) ;
    let tagMustHave = tagRoot.querySelector('.mustHave') ;
    let tagFolders = tagRoot.querySelector('.Folders') ;

    tagMustHave.innerHTML = `<ul></ul>` ;

    let tagMustHaveUL = tagMustHave.querySelector('ul') ;
    for(let i=0;i<jsonGateway.data.mustHave.length;i++){
        gwRenderBookmark(jsonGateway.data.mustHave[i],tagMustHaveUL) ;
    }

    tagFolders.innerHTML = `<ul id="idFoldersUL"></ul>` ;
    let tagFoldersUL = tagFolders.querySelector('ul') ;
    for(i=0;i<jsonGateway.data.Folders.length;i++){
        if(jsonGateway.data.Folders[i].type == "Gateway.Folder"){
            gwRenderFolder(jsonGateway.data.Folders[i],tagFoldersUL) ;
        }else{
            gwRenderBookmark(jsonGateway.data.Folders[i],tagFoldersUL) ;
        }
    }
}


function findJSONUsingIDIn(jsonFolder,id){
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].id == id){
            return jsonFolder.Contents[i] ;
        }else{
            if(jsonFolder.Contents[i].type == "Gateway.Folder"){
                let jsonItem =  findJSONUsingIDIn(jsonFolder.Contents[i],id) ;
                if(jsonItem !=null) return jsonItem ;
            }
        }
    }

    return null ;
}

function findJSONUsingID(jsonGateway,id){
    for(let i=0;i<jsonGateway.data.mustHave.length;i++){
        if(jsonGateway.data.mustHave[i].id == id){
            return jsonGateway.data.mustHave[i] ;
        }else{
            if(jsonGateway.data.mustHave[i].type == "Gateway.Folder"){
                let jsonItem = findJSONUsingIDIn(jsonGateway.data.mustHave[i],id) ;
                if(jsonItem!=null) return jsonItem ;
            }
        }
    }

    for(i=0;i<jsonGateway.data.Folders.length;i++){
        if(jsonGateway.data.Folders[i].id == id){
            return jsonGateway.data.Folders[i] ;
        }else{
            if(jsonGateway.data.Folders[i].type == "Gateway.Folder"){
                let jsonItem = findJSONUsingIDIn(jsonGateway.data.Folders[i],id) ;
                if(jsonItem!=null) return jsonItem ;
            }
        }
    }
    return null ;
}

function removeBookmark(jsonFolder,bookmarkID){
    let jsonBookmark = null ;//removeBookmark()
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].id==bookmarkID && jsonFolder.Contents[i].type == "Gateway.Bookmark"){
            jsonBookmark = jsonFolder.Contents[i] ;
            jsonFolder.Contents.splice(i,1) ;
            return jsonBookmark ;
        }else if(jsonFolder.Contents[i].type != "Gateway.Bookmark"){
            jsonBookmark = removeBookmark(jsonFolder.Contents[i],bookmarkID) ;
            if(jsonBookmark !=null) return jsonBookmark ;
        }
    }
    return null ;
}

function addBookmark(jsonFolder,folderID,jsonBookmark){
    let opJSONFolder = null ;
    if(jsonFolder.id == folderID){
        jsonFolder.Contents.push(jsonBookmark) ;
        opJSONFolder = jsonFolder ;
        return opJSONFolder;
    }

    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == "Gateway.Folder"){
            opJSONFolder = addBookmark(jsonFolder.Contents[i],folderID,jsonBookmark) ;
            if(opJSONFolder != null)return opJSONFolder ;
        }
    }

    return null ;
}

function moveBookmark(jsonGateway,bookmarkID,folderID){
    let jsonBookmark = null ;
    for(let i=0;i<jsonGateway.data.Folders.length;i++){
        jsonBookmark = removeBookmark(jsonGateway.data.Folders[i],bookmarkID) ;
        if(jsonBookmark!=null)break ;
    }

    if(jsonBookmark == null){
        alert('something wrong') ;
        return ;
    }

    //addBookmark
    let jsonFolderOp = null ;
    for(i=0;i<jsonGateway.data.Folders.length;i++){
        jsonFolderOp = addBookmark(jsonGateway.data.Folders[i],folderID,jsonBookmark) ;
        if(jsonFolderOp!=null)return ;
    }

    alert('something wrong 2') ;
    
}