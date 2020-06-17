import React from "react";
import { Segment, Button, Header, Icon, List } from "semantic-ui-react";
import VideoViews from "./VideoViews";

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
          content={
            <span>
              {knightId === table.source ? "🦄" : "🐴"}
              {table.knights[knightId].name}
              {table.self.id === table.king.id && knightId !== table.source ? (
                <Button
                  onClick={() => handleChangeSource(knightId)}
                  content="Change Source"
                  size="mini"
                />
              ) : null}
            </span>
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
          content={
            <span>
              {table.self.id === table.source ? "🦄" : "🐴"}
              {table.self.name}
              {table.self.id === table.king.id &&
              table.self.id !== table.source ? (
                <Button
                  onClick={() => handleChangeSource(table.self.id)}
                  content="Change Source"
                  size="mini"
                />
              ) : null}
            </span>
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
      <VideoViews table={table} />
    </Segment>
  </Segment>
);

export default TableControl;
