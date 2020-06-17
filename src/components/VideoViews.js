import React from "react";
import { Segment } from "semantic-ui-react";
import { VideoView } from "../round-table-client";

const renderVideos = (table) => {
  const temp = [];
  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(
        <VideoView
          key={knightId}
          source={knightId}
          isConnected={table.knights[knightId].isConnected}
          style={{ width: "100%" }}
        />
      );
  }
  return temp;
};

const VideoViews = ({ table }) => {
  return (
    <Segment>
      <div style={{ display: "flex" }}>
        <div style={{ width: "75%", position: "relative" }}>
          <VideoView
            key="dispatcher"
            source="dispatcher"
            isConnected
            style={{ width: "100%" }}
          />
          <VideoView
            key="self"
            source="self"
            isConnected
            style={{ width: "33.3%", position: "absolute", top: 0, left: 0 }}
          />
        </div>
        <div style={{ width: "25%" }}>{renderVideos(table)}</div>
      </div>
    </Segment>
  );
};

export default VideoViews;
