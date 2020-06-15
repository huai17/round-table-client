import React, { useRef, useEffect } from "react";
import io from "socket.io-client";
import kurentoUtils from "kurento-utils";
import server from "../configs/server";

let _webRtcPeers = {};
let _onServerConnected = null;
let _onMeetingStarted = null;
let _onMeetingStopped = null;
let _onKnightJoined = null;
let _onKnightLeft = null;
let _onSourceChanged = null;
let _onSeatsUpdated = null;
let _onError = null;

// connect with signal server
const _socket = io(server({ debug: "local" }));

_socket.on("connect", () => {
  if (typeof _onServerConnected === "function") _onServerConnected(_socket.id);
});

_socket.on("message", (message) => {
  console.log(`Receive message: ${message.id}`);

  switch (message.id) {
    case "startCommunication":
      _handleStartCommunication(message);
      break;
    case "stopCommunication":
      _handleStopCommunication();
      break;
    case "connectResponse":
      _handleConnectResponse(message);
      break;
    case "knightJoined":
      _handleKnightJoined(message);
      break;
    case "knightLeft":
      _handleKnightLeft(message);
      break;
    case "changeSource":
      _handleChangeSource(message);
      break;
    case "seatsUpdated":
      _handleSeatsUpdated(message);
      break;
    case "iceCandidate":
      _handleIceCandidate(message);
      break;
    case "error":
      console.error(`Error: ${message.message}`);
      _handleError(message);
      break;
    default:
      console.error(`Unrecognized message: ${message.id}`);
  }
});

// utils
const _setPeer = ({ source, webRtcPeer }) => {
  _webRtcPeers[source] = webRtcPeer;
};

const _sendMessage = (message) => {
  _socket.send(message);
};

const _connect = ({ source, videoRef }) => {
  let webRtcPeer = null;
  const options = {
    onIceCandidate: (candidate) =>
      _sendMessage({ id: "onIceCandidate", source, candidate }),
  };
  const connectCallback = function (error) {
    if (error) return console.error(error);
    this.generateOffer((error, sdpOffer) => {
      if (error) return console.error(error);

      console.info("Invoking SDP offer callback function ");
      _sendMessage({ id: "connect", source, sdpOffer });
    });
  };

  if (source === "me") {
    options.localVideo = videoRef.current;
    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
      options,
      connectCallback
    );
  } else {
    options.remoteVideo = videoRef.current;
    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      connectCallback
    );
  }

  if (webRtcPeer) _setPeer({ source, webRtcPeer });
};

const _disposePeer = (source) => {
  if (_webRtcPeers[source]) {
    _webRtcPeers[source].dispose();
    delete _webRtcPeers[source];
  }
};

const _dispose = () => {
  for (let source in _webRtcPeers) {
    if (_webRtcPeers[source]) {
      _webRtcPeers[source].dispose();
      delete _webRtcPeers[source];
    }
  }
  if (typeof _onMeetingStopped === "function") _onMeetingStopped();
  _webRtcPeers = {};
};

// signal handlers
const _handleStartCommunication = (message) => {
  if (typeof _onMeetingStarted === "function")
    _onMeetingStarted(message.self, message.table);
};

const _handleStopCommunication = () => {
  _dispose();
};

const _handleConnectResponse = (message) => {
  if (message.response !== "success") {
    const error = message.error ? message.error : "Unknow error";
    console.info(`Connect failed for the following reason: `, error);
    _disposePeer(message.source);
  } else {
    _webRtcPeers[message.source].processAnswer(message.sdpAnswer);
  }
};

const _handleKnightJoined = (message) => {
  if (typeof _onKnightJoined === "function")
    _onKnightJoined({ knight: message.knight, seatNumber: message.seatNumber });
};

const _handleKnightLeft = (message) => {
  if (typeof _onKnightLeft === "function")
    _onKnightLeft({
      knight: message.knight,
      seatNumber: message.seatNumber,
      isRemoved: message.isRemoved,
    });
};

const _handleChangeSource = (message) => {
  if (typeof _onSourceChanged === "function") _onSourceChanged(message.source);
};

const _handleSeatsUpdated = (message) => {
  if (typeof _onSeatsUpdated === "function")
    _onSeatsUpdated({
      seats: message.seats,
      numberOfSeats: message.numberOfSeats,
    });
};

const _handleIceCandidate = (message) => {
  _webRtcPeers[message.source].addIceCandidate(message.candidate);
};

const _handleError = (message) => {
  if (typeof _onError === "function")
    _onError({ message: message.message, error: message.error });
};

// services
const reserve = ({ numberOfSeats, name }) => {
  _sendMessage({ id: "reserve", numberOfSeats, name });
};

const join = ({ seatNumber, name }) => {
  if (!seatNumber) return;
  _sendMessage({ id: "join", seatNumber, name });
};

const leave = () => {
  _sendMessage({ id: "leave" });
  _dispose();
};

const changeSource = (source) => {
  _sendMessage({ id: "changeSource", source });
};

const generateSeats = (numberOfSeats) => {
  _sendMessage({ id: "generateSeats", numberOfSeats });
};

const kickout = (seatNumber) => {
  _sendMessage({ id: "kickout", seatNumber });
};

export const useRoundTable = ({
  onKnightJoined,
  onKnightLeft,
  onMeetingStarted,
  onMeetingStopped,
  onSourceChanged,
  onSeatsUpdated,
  onError,
}) => {
  useEffect(() => {
    if (typeof onKnightJoined === "function") _onKnightJoined = onKnightJoined;
    if (typeof onKnightLeft === "function") _onKnightLeft = onKnightLeft;
    if (typeof onMeetingStarted === "function")
      _onMeetingStarted = onMeetingStarted;
    if (typeof onMeetingStopped === "function")
      _onMeetingStopped = onMeetingStopped;
    if (typeof onSourceChanged === "function")
      _onSourceChanged = onSourceChanged;
    if (typeof onSeatsUpdated === "function") _onSeatsUpdated = onSeatsUpdated;
    if (typeof onError === "function") _onError = onError;
  }, [
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    onSeatsUpdated,
    onError,
  ]);

  return {
    join,
    leave,
    reserve,
    changeSource,
    generateSeats,
    kickout,
  };
};

export const Video = ({ source, ...props }) => {
  const videoRef = useRef(null);

  // function playPause() {
  //   if (videoRef.current.paused) videoRef.current.play();
  //   else videoRef.current.pause();
  // }

  useEffect(() => {
    _connect({ source, videoRef });

    return () => {
      _disposePeer(source);
    };
  }, [source]);

  return (
    <video
      ref={videoRef}
      autoPlay
      {...props}
      style={source === "me" ? { transform: "rotateY(180deg)" } : null}
    />
  );
};
