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
        if (value) {
          send();
        }
      }}
      action={<Button content="Send" size="big" onClick={() => send()} />}
    />
  );
};

const renderChat = (chatList) => {
  return chatList.map((chat) => (
    <div key={chat.knight.id + chat.id}>
      {chat.knight.name}: {chat.message}
    </div>
  ));
};

const ChatRoom = () => {
  const [chatList, setChatList] = useState([]);

  useRoundTable({
    onChatReceived: (message) => {
      setChatList((chatList) => [...chatList, message]);
    },
  });

  return (
    <>
      <ChatBox />
      {renderChat(chatList)}
    </>
  );
};

export default ChatRoom;
