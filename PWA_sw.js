// sw.js
console.log('PWA service worker 注册成功')


self.addEventListener('install', (event) => {
  // 安装回调的逻辑处理
  //缓存需要的资源，signpost而言就是哪些主要的JSON文件
  console.log('service worker 安装成功') ;
  /**
   here to cache data
   */
   var cacheName = 'signpostCache';
   var urlsToCache = [
    'https://alexzhangmaker.github.io/indexPWA.html',
    'https://alexzhangmaker.github.io/styles.css',
    'https://alexzhangmaker.github.io/signpostPortfolio.js',
    'https://alexzhangmaker.github.io/signpostMessage.js',
    'https://alexzhangmaker.github.io/signpostNews.js',
    'https://alexzhangmaker.github.io/signpostDividends.js',
    'https://alexzhangmaker.github.io/signpostCompanyKPI.js',
    'https://alexzhangmaker.github.io/json/athenaBookmarks.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css',
    'https://alexzhangmaker.github.io/images/signpost.jpeg',
    'https://alexzhangmaker.github.io/images/poodle.jpeg'

   ];
  
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
  var cacheAllowlist = ['pages-cache-v1', 'blog-posts-cache-v1'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
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
          return response;
        }

        // 缓存中没有对应的资源，从网络获取
        return fetch(event.request);
      })
  );

  /*
  const url = new URL(event.request.url);
  // If this is an incoming POST request for the
  // registered "action" URL, respond to it.
  if (event.request.method === 'POST' && url.pathname === '/bookmark') {
        event.respondWith((async () => {
          const formData = await event.request.formData();
          const link = formData.get('link') || '';
          const responseUrl = await saveBookmark(link);
          return Response.redirect(responseUrl, 303);
        })());
  }
  */
});


/*
async function saveBookmark(link){
  console.log(link) ;
  return "https://www.google.com/" ;
}


self.addEventListener('message', function handler(event: MessageEvent<any>) {
  console.log(event.data)
})
*/