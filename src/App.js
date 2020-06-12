import React, { useState, useCallback, useRef } from "react";
import { Container } from "semantic-ui-react";
import { Video, useRoundTable } from "./services/roundTableClient";

import StartPanel from "./components/StartPanel";
import TableControl from "./components/TableControl";

const renderVideos = (table) => {
  const temp = [];
  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(<Video key={knightId} source={knightId} />);
  }
  return temp;
};

const App = () => {
  const [table, setTable] = useState(null);
  const localVideoRef = useRef(null);

  // Round Table listeners
  const onMeetingStarted = useCallback((self, table) => {
    setTable({ ...table, self });
  }, []);

  const onMeetingStopped = useCallback(() => {
    setTable(null);
  }, []);

  const onKnightJoined = useCallback(({ knight, seatNumber }) => {
    setTable((table) => {
      const cloneKnights = { ...table.knights };
      cloneKnights[knight.id] = knight;

      if (seatNumber && table.seats[seatNumber]) {
        const cloneSeats = { ...table.seats };
        cloneSeats[seatNumber] = knight.id;
        return { ...table, knights: cloneKnights, seats: cloneSeats };
      }

      return { ...table, knights: cloneKnights };
    });
  }, []);

  const onKnightLeft = useCallback(({ knight, seatNumber, isRemoved }) => {
    setTable((table) => {
      const cloneKnights = { ...table.knights };
      delete cloneKnights[knight.id];

      if (seatNumber && table.seats[seatNumber]) {
        const cloneSeats = { ...table.seats };
        cloneSeats[seatNumber] = isRemoved ? "removed" : "available";
        return { ...table, knights: cloneKnights, seats: cloneSeats };
      }

      return { ...table, knights: cloneKnights };
    });
  }, []);

  const onSourceChanged = useCallback((source) => {
    setTable((table) => ({ ...table, source }));
  }, []);

  const onSeatsUpdated = useCallback(({ seats, numberOfSeats }) => {
    setTable((table) => ({ ...table, seats, numberOfSeats }));
  }, []);

  // Round Table
  const {
    join,
    leave,
    reserve,
    changeSource,
    generateSeats,
    kickout,
  } = useRoundTable({
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    onSeatsUpdated,
    localVideoRef: localVideoRef,
  });

  // TableControl handlers
  const handleChangeSource = (source) => changeSource(source);
  const handleKickout = (seatNumber) => kickout(seatNumber);
  const handleGenerateSeats = (numberOfSeats) => generateSeats(numberOfSeats);
  const handleLeave = () => leave();

  return (
    <Container>
      <div>
        <div>
          {!table ? (
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
              handleKickout={handleKickout}
              handleGenerateSeats={handleGenerateSeats}
              handleLeave={handleLeave}
              table={table}
            />
          )}
        </div>
        <video autoPlay muted controls ref={localVideoRef} />
        {table ? (
          <>
            <div>
              <Video key={"composite"} source={"composite"} />
              <Video key={"dispatcher"} source={"dispatcher"} />
            </div>
            <div>{renderVideos(table)}</div>
          </>
        ) : null}
      </div>
    </Container>
  );
};

export default App;
