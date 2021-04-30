import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";

import ScrollToBottom from "react-scroll-to-bottom";
import Spinner from "../components/Spinner";
import encrypted from "../assets/encrypted.svg";
import url from "../constants/Url";
import { Fragment } from "react";
import { logout } from "../actions/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Notice for JAVA KING !
// contact={
//   id:"",
//   user_id:"--"
// }

// @Krishn
// go to line 186

let stompClient = null;
let activeC = null;
const Chat = ({ logout, curruser, loading }) => {
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conn, setConn] = useState(false);
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

    axios
      .get(`${url}/messages/${userId}`)
      .then((res) => {
        setMessages([...res.data]);
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
    console.log(curruser);
    stompClient.subscribe(
      "/user/" + curruser.userId + "/queue/messages",
      onMessageReceived
    );
    setConn(true);
  };

  const onError = (err) => {
    console.log(err);
  };

  const onMessageReceived = (msg) => {
    fetchMessages(curruser.userId);
    const notification = JSON.parse(msg.body);
    console.log("activeC", activeC);
    if (activeC !== notification.sender) {
      toast(`Received a message from ${notification.sender}`, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        toastId
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

      const messageReq = {
        senderId: curruser.userId,
        recipientId: activeContact,
        message,
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
    if (curruser != null) {
      fetchMessages(curruser.userId);
    }
  }, [curruser]);

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
              className="fa fa-sign-out log"
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
                      {messages.map((msg, index) => {
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
                      })}
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
                    <input
                      style={{ width: "87.5%" }}
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
