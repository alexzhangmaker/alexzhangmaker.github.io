// sw.js
console.log('PWA service worker 注册成功')


self.addEventListener('install', (event) => {
  // 安装回调的逻辑处理
  //缓存需要的资源，signpost而言就是哪些主要的JSON文件
  console.log('service worker 安装成功') ;
  /**
   here to cache data
   */
  /*
   event.waitUntil(
    caches.open('signpostCache').then(async function(cache) {
      return cache.addAll([
        '/',
        '/indexPWA.html',
        '/styles.css',
        '/script.js',
        '/logo.png',
      ]).catch(function(error) {
        console.log('资源缓存失败:', error);
      });
    })
  );
  */
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功') ;
})



self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)

  /*
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存中有对应的资源，直接返回
        if (response) {
          return response;
        }

        // 缓存中没有对应的资源，从网络获取
        return fetch(event.request);
      })
  );

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

async function saveBookmark(link){
  console.log(link) ;
  return "https://www.google.com/" ;
}

/*
self.addEventListener('message', function handler(event: MessageEvent<any>) {
  console.log(event.data)
})
*/