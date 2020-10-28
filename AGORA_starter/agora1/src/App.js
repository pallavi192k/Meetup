import React from "react";
import logo from "./logo.svg";
import "./App.css";
import $ from "jquery";
import AgoraRTC from "agora-rtc-sdk";

function addView(id, show) {
  if (!$("#" + id)[0]) {
    $("<div/>", {
      id: "remote_video_panel_" + id,
      class: "video-view"
    }).appendTo("#video");

    $("<div/>", {
      id: "remote_video_" + id,
      class: "video-placeholder"
    }).appendTo("#remote_video_panel_" + id);

    $("<div/>", {
      id: "remote_video_info_" + id,
      class: "video-profile " + (show ? "" : "hide")
    }).appendTo("#remote_video_panel_" + id);

    $("<div/>", {
      id: "video_autoplay_" + id,
      class: "autoplay-fallback hide"
    }).appendTo("#remote_video_panel_" + id);
  }
}

function removeView(id) {
  if ($("#remote_video_panel_" + id)[0]) {
    $("#remote_video_panel_" + id).remove();
  }
}

function App() {
  var rtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
  };
  // Options for joining a channel
  var option = {
    appID: "",
    channel: "Channel name",
    uid: null,
    token: ""
  };

  // Create a local stream
  rtc.localStream = AgoraRTC.createStream({
    streamID: rtc.params.uid,
    audio: true,
    video: true,
    screen: false
  });
  // initializing the stream
  rtc.localStream.init(
    function() {
      console.log("init local stream success");
    },
    function(err) {
      console.error("init local stream failed ", err);
    }
  );

  // Create a client
  rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

  // Initialize the client
  rtc.client.init(
    option.appID,
    function() {
      console.log("init success");
    },
    err => {
      console.error(err);
    }
  );
  // Join a channel
  // token is optional
  rtc.client.join(
    option.token,
    option.channel,
    option.uid,
    function(uid) {
      console.log("join channel: " + option.channel + " success, uid: " + uid);
      rtc.params.uid = uid;
    },
    function(err) {
      console.error("client join failed", err);
    }
  );
  // Publish the local stream
  rtc.client.publish(rtc.localStream, function(err) {
    console.log("publish failed");
    console.error(err);
  });

  //  Subscribe to a remote stream when the stream is added.
  rtc.client.on("stream-added", function(evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    if (id !== rtc.params.uid) {
      rtc.client.subscribe(remoteStream, function(err) {
        console.log("stream subscribe failed", err);
      });
    }
    console.log("stream-added remote-uid: ", id);
  });

  rtc.client.on("stream-subscribed", function(evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    // Add a view for the remote stream.
    addView(id);
    // Play the remote stream.
    remoteStream.play("remote_video_" + id);
    console.log("stream-subscribed remote-uid: ", id);
  });

  rtc.client.on("stream-removed", function(evt) {
    var remoteStream = evt.stream;
    var id = remoteStream.getId();
    // Stop playing the remote stream.
    remoteStream.stop("remote_video_" + id);
    // Remove the view of the remote stream.
    removeView(id);
    console.log("stream-removed remote-uid: ", id);
  });

  // Leave the channel
  rtc.client.leave(
    function() {
      // Stop playing the local stream
      rtc.localStream.stop();
      // Close the local stream
      rtc.localStream.close();
      // Stop playing the remote streams and remove the views
      while (rtc.remoteStreams.length > 0) {
        var stream = rtc.remoteStreams.shift();
        var id = stream.getId();
        stream.stop();
        removeView(id);
      }
      console.log("client leaves channel success");
    },
    function(err) {
      console.log("channel leave failed");
      console.error(err);
    }
  );
  return <div className="App"></div>;
}

export default App;
