import React, { Component } from "react";

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.platform = null;
    this.map = null;

    this.state = {
      app_id: props.app_id,
      app_code: props.app_code,
      center: {
        lat: props.lat,
        lng: props.lng
      },
      zoom: props.zoom,
      theme: props.theme,
      style: props.style
    };
  }

  // TODO: Add theme selection discussed later HERE

  componentDidMount() {
    this.platform = new window.H.service.Platform(this.state);

    var layer = this.platform.createDefaultLayers();
    var container = document.getElementById("here-map");

    this.map = new window.H.Map(container, layer.normal.map, {
      center: this.state.center,
      zoom: this.state.zoom
    });

    var events = new window.H.mapevents.MapEvents(this.map);
    // eslint-disable-next-line
    var behavior = new window.H.mapevents.Behavior(events);
    // eslint-disable-next-line
    var ui = new window.H.ui.UI.createDefault(this.map, layer);
  }

  render() {
    return (
      <div
        id="here-map"
        style={{ width: "100%", height: "400px", background: "grey" }}
      />
    );
  }
}
