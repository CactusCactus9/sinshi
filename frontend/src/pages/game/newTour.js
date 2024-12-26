import React, { useEffect, useRef, useState } from 'react';
import "./PongGame.css"
import profile from "./logo.png"
import { useNavigate, useLocation } from 'react-router-dom';

const Tournament = () => {
    const { state } = useLocation();
    const { name1, name2, name3, name4 } = state;
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    //rounds
    const round1 = {id: 1, player1: null, player2: null, winner: null};
    const round2 = {id: 2, player1: null, player2: null, winner: null};
    const round3 = {id: 3, player1: null, player2: null, winner: null};
    const [currentRound, setCurrentRound] = useState(round1);

    //canvas
    const net = {y: 0, w: 6, h: 12, x: 0};
    const ball = {x: 0, y: 0, radius: 12, color: "white", speed: 9, velocityX: 9, velocityY: 9};

    const player1PaddleMove = {up: false, down: false};
    const player2PaddleMove = {up: false, down: false};

    //players
    const players = [
        {name: name1, x: 0, y: 0, w: 20, h: 100, score: 0},
        {name: name2, x: 0, y: 0, w: 20, h: 100, score: 0},
        {name: name3, x: 0, y: 0, w: 20, h: 100, score: 0},
        {name: name4, x: 0, y: 0, w: 20, h: 100, score: 0}
    ];

    //get random number to set rounds players
    const getRandomId = () => {
        const randNb = Math.random();
        return(randNb < 0.25 ? 0 : randNb < 0.5 ? 1 : randNb < 0.75 ? 2 : 3)
    }

    const setRoundsPlayers = () => {
        const player1Id = getRandomId();
        let player2Id = getRandomId();
        while (player2Id === player1Id)
            player2Id = getRandomId();
        round1.player1 = players[player1Id];
        round1.player2 = players[player2Id];

        const remainingPlayers = players.filter(player => player !== round1.player1 && player !== round1.player2);

        round2.player1 = remainingPlayers[0];
        round2.player2 = remainingPlayers[1];
    }

    const draw = (ctx, canvas) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw table
        ctx.fillStyle = "#636987";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw net
        ctx.fillStyle = "#D9D9D9";
        for (let i = 0; i < canvas.height; i += 20){
            ctx.fillRect(net.x, net.y + i, net.w, net.h);
        }
        // Draw ball
        ctx.beginPath();
        ctx.fillStyle = ball.color;
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        // Draw paddles
        ctx.fillStyle = "#D8FD62";
        ctx.fillRect(currentRound.player1.x, currentRound.player1.y, currentRound.player1.w, currentRound.player1.h);

        ctx.fillStyle = "#E84172";
        ctx.fillRect(currentRound.player2.x, currentRound.player2.y, currentRound.player2.w, currentRound.player2.h);

        // Display scores
        ctx.fillStyle = "white";
        ctx.font = "60px rationale";
        ctx.fillText(currentRound.player1.score, canvas.width / 4, canvas.height / 5);
        ctx.fillText(currentRound.player2.score, (canvas.width / 4) * 3, canvas.height / 5);
    };

    const checkCollision = (paddle, ball) => {
        paddle.top = paddle.y;
        paddle.bottom = paddle.y + paddle.h;
        paddle.right = paddle.x + paddle.w;
        paddle.left = paddle.x;

        ball.top = ball.y - ball.radius;
        ball.bottom = ball.y + ball.radius;
        ball.right = ball.x + ball.radius;
        ball.left = ball.x - ball.radius;

        return (ball.left <= paddle.right && ball.top <= paddle.bottom && ball.bottom >= paddle.top && ball.right >= paddle.left)
    }

    const setBall = (canvas) => {
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 9;
    }

    const handleEndOfRound = () => {
        //set the current round winner
        // if (currentRound.player1.score > currentRound.player2.score)
        //     currentRound.winner = currentRound.player1;
        // else 
        //     currentRound.winner = currentRound.player2;
        //move to next round
        if (currentRound.id === 1){
            if (currentRound.player1.score > currentRound.player2.score)
                round3.player1 = currentRound.player1;
            else
                round3.player1 = currentRound.player2;
            setCurrentRound(round2);
        }
        else if (currentRound.id === 2){
            if (currentRound.player1.score > currentRound.player2.score)
                round3.player2 = currentRound.player1;
            else
                round3.player2 = currentRound.player2;
            setCurrentRound(round3);
        }
        else if (currentRound.id === 3){
            if (currentRound.player1.score > currentRound.player2.score)
                round3.winner = currentRound.player1;
            else
                round3.winner = currentRound.player2;
            navigate(`/game/Local/TournamentLocal/Tournament/Results`, 
            {state: round3.winner.name}
        );
        }
    };
    
    const updateGame = (ctx, canvas) => {
        // Handle ball movement and collision detection logic
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        //check collision with top and bottom walls
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
            ball.velocityY = -ball.velocityY;

        // Check for collision and update scores
        const paddle = ((ball.x > canvas.width/2) ? currentRound.player2 : currentRound.player1);
        if (checkCollision(paddle, ball)){
            let angleRad = (ball.y === (paddle.y + paddle.h/2)) ? 0 : ( ball.velocityY > 0) ? Math.PI/4 : -Math.PI/4;//move the ball to the opposite direction from which it come
            const direction = (ball.x < canvas.width/2) ? 1 : -1;

            ball.velocityX = (Math.cos(angleRad) * ball.speed) * direction;
            ball.velocityY = Math.sin(angleRad) * ball.speed;
            ball.speed += 0.1;
        }
        // Ball reset on scoring
        if (ball.x - ball.radius <= 0){
            currentRound.player2.score++;
            setBall(canvas);}
        else if (ball.x + ball.radius >= canvas.width){
            currentRound.player1.score++;
            setBall(canvas);}
            draw(ctx, canvas);
        // Check if the current round has ended to move to the next round
        if (currentRound.player1.score === 5 || currentRound.player2.score === 5){
            handleEndOfRound();
        }
    }

    setRoundsPlayers(); // Initialize the players for round 1 and 2
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;
        const ctx = canvas.getContext("2d");
        
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        net.x = canvas.width/2 - net.w/2;

        currentRound.player2.x = canvas.width - currentRound.player2.w;
        currentRound.player2.y = canvas.height - currentRound.player2.h;

        //draw Canvas
        draw(ctx, canvas);
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown')
                player2PaddleMove.down = true;
            if (event.key === 'ArrowUp')
                player2PaddleMove.up = true;
            if (event.key === 's' || event.key === 'S')
                player1PaddleMove.down = true;
            if (event.key === 'w' || event.key === 'W')
                player1PaddleMove.up = true;
        };
        const handleKeyUp = (event) => {
            if (event.key === 'ArrowDown')
                player2PaddleMove.down = false;
            if (event.key === 'ArrowUp')
                player2PaddleMove.up = false;
            if (event.key === 's' || event.key === 'S')
                player1PaddleMove.down = false;
            if (event.key === 'w' || event.key === 'W')
                player1PaddleMove.up = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const movePaddle = (event) => {
        if (player2PaddleMove.up)
            currentRound.player2.y = Math.max(0, currentRound.player2.y - 10);
        if (player2PaddleMove.down)
            currentRound.player2.y = Math.min(canvas.height - currentRound.player2.h, currentRound.player2.y + 10);
        if (player1PaddleMove.up)
            currentRound.player1.y = Math.max(0, currentRound.player1.y - 10);
        if (player1PaddleMove.down)
            currentRound.player1.y = Math.min(canvas.height - currentRound.player1.h, currentRound.player1.y + 10);
    }
    // Start the game loop
    const interval = setInterval(() => updateGame(ctx, canvas), 1000 / 60);
    const keyPressInterval = setInterval(movePaddle, 1000 / 60);

    return () => {
        clearInterval(interval);
        clearInterval(keyPressInterval);
    }; 
        }, [ currentRound ]);
    return (
        <div className='game_container'>
            <div className='adversaries'>
                <div className='player1'>
                    {/* <div className='player1-info'> */}
                        {/* <img src={profile} alt=""></img> */}
                        <span className="p-img"><img src={profile} alt=""></img></span>
                        <span className="p-name1">{currentRound.player1.name}</span>
                        <span className="V">V</span>
                    {/* </div> */}
                </div>
                <div className='player2'>
                    {/* <div className='player2-info'> */}
                        <span className="S">S</span>
                        <span className="p-name2">{currentRound.player2.name}</span>
                        <span className="p-img"><img src={profile} alt=""></img></span>
                        {/* <img src={profile} alt=""></img> */}
                    {/* </div> */}
                </div>
            </div>
            <canvas ref={canvasRef}></canvas>
        </div>
    )
}
export default Tournament