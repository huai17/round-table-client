import React, { useState, useCallback } from "react";

import { Video, useRoundTable } from "./services/roundTableClient";

const renderVideos = (sources) =>
  sources.map((source) => <Video key={source} source={source} />);

const App = () => {
  const [sources, setSources] = useState([]);
  const [token, setToken] = useState("");
  const [table, setTable] = useState(null);
  const [host, setHost] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const onMeetingStarted = useCallback(() => {
    setIsStarting(true);
  }, []);

  const onMeetingStopped = useCallback(() => {
    setIsStarting(false);
    setTable(null);
    setToken("");
    setSources([]);
  }, []);

  const onSourceChanged = useCallback((hostId) => {
    setHost(hostId);
  }, []);

  const onTableReserved = useCallback((table) => {
    setTable(table);
    setHost(table.host);
  }, []);

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

  const { join, leave, reserve, release, changeSource } = useRoundTable({
    onParticipantJoined,
    onParticipantLeft,
    onTableReserved,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
  });

  return (
    <div>
      <div>
        {!isStarting ? (
          <div>
            <div>
              <button
                onClick={() => {
                  reserve({});
                }}
              >
                Reserve Table
              </button>
            </div>
            <div>OR</div>
            <div>
              <input
                onChange={(event) => setToken(event.target.value)}
                value={token}
              />
              <button
                onClick={() => {
                  join({ token });
                }}
              >
                Join
              </button>
            </div>
          </div>
        ) : table ? (
          <div>
            <div>
              <div>Tokens:</div>
              <div>
                {table.seats.map((seatNumber) => (
                  <div key={seatNumber}>{seatNumber}</div>
                ))}
              </div>
            </div>
            <div>
              <div>Participants:</div>
              <button
                onClick={() => {
                  changeSource("me");
                }}
              >
                Get Back Host
              </button>
              <div>
                {sources.map((source) => (
                  <div key={source}>
                    <button
                      onClick={() => {
                        changeSource(source);
                      }}
                    >
                      Change Host
                    </button>{" "}
                    {source} - {host === source ? "HOST" : null}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                release();
              }}
            >
              Release Table
            </button>
          </div>
        ) : (
          <div>
            <div>
              <div>Participants:</div>
              <div>
                {sources.map((source) => (
                  <div key={source}>
                    {source} - {host === source ? "HOST" : null}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                leave();
              }}
            >
              Leave Table
            </button>
          </div>
        )}
      </div>
      <div>
        {isStarting ? (
          <>
            <Video key={"composite"} source={"composite"} />
            <Video key={"dispatcher"} source={"dispatcher"} />
          </>
        ) : null}
      </div>
      <div>{renderVideos(sources)}</div>
    </div>
  );
};

export default App;
