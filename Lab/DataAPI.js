// 模拟从Firebase获取的数据
let gFolderTree = [];
let gDialyTools=[] ;
let gBookmarks=[] ;
let flagFolderChanged = false ;
let flagBookmarksChanged = false ;
let flagDailyToolChanged = false ;

// Firebase配置 - 需要替换为实际配置
const firebaseConfig = {
    apiKey: "AIzaSyA6MZ_p5lVuy8TMAqiuV6IRx9fggV44lQs",
    authDomain: "outpost-8d74e.firebaseapp.com",
    databaseURL: "https://outpost-8d74e.asia-southeast1.firebasedatabase.app/",
    projectId: "outpost-8d74e",
    storageBucket: "outpost-8d74e.firebasestorage.app",
    messagingSenderId: "724993324937",
    appId: "1:724993324937:web:ce6c7e6b06489331c79358",
    measurementId: "G-QPHWRTH6BH"
};

const gPortalPath = "Portal" ;


// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 从Firebase获取课件列表
function _transformPortal(portalEntries){
    for(let i=0;i<portalEntries.length;i++){
        let jsonNode = portalEntries[i] ;
        if(jsonNode.type == "Gateway.Folder"){
            if(jsonNode.hasOwnProperty("Contents")){
                _transformPortal(jsonNode.Contents) ;
                jsonNode.children = jsonNode.Contents ;
                delete jsonNode.Contents ;
                
            }
            jsonNode.type = "folder" ;
            jsonNode.name = jsonNode.title ;
            delete jsonNode.title ;
        }
    }
    return portalEntries ;
}

async function asyncLoadAppData(){
    const snapshot = await database.ref('Portal').once('value');
    const jsonPortal = snapshot.val();
    console.log(jsonPortal) ;
    
    //_transformPortal(jsonPortal.jsonFolders) ;
    console.log(jsonPortal.jsonFolders) ;
    gFolderTree = jsonPortal.jsonFolders ;
    gDialyTools = jsonPortal.jsonMustHave ;
    gBookmarks = jsonPortal.Bookmarks ;
    flagFolderChanged = false ;
    flagBookmarksChanged = false ;
    flagDailyToolChanged = false ;
}

async function asyncSaveAppData(){
    if(flagBookmarksChanged){
        await database.ref(`Portal/Bookmarks`).set(gBookmarks);
        flagBookmarksChanged = false ;
    }
    if(flagDailyToolChanged){
        await database.ref(`Portal/jsonMustHave`).set(gDialyTools);
        flagDailyToolChanged = false ;
    }
    if(flagFolderChanged){
        await database.ref(`Portal/jsonFolders`).set(gFolderTree);
        flagFolderChanged = false ;
    }

    document.querySelector("#idBTNSaveChange").style.color="white" ;

}

function loadAppData() {
    const PortalRef = database.ref(gPortalPath);
    
    PortalRef.on('value', (snapshot) => {
        const jsonPortal = snapshot.val();
        console.log(jsonPortal) ;
        
        //let dataEntries = 
        _transformPortal(jsonPortal.jsonFolders) ;
        console.log(jsonPortal.jsonFolders) ;
        gFolderTree = jsonPortal.jsonFolders ;

    }, (error) => {
        console.error('加载Portal数据失败:', error);
    });
}

//loadAppData() ;
function fetchFolderBookmarks(folder){
    const bookmarks = [] ;
    gBookmarks.forEach(jsonBookmark => {
        if(jsonBookmark.folderID == folder.id )bookmarks.push(jsonBookmark) ;
    });
    return bookmarks ;
}


function findObjectsWithSameValue(array, attribute) {
    // Create a Map to group objects by attribute value
    const groupedByValue = new Map();
    
    // Iterate through the array and group objects
    array.forEach(obj => {
        const value = obj[attribute];
        if (value !== undefined) {
            if (!groupedByValue.has(value)) {
                groupedByValue.set(value, []);
            }
            groupedByValue.get(value).push(obj);
        }
    });
    
    // Convert Map to array of groups, filtering out groups with single objects
    const result = Array.from(groupedByValue.entries())
        .filter(([_, group]) => group.length > 1)
        .map(([value, objects]) => ({
            attributeValue: value,
            objects: objects
        }));
    
    return result;
}

async function removeBookmark(bookmarkID){
    console.log(`will removeBookmark:${bookmarkID}`) ;
    //gBookmarks
    for(let i=0;i<gBookmarks.length;i++){
        if(gBookmarks[i].id == bookmarkID){
            gBookmarks.splice(i,1) ;
            if(flagBookmarksChanged==false){
                flagBookmarksChanged = true ;
                document.querySelector("#idBTNSaveChange").style.color="red" ;
            }
            return ;
        }
    }

    return ;
}

function plusDailyTool(jsonTool){
    gDialyTools.push(jsonTool) ;
    flagDailyToolChanged = true ;
    document.querySelector("#idBTNSaveChange").style.color="red" ;
}

function plusFolderatRoot(jsonFolder){
    gFolderTree.push(jsonFolder) ;
    flagFolderChanged = true ;
    document.querySelector("#idBTNSaveChange").style.color="red" ;

}

function plusFolder2Folder(jsonFolder,selectedNode){
    // 确保selectedNode有children数组
    if (!selectedNode.children) {
        selectedNode.children = [];
    }
    // 添加新节点（作为文件夹）
    selectedNode.children.push(jsonFolder);
    flagFolderChanged = true ;
    document.querySelector("#idBTNSaveChange").style.color="red" ;
}

// 从数据中删除节点
function removeFolderFromForest(folderID) {

    function _callRemoved(){
        flagFolderChanged = true ;
        document.querySelector("#idBTNSaveChange").style.color="red" ;    
    }
    
    function _removeFolder(jsonRoot,folderID){
        console.log(jsonRoot) ;

        if(!jsonRoot.children)return false ;
        if(jsonRoot.children.length==0)return false ;
        for(let i=0;i<jsonRoot.children.length;i++){
            //console.log(jsonRoot.children[i]) ;
            if(jsonRoot.children[i].id == folderID){
                jsonRoot.children.splice(i,1) ;
                return true ;
            }
            let bRemoved =_removeFolder(jsonRoot.children[i],folderID) ;
            if(bRemoved)return true ;
        }
        return false ;
    }

    for (let i = 0; i < gFolderTree.length; i++) {
        if(gFolderTree[i].id == folderID){
            if(!gFolderTree[i].children){
                gFolderTree.splice(i,1) ;
                _callRemoved() ;
                return true ;
            }

            if(gFolderTree[i].children.length==0){
                gFolderTree.splice(i,1) ;
                _callRemoved() ;
                return true ;
            }
            return false ;
        }

        let bRemoved = _removeFolder(gFolderTree[i],folderID) ;
        if(bRemoved){
            _callRemoved() ;
            return true ;
        }
    }
    return false;
}