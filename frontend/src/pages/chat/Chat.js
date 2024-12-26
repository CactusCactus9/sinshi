import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";
import UserInfo from "./UserInfo";
import "./Chat.css";

const Chat = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Load initial chat room
  useEffect(() => {
    const fetchInitialRoom = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/chat/rooms/", {
          credentials: "include",
        });
        const rooms = await response.json();
        if (rooms.length > 0) {
          setSelectedRoom(rooms[0].id);
          setSelectedParticipant(rooms[0].participant_name || rooms[0].participant_email);
        }
      } catch (err) {
        console.error("Failed to load initial chat room:", err);
      }
    };
    fetchInitialRoom();
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-list">
        <ChatList
          onSelectRoom={(roomId, participantName) => {
            setSelectedRoom(roomId);
            setSelectedParticipant(participantName);
          }}
        />
      </div>
      <div className="chat-detail">
        {selectedRoom ? (
          <ChatDetail roomId={selectedRoom} participantName={selectedParticipant} />
        ) : (
          <p className="no-room-selected">Please select a chat room to start chatting.</p>
        )}
      </div>
      <div className="user-info">
        <UserInfo
          participantName={selectedParticipant}
          participantStatus="Active"
        />
      </div>
    </div>
  );
};

export default Chat;
