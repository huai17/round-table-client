import React from "react";
import { Segment, Button, Header, Icon, List } from "semantic-ui-react";

const renderSeats = (table) =>
  table.seats ? (
    <Segment textAlign="left">
      <Header size="small">
        <Icon name="ticket" /> Seat Numbers
      </Header>
      <List>
        {table.seats.map((seatNumber) => (
          <List.Item key={seatNumber} content={seatNumber} />
        ))}
      </List>
    </Segment>
  ) : null;

const renderKnights = ({
  self,
  knights,
  source,
  table,
  isKing,
  handleChangeSource,
}) => (
  <Segment textAlign="left">
    <Header size="small">
      <Icon name="users" /> Participants
    </Header>

    <List>
      <List.Item
        key={self.id}
        icon={table.king.id === self.id ? "chess king" : "chess knight"}
        content={
          <>
            <span style={{ color: self.id === source ? "green" : undefined }}>
              {self.name}
            </span>
            {isKing && self.id !== source ? (
              <Button
                onClick={() => handleChangeSource(self.id)}
                content="Change Source"
                size="mini"
              />
            ) : null}
          </>
        }
      />
      {knights.map((knight) =>
        self.id !== knight.id ? (
          <List.Item
            key={knight.id}
            icon={table.king.id === knight.id ? "chess king" : "chess knight"}
            content={
              <>
                <span
                  style={{ color: knight.id === source ? "green" : undefined }}
                >
                  {knight.name}
                </span>
                {isKing && knight.id !== source ? (
                  <Button
                    onClick={() => handleChangeSource(knight.id)}
                    content="Change Source"
                    size="mini"
                  />
                ) : null}
              </>
            }
          />
        ) : null
      )}
    </List>
  </Segment>
);

const TableControl = ({
  handleChangeSource,
  handleLeave,
  source,
  self,
  knights,
  table,
}) => {
  const isKing = self.id === table.king.id;

  return (
    <Segment textAlign="center" color="teal" inverted>
      <Header size="huge">
        <Icon name="chess knight" /> Round Table
      </Header>
      <Segment>
        {renderSeats(table)}
        {renderKnights({
          self,
          knights,
          source,
          table,
          isKing,
          handleChangeSource,
        })}
        <Button
          onClick={() => handleLeave()}
          content={isKing ? "Release Table" : "Leave Table"}
          size="large"
        />
      </Segment>
    </Segment>
  );
};

export default TableControl;
