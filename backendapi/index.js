const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 5001;
// { id: 1, lat: 37.787729, long: -127.396699 },
//   { id: 2, lat: 37.788659, long: -127.397612 }
users = [
  { id: 0, lat: 37.787659, long: -122.3965, issearchable: false },
  { id: 1, lat: 37.787729, long: -122.3965, issearchable: false },
];
const offset = 0.0001;
const testoffset = 0.00005;
function between(x, min, max) {
  return x >= min && x <= max;
}
function isNear(id) {
  //   console.log(users[id].issearchable);
  if (users[id].issearchable) {
    var usersInArea = [];
    const searchingUser = users[id];
    uLat = users[id].lat;
    uLong = users[id].long;
    // console.log(uLat, uLong);
    console.log(id);
    for (var i = 0; i < users.length; i++) {
      if (i !== id && users[i].issearchable) {
        const otherUser = users[i];
        console.log(
          getDistanceFromLatLonInKm(
            uLat,
            uLong,
            otherUser.lat,
            otherUser.long
          ) * 1000
        );
        const toleratedDistance = Math.min(
          searchingUser.distance,
          otherUser.distance
        );
        const matchingTopics = getMatchingTopics(searchingUser, otherUser);
        if (
          getDistanceFromLatLonInKm(uLat, uLong, users[i].lat, users[i].long) *
            1000 <=
            toleratedDistance &&
          matchingTopics.length > 0
        ) {
          // Getting something from amadeus
          usersInArea.push({
            id: i,
            topics: matchingTopics,
            description: otherUser.description,
            location: {
              lat: 37.785688,
              long: -122.400945,
            },
          });
        } else {
        }
        // if (
        //   between(users[i].lat, uLat - offset, uLat + offset) &&
        //   between(users[i].long, uLong - offset, uLong + offset)
        // ) {
        //   //   console.log(users[i]);
        //   return true;
        // } else {
        // }
      }
    }
    if (usersInArea.length > 0) {
      return { isnear: true, usersInArea: usersInArea };
    }
  }

  return { isnear: false };
}
// console.log(isNear(0));

app.get('/', (req, res) => {
  res.send('hey!');
});
app.get('/api/users', (req, res) => {
  res.send(users);
});
app.post('/api/newuser', (req, res) => {
  var newuser = {
    id: users.length,
    lat: req.body.lat,
    long: req.body.long,
    issearchable: false,
  };
  users.push(newuser);
  console.log(`new user is pushed with id:${users.length - 1}`);
  res.send({ id: users.length - 1 });
});
app.post('/api/startsearch', (req, res) => {
  console.log(req.body);
  const body = req.body;
  users[body.id].issearchable = true;
  users[body.id].distance = body.distance;
  users[body.id].description = body.description;
  users[body.id].topics = body.topics;
  res.send(isNear(body.id));
});
app.post('/api/stopsearch', (req, res) => {
  users[req.body.id].issearchable = false;
  res.send('done');
});
app.post('/api/changeloc', (req, res) => {
  console.log('frontend seach for changeloc');
  users[req.body.id].lat = req.body.lat;
  users[req.body.id].long = req.body.long;
  res.send(isNear(req.body.id));
});
// app.post("/api/isnear", (req, res) => {
//   res.send({ isnear: isNear(req.body.id) });
// });
app.listen(port, () => console.log(`app listening on port ${port}!`));

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getMatchingTopics(searchingUser, otherUser) {
  console.log(searchingUser);
  console.log(otherUser);
  return searchingUser.topics.filter(
    (value) => -1 !== otherUser.topics.indexOf(value)
  );
}

const getAmadeusStuff = async () => {
  return fetch('https://test.api.amadeus.com/v1/security/oauth2/token ', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&client_id={}&client_secret={}',
  })
    .then((res) => {
      // console.log(res);
      return res.json();
    })
    .then((resobj) => {
      console.log(resobj);
      var actoken = 'Bearer ' + resobj.access_token;
      fetch(
        'https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=37.773972&longitude=-122.431297',
        { headers: { Authorization: actoken } }
      )
        .then((res) => {
          return res.json();
        })
        .then((x) => {
          console.log(x);
          return x;
        });
    });
};
