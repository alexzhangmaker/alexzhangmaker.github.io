let jsonMenu = [
            { title: '打开', action: 'open' },
            { title: '下载', action: 'download' },
            { title: '外链分享', action: 'share' },
            { title: '复制', action: 'copy' },
            { title: '重命名', action: 'rename' },
            { title: '刷新', action: 'refresh' },
            { title: '删除', action: 'delete' },
            { 
                title: '新建',
                children: [
                    { title: '新建doc', action: 'new-doc' },
                    { title: '新建ppt', action: 'new-ppt' },
                    { title: '新建excel', action: 'new-excel' },
                    { title: '新建txt', action: 'new-txt' },
                ] 
            },
            { 
                title: '更多', 
                children: [
                    { title: '添加到收藏夹', action: 'collect' },
                    { title: '编辑锁定', action: 'locked' },
                    { title: '置顶', action: 'sticky' },
                    { title: '文件历史记录', action: 'history-record' },
                ]
            },
            { 
                title: '属性', 
                children: [
                    { title: '属性1', action: 'collect' },
                    { title: '属性2' },
                    { title: '属性3' },
                    { title: '属性4' },
                ] 
            },
        ] ;

/*
const contextMenus = new ContextMenus({
    className: '.container', 
    menu:jsonMenu
}) ;
console.log(contextMenus);
contextMenus.on((item, evt) => {
    console.log(item, evt);
}) ;
*/