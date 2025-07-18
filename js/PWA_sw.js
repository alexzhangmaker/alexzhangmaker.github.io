// sw.js
console.log('PWA service worker 注册成功')

var cacheName = 'signpostCache';
var urlsToCache = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css',
  'https://alexzhangmaker.github.io/images/signpost.jpeg',
  'https://alexzhangmaker.github.io/images/poodle.jpeg'
];

self.addEventListener('install', (event) => {
  // 安装回调的逻辑处理
  //缓存需要的资源，signpost而言就是哪些主要的JSON文件
  let cTime = new Date() ;
  console.log('service worker 安装成功:'+cTime.toLocaleString()) ;
  
  /**here to cache data*/
   event.waitUntil(
     caches.open(cacheName)
     .then(async function(cache){
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.log('资源缓存失败:', error);
      });
    })
  );
}) ;


self.addEventListener('activate', function(event) {
  let cTime = new Date() ;
  console.log('service worker activate:'+cTime.toLocaleString()) ;
 
  var cacheAllowlist = ['pages-cache-v1', 'blog-posts-cache-v1','signpostCache'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            console.log('activate caches.delete:'+cacheName) ;
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)
  
  event.respondWith(
    caches.match(event.request).then(function(response) {
        // 缓存中有对应的资源，直接返回
        if (response) {
          console.log('缓存中有对应的资源，直接返回') ;
          return response;
        }

        // 缓存中没有对应的资源，从网络获取
        console.log('缓存中没有对应的资源，从网络获取') ;
        return fetch(event.request);
      })
  );


});

