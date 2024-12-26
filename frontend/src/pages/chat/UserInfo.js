import React from "react";
import "./UserInfo.css";
import avatar from "../../images/avatar.png";
import chatIcon from "../../images/chat-4-256.png";
import pingPongIcon from "../../images/ping-pong-256.png";
import deleteIcon from "../../images/delete-256.png";

const UserInfo = ({ participantName, participantStatus }) => {
  return (
    <div className="user-info">
      {/* User Section */}
      <div className="user">
        <img src={avatar} alt="Participant Avatar" />
        <div className="texts">
          <h3>{participantName || "Unknown User"}</h3>
          <p className="status">{participantStatus || "Active"}</p>
        </div>
      </div>

      {/* User Actions Section */}
      <div className="user-actions">
        <div className="action">
          <img
            src={chatIcon}
            alt="contact"
            className="action-icon"
            onClick={() => console.log("Block User clicked")}
          />
          <span>Contact</span>
        </div>
        <div className="action">
          <img
            src={pingPongIcon}
            alt="Invite to Game"
            className="action-icon"
            onClick={() => console.log("Invite to Game clicked")}
          />
          <span>Invite</span>
        </div>
        <div className="action">
          <img
            src={deleteIcon}
            alt="Delete Chat"
            className="action-icon"
            onClick={() => console.log("Delete Chat clicked")}
          />
          <span>Delete</span>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
