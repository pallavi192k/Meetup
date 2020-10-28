import { BASE_URL, MVRS_API_KEY } from './env.js';

const USER_ID = 'user-id';

let userId;
let isSearching = false;

let lastLong = 0;
let lastLat = 0;

const createNewUser = (long, lat) => {
  const storedId = window.localStorage.getItem(USER_ID);
  console.log(storedId);

  if (storedId) {
    userId = storedId;
  } else {
    createUserOnServer(long, lat);
  }
};

const createUserOnServer = (long, lat) => {
  fetch(`${BASE_URL}/api/newuser`, {
    method: 'POST',
    body: JSON.stringify({ long, lat }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      return response.json();
    })
    .then((newUser) => {
      console.log(newUser);
      userId = newUser.id;
      //   window.localStorage.setItem(USER_ID, userId);
    })
    .catch((err) => {
      console.log(err);
    });
};

const pushNewLocation = (long, lat) => {
  lastLong = long;
  lastLat = lat;
  if (!isSearching) return;
  if (!userId) {
    console.warn('Would send new location, but no userId found');
    return;
  }
  console.log(userId);

  fetch(`${BASE_URL}/api/changeloc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userId,
      long,
      lat,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((obj) => {
      if (obj.isnear) {
        handleUsersInArea(obj.usersInArea);
      }
    })
    .catch((err) => console.log(err));
};

//
const startSearch = (params) => {
  fetch(`${BASE_URL}/api/startsearch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userId,
      ...params,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((obj) => {
      console.log(obj);
      isSearching = true;
      if (obj.isnear) {
        handleUsersInArea(obj.usersInArea);
      }
      startSearchInterval();
    })
    .catch((err) => console.log(err));
};

const stopSearch = () => {
  clearInterval();
  fetch(`${BASE_URL}/api/stopsearch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userId,
    }),
  })
    .then((_) => {
      isSearching = false;
      console.log('Stopped searching');
    })
    .catch((err) => console.log(err));
};

const startSearchInterval = () => {
  setInterval(() => {
    pushNewLocation(lastLong, lastLat);
  }, 20000);
};

const handleUsersInArea = (usersInArea) => {
  $('#result-list').empty();
  usersInArea.forEach((user) => {
    $('#result-list').append(
      `<div class="alert alert-secondary" id="result-${user.id}">User ${user.id} says: ${user.description}. They're up to: ${user.topics}</div>`
    );
    $(`#result-${user.id}`).click(() => {
      console.log('CLICKED');
      handleStartRouting(user);
    });
  });
};

const handleStartRouting = (user) => {
  const waypoint0 = `geo!${lastLat},${lastLong}`;
  const waypoint1 = `geo!${user.location.lat},${user.location.long}`;
  console.log(user);
  console.log(lastLat);
  console.log(lastLong);
  var routingParameters = {
    // The routing mode:
    mode: 'fastest;car',
    // The start point of the route:
    // waypoint0: 'geo!50.1120423728813,8.68340740740811',
    waypoint0,
    waypoint1,
    // The end point of the route:
    // waypoint1: 'geo!52.5309916298853,13.3846220493377',
    // To retrieve the shape of the route we choose the route
    // representation mode 'display'
    representation: 'display',
  };

  // Define a callback function to process the routing response:
  var onResult = function(result) {
    var route, routeShape, startPoint, endPoint, linestring;
    if (result.response.route) {
      // Pick the first route from the response:
      route = result.response.route[0];
      // Pick the route's shape:
      routeShape = route.shape;

      // Create a linestring to use as a point source for the route line
      linestring = new H.geo.LineString();

      // Push all the points in the shape into the linestring:
      routeShape.forEach(function(point) {
        var parts = point.split(',');
        linestring.pushLatLngAlt(parts[0], parts[1]);
      });

      // Retrieve the mapped positions of the requested waypoints:
      startPoint = route.waypoint[0].mappedPosition;
      endPoint = route.waypoint[1].mappedPosition;

      // Create a polyline to display the route:
      var routeLine = new H.map.Polyline(linestring, {
        style: { strokeColor: 'blue', lineWidth: 3 },
      });

      // Create a marker for the start point:
      var startMarker = new H.map.Marker({
        lat: startPoint.latitude,
        lng: startPoint.longitude,
      });

      // Create a marker for the end point:
      var endMarker = new H.map.Marker({
        lat: endPoint.latitude,
        lng: endPoint.longitude,
      });

      // Add the route polyline and the two markers to the map:
      map.addObjects([routeLine, startMarker, endMarker]);

      // Set the map's viewport to make the whole route visible:
      map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
    }
  };

  // Get an instance of the routing service:
  var platform = new H.service.Platform({
    apikey: MVRS_API_KEY,
  });
  var router = platform.getRoutingService();

  // Call calculateRoute() with the routing parameters,
  // the callback and an error callback function (called if a
  // communication error occurs):
  router.calculateRoute(routingParameters, onResult, function(error) {
    alert(error.message);
  });
};

window.handleStartRouting = handleStartRouting;

const stopSearchInterval = () => {
  clearInterval();
};

export { startSearch, stopSearch, pushNewLocation, createNewUser };
