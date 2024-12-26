
import React, { useState, useEffect } from "react";
import axios from "axios";
import avatarImage from "../../images/avatar.png";
import "./ChatDetail.css";

const ChatDetail = ({ roomId, participantName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages when roomId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/chat/rooms/${roomId}/messages/`,
          { withCredentials: true }
        );
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (roomId) fetchMessages();
  }, [roomId]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/chat/rooms/${roomId}/messages/`,
        { content: newMessage, message_type: "text" },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="chat">
    {/* Top Section: User Info */}
    <div className="chat-header">
      <div className="user-info">
        <img src={avatarImage} alt="Participant Avatar" />
        <div className="texts">
          <span>{participantName || "Unknown User"}</span>
          <p>Status: Active</p>
        </div>
      </div>
    </div>


      {/* Center Section: Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_username === "You" ? "own" : ""}`}
          >
            <img src={avatarImage} alt="User Avatar" />
            <div className="message-texts">
              <p>{msg.content}</p>
              <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatDetail;



// colors green #BBFC52; rose #E84172; light backround colo #636987;
// darker #3F4054;