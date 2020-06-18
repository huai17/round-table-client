import React, { useRef, useEffect } from "react";

import { useKnight } from "../libs/hooks";

const VideoView = ({ source, isConnected, style, ...props }) => {
  const videoRef = useRef(null);
  const { connectPeer, disposePeer } = useKnight({ source });

  // function playPause() {
  //   if (videoRef.current.paused) videoRef.current.play();
  //   else videoRef.current.pause();
  // }

  useEffect(() => {
    if (isConnected || source === "self" || source === "dispatcher")
      connectPeer(videoRef);
    return () => {
      disposePeer();
    };
  }, [connectPeer, disposePeer, isConnected, source]);

  return (
    <video
      poster="https://i.pinimg.com/originals/60/f6/e7/60f6e7294309c3ec67855e35eb1912da.gif"
      ref={videoRef}
      autoPlay
      muted
      {...props}
      style={
        source === "self" ? { ...style, transform: "rotateY(180deg)" } : style
      }
    />
  );
};

export default VideoView;
