// 模拟从Firebase获取的数据
let mockFirebaseData = [
    {
        id: "1",
        name: "项目文档",
        type: "folder",
        children: [
            {
                id: "1-1",
                name: "需求分析",
                type: "folder",
                children: [
                    { id: "1-1-1", name: "用户需求文档.pdf", type: "file" },
                    { id: "1-1-2", name: "功能规格说明.docx", type: "file" }
                ]
            },
            {
                id: "1-2",
                name: "设计文档",
                type: "folder",
                children: [
                    { id: "1-2-1", name: "系统架构图.vsd", type: "file" },
                    { id: "1-2-2", name: "UI设计稿", type: "folder", children: [
                        { id: "1-2-2-1", name: "首页设计.psd", type: "file" },
                        { id: "1-2-2-2", name: "用户界面.sketch", type: "file" }
                    ] }
                ]
            }
        ]
    },
    {
        id: "2",
        name: "开发资源",
        type: "folder",
        children: [
            {
                id: "2-1",
                name: "前端代码",
                type: "folder",
                children: [
                    { id: "2-1-1", name: "组件库", type: "folder", children: [
                        { id: "2-1-1-1", name: "按钮组件.vue", type: "file" },
                        { id: "2-1-1-2", name: "表单组件.vue", type: "file" }
                    ] },
                    { id: "2-1-2", name: "页面模板", type: "folder", children: [] }
                ]
            },
            {
                id: "2-2",
                name: "后端代码",
                type: "folder",
                children: [
                    { id: "2-2-1", name: "API接口", type: "folder", children: [
                        { id: "2-2-1-1", name: "用户接口.js", type: "file" },
                        { id: "2-2-1-2", name: "产品接口.js", type: "file" }
                    ] },
                    { id: "2-2-2", name: "数据库设计", type: "folder", children: [
                        { id: "2-2-2-1", name: "表结构.sql", type: "file" }
                    ] }
                ]
            }
        ]
    },
    {
        id: "3",
        name: "会议记录",
        type: "folder",
        children: [
            { id: "3-1", name: "周会记录", type: "folder", children: [
                { id: "3-1-1", name: "2023年10月会议.docx", type: "file" }
            ] },
            { id: "3-2", name: "评审会议", type: "folder", children: [] }
        ]
    }
];

let dialyTools=[] ;
let bookmarks=[] ;

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
    let urlAppData = `https://outpost-8d74e.asia-southeast1.firebasedatabase.app/Portal.json` ;
    let response = await fetch(urlAppData) ;
    const jsonPortal = await response.json() ;
    console.log(jsonPortal) ;
    _transformPortal(jsonPortal.jsonFolders) ;
    console.log(jsonPortal.jsonFolders) ;
    mockFirebaseData = jsonPortal.jsonFolders ;

    dialyTools = jsonPortal.jsonMustHave ;

    bookmarks = jsonPortal.Bookmarks ;

}

function loadAppData() {
    const PortalRef = database.ref(gPortalPath);
    
    PortalRef.on('value', (snapshot) => {
        const jsonPortal = snapshot.val();
        console.log(jsonPortal) ;
        
        //let dataEntries = 
        _transformPortal(jsonPortal.jsonFolders) ;
        console.log(jsonPortal.jsonFolders) ;
        mockFirebaseData = jsonPortal.jsonFolders ;

        /*
        const treeContainer = document.getElementById('directory-tree');
        renderTree(mockFirebaseData, treeContainer);
        */
        /*
        if (jsonPortal) {
            
            
        } else {

        }
        */
    }, (error) => {
        console.error('加载Portal数据失败:', error);
    });
}

//loadAppData() ;