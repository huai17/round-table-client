import React from "react";
import { Segment } from "semantic-ui-react";
import { VideoView } from "../react-round-table";

const renderVideos = ({ table, streams }) => {
  const temp = [];
  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(
        <div
          key={knightId}
          style={{
            width: "100%",
            position: "relative",
            height: 0,
            paddingTop: "100%",
            backgroundColor: "#000",
          }}
        >
          <VideoView
            stream={streams[knightId]}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              objectFit: "contain",
            }}
          />
        </div>
      );
  }
  return temp;
};

const VideoViews = ({ table, streams }) => {
  return (
    <Segment>
      <div style={{ display: "flex", position: "relative" }}>
        <div
          style={{
            width: "75%",
            height: 0,
            paddingTop: "75%",
            backgroundColor: "#000",
            position: "relative",
          }}
        >
          <VideoView
            key="host"
            stream={streams[table.source]}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              objectFit: "contain",
            }}
          />
        </div>
        <div
          style={{
            width: "25%",
            height: 0,
            paddingTop: "25%",
            backgroundColor: "#000",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <VideoView
            key="self"
            mirror
            stream={streams[table.self.id]}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              objectFit: "contain",
            }}
          />
        </div>
        <div style={{ width: "25%" }}>{renderVideos({ table, streams })}</div>
      </div>
    </Segment>
  );
};

export default VideoViews;
