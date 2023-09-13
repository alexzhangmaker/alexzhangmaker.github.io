// sw.js
console.log('PWA service worker 注册成功')

self.addEventListener('install', () => {
  // 安装回调的逻辑处理
  console.log('service worker 安装成功')
})

self.addEventListener('activate', () => {
  // 激活回调的逻辑处理
  console.log('service worker 激活成功')
})



self.addEventListener('fetch', event => {
  console.log('service worker 抓取请求成功: ' + event.request.url)

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