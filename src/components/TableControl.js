import React from "react";
import { Segment, Button, Header, Icon, List } from "semantic-ui-react";
import { Video } from "../services/roundTableClient";

const renderVideos = (table) => {
  const temp = [];
  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(<Video key={knightId} source={knightId} />);
  }
  return temp;
};

const renderSeats = ({ table, handleKickout }) => {
  if (!table.seats) return null;

  const temp = [];

  for (const seatNumber in table.seats) {
    switch (table.seats[seatNumber]) {
      case "available":
        temp.push(
          <List.Item key={seatNumber} content={`${seatNumber} - available`} />
        );
        break;
      case "removed":
        temp.push(
          <List.Item key={seatNumber} content={`${seatNumber} - removed`} />
        );
        break;
      default:
        temp.push(
          <List.Item
            key={seatNumber}
            content={
              <>
                <span>
                  {seatNumber} - {table.knights[table.seats[seatNumber]].name}
                </span>

                <Button
                  onClick={() => handleKickout(seatNumber)}
                  content="Kick Out"
                  size="mini"
                />
              </>
            }
          />
        );
    }
  }

  return (
    <Segment textAlign="left">
      <Header size="small">
        <Icon name="ticket" /> Seat Numbers
      </Header>
      <List>{temp}</List>
    </Segment>
  );
};

const renderKnights = ({ table, handleChangeSource, handleKickout }) => {
  const temp = [];

  for (const knightId in table.knights) {
    if (table.self.id !== knightId)
      temp.push(
        <List.Item
          key={knightId}
          icon={table.king.id === knightId ? "chess king" : "chess knight"}
          content={
            <>
              <span
                style={{
                  color: knightId === table.source ? "green" : undefined,
                }}
              >
                {table.knights[knightId].name}
              </span>
              {table.self.id === table.king.id && knightId !== table.source ? (
                <Button
                  onClick={() => handleChangeSource(knightId)}
                  content="Change Source"
                  size="mini"
                />
              ) : null}
            </>
          }
        />
      );
  }

  return (
    <Segment textAlign="left">
      <Header size="small">
        <Icon name="users" /> Participants
      </Header>

      <List>
        <List.Item
          key={table.self.id}
          icon={table.king.id === table.self.id ? "chess king" : "chess knight"}
          content={
            <>
              <span
                style={{
                  color: table.self.id === table.source ? "green" : undefined,
                }}
              >
                {table.self.name}
              </span>
              {table.self.id === table.king.id &&
              table.self.id !== table.source ? (
                <Button
                  onClick={() => handleChangeSource(table.self.id)}
                  content="Change Source"
                  size="mini"
                />
              ) : null}
            </>
          }
        />
        {temp}
      </List>
    </Segment>
  );
};

const TableControl = ({
  handleChangeSource,
  handleKickout,
  handleGenerateSeats,
  handleLeave,
  table,
}) => (
  <Segment textAlign="center" color="teal" inverted>
    <Header size="huge">
      <Icon name="chess knight" /> Round Table
    </Header>
    <Segment>
      {renderSeats({ table, handleKickout })}
      {renderKnights({ table, handleChangeSource, handleKickout })}
      {table.self.id === table.king.id ? (
        <Button
          onClick={() => handleGenerateSeats()}
          content="Generate Seat"
          size="large"
        />
      ) : null}
      <Button
        onClick={() => handleLeave()}
        content={
          table.self.id === table.king.id ? "Release Table" : "Leave Table"
        }
        size="large"
      />
      <Segment>
        <Video key="me" source="me" />
        <Video key="dispatcher" source="dispatcher" />
        {renderVideos(table)}
      </Segment>
    </Segment>
  </Segment>
);

export default TableControl;
