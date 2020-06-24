import React from "react";
import { Segment, Button, Header, Icon, List } from "semantic-ui-react";
import { useRoundTable } from "../react-round-table";

import VideoViews from "./VideoViews";
import ChatRoom from "./ChatRoom";

const renderSeats = ({ table, kickout }) => {
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
                  onClick={() => kickout({ seatNumber })}
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

const renderKnights = ({ table, changeSource }) => {
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
                  onClick={() => changeSource({ source: knightId })}
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
                  onClick={() => changeSource({ source: table.self.id })}
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

const TableControl = ({ table, streams }) => {
  const { generateSeats, leave, changeSource, kickout } = useRoundTable();

  return (
    <Segment textAlign="center" color="teal" inverted>
      <Header size="huge">
        <Icon name="chess knight" /> Round Table
      </Header>
      <Segment>
        {renderSeats({ table, kickout })}
        {renderKnights({ table, changeSource })}
        {table.self.id === table.king.id ? (
          <Button
            onClick={() => generateSeats()}
            content="Generate Seat"
            size="large"
          />
        ) : null}
        <Button
          onClick={() => leave()}
          content={
            table.self.id === table.king.id ? "Release Table" : "Leave Table"
          }
          size="large"
        />
        <VideoViews table={table} streams={streams} />
        <ChatRoom />
      </Segment>
    </Segment>
  );
};

export default TableControl;
