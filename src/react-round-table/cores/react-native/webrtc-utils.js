import freeice from 'freeice';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';

const ICE_CONFIG = {iceServers: freeice()};

let _localStream = null;
let _isEnableAudio = true;
let _isEnableVideo = true;
let _pcs = {};

const _getPC = (options = {}) => {
  const {source} = options;
  if (!_pcs[source]) return null;
  if (!_pcs[source].pc) {
    delete _pcs[source];
    return null;
  }
  if (_pcs[source].pc.signalingState === 'closed') closePC({source});
  return _pcs[source].pc;
};

const _setPC = (options = {}) => {
  const {source, pc} = options;
  if (_pcs[source]) closePC({source});
  _pcs[source] = {pc, cq: []};
};

const _getQueue = (options = {}) => {
  const {source} = options;
  if (!_pcs[source]) return null;
  if (!_pcs[source].pc) {
    delete _pcs[source];
    return null;
  }
  if (!_pcs[source].cq) _pcs[source].cq = [];
  return _pcs[source].cq;
};

const _createOffer = ({source, offerReceive, sendMessage}) => {
  const pc = _getPC({source});
  if (!pc) throw new Error('PeerConnection does not exist');
  pc.createOffer({
    offerToReceiveAudio: offerReceive,
    offerToReceiveVideo: offerReceive,
  })
    .then(desc => {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      return pc.setLocalDescription(desc);
    })
    .then(() => {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      if (!pc.localDescription)
        throw new Error('LocalDescription does not exist');
      sendMessage({
        id: 'connect',
        source,
        sdpOffer: pc.localDescription.sdp,
      });
    })
    .catch(error => console.error(error));
};

export const getLocalStream = async (options = {}) => {
  if (_localStream) return _localStream;

  const {camera = 'front'} = options;
  const isFront = camera === 'front';

  const sourceInfos = await mediaDevices.enumerateDevices();

  let videoSourceId;
  for (let i = 0; i < sourceInfos.length; i++) {
    const sourceInfo = sourceInfos[i];
    if (
      sourceInfo.kind == 'videoinput' &&
      sourceInfo.facing == (isFront ? 'front' : 'environment')
    ) {
      videoSourceId = sourceInfo.deviceId;
    }
  }

  _localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: {
      mandatory: {
        maxWidth: 560,
        maxHeight: 400,
        maxFrameRate: 30,
      },
      facingMode: isFront ? 'user' : 'environment',
      optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
    },
  });

  return _localStream;
};

export const createPC = (options = {}) => {
  const {source, sendMessage, localStream, onaddstream} = options;
  console.debug(`Create PC <${source}>`);
  let pc = _getPC({source});
  if (pc) return pc;

  pc = new RTCPeerConnection(ICE_CONFIG);
  _setPC({source, pc});

  if (onaddstream) pc.onaddstream = onaddstream;
  if (localStream) pc.addStream(localStream);

  // pc.onnegotiationneeded = () =>
  //   console.debug(`PC <${source}> - onnegotiationneeded`);

  pc.onicecandidate = event => {
    console.debug(`PC <${source}> - onicecandidate`);
    if (event.candidate)
      sendMessage({id: 'onIceCandidate', source, candidate: event.candidate});
  };

  pc.oniceconnectionstatechange = event => {
    console.debug(
      `PC <${source}> - oniceconnectionstatechange: `,
      event.target.iceConnectionState,
    );
    if (event.target.iceConnectionState === 'disconnected') closePC({source});
  };

  pc.onsignalingstatechange = event => {
    console.debug(
      `PC <${source}> - onsignalingstatechange: `,
      event.target.signalingState,
    );
    if (event.target.signalingState === 'stable') {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      const candidatesQueue = _getQueue({source});
      while (candidatesQueue && candidatesQueue.length) {
        pc.addIceCandidate(candidatesQueue.shift());
      }
    }
  };

  setTimeout(
    () => _createOffer({source, offerReceive: !localStream, sendMessage}),
    0,
  );

  return pc;
};

export const closePC = (options = {}) => {
  const {source} = options;
  console.debug(`Close PC <${source}>`);
  if (source === 'self') {
    if (_localStream) {
      _localStream.release();
      _localStream = null;
    }
    _isEnableAudio = true;
    _isEnableVideo = true;
  }
  if (!_pcs[source]) return;
  if (_pcs[source].pc && _pcs[source].pc.signalingState !== 'closed') {
    _pcs[source].pc.close();
    _pcs[source].pc = null;
  }
  delete _pcs[source];
};

export const stopCommunication = () => {
  console.debug('Stop communication');
  for (let source in _pcs) closePC({source});
  _pcs = {};
};

export const addIceCandidate = async (options = {}) => {
  const {source, iceCandidate} = options;
  console.debug(`PC <${source}> ICE candidate received, adding ICE candidate`);
  const pc = _getPC({source});
  if (!pc) throw new Error('PeerConnection does not exist');
  const candidate = new RTCIceCandidate(iceCandidate);
  if (pc.signalingState === 'stable' && pc.remoteDescription)
    return await pc.addIceCandidate(candidate);
  const candidatesQueue = _getQueue({source});
  if (candidatesQueue) candidatesQueue.push(candidate);
};

export const processAnswer = async (options = {}) => {
  const {source, sdpAnswer} = options;
  console.debug(
    `PC <${source}> SDP answer received, setting remote description`,
  );
  const pc = _getPC({source});
  if (!pc) throw new Error('PeerConnection does not exist');
  await pc.setRemoteDescription(
    new RTCSessionDescription({type: 'answer', sdp: sdpAnswer}),
  );
};

export const toggleAudio = () => {
  if (_localStream) {
    _isEnableAudio = !_isEnableAudio;
    _localStream
      .getAudioTracks()
      .forEach(track => (track.enabled = _isEnableAudio));
  }
  return _isEnableAudio;
};

export const toggleVideo = () => {
  if (_localStream) {
    _isEnableVideo = !_isEnableVideo;
    _localStream
      .getVideoTracks()
      .forEach(track => (track.enabled = _isEnableVideo));
  }
  return _isEnableVideo;
};

export const switchCamera = () => {
  if (_localStream)
    _localStream.getVideoTracks().forEach(track => track._switchCamera());
};
