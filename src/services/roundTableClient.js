import React, { useRef, useEffect } from "react";
import io from "socket.io-client";
import kurentoUtils from "kurento-utils";
import server from "../configs/server";

const url = server({ mode: "local" });

const _socket = io(url);
let _webRtcPeers = {};
let _localVideoRef = null;
let _onServerConnected = null;
let _onMeetingStarted = null;
let _onMeetingStopped = null;
let _onKnightJoined = null;
let _onKnightLeft = null;
let _onSourceChanged = null;
let _onSeatsUpdated = null;

_socket.on("connect", () => {
  if (typeof _onServerConnected === "function") _onServerConnected(_socket.id);
});

_socket.on("message", (message) => {
  console.log(`Receive message: ${message.id}`);

  switch (message.id) {
    case "reserveResponse":
      _reserveResponse(message);
      break;
    case "joinResponse":
      _joinResponse(message);
      break;
    case "receiveResponse":
      _receiveResponse(message);
      break;
    case "stopCommunication":
      _dispose();
      break;
    case "knightJoined":
      _knightJoined(message);
      break;
    case "knightLeft":
      _knightLeft(message);
      break;
    case "changeSource":
      _changeSource(message);
      break;
    case "seatsUpdated":
      _seatsUpdated(message);
      break;
    case "iceCandidate":
      _iceCandidate(message);
      break;
    case "error":
      console.error(`Error: ${message.message}`);
      break;
    default:
      console.error(`Unrecognized message: ${message.id}`);
  }
});

const _setPeer = ({ source, webRtcPeer }) => {
  _webRtcPeers[source] = webRtcPeer;
};

const _sendMessage = (message) => {
  _socket.send(message);
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

const _iceCandidate = (message) => {
  _webRtcPeers[message.source].addIceCandidate(message.candidate);
};

const _reserveResponse = (message) => {
  if (message.response !== "success") {
    const error = message.error ? message.error : "Unknow error";
    console.info(`Create table failed for the following reason: `, error);
    _dispose();
  } else {
    _webRtcPeers["me"].processAnswer(message.sdpAnswer);
    if (typeof _onMeetingStarted === "function")
      _onMeetingStarted(message.self, message.table);
  }
};

const _joinResponse = (message) => {
  if (message.response !== "success") {
    const error = message.error ? message.error : "Unknow error";
    console.info(`Join table failed for the following reason: `, error);
    _dispose();
  } else {
    _webRtcPeers["me"].processAnswer(message.sdpAnswer);
    if (typeof _onMeetingStarted === "function")
      _onMeetingStarted(message.self, message.table);
  }
};

const _receiveResponse = (message) => {
  if (message.response !== "success") {
    const error = message.error ? message.error : "Unknow error";
    console.info(`Receive failed for the following reason: `, error);
    _disposePeer(message.source);
  } else {
    _webRtcPeers[message.source].processAnswer(message.sdpAnswer);
  }
};

const _changeSource = (message) => {
  if (typeof _onSourceChanged === "function") _onSourceChanged(message.source);
};

const _seatsUpdated = (message) => {
  if (typeof _onSeatsUpdated === "function")
    _onSeatsUpdated({
      seats: message.seats,
      numberOfSeats: message.numberOfSeats,
    });
};

const _knightJoined = (message) => {
  if (typeof _onKnightJoined === "function")
    _onKnightJoined({ knight: message.knight, seatNumber: message.seatNumber });
};

const _knightLeft = (message) => {
  if (typeof _onKnightLeft === "function")
    _onKnightLeft({
      knight: message.knight,
      seatNumber: message.seatNumber,
      isRemoved: message.isRemoved,
    });
};

const join = ({ seatNumber, name }) => {
  if (!seatNumber) return;

  const options = {
    localVideo: _localVideoRef.current,
    onIceCandidate: (candidate) =>
      _sendMessage({ id: "onIceCandidate", source: "me", candidate }),
  };

  _webRtcPeers["me"] = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
    options,
    function (error) {
      if (error) return console.error(error);
      this.generateOffer((error, sdpOffer) => {
        if (error) return console.error(error);

        console.info("Invoking SDP offer callback function ");
        _sendMessage({ id: "join", seatNumber, name, sdpOffer });
      });
    }
  );
};

const leave = () => {
  _sendMessage({ id: "leave" });
  _dispose();
};

const reserve = ({ numberOfSeats, name }) => {
  const options = {
    localVideo: _localVideoRef.current,
    onIceCandidate: (candidate) =>
      _sendMessage({ id: "onIceCandidate", source: "me", candidate }),
  };

  _webRtcPeers["me"] = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
    options,
    function (error) {
      if (error) return console.error(error);
      this.generateOffer((error, sdpOffer) => {
        if (error) return console.error(error);

        console.info("Invoking SDP offer callback function ");
        _sendMessage({ id: "reserve", numberOfSeats, name, sdpOffer });
      });
    }
  );
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
  localVideoRef,
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

    if (localVideoRef) _localVideoRef = localVideoRef;
  }, [
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    onSeatsUpdated,
    localVideoRef,
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
    const options = {
      remoteVideo: videoRef.current,
      onIceCandidate: (candidate) =>
        _sendMessage({ id: "onIceCandidate", source, candidate }),
    };

    const webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      function (error) {
        if (error) return console.error(error);
        this.generateOffer((error, sdpOffer) => {
          if (error) return console.error(error);
          console.info("Invoking SDP offer callback function ");
          _sendMessage({ id: "receive", source, sdpOffer });
        });
      }
    );
    _setPeer({ source, webRtcPeer });

    return () => {
      _disposePeer(source);
    };
  }, [source]);

  return <video ref={videoRef} autoPlay muted {...props} controls />;
};
