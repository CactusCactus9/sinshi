


import React, { useEffect, useRef } from 'react';
import {useParams } from 'react-router-dom';

const RemoteGame = () => {
    const canvasRef = useRef(null);
    const {gameId} = useParams();
    
    const ballRef = useRef({x: 0, y: 0, radius: 12, color: "white", speed: 9, velocityX: 9, velocityY: 9});
    const netRef = useRef({x: 0, y: 0, w: 6, h: 12});
    const rightPlayerRef = useRef({x: 980, y: 0, w: 20, h: 120, color: "#E84172", score: 0});
    const leftPlayerRef = useRef({x: 0, y: 0, w: 20, h: 120, color: "#D8FD62", score: 0});
    const wsRef = useRef(null);
    const keysPressed = useRef(new Set());


    const handleKeyDown = (e) => {
        e.preventDefault();
        keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e) => {
        e.preventDefault();
        keysPressed.current.delete(e.key);
    };
  
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        const ball = ballRef.current;
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;

        const net = netRef.current;
        net.x = canvas.width/2 - net.w/2;
        
        // Setup WebSocket connection
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}`);

        wsRef.current.onopen = () => {
            console.log("WebSocket connected");
        };

        wsRef.current.onmessage = (message) => {
            const data = JSON.parse(message.data);
            
            // if(data.role) {
            //     playerRole.current = data.role;
            //     // console.log("Player role assigned:", data.role);
            //     return;
            // }

            if (data.ball) {
                ballRef.current.x = data.ball.x;
                ballRef.current.y = data.ball.y;
            }
            
            if (data.leftPlayer) {
                leftPlayerRef.current.y = data.leftPlayer.y;
                leftPlayerRef.current.score = data.leftPlayer.score;
            }

            if (data.rightPlayer) {
                console.log("right player>>>", data.rightPlayer)
                rightPlayerRef.current.y = data.rightPlayer.y;
                rightPlayerRef.current.score = data.rightPlayer.score;
            }
            
            if (data.winner) {
                console.log("Game Over - Winner:", data.winner);
            }
        };
        //as//
        const sendMovement = () => {
            if (!wsRef.current) return;
            
            if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W')) {
                wsRef.current.send(JSON.stringify({ move: 'up' }));
            }
            if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S')) {
                wsRef.current.send(JSON.stringify({ move: 'down' }));
            }
        };
            //as//
        // Create movement interval
        const movementInterval = setInterval(sendMovement, 16); // ~60fps

        // Add both keydown and keyup listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // wsRef.current.onerror = (error) => {
        //     console.error('WebSocket error:', error);
        // };
        
        // wsRef.current.onclose = () => {
        //     console.log("WebSocket disconnected");
        // };

       

        const ctx = canvas.getContext("2d");
        const renderGame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // const ball = ballRef.current;

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

            //Draw score
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(leftPlayerRef.current.score, canvas.width/4, canvas.height/5);
            ctx.fillText(rightPlayerRef.current.score, canvas.width/4 * 3, canvas.height/5);

            // Draw paddles
            ctx.fillStyle = leftPlayerRef.current.color;
            ctx.fillRect(leftPlayerRef.current.x, leftPlayerRef.current.y, leftPlayerRef.current.w, leftPlayerRef.current.h);

            ctx.fillStyle = rightPlayerRef.current.color;
            ctx.fillRect(rightPlayerRef.current.x, rightPlayerRef.current.y, rightPlayerRef.current.w, rightPlayerRef.current.h);
        };

       

        const gameInterval = setInterval(renderGame, 1000 / 60);

        return () => {
            clearInterval(gameInterval);
            //as//
            clearInterval(movementInterval);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            // window.removeEventListener('keydown', handleKeyDown);
            // window.removeEventListener('keyup', handleKeyUp);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [gameId]);

    return (
        <div className='game_container'>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default RemoteGame