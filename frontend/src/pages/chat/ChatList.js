import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatList.css";
import searchIcon from "../../images/search.png"; // Assuming there's a search icon
import avatar from "../../images/avatar.png"; // Assuming a placeholder avatar

const ChatList = ({ onSelectRoom }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoomId, setActiveRoomId] = useState(null);

  // Fetch chat rooms when the component loads
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/chat/rooms/", {
          withCredentials: true,
        });
        setChatRooms(response.data);
      } catch (err) {
        console.error("Failed to fetch chat rooms:", err);
      }
    };

    fetchChatRooms();
  }, []);

  // Filter chat rooms based on the search query
  const filteredRooms = chatRooms.filter((room) =>
    (room.participant_name || room.participant_email)
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chatList">
      {/* Search Section */}
      <div className="search">
        <div className="searchBar">
          <img src={searchIcon} alt="Search" />
          <input
            type="text"
            placeholder="Search chat rooms"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat Room Items */}
      <div className="room-list">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`item ${activeRoomId === room.id ? "active" : ""}`}
              onClick={() => {
                setActiveRoomId(room.id);
                onSelectRoom(room.id, room.participant_name || room.participant_email);
              }}
            >
              <img src={avatar} alt="Participant Avatar" />
              <div className="texts">
                <span>{room.participant_name || room.participant_email}</span>
                <p>{room.last_message || "No messages yet"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-rooms">No chat rooms found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
