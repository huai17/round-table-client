import React, { useState, useCallback } from "react";
import { Container } from "semantic-ui-react";
import { useRoundTable } from "./round-table-client";

import StartPanel from "./components/StartPanel";
import TableControl from "./components/TableControl";

const App = () => {
  const [table, setTable] = useState(null);

  // Round Table listeners
  const onMeetingStarted = useCallback(({ self, table }) => {
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

  const onKnightConnected = useCallback(({ knight }) => {
    setTable((table) => {
      const cloneKnights = { ...table.knights };
      if (!cloneKnights[knight.id]) cloneKnights[knight.id] = knight;
      cloneKnights[knight.id].isConnected = true;
      return { ...table, knights: cloneKnights };
    });
  }, []);

  const onSourceChanged = useCallback(({ source }) => {
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
    onKnightConnected,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    onSeatsUpdated,
  });

  // TableControl handlers
  const handleChangeSource = (source) => changeSource({ source });
  const handleKickout = (seatNumber) => kickout({ seatNumber });
  const handleGenerateSeats = (numberOfSeats) =>
    generateSeats({ numberOfSeats });
  const handleLeave = () => leave();

  return (
    <Container>
      {table ? (
        <TableControl
          handleChangeSource={handleChangeSource}
          handleKickout={handleKickout}
          handleGenerateSeats={handleGenerateSeats}
          handleLeave={handleLeave}
          table={table}
        />
      ) : (
        <StartPanel
          handleReserveTable={() => {
            reserve();
          }}
          handleJoinTable={(seatNumber) => {
            join({ seatNumber });
          }}
        />
      )}
    </Container>
  );
};

export default App;
