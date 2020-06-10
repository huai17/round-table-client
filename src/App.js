import React, { useState, useCallback } from "react";

import { Video, useRoundTable } from "./services/roundTableClient";

const renderVideos = (sources) =>
  sources.map((source) => <Video key={source} source={source} />);

const App = () => {
  const [sources, setSources] = useState([]);

  const [tableId, setTableId] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");

  const onParticipantJoined = useCallback((sources) => {
    setSources((_sources) => {
      const set = new Set(_sources);
      sources.forEach(set.add, set);
      return Array.from(set);
    });
  }, []);

  const onParticipantLeft = useCallback((sources) => {
    setSources((_sources) => {
      const set = new Set(_sources);
      sources.forEach(set.delete, set);
      return Array.from(set);
    });
  }, []);

  const { join, leave, reserve, release } = useRoundTable({
    onParticipantJoined,
    onParticipantLeft,
  });

  return (
    <div>
      <div>
        <div>
          <button
            onClick={() => {
              console.log("reserve table");
              reserve();
            }}
          >
            Reserve Table
          </button>
        </div>

        <div>
          <input
            onChange={(event) => setTableId(event.target.value)}
            value={tableId}
          />
          <button
            onClick={() => {
              console.log(`release table: ${tableId}`);
              release();
            }}
          >
            Release Table
          </button>
        </div>

        <div>
          <input
            onChange={(event) => setToken(event.target.value)}
            value={token}
          />
          <input
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
          <button
            onClick={() => {
              console.log(`${name} join table: ${token}`);
              join({ name, token });
            }}
          >
            Join
          </button>
        </div>

        <div>
          <button
            onClick={() => {
              console.log(`leave table`);
              leave();
            }}
          >
            Leave
          </button>
        </div>
      </div>
      <div>{renderVideos(sources)}</div>
    </div>
  );
};

export default App;
