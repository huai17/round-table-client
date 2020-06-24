import React, {useEffect, useState, useMemo} from 'react';
import {RTCView} from 'react-native-webrtc';
import {useKnight} from '../libs/round-table-hooks-react-native';

const getStreamUrl = stream => {
  if (!stream) return null;
  return stream.toURL();
};

const RNVideoView = ({source, isConnected, ...props}) => {
  const [stream, setStream] = useState(null);
  const {connectPC, closePC} = useKnight({source});
  const streamURL = useMemo(() => getStreamUrl(stream), [stream]);

  useEffect(() => {
    if (isConnected || source === 'self' || source === 'dispatcher')
      connectPC({
        onStreamReady: ({stream}) => setStream(stream),
      });
    return () => closePC();
  }, [connectPC, closePC, isConnected, source]);

  return (
    <RTCView mirror={source === 'self'} streamURL={streamURL} {...props} />
  );
};

export default RNVideoView;
