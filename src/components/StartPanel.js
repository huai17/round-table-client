import React, { useState } from "react";
import {
  Button,
  Segment,
  Divider,
  Input,
  Header,
  Icon,
} from "semantic-ui-react";

const StartPanel = ({ handleReserveTable, handleJoinTable }) => {
  const [seatNumber, setSeatNumber] = useState("");

  return (
    <Segment textAlign="center" color="teal" inverted>
      <Header size="huge">
        <Icon name="chess knight" /> Round Table
      </Header>
      <Segment textAlign="center">
        <Input
          size="big"
          icon="ticket"
          iconPosition="left"
          placeholder="Seat Number"
          onChange={(event) => setSeatNumber(event.target.value)}
          value={seatNumber}
          action={
            <Button
              content="Join Table"
              size="big"
              onClick={() => {
                handleJoinTable(seatNumber);
              }}
            />
          }
        />

        <Divider horizontal>Or</Divider>

        <Button
          content="Reserve Table"
          icon="signup"
          size="big"
          onClick={() => {
            handleReserveTable();
          }}
        />
      </Segment>
    </Segment>
  );
};

export default StartPanel;
