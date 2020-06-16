import {
  addIceCandidate,
  processAnswer,
  dispose,
  disposePeer,
} from "./webRtcPeerControls";

/**
 * onServerConnected
 * onMeetingStarted
 * onMeetingStopped
 * onKnightJoined
 * onKnightLeft
 * onSourceChanged
 * onSeatsUpdated
 * onError
 */

const _eventListeners = {};

const _triggerEvent = (event, ...args) => {
  if (typeof _eventListeners[event] === "function")
    _eventListeners[event](...args);
};

export const setEventListener = (event, listener) => {
  if (typeof listener === "function") _eventListeners[event] = listener;
};

export const handleConnectEvent = (_socket) => {
  _triggerEvent("onServerConnected", {
    socketId: _socket.id,
  });
};

export const handleMessageEvent = (message) => {
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
      _handleError(message);
      break;
    default:
      console.error(`Unrecognized message: ${message.id}`);
  }
};

const _handleStartCommunication = (message) => {
  _triggerEvent("onMeetingStarted", {
    self: message.self,
    table: message.table,
  });
};

const _handleStopCommunication = () => {
  dispose();
  _triggerEvent("onMeetingStopped");
};

const _handleConnectResponse = (message) => {
  if (message.response !== "success") {
    console.error(`Connect failed for the following reason: `, message.error);
    disposePeer({ source: message.source });
    _triggerEvent("onError", {
      message: "WebRTC peer connect fail",
      error: message.error,
    });
  } else {
    processAnswer({ source: message.source, sdpAnswer: message.sdpAnswer });
  }
};

const _handleKnightJoined = (message) => {
  _triggerEvent("onKnightJoined", {
    knight: message.knight,
    seatNumber: message.seatNumber,
  });
};

const _handleKnightLeft = (message) => {
  _triggerEvent("onKnightLeft", {
    knight: message.knight,
    seatNumber: message.seatNumber,
    isRemoved: message.isRemoved,
  });
};

const _handleChangeSource = (message) => {
  _triggerEvent("onSourceChanged", {
    source: message.source,
  });
};

const _handleSeatsUpdated = (message) => {
  _triggerEvent("onSeatsUpdated", {
    seats: message.seats,
    numberOfSeats: message.numberOfSeats,
  });
};

const _handleIceCandidate = (message) => {
  addIceCandidate({ source: message.source, candidate: message.candidate });
};

const _handleError = (message) => {
  console.error(`Error: ${message.message}`);
  _triggerEvent("onError", {
    message: message.message,
    error: message.error,
  });
};
