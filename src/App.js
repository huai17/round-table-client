import React, { useState, useCallback, useRef } from "react";
import { Container } from "semantic-ui-react";
import { Video, useRoundTable } from "./services/roundTableClient";

import StartPanel from "./components/StartPanel";
import TableControl from "./components/TableControl";

const renderVideos = (knights) =>
  knights.map((knight) => <Video key={knight.id} source={knight.id} />);

const App = () => {
  const [source, setSource] = useState(null);
  const [self, setSelf] = useState(null);
  const [knights, setKnights] = useState([]);
  const [table, setTable] = useState(null);

  const [isStarting, setIsStarting] = useState(false);
  const localVideoRef = useRef(null);

  const onMeetingStarted = useCallback((self, table) => {
    setTable(table);
    setSelf(self);
    setSource(table.source);
    setKnights((knights) => {
      const newKnights = knights.concat();
      for (let key in table.knights) {
        if (self.id !== key) newKnights.push(table.knights[key]);
      }
      return newKnights;
    });
    setIsStarting(true);
  }, []);

  const onMeetingStopped = useCallback(() => {
    setIsStarting(false);
    setTable(null);
    setSelf(null);
    setSource(null);
    setKnights([]);
  }, []);

  const onKnightJoined = useCallback((knight) => {
    setKnights((knights) => {
      if (knights.find((_knight) => _knight.id === knight.id)) return knights;
      return [...knights, knight];
    });
  }, []);

  const onKnightLeft = useCallback((knight) => {
    setKnights((knights) => {
      const index = knights.findIndex((_knight) => _knight.id === knight.id);
      if (index === -1) return knights;
      const newKnights = knights.concat();
      newKnights.splice(index, 1);
      return newKnights;
    });
  }, []);

  const onSourceChanged = useCallback((source) => {
    setSource(source);
  }, []);

  const { join, leave, reserve, changeSource } = useRoundTable({
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    localVideoRef: localVideoRef,
  });

  const handleChangeSource = (source) => {
    changeSource(source);
  };

  const handleLeave = () => {
    leave();
  };

  return (
    <Container>
      <div>
        <div>
          {!isStarting ? (
            <StartPanel
              handleReserveTable={() => {
                reserve({});
              }}
              handleJoinTable={(seatNumber) => {
                join({ seatNumber });
              }}
            />
          ) : (
            <TableControl
              handleChangeSource={handleChangeSource}
              handleLeave={handleLeave}
              source={source}
              self={self}
              knights={knights}
              table={table}
            />
          )}
        </div>
        <video autoPlay muted ref={localVideoRef} />
        <div>
          {isStarting ? (
            <>
              <Video key={"composite"} source={"composite"} />
              <Video key={"dispatcher"} source={"dispatcher"} />
            </>
          ) : null}
        </div>
        <div>{renderVideos(knights)}</div>
      </div>
    </Container>
  );
};

export default App;
