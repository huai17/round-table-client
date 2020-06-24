import {getLocalStream, createPC, stopCommunication} from './webrtc-utils';
import {sendMessage} from './signal-utils';

export {closePC, toggleAudio, toggleVideo, switchCamera} from './webrtc-utils';
export {connect} from './signal-utils';
export {setEventListener} from './event-utils';

export const connectPC = async (options = {}) => {
  const {source, onStreamReady} = options;
  console.debug(`Connect PC <${source}>`);
  const createPCOptions = {source, sendMessage};
  if (source === 'self') {
    const localStream = await getLocalStream();
    createPCOptions.localStream = localStream;
    if (onStreamReady) onStreamReady({stream: localStream});
  } else {
    if (onStreamReady) createPCOptions.onaddstream = onStreamReady;
  }
  return createPC(createPCOptions);
};

export const reserve = (options = {}) => {
  const {numberOfSeats, name} = options;
  sendMessage({id: 'reserve', numberOfSeats, name});
};

export const join = (options = {}) => {
  const {seatNumber, name} = options;
  if (!seatNumber) return;
  sendMessage({id: 'join', seatNumber, name});
};

export const leave = () => {
  sendMessage({id: 'leave'});
  stopCommunication();
};

export const changeSource = (options = {}) => {
  const {source} = options;
  sendMessage({id: 'changeSource', source});
};

export const generateSeats = (options = {}) => {
  const {numberOfSeats} = options;
  sendMessage({id: 'generateSeats', numberOfSeats});
};

export const kickout = (options = {}) => {
  const {seatNumber} = options;
  sendMessage({id: 'kickout', seatNumber});
};

export const chat = (options = {}) => {
  const {message} = options;
  sendMessage({id: 'chat', message});
};
