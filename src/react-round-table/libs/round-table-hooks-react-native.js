import {useEffect, useCallback} from 'react';

import {
  reserve,
  join,
  leave,
  changeSource,
  generateSeats,
  kickout,
  chat,
  connectPC,
  closePC,
  setEventListener,
  toggleAudio,
  toggleVideo,
  switchCamera,
} from '../cores/react-native';

export const useRoundTable = (options = {}) => {
  const {
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onKnightConnected,
    onSourceChanged,
    onSeatsUpdated,
    onChat,
    onError,
  } = options;

  useEffect(() => {
    if (onKnightJoined) setEventListener('onKnightJoined', onKnightJoined);
  }, [onKnightJoined]);

  useEffect(() => {
    if (onKnightLeft) setEventListener('onKnightLeft', onKnightLeft);
  }, [onKnightLeft]);

  useEffect(() => {
    if (onKnightConnected)
      setEventListener('onKnightConnected', onKnightConnected);
  }, [onKnightConnected]);

  useEffect(() => {
    if (onMeetingStarted)
      setEventListener('onMeetingStarted', onMeetingStarted);
  }, [onMeetingStarted]);

  useEffect(() => {
    if (onMeetingStopped)
      setEventListener('onMeetingStopped', onMeetingStopped);
  }, [onMeetingStopped]);

  useEffect(() => {
    if (onSourceChanged) setEventListener('onSourceChanged', onSourceChanged);
  }, [onSourceChanged]);

  useEffect(() => {
    if (onSeatsUpdated) setEventListener('onSeatsUpdated', onSeatsUpdated);
  }, [onSeatsUpdated]);

  useEffect(() => {
    if (onChat) setEventListener('onChat', onChat);
  }, [onChat]);

  useEffect(() => {
    if (onError) setEventListener('onError', onError);
  }, [onError]);

  return {
    join,
    leave,
    reserve,
    changeSource,
    generateSeats,
    kickout,
    chat,
    connectPC,
    closePC,
    toggleAudio,
    toggleVideo,
    switchCamera,
  };
};

export const useKnight = ({source}) => {
  const _connectPC = useCallback(options => connectPC({source, ...options}), [
    source,
  ]);
  const _closePC = useCallback(options => closePC({source, ...options}), [
    source,
  ]);
  return {connectPC: _connectPC, closePC: _closePC};
};

// export const useChatRoom = (options = {}) => {
//   const {onChat} = options;
//   const [messages, setMessages] = useState([]);

//   const _chat = useCallback(message => {
//     chat(message);
//     setMessages(messages => [...messages, {name: 'Me', message}]);
//   }, []);

//   useEffect(() => {
//     if (onChat)
//       setEventListener('onChat', message => {
//         onChat(message);
//         setMessages(messages => [
//           ...messages,
//           {name: message.knight.name, message: message.message},
//         ]);
//       });
//   }, [onChat]);

//   return [messages, _chat];
// };
