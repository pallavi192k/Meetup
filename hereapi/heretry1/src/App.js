import React, { Component } from "react";

import logo from "./logo.svg";
import "./App.css";

import { HEREMap, Marker } from "here-maps-react";
import Map from "./Map";
 var platform = new window.H.service.Platform({
   'apikey': 'tpVGf7BwHBZ3xs5ycEEr7QETKcjrblm-2DZ3wODUY3M'
   });
const e = React.createElement;
class App extends Component {
  state = {};

  render() {
    return <Map />;
  }
}

export default App;
