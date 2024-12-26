import React, { useEffect, useRef } from 'react';
import "./PongGame.css"
// import { Navigate } from 'react-router-dom';
// import AdversariesBar from './AdversariesBar';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const RemoteGame = () => {
    const canvasRef = useRef(null);
    const {gameId} = useParams()


    const ballRef = useRef({x: 0, y: 0, radius: 15, color: "white", speed: 9, velocityX: 9, velocityY: 9});
    const netRef = useRef({ x: 0, y: 0, w: 6, h: 12 });
    const rightPlayerRef = useRef({ x: 0, y: 0, w: 20, h: 120, color: "#E84172", score: 0 });
    const leftPlayerRef = useRef({ x: 0, y: 0, w: 20, h: 120, color: "#D8FD62", score: 0 });

    const lPaddleMoveRef = useRef({ up: false, down: false });
    const rPaddleMoveRef = useRef({ up: false, down: false });
    // const isrunningGame = useRef(true);
    const wsRef = useRef(null); // WebSocket reference
    const navigate = useNavigate();

    const {user} = useAuth();
    console.log(`my curr : ${user.username}`);

    useEffect(() => {

        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        const lPaddleMove = lPaddleMoveRef.current;
        const rPaddleMove = rPaddleMoveRef.current;

        const ball = ballRef.current;
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;

        const bot = rightPlayerRef.current;
        bot.x = canvas.width - bot.w;
        bot.y = canvas.height - bot.h;

        const playerL = leftPlayerRef.current;
        const playerR = rightPlayerRef.current;
        const net = netRef.current;
        net.x = canvas.width / 2 - net.w / 2;

        // Setup WebSocket
        //wsRef is s useRef hook that hols a reference to ws instance
        // wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/?token=sinshi`); // Replace with server address
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/`); // Replace with server address

        wsRef.current.onopen = () => {
            console.log("WebSocket connected9999999999");
        };

        wsRef.current.onmessage = (message) => {
            // Parse the JSON string into an object

            // Example: data = { leftPlayer: { y: 50 }, rightPlayer: { y: 100 } }

            const data = JSON.parse(message.data);

            if (data.ball) {
                if (ball.x !== data.ball.x || ball.y !== data.ball.y) {
                    ball.x = data.ball.x;
                    ball.y = data.ball.y;
                }
            }
            if (data.leftPlayer) {
                leftPlayerRef.current.y = data.leftPlayer.y;
                leftPlayerRef.current.score = data.leftPlayer.score;
            }
            if (data.rightPlayer) {
                rightPlayerRef.current.y = data.rightPlayer.y;
                rightPlayerRef.current.score = data.rightPlayer.score;
            }
            if (data.winner)
                if (data.winner === "leftPlayer" || data.winner === "rightPlayer"){
                    navigate(`/game/Local/SingleGame/SoloPractice/Score`);
                }
            console.log('score right', rightPlayerRef.current.score);
            console.log('score left', leftPlayerRef.current.score);
        };

        wsRef.current.onclose = () => {
            console.log("WebSocket disconnected");
        };

        const renderGame = () => {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw table
            ctx.fillStyle = "#636987";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the net
            ctx.fillStyle = "#D9D9D9";
            for (let i = 0; i < canvas.height; i += 20) {
                ctx.fillRect(net.x, net.y + i, net.w, net.h);
            }

            //draw ball
            ctx.beginPath();
            ctx.fillStyle = ball.color;
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();
            // Draw paddles
            ctx.fillStyle = leftPlayerRef.current.color;
            ctx.fillRect(playerL.x, playerL.y, playerL.w, playerL.h);

            ctx.fillStyle = rightPlayerRef.current.color;
            ctx.fillRect(playerR.x, playerR.y, playerR.w, playerR.h);

            //Draw score
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(playerL.score, canvas.width/4, canvas.height/5);
            ctx.fillText(playerR.score, canvas.width/4 * 3, canvas.height/5);

        };
        
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown')
                rPaddleMove.down = true;
            if (event.key === 'ArrowUp')
                rPaddleMove.up = true;
            if (event.key === 's' || event.key === 'S')
                lPaddleMove.down = true;
            if (event.key === 'w' || event.key === 'W')
                lPaddleMove.up = true;

        };
        const handleKeyUp = (event) => {
            if (event.key === 'ArrowDown')
                rPaddleMove.down = false;
            if (event.key === 'ArrowUp')
                rPaddleMove.up = false;
            if (event.key === 's' || event.key === 'S')
                lPaddleMove.down = false;
            if (event.key === 'w' || event.key === 'W')
                lPaddleMove.up = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const movePaddle = () => {
            if (lPaddleMove.up) {
                playerL.y = Math.max(0, playerL.y - 15);
            }
            if (lPaddleMove.down) {
                playerL.y = Math.min(canvas.height - playerL.h, playerL.y + 15);
            }

            if (rPaddleMove.up) {
                playerR.y = Math.max(0, playerR.y - 15);
            }
            if (rPaddleMove.down) {
                playerR.y = Math.min(canvas.height - playerR.h, playerR.y + 15);
            }

            // Send paddle movement to server
            //?. to make sure wsRef isnt null or undefined
            // wsRef.current?.send(
            //     JSON.stringify({
            //         //The client sends data as a JSON string
            //         //leftPlayer is an object and y is its property
            //         // {
            //         //     "leftPlayer": { "y": 50 },
            //         //     "rightPlayer": { "y": 100 }
            //         // }
            //         leftPlayer: { y: playerL.y, score: playerL.score},
            //         rightPlayer: { y: playerR.y, score: playerR.score}
            //     })
            // );
        };

        const gameInterval = setInterval(renderGame, 1000 / 60);
        const keyPressInterval = setInterval(movePaddle, 1000 / 60);
        return () => {
            clearInterval(gameInterval);
            clearInterval(keyPressInterval);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            
        };
    });
    console.log("asma");
    return (
        <div className='game_container'>
            
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};


// export default Online;
export default RemoteGame;