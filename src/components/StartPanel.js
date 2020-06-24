import React, { useState } from "react";
import {
  Button,
  Segment,
  Divider,
  Input,
  Header,
  Icon,
} from "semantic-ui-react";
import { useRoundTable } from "../react-round-table";

const StartPanel = () => {
  const [seatNumber, setSeatNumber] = useState("");
  const { reserve, join } = useRoundTable();

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
              onClick={() => join({ seatNumber })}
            />
          }
        />

        <Divider horizontal>Or</Divider>

        <Button
          content="Reserve Table"
          icon="signup"
          size="big"
          onClick={() => reserve()}
        />
      </Segment>
    </Segment>
  );
};

export default StartPanel;
