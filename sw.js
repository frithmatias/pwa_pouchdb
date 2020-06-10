const CACHE_STATIC = 'cache-static-v1'; 
const CACHE_DYNAMIC = 'cache-dynamic-v1';
const CACHE_INMUTABLE = 'cache-inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 5;

const APP_SHELL = [
    '/', 
    '/index.html',
    '/style/base.css',
    '/style/bg.png',
    '/js/app.js',
    '/js/base.js'

]

const APP_SHELL_INMUTABLE = [
    'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js'
]

self.addEventListener('install', e => {
    const cacheStatic = caches.open( CACHE_STATIC ).then( cache => cache.addAll( APP_SHELL ));
    const cacheInmutable = caches.open( CACHE_INMUTABLE ).then( cache => cache.addAll( APP_SHELL_INMUTABLE ));
    e.waitUntil(Promise.all([ cacheStatic, cacheInmutable ]));
});


// strategy cache with network fallback 
self.addEventListener( 'fetch', e => {
    const respuesta = caches.match( e.request ).then( res => {
        if (res) {
            return res;
        } else {
            return fetch(e.request)
            .then(resp2 => {
                return actualizarCacheDinamico( CACHE_DYNAMIC, e.request, resp2 );
            })
            .catch(err => {
                console.log('Error ', err);
            })
        }
    });
    e.respondWith(respuesta);
})


function actualizarCacheDinamico( dynamicCache, req, res ) {
    if ( res.ok ) {
        // * la respuesta tiene data que voy a almacenar en el cache 
        caches.open( dynamicCache ).then( cache => {
            cache.put( req, res.clone() );
            return res.clone();
        })
    } else {
        // ! falló el cache y falló la red 
        return res;
    }
}