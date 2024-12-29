import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RemoteGame = () => {
    const canvasRef = useRef(null);
    const {gameId} = useParams();
    const {user} = useAuth();
    
    const ballRef = useRef({x: 500, y: 350, radius: 15, color: "white", speed: 9, velocityX: 9, velocityY: 9});
    const netRef = useRef({ x: 0, y: 0, w: 6, h: 12 });
    const rightPlayerRef = useRef({ x: 980, y: 0, w: 20, h: 120, color: "#E84172", score: 0 });
    const leftPlayerRef = useRef({ x: 0, y: 50, w: 20, h: 120, color: "#D8FD62", score: 0 });
    
    const wsRef = useRef(null);
    const playerRole = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/`);

        wsRef.current.onopen = () => {
            console.log("WebSocket connected7777");
        };

        wsRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            // console.log("Received WebSocket message:", data);
            
            if(data.role) {
                playerRole.current = data.role;
                // console.log("++++++Player role assigned:", data.role);
                return;
            }

            if (data.ball) {
                ballRef.current = {...ballRef.current, ...data.ball};
            }
            
            
            if (data.leftPlayer && data.leftPlayer.y !== leftPlayerRef.current.y) {
                console.log("Updating left player from server:", data.leftPlayer);
                leftPlayerRef.current = { ...leftPlayerRef.current, ...data.leftPlayer };
            }

            if (data.rightPlayer && data.rightPlayer.y !== rightPlayerRef.current.y) {
                console.log("Updating right player from server:", data.rightPlayer);
                rightPlayerRef.current = { ...rightPlayerRef.current, ...data.rightPlayer };
            }
            
            if (data.winner) {
                console.log("WINNER");
                navigate(`/game/Local/SingleGame/SoloPractice/Score`);
            }
        };

        const handleKeyDown = (event, mypaddel) => {
            console.log("Key pressed:", event.key);
            const role = leftPlayerRef.current;
            console.log("Player role:", role);
            
            if (!role || !wsRef.current) return;
            
            console.log("heeere");
            const PADDLE_SPEED = 15;
            let paddleUpdate = null;
        
                let newY = leftPlayerRef.current.y;
        
                if (event.key.toLowerCase() === 'w') {
                    newY -= PADDLE_SPEED;
                } else if (event.key.toLowerCase() === 's') {
                    console.log(`prev : ${leftPlayerRef.current.y}`)
                    newY = Math.min(canvas.height - leftPlayerRef.current.h, newY + PADDLE_SPEED);
                    console.log(`prev : ${newY}`)
                }
        
                leftPlayerRef.current.y = newY;
                paddleUpdate = { leftPlayer: { y: newY, score: leftPlayerRef.current.score } };
            if (role === 'rightPlayer') {
                let newY = rightPlayerRef.current.y;
        
                if (event.key === 'ArrowUp') {
                    newY = Math.max(0, newY - PADDLE_SPEED);
                } else if (event.key === 'ArrowDown') {
                    newY = Math.min(canvas.height - rightPlayerRef.current.h, newY + PADDLE_SPEED);
                }
        
                rightPlayerRef.current.y = newY;
                paddleUpdate = { rightPlayer: { y: newY, score: rightPlayerRef.current.score } };
            }
        
            if (paddleUpdate) {
                console.log("Sending paddle update:", paddleUpdate);
                wsRef.current.send(JSON.stringify(paddleUpdate));
            }
        };
        
        

        const renderGame = () => {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            ctx.fillStyle = "#636987";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw net
            ctx.fillStyle = "#D9D9D9";
            for (let i = 0; i < canvas.height; i += 20) {
                ctx.fillRect(netRef.current.x + canvas.width/2, i, netRef.current.w, netRef.current.h);
            }

            // Draw ball
            const ball = ballRef.current;
            ctx.beginPath();
            ctx.fillStyle = ball.color;
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();

            // Draw paddles
            const leftPlayer = leftPlayerRef.current;
            const rightPlayer = rightPlayerRef.current;
            
            ctx.fillStyle = leftPlayer.color;
            ctx.fillRect(leftPlayer.x, leftPlayer.y, leftPlayer.w, leftPlayer.h);
            
            ctx.fillStyle = rightPlayer.color;
            ctx.fillRect(rightPlayer.x, rightPlayer.y, rightPlayer.w, rightPlayer.h);

            // Draw scores
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(leftPlayer.score, canvas.width/4, canvas.height/5);
            ctx.fillText(rightPlayer.score, canvas.width/4 * 3, canvas.height/5);
        };

        window.addEventListener('keydown', handleKeyDown);
        const gameLoop = setInterval(renderGame, 1000 / 60);

        return () => {
            clearInterval(gameLoop);
            window.removeEventListener('keydown', handleKeyDown);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [gameId, navigate]);

    return (
        <div className='game_container'>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default RemoteGame;