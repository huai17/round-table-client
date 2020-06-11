import React, { useRef, useEffect } from "react";
import io from "socket.io-client";
import kurentoUtils from "kurento-utils";
import server from "../configs/server";

const url = server({ mode: "online" });

const _socket = io(url);
let _webRtcPeers = {};
let _onParticipantJoined = null;
let _onParticipantLeft = null;
let _onTableReserved = null;
let _onMeetingStarted = null;
let _onMeetingStopped = null;
let _onSourceChanged = null;

_socket.on("message", (message) => {
  console.log(`Receive message: ${message.id}`);
  switch (message.id) {
    // case "getRoomsResponse":
    //   getRoomsResponse(message);
    //   break;
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
    case "participantJoined":
      _participantJoined(message);
      break;
    case "participantLeft":
      _participantLeft(message);
      break;
    case "existParticipants":
      _existParticipants(message);
      break;
    case "changeSource":
      _changeSource(message);
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
  _onMeetingStopped();
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
    // _onParticipantJoined(["composite", "dispatcher"]);
    _onTableReserved(message.table);
    _onMeetingStarted();
  }
};

const _joinResponse = (message) => {
  if (message.response !== "success") {
    const error = message.error ? message.error : "Unknow error";
    console.info(`Join table failed for the following reason: `, error);
    _dispose();
  } else {
    _webRtcPeers["me"].processAnswer(message.sdpAnswer);
    // _onParticipantJoined(["composite", "dispatcher"]);
    _onMeetingStarted();
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

const _participantJoined = (message) => {
  _onParticipantJoined([message.participantId]);
};
const _participantLeft = (message) => {
  _onParticipantLeft([message.participantId]);
};

const _existParticipants = (message) => {
  _onParticipantJoined(message.participantIds);
  _onSourceChanged(message.hostId);
};

const join = ({ token, name }) => {
  if (!token) return;

  const options = {
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
        _sendMessage({ id: "join", token, name, sdpOffer });
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

const release = () => {
  _sendMessage({ id: "release" });
};

const changeSource = (source) => {
  _sendMessage({ id: "changeSource", source });
};

const _changeSource = (message) => {
  _onSourceChanged(message.source);
};

export const useRoundTable = ({
  onParticipantJoined,
  onParticipantLeft,
  onTableReserved,
  onMeetingStarted,
  onMeetingStopped,
  onSourceChanged,
}) => {
  useEffect(() => {
    if (typeof onParticipantJoined === "function")
      _onParticipantJoined = onParticipantJoined;
    else throw Error("onParticipantJoined must be a function");
    if (typeof onParticipantLeft === "function")
      _onParticipantLeft = onParticipantLeft;
    else throw Error("onParticipantLeft must be a function");
    if (typeof onTableReserved === "function")
      _onTableReserved = onTableReserved;
    else throw Error("onTableReserved must be a function");
    if (typeof onMeetingStarted === "function")
      _onMeetingStarted = onMeetingStarted;
    else throw Error("onMeetingStarted must be a function");
    if (typeof onMeetingStopped === "function")
      _onMeetingStopped = onMeetingStopped;
    else throw Error("onMeetingStopped must be a function");

    if (typeof onSourceChanged === "function")
      _onSourceChanged = onSourceChanged;
    else throw Error("onSourceChanged must be a function");
  }, [
    onParticipantJoined,
    onParticipantLeft,
    onTableReserved,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
  ]);

  return { join, leave, reserve, release, changeSource };
};

export const Video = ({ source }) => {
  const videoRef = useRef(null);

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

  return <video ref={videoRef} autoPlay />;
};
