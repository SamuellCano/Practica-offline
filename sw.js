//Todos los archivos que nuestra app utilice
const STATIC = 'staticv2';
const INMUTABLE = 'inmutablev1';
const DYNAMIC = 'dynamicv1';

const APP_SHELL = [
    '/',
    '/index.html',
    'js/app.js',
    'img/gatito.webp',
    'css/styles.css',
    'img/p.webp', 
    'pages/offline.html'
];

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous',

];


self.addEventListener('install', (e) =>{
    console.log('SW: instalado');
    const staticCache = caches.open(STATIC)
    .then(cache =>{
        cache.addAll(APP_SHELL);
    });

    const inmutableCache = caches.open(INMUTABLE)
    .then(cache =>{
        cache.addAll(APP_SHELL_INMUTABLE);
    });
    e.waitUntil(Promise.all([staticCache, inmutableCache]));
    //e.skipWaiting();
})

self.addEventListener('activate', (e) =>{
    console.log('SW: Activado');
    //Borrar cache antiguo
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC && cacheName !== INMUTABLE && cacheName !== DYNAMIC) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
})

self.addEventListener('fetch', (e) =>{
    e.respondWith(
        caches.match(e.request).then((response) => {
          // Si la solicitud está en la caché, la servimos desde la caché
          if (response) {
            return response;
          }
    
          /*if (e.request.url.includes('/page2.html')) {
            return caches.match('pages/offline.html');
          }*/
    
          return fetch(e.request).catch(() => {
            // Si no se puede obtener de Internet, respondemos con la página offline
            if (e.request.url.includes('/page2.html'))
                return caches.match('pages/offline.html');
          });
        })
      );

    

   /* //5.Cache and network race
    const source = new Promise((resolve, reject)=>{
        let flag = false;
        const failsOnce = () =>{
        if(flag){
            if(/\.(png|jpg)/i.test(e.request.url)){
                resolve(caches.match('img/not-found.png'));
            }else{
                reject('SourceNotFound');
            }
        }else{
            flag = true;
        }
    }

    fetch(e.request).then(resFetch =>{
        resFetch.ok ? resolve(resFetch) : failsOnce();
    }).catch(failOnce);
    caches.match(e.request).then((sourceCache) =>{
      sourceCache.ok ? resolve(resFetch) : failsOnce();
    }) 
});*/
    

    //4.Network with cache fallback
    //Primero todo lo devuelve del caché
    //Después actualiza el recurso
    //Rendimiento crítico. Desventaja: Siempre se queda un paso atrás

/*const source = caches.open(STATIC).then(cache =>{
        fetch(e.request).then(resFetch =>{
            cache.put(e.request, resFetch);
        });
        return caches.match(e.request);
    });
    e.respondWith(source);*/


    //3.Network with cache fallback
    /*const source = fetch(e.request)
        .then(res =>{
            if(!res) throw Error("NotFound");
            caches.open(DYNAMIC).then(cache =>{
                cache.put(e.request, res);
            })
            return res.clone();
        }).catch(err =>{
            return caches.match(e.request);
        });
    e.respondWith(source);*/

    //2.Caché with network fallback
    /*const source = caches.match(e.request)
    .then(res =>{
        if(res) return res;
        return fetch(e.request).then(resFetch =>{
            caches.open(DYNAMIC).then(cache =>{
                cache.put(e.request, resFetch);
            });
            return resFetch.clone();
        });
    })
    e.respondWith(source); */


    //1. Cache Only
    //e.respondWith(caches.match(e.request));
    /*console.log(e.request);
    if(e.request.url.includes('gatito.webp'))
        e.respondWith(fetch('img/wp.jpg'));
    else e.respondWith(fetch(e.request));*/
});

