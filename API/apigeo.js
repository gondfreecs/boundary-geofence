export function getGeofence(lat,lng) {
     
     const url = 'https://fr-preprod.caravel-app.ovh/api/v1/sites?lat='+lat+'&lng='+lng+'&total_results=20&order=true';
        console.log(url);
   /* if(id){
        url = 'https://fr-preprod.caravel-app.ovh/api/v1/geofences?geo='+id

    }else{
        url = 'https://fr-preprod.caravel-app.ovh/api/v1/geofences'
    }
*/
    return fetch(url)
    .then((response) => response.json())
    .catch((error) => console.error(error))
}
