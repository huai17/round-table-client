import io from 'socket.io-client';
import {handleConnectEvent, handleMessageEvent} from './event-utils';

let _socket = null;

export const sendMessage = message => {
  if (_socket) {
    console.debug(`Send Message: ${message.id}`);
    _socket.send(message);
  }
};

export const connect = address => {
  if (_socket) return;

  _socket = io(address + '/roundTable');

  _socket.on('connect', () => handleConnectEvent(_socket));
  _socket.on('message', message => handleMessageEvent(message));
};
