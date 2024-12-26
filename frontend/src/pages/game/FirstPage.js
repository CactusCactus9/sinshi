import "./FirstPage.css";
import Banner from '../../components/Banner';
import PongSimulator from "./PongSimulator";
import { GiPingPongBat } from "react-icons/gi";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function FirstPage() {
    const [gameMode, setGameMode] = useState("");

    const navigate = useNavigate();
    const handleStart = () =>{
        navigate('/FirstPage');
    }

    const handleChange = (e) => {
        setGameMode(e.target.value);
        console.log(e.target.value);
    };

    return (
        
        <div>
            <Banner />
            <div className="First-page-background">
                <div className="PongFirstPage"><PongSimulator /></div>
                
                <div className="radio-group">
                    <label className="radio-option">
                    <input
                        type="radio"
                        name="gameMode"
                        value="Local"
                        checked={game === "Local"}
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

                {/* Start Game Button */}
                <div className="Start-game">
                    <button className="START" onClick={handleStart}><GiPingPongBat /> START</button>
                </div>
            </div>
                </div>
    );
}

export default FirstPage;
