const addListeners = (map) => {
  //   var mapEvents = new H.mapevents.MapEvents(map);

  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

  window.addEventListener('resize', () => map.getViewPort().resize());
};

export default addListeners;
