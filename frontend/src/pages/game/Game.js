
import React, { useState } from "react";
import PongSimulator from "./PongSimulator";
import { GiPingPongBat } from "react-icons/gi";
import { Link } from "react-router-dom";
import './Game.css'

const Game = () => {
  const [gameMode, setGameMode] = useState("");

    const handleChange = (e) => {
        setGameMode(e.target.value);
    };

    return (
        
        <div className="Game-page-container">

            <div className="pongSimulator"><PongSimulator /></div>

            <div className="other_elements">
                <div className="radio-group">
                    <label className="radio-option">
                    <input
                        type="radio"
                        name="gameMode"
                        value="Local"
                        checked={gameMode === "Local"}
                        onChange={handleChange}
                    />
                    <span className="custom-radio"></span>
                    Local
                    </label>

                    <label className="radio-option">
                    <input
                        type="radio"
                        name="gameMode"
                        value="Online"
                        checked={gameMode === "Online"}
                        onChange={handleChange}
                    />
                    <span className="custom-radio"></span>
                    Online
                    </label>
                </div>
                    <hr className="Separator-line"></hr>
                <div className="Start-button">
                  {gameMode ? (
                        <Link  className="link" to={`/game/${gameMode}`} >
                                <GiPingPongBat/> START
                        </Link>
                    ) : (
                        <button className="link" >
                            <GiPingPongBat/> START
                        </button>
                    )}
                </div>
            </div>
                
        </div>
    );
};

export default Game;
