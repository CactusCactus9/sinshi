import './Loading.css';
import React, { useRef } from 'react';
import { useNavigate ,useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

function Loading() {

    const { userId } = useParams();
    const navigate = useNavigate();
    const websocket = useRef(null);
    const { state } = useLocation();
    const [startGame, setStartGame] = useState(false);
    // const [startGame, setStartGame] = useState(0);
    axios.defaults.withCredentials = true;

    websocket.current = new WebSocket(`ws://localhost:8000/ws/invite/${userId}`);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_________________________");
    
    websocket.current.onopen = () => {
        console.log('WebSocket connected');
    };
    
    websocket.current.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'game_created') {
                setStartGame(true);
                // console.log('Game created:', data);
                // console.log('iiiiiiiiiiiiiiiiiiiiddddddd---->:', data.game_id)
                setTimeout(() => {if (websocket.current) {
                    websocket.current.close();
                }
                navigate(`../play/${data.game_id}`)}, 3000)
                // setStartGame(data.game_id);
            } else if (data.type === 'error') {
                console.error('Error:', data.message);
            }
        };
        
        websocket.current.onclose = () => {
            console.log('WebSocket closed');
        };


    const handleCancel = () => {
        axios.post(`http://localhost:8000/game/declinesend/${userId}/`)
        .then(() => {
            if (websocket.current) {
                websocket.current.close();
            }
            navigate('..')
        })
        .catch((err) => {
            console.log(err);
        });
    };

    
    return (
        <>
        <div className='loading-container'>
                <div className='center'>
                <div className='ring'></div>
                <span>Loading...</span>
                </div>
                {state && !startGame ? (<button onClick={handleCancel}>Cancel</button>) : (<p>GET READY TO PLAY</p>)}
        </div>
        </>
    )
}

export default Loading