import makeMapInteractive from './interactivity.js';
import addListeners from './listeners.js';
import {
  createNewUser,
  pushNewLocation,
  stopSearch,
} from './search-functions.js';
import { MVRS_API_KEY } from './env.js';
import {
  handleStartSearch,
  handleStopSearch,
} from './search-button-handlers.js';

let long;
let lat;
let currentlySearching = false;

var platform = new H.service.Platform({
  apikey: MVRS_API_KEY,
});
var geocoder = platform.getGeocodingService();

// Obtain the default map types from the platform object
var maptypes = platform.createDefaultLayers();

// Instantiate (and display) a map object:
var map;
initmap();

function initmap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      long = position.coords.longitude;
      lat = position.coords.latitude;
      map = new H.Map(
        document.getElementById('mapContainer'),
        maptypes.vector.normal.map,
        {
          zoom: 18,
          center: {
            lng: long,
            lat: lat,
          },
        }
      );
      window.map = map;
      addListeners(map);
      makeMapInteractive(map, maptypes);
      createNewUser(long, lat);
    });

    navigator.geolocation.watchPosition(function(position) {
      long = position.coords.longitude;
      lat = position.coords.latitude;

      map.removeObjects(map.getObjects());
      const marker = new H.map.Marker({
        lng: long,
        lat: lat,
      });
      map.addObject(marker);

      pushNewLocation(long, lat);
    });
  } else {
    console.error('Geolocation is not supported by this browser!');
  }
}

document.getElementById('startSearchButton').addEventListener('click', () => {
  if (currentlySearching) {
    handleStopSearch();
  } else {
    handleStartSearch();
  }

  currentlySearching = !currentlySearching;
});

window.onbeforeunload = () => {
  stopSearch();
};
