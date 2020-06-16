import React, { useRef, useEffect } from "react";

import { useKnight } from "../libs/hooks";

const VideoView = ({ source, style, ...props }) => {
  const videoRef = useRef(null);
  const { connectPeer, disposePeer } = useKnight({ source });

  // function playPause() {
  //   if (videoRef.current.paused) videoRef.current.play();
  //   else videoRef.current.pause();
  // }

  useEffect(() => {
    connectPeer(videoRef);
    return () => {
      disposePeer();
    };
  }, [connectPeer, disposePeer]);

  return (
    <video
      ref={videoRef}
      autoPlay
      {...props}
      style={
        source === "self" ? { ...style, transform: "rotateY(180deg)" } : style
      }
    />
  );
};

export default VideoView;
