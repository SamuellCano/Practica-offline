console.log('APP.js')
let swLocation
if(navigator.serviceWorker){
    navigator.serviceWorker.register('sw.js')
}