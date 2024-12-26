
import React, { useState } from "react";
// import "./FirstPage.css";
// import Banner from '../../components/Banner';
import PongSimulator from "./PongSimulator";
import { GiPingPongBat } from "react-icons/gi";
// import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './Game.css'
import axios from 'axios'

const Game = () => {
  const [gameMode, setGameMode] = useState("");

    // const navigate = useNavigate();
    // const handleStart = () =>{
    //     navigate('/Local');
    // }

    const handleChange = (e) => {
        setGameMode(e.target.value);
        // console.log(e.target.value);
    };

    const handleSubmit = () => {
        axios({
            method: 'post',
            url: "http://localhost:8000/game/create/",
            data: {
                mode: gameMode,
            }
        })
        .then(response => console.log(response.data))
        .catch(error => console.log(error));
    }
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
                        <Link  className="link" to={`/game/${gameMode}`} onClick= {handleSubmit()}>
                                <GiPingPongBat/> START
                        </Link>
                    ) : (
                        <button className="link" >
                            <GiPingPongBat/> START
                        </button>
                    )}
                </div>
                    {/* <Link className="START" to={`/game/${gameMode}`}><GiPingPongBat /> START</Link> */}

            </div>
                
        </div>
    );
};

export default Game;
