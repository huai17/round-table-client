import kurentoUtils from "kurento-utils";

import { sendMessage } from "./signals";

let _webRtcPeers = {};

export const connectPeer = (options = {}) => {
  const { source, videoRef } = options;
  let webRtcPeer = null;
  const webRtcOptions = {
    onIceCandidate: (candidate) =>
      sendMessage({ id: "onIceCandidate", source, candidate }),
  };
  const connectCallback = function (error) {
    if (error) return console.error(error);
    this.generateOffer((error, sdpOffer) => {
      if (error) return console.error(error);

      console.info("Invoking SDP offer callback function ");
      sendMessage({ id: "connect", source, sdpOffer });
    });
  };
  if (source === "self") {
    if (videoRef) webRtcOptions.localVideo = videoRef.current;
    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
      webRtcOptions,
      connectCallback
    );
  } else {
    if (videoRef) webRtcOptions.remoteVideo = videoRef.current;
    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      webRtcOptions,
      connectCallback
    );
  }
  if (webRtcPeer) _webRtcPeers[source] = webRtcPeer;
};

export const disposePeer = (options = {}) => {
  const { source } = options;
  if (_webRtcPeers[source]) {
    _webRtcPeers[source].dispose();
    delete _webRtcPeers[source];
  }
};

export const dispose = () => {
  for (let source in _webRtcPeers) {
    if (_webRtcPeers[source]) {
      _webRtcPeers[source].dispose();
      delete _webRtcPeers[source];
    }
  }
  _webRtcPeers = {};
};

export const addIceCandidate = (options = {}) => {
  const { source, candidate } = options;
  if (_webRtcPeers[source]) _webRtcPeers[source].addIceCandidate(candidate);
};

export const processAnswer = (options = {}) => {
  const { source, sdpAnswer } = options;
  if (_webRtcPeers[source]) _webRtcPeers[source].processAnswer(sdpAnswer);
};

export const reserve = (options = {}) => {
  const { numberOfSeats, name } = options;
  sendMessage({ id: "reserve", numberOfSeats, name });
};

export const join = (options = {}) => {
  const { seatNumber, name } = options;
  if (!seatNumber) return;
  sendMessage({ id: "join", seatNumber, name });
};

export const leave = () => {
  sendMessage({ id: "leave" });
  dispose();
};

export const changeSource = (options = {}) => {
  const { source } = options;
  sendMessage({ id: "changeSource", source });
};

export const generateSeats = (options = {}) => {
  const { numberOfSeats } = options;
  sendMessage({ id: "generateSeats", numberOfSeats });
};

export const kickout = (options = {}) => {
  const { seatNumber } = options;
  sendMessage({ id: "kickout", seatNumber });
};
