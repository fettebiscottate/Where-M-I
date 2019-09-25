//var key = 'AIzaSyDS2MEA0p4QDHztc-w1GgQOnvb-k0TOTFs';
var key = 'AIzaSyDp-aKf-f6xagJWDEyfinB3Oq9Lb99DrQM';
//var key = 'AIzaSyD1UPb-5Nprt0-PYC0qsK5nOM0qy1Q-RoI';
//var clientID = '913820195357-mc8f19o0qco1hjgj6pdi8q2hqk7q182f.apps.googleusercontent.com'; 
var clientID = '802518016567-8cvh8m8fvbc1iknkvsdr631dkd3ipcq1.apps.googleusercontent.com';
//var clientID = '451638366357-rtfp6k0hljcpgkjs5urkt9o7ai3omfl7.apps.googleusercontent.com';

/** Update the openlocationcode value given the coordinates 
 * https://github.com/google/open-location-code/blob/master/docs/olc_definition.adoc
*/
function getOlc() {
  var openLocationCode = OpenLocationCode.encode(lat, lng);
  document.getElementById('openLocationCode').value = openLocationCode;
}

/** dbClick event handler
 *  Clear location values
 * update location values
 * update vars 
 * call getOlc to update the OLC code
*/
function onMapClick(currentEvent) {
  resetGeoloc()
  document.getElementById('location').value = currentEvent.latlng.lat + ', ' + currentEvent.latlng.lng;
  lat = currentEvent.latlng.lat;
  lng = currentEvent.latlng.lng;
  getOlc()
}

/** location found event handler
 * add marker with popup and open it
 * update location value
 * update vars
 * update OLC
*/
function onLocationFound(eventData) {
  L.marker(eventData.latlng).addTo(map)
    .bindPopup("Your location is " + eventData.latlng.lat + ',' + eventData.latlng.lng).openPopup();
  $('#location').val(eventData.latlng.lat + ',' + eventData.latlng.lng);
  lat = eventData.latlng.lat;
  lng = eventData.latlng.lng;
  getOlc();
}

/** Function called when the document is ready (in fact is called entrypoint)
 * create map and add clickhandler
 * add  image layer to the map (https://docs.mapbox.com/api/)
 * add locationfound click handler
 * declare in place the locationerror event handler
*/
function entryPoint() {
  map = L.map('mapid').setView([45, 12], 8);
  map.on('dblclick', onMapClick);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=sk.eyJ1IjoiamFja21pbmVsbG8iLCJhIjoiY2swbDV1Ymk2MHFlbDNoc3Z4dG1qa214NSJ9.jfe-cXydT8Pc-elRoynKug', {
    maxZoom: 20,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    id: 'mapbox.streets'
  }).addTo(map);
  map.on('locationfound', onLocationFound);

  function onLocationError(error) {
    console.log(error);
  }

  map.on('locationerror', onLocationError);
  //geolocalization
  map.locate({ setView: true, maxZoom: 20, enableHighAccuracy: true });
}

var map //the leaflet map
var lat;
var lng;

/** Reset the olc and the location values*/
function resetGeoloc() {
  document.getElementById('location').value = '';
  document.getElementById('openLocationCode').value = '';
  lat = 0;
  lng = 0;
}
