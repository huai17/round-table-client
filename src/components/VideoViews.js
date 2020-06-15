import React from "react";
import { Segment } from "semantic-ui-react";
import { Video } from "../services/roundTableClient";

const renderVideos = (table) => {
  const temp = [];
  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(
        <Video key={knightId} source={knightId} style={{ width: "100%" }} />
      );
  }
  return temp;
};

const VideoViews = ({ table }) => {
  return (
    <Segment>
      <div style={{ display: "flex" }}>
        <div style={{ width: "75%", position: "relative" }}>
          <Video
            key="dispatcher"
            source="dispatcher"
            style={{ width: "100%" }}
          />
          <Video
            key="me"
            source="me"
            style={{ width: "33.3%", position: "absolute", top: 0, left: 0 }}
          />
        </div>
        <div style={{ width: "25%" }}>{renderVideos(table)}</div>
      </div>
    </Segment>
  );
};

export default VideoViews;
