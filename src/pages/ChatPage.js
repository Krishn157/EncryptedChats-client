import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { loadUser } from "../actions/auth";

let stompClient = null;
const ChatPage = ({ curruser }) => {
  const [text, setText] = useState("");
  useEffect(() => {
    if (curruser !== null) connect();
  }, [curruser]);

  const connect = () => {
    const Stomp = require("stompjs");
    let SockJS = require("sockjs-client");
    SockJS = new SockJS("http://localhost:8080/e2eechat");
    stompClient = Stomp.over(SockJS);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    console.log(curruser);
    stompClient.subscribe(
      "/user/" + curruser.userId + "/queue/messages",
      onMessageReceived
    );
  };

  const onError = (err) => {
    console.log(err);
  };

  const onMessageReceived = (msg) => {
    console.log("message received");
    const notification = JSON.parse(msg.body);
    console.log(notification);
  };

  const sendMessage = (msg) => {
    if (msg.trim() !== "") {
      const message = {
        sender: curruser,
        message: msg,
        timestamp: new Date(),
      };
      stompClient.send("/cryptoaes/chat", {}, JSON.stringify(message));
      console.log("send...");
    }
  };

  return (
    <div>
      <h1>Chat Page</h1>
      <div className="message-input">
        <div className="wrap">
          <input
            name="user_input"
            size="large"
            placeholder="Write your message..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                sendMessage(text);
                setText("");
              }
            }}
          />

          <button
            onClick={() => {
              sendMessage(text);
              setText("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  curruser: state.auth.user,
});

export default connect(mapStateToProps)(ChatPage);
