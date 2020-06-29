import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button, Input, List, Segment } from "semantic-ui-react";
import { useRoundTable } from "../react-round-table";

const ChatBox = () => {
  const [value, setValue] = useState("");
  const { chat } = useRoundTable();

  const send = () => {
    chat({ message: value });
    setValue("");
  };

  return (
    <Input
      size="big"
      icon="pencil"
      iconPosition="left"
      placeholder="Chat..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyPress={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        value && send();
      }}
      action={
        <Button content="Send" size="big" onClick={() => value && send()} />
      }
    />
  );
};

const ChatList = ({ chatList }) => {
  const end = useRef(null);

  useEffect(() => {
    chatList.length && end.current.scrollIntoView({ behavior: "smooth" });
  }, [chatList]);

  return (
    <List relaxed style={{ height: 200, overflowY: "auto" }}>
      {chatList}
      <div ref={end}></div>
    </List>
  );
};

const ChatRoom = ({ selfId }) => {
  const [chatList, setChatList] = useState([]);

  const onChatReceived = useCallback(
    ({ id, message, knight }) => {
      setChatList((chatList) => [
        ...chatList,
        <List.Item key={knight.id + id}>
          <List.Header style={selfId === knight.id ? { color: "green" } : null}>
            {knight.name}
          </List.Header>
          <List.Description>{message}</List.Description>
        </List.Item>,
      ]);
    },
    [selfId]
  );

  const onKnightJoined = useCallback(({ knight }) => {
    setChatList((chatList) => [
      ...chatList,
      <List.Item
        key={knight.id + new Date().toDateString()}
        style={{ color: "#ABB2B9" }}
      >
        {knight.name} Joind
      </List.Item>,
    ]);
  }, []);

  const onKnightLeft = useCallback(({ knight }) => {
    setChatList((chatList) => [
      ...chatList,
      <List.Item
        key={knight.id + new Date().toDateString()}
        style={{ color: "#ABB2B9" }}
      >
        {knight.name} Left
      </List.Item>,
    ]);
  }, []);

  useRoundTable({
    onChatReceived,
    onKnightJoined,
    onKnightLeft,
  });

  return (
    <Segment textAlign="left">
      <ChatList chatList={chatList} />
      <ChatBox />
    </Segment>
  );
};

export default ChatRoom;
