import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";

import ScrollToBottom from "react-scroll-to-bottom";
import Spinner from "../components/Spinner";
import encrypted from "../assets/encrypted.svg";
import url from "../constants/Url";
import { Fragment } from "react";
import { logout } from "../actions/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Picker, { SKIN_TONE_NEUTRAL } from "emoji-picker-react";

import aes256 from "aes256";

// Notice for JAVA KING !
// contact={
//   id:"",
//   user_id:"--"
// }

// @Krishn
// go to line 186

let stompClient = null;
let activeC = null;
let quantumKeyG = null;
const Chat = ({ logout, curruser, loading }) => {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [quantumKey, setQuantumKey] = useState("");
  const [conn, setConn] = useState(false);
  const [msgloading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [chosenEmoji, setChosenEmoji] = useState(null);
  const toastId = "toastifyId";

  useEffect(() => {
    if (curruser !== null) {
      axios
        .get(url + `/get_all/${curruser.userId}`)
        .then((res) => {
          setContacts(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [curruser]);

  useEffect(() => {
    if (curruser !== null) {
      connect();
    }
  }, [curruser]);

  const fetchMessages = (userId) => {
    console.log("userId", userId);
    console.log("activeContact", activeC);
    axios
      .get(`${url}/messages/${userId}/${activeC}`)
      .then((res) => {
        console.log("res", res.data);
        setMessagesDecrypted(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const connect = () => {
    const Stomp = require("stompjs");
    let SockJS = require("sockjs-client");
    SockJS = new SockJS(`${url}/e2eechat`);
    stompClient = Stomp.over(SockJS);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    try {
      stompClient.subscribe(
        "/user/" + curruser.userId + "/queue/messages",
        onMessageReceived
      );
      setConn(true);
    } catch (err) {
      console.log(err.message);
    }
  };

  const onError = (err) => {
    console.log(err);
  };

  const onMessageReceived = (msg) => {
    const notification = JSON.parse(msg.body);
    if (activeC === notification.sender) {
      fetchMessages(curruser.userId);
    }
    if (activeC !== notification.sender || activeC === null) {
      toast(`Received a message from ${notification.sender}`, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId,
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      const ts = new Date();
      const msgIm = {};
      msgIm["timestamp"] = ts;
      msgIm["id"] = null;
      msgIm["message"] = message;
      msgIm["sender"] = { id: 0, userId: curruser.userId };
      msgIm["recipient"] = { id: 0, userId: activeContact };
      setMessages([...messages, msgIm]);
      const encryptedmsg = aes256.encrypt(quantumKey, message);

      const messageReq = {
        senderId: curruser.userId,
        recipientId: activeContact,
        encryptedmsg,
        timestamp: ts,
      };
      stompClient.send("/cryptoaes/chat", {}, JSON.stringify(messageReq));
      setMessage("");
      // setTimeout(() => {
      //   fetchMessages(curruser.userId);
      // }, 700);
    }
  };

  useEffect(() => {
    console.log("inside use effect");
    if (activeContact !== null && quantumKey.length > 0) {
      console.log("fetch messages called");
      fetchMessages(curruser.userId);
    }
  }, [activeContact, quantumKey]);

  const setMessagesDecrypted = (messagesData) => {
    setLoading(true);
    setMessages(
      messagesData.map((msg) => {
        if (
          (msg.sender.userId === curruser.userId &&
            msg.recipient.userId === activeC) ||
          (msg.sender.userId === activeC &&
            msg.recipient.userId === curruser.userId)
        ) {
          // console.log(msg.message);

          msg.message = aes256.decrypt(quantumKeyG, msg.message);
        }
        return msg;
      })
    );
    setLoading(false);
  };

  const getDateFormat = (timestamp) => {
    let date = new Date(timestamp);
    let mon = date.getMonth() + 1;
    mon = mon.toString().length < 2 ? "0" + mon.toString() : mon;
    date =
      date.getDate() +
      "/" +
      mon +
      "/" +
      date.getFullYear().toString().substr(2);
    const time = new Date(timestamp)
      .toLocaleTimeString()
      .replace(/(.*)\D\d+/, "$1");
    return date + " " + time;
  };

  useEffect(() => {
    if (activeContact !== null && curruser !== null) {
      axios
        .get(url + "/keys/", {
          params: {
            user_1: curruser.userId,
            user_2: activeContact,
          },
        })
        .then((res) => {
          console.log(res.data);
          setQuantumKey(res.data);
          quantumKeyG = res.data;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [activeContact, curruser]);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
    setMessage(message + emojiObject.emoji);
  };

  return loading || curruser == null || !conn ? (
    <Spinner />
  ) : (
    <>
      <div className="container">
        <div className="content">
          <div className="left">
            <div className="left-top">
              <h2>{curruser.userId}</h2>
            </div>
            <br></br>
            <div className="left-content">
              {contacts.map((contact) => (
                <div
                  onClick={() => {
                    setMessage("");
                    setActiveContact(contact.user_id);
                    activeC = contact.user_id;
                  }}
                  className={
                    activeContact && contact.user_id === activeContact
                      ? "contact-list active"
                      : "contact-list"
                  }
                  key={contact.user_id}
                >
                  <p>{contact.user_id}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="right">
            <i
              className="fas fa-sign-out-alt log"
              aria-hidden="true"
              onClick={() => logout()}
            ></i>
            <div className="right-top">
              {activeContact === null ? (
                <h3>All your chats are End-to-End encrypted !</h3>
              ) : (
                <h3>{activeContact}</h3>
              )}
            </div>
            <div className="right-content">
              <br></br>
              {activeContact === null ? (
                <img
                  src={encrypted}
                  alt="Encrypted Chats"
                  style={{
                    width: "400px",
                    margin: "auto",
                    display: "block",
                  }}
                />
              ) : (
                <Fragment>
                  {messages.length > 0 ? (
                    <ScrollToBottom className="messages">
                      {msgloading ? (
                        <Spinner />
                      ) : (
                        messages.map((msg, index) => {
                          if (
                            msg.recipient.userId === activeContact ||
                            msg.sender.userId === activeContact
                          ) {
                            return (
                              <span
                                key={index}
                                className={
                                  activeContact === msg.recipient.userId
                                    ? "sent"
                                    : "replies"
                                }
                              >
                                {msg.message}

                                {/*krishn isko show karna aapka kaam  */}
                                {/* <br /> */}
                                {"           "}
                                <sub class="time">
                                  {getDateFormat(msg.timestamp)}
                                </sub>
                              </span>
                            );
                          }
                        })
                      )}
                    </ScrollToBottom>
                  ) : (
                    <div className="messages">
                      <img
                        src={encrypted}
                        alt="Encrypted Chats"
                        style={{
                          width: "400px",
                          margin: "auto",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <div className="send-messages">
                    {showPicker && (
                      <div className="emoji-container">
                        <Picker
                          skinTone={SKIN_TONE_NEUTRAL}
                          preload={true}
                          onEmojiClick={onEmojiClick}
                          native={true}
                        />
                      </div>
                    )}

                    <i
                      className="far fa-grin-beam emoji-custom"
                      onClick={(e) => setShowPicker(!showPicker)}
                    ></i>
                    <input
                      style={{ width: "78.7%" }}
                      className="app-input"
                      name="user_input"
                      size="large"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          sendMessage(event);
                        }
                      }}
                    />
                    <button className="send" onClick={sendMessage}>
                      Send
                    </button>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const mapStateToProps = (state) => ({
  curruser: state.auth.user,
  loading: state.auth.loading,
});

export default connect(mapStateToProps, { logout })(Chat);
