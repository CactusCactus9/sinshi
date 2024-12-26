
import React, { useEffect, useRef, useState } from 'react';
import "./PongGame.css"
import profile from "./logo.png"
import { useNavigate, useLocation } from 'react-router-dom';

const Tournament = () => {
    const { state } = useLocation();
    const { name1, name2, name3, name4 } = state;
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    
    const round1 = useRef({player1: null, player2: null, winner: null, loser: null, score:[0,0]})
    const round2 = useRef({player1: null, player2: null, winner: null, loser: null, score:[0,0]})
    const round3 = useRef({player1: null, player2: null, winner: null, loser: null, score:[0,0]})
    const currentRound = useRef(round1.current);
    const isGamePaused = useRef(false);
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    
    const ballRef = useRef({x: 0, y: 0, radius: 12, color: "white", speed: 9, velocityX: 9, velocityY: 9});
    const netRef = useRef({x: 0, y: 0, w: 6, h: 12});
    const playersRef = useRef([
        {id: 0, name: name1, x: 0, y: 0, w: 20, h: 100, score: 0},
        {id: 1, name: name2, x: 0, y: 0, w: 20, h: 100, score: 0},
        {id: 2, name: name3, x: 0, y: 0, w: 20, h: 100, score: 0},
        {id: 3, name: name4, x: 0, y: 0, w: 20, h: 100, score: 0}]);
        
    const lPaddleMoveRef = useRef({up: false, down: false});
    const rPaddleMoveRef = useRef({up: false, down: false});

    const players = playersRef.current;

    const getRandomId = () => {
        const randNb = Math.random();
        return(randNb < 0.25 ? 0 : randNb < 0.5 ? 1 : randNb < 0.75 ? 2 : 3)
    }
    const setRoundsPlayers = () => {
        const player1Id = getRandomId();
        let player2Id = getRandomId();
        while (player2Id === player1Id)
            player2Id = getRandomId();
        round1.current.player1 = players[player1Id];
        round1.current.player2 = players[player2Id];
        console.log("round1:")
        console.log(round1.current.player1.name);
        console.log(round1.current.player2.name);

        const remainingPlayers = players.filter(player => player !== round1.current.player1 && player !== round1.current.player2);

        round2.current.player1 = remainingPlayers[0];
        round2.current.player2 = remainingPlayers[1];
        console.log("round2:")
        console.log(round2.current.player1.name);
        console.log(round2.current.player2.name);
        setP1(round1.current.player1.name);
        setP2(round1.current.player2.name);
    }

    const setRound3Players = () => {
        round3.current.player1 = round1.current.winner;
        round3.current.player2 = round2.current.winner;
        console.log("round3:")
        console.log(round3.current.player1.name);
        console.log(round3.current.player2.name);
    }
    useEffect(() => {
        setRoundsPlayers(); // Initialize the players for round 1 and 2
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        const ctx = canvas.getContext("2d");
        const ball = ballRef.current;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        const net = netRef.current;
        net.x = canvas.width/2 - net.w/2;

        currentRound.current.player2.x = canvas.width - currentRound.current.player2.w;
        currentRound.current.player2.y = canvas.height - currentRound.current.player2.h;

        const renderGame = () => {
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
            ctx.fillRect(currentRound.current.player1.x, currentRound.current.player1.y, currentRound.current.player1.w, currentRound.current.player1.h);

            ctx.fillStyle = "#E84172";
            ctx.fillRect(currentRound.current.player2.x, currentRound.current.player2.y, currentRound.current.player2.w, currentRound.current.player2.h);

            // Display scores
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(currentRound.current.player1.score, canvas.width / 4, canvas.height / 5);
            ctx.fillText(currentRound.current.player2.score, (canvas.width / 4) * 3, canvas.height / 5);
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
        const setBall = () => {
            ball.x = canvas.width/2;
            ball.y = canvas.height/2;
            ball.velocityX = -ball.velocityX;
            ball.speed = 9;
        }

        const updateGame = () => {
            // Handle ball movement and collision detection logic
            if (isGamePaused.current)
                return;
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;

            //check collision with top and bottom walls
            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
                ball.velocityY = -ball.velocityY;

            // Check for collision and update scores
            const paddle = ((ball.x > canvas.width/2) ? currentRound.current.player2 : currentRound.current.player1);
            if (checkCollision(paddle, ball)){
                let angleRad = (ball.y === (paddle.y + paddle.h/2)) ? 0 : ( ball.velocityY > 0) ? Math.PI/4 : -Math.PI/4;//move the ball to the opposite direction from which it come
                const direction = (ball.x < canvas.width/2) ? 1 : -1;

                ball.velocityX = (Math.cos(angleRad) * ball.speed) * direction;
                ball.velocityY = Math.sin(angleRad) * ball.speed;
                ball.speed += 0.1;
            }
            // Ball reset on scoring
            if (ball.x - ball.radius <= 0){
                currentRound.current.player2.score++;
                setBall();}
            else if (ball.x + ball.radius >= canvas.width){
                currentRound.current.player1.score++;
                setBall();}
                // Render the game
                renderGame();
            // Check if the current round has ended to move to the next round
            if (currentRound.current.player1.score === 5 || currentRound.current.player2.score === 5){
                ctx.fillStyle = "white";
                ctx.font = "90px rationale";
                if (currentRound.current.player1.score === 5)
                    ctx.fillText("WIN!", (canvas.width / 12) * 2, canvas.height / 2);
                else
                    ctx.fillText("WIN!", (canvas.width/12)*8, canvas.height / 2);
                isGamePaused.current = true;
                handleEndOfRound();}
        }

        const handleEndOfRound = () => {
            if (currentRound.current.player1.score > currentRound.current.player2.score){
                currentRound.current.winner = currentRound.current.player1;
                currentRound.current.loser = currentRound.current.player2;
            }
            else {
                currentRound.current.winner = currentRound.current.player2;
                currentRound.current.loser = currentRound.current.player1;
            }
            //set the current round score
            currentRound.current.score = [currentRound.current.player1.score, currentRound.current.player2.score];
            //reset the current round's players score to 0;
            // console.log("current round score: " + currentRound.current.player1.name + ":" + currentRound.current.score[0] + " vs " + currentRound.current.player2.name + ":" + currentRound.current.score[1]);
            if (currentRound.current === round1.current){
                // console.log("round1 " + round1.current.score);
                // console.log("Round 1 completed. Moving to Round 2.");
                currentRound.current = round2.current;
            }
            else if (currentRound.current === round2.current){
                // console.log("round2 " + round2.current.score);
                // console.log("Round 2 completed. Setting up Round 3.");
                setRound3Players();
                currentRound.current = round3.current;
            }
            else if (currentRound.current === round3.current){
                // console.log("round3 " + round3.current.score);
                // console.log("Round 3 completed. Ending the tournament.");
                navigate(`/game/Local/TournamentLocal/Tournament/Results`, 
                    {state: currentRound.current.winner.name}
                );
                return;
            }
            setTimeout(() => {
                setP1(currentRound.current.player1.name);
                setP2(currentRound.current.player2.name);
                resetGame4NextRound();
            }, 3000);
        };
        const resetGame4NextRound = () => {
            currentRound.current.player1.score = 0;
            currentRound.current.player2.score = 0;
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.velocityX = 9;
            ball.velocityY = 9;
            ball.speed = 9;
            currentRound.current.player2.x = canvas.width - currentRound.current.player2.w;
            currentRound.current.player2.y = canvas.height - currentRound.current.player2.h;
            currentRound.current.player1.x = 0;
            currentRound.current.player1.y = 0;
            isGamePaused.current = false;
        };
        const player1PaddleMove = lPaddleMoveRef.current;
        const player2PaddleMove = rPaddleMoveRef.current;
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
            currentRound.current.player2.y = Math.max(0, currentRound.current.player2.y - 10);
        if (player2PaddleMove.down)
            currentRound.current.player2.y = Math.min(canvasRef.current.height - currentRound.current.player2.h, currentRound.current.player2.y + 10);
        if (player1PaddleMove.up)
            currentRound.current.player1.y = Math.max(0, currentRound.current.player1.y - 10);
        if (player1PaddleMove.down)
            currentRound.current.player1.y = Math.min(canvasRef.current.height - currentRound.current.player1.h, currentRound.current.player1.y + 10);
    }
    const keyPressInterval = setInterval(movePaddle, 1000 / 60);
    // Start the game loop
    const interval = setInterval(updateGame, 1000 / 60);

    return () => {
        clearInterval(interval);
        clearInterval(keyPressInterval);
    };
        });
    return (
        <div className='game_container'>
            <div className='adversaries'>
                <div className='player1'>
                    {/* <div className='player1-info'> */}
                        {/* <img src={profile} alt=""></img> */}
                        <span className="p-img"><img src={profile} alt=""></img></span>
                        <span className="p-name1">{p1}</span>
                        <span className="V">V</span>
                    {/* </div> */}
                </div>
                <div className='player2'>
                    {/* <div className='player2-info'> */}
                        <span className="S">S</span>
                        <span className="p-name2">{p2}</span>
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

























// import React, { useEffect, useRef, useState } from 'react';
// import "./PongGame.css"
// import profile from "./logo.png"
// import { useNavigate, useLocation } from 'react-router-dom';

// const Tournament = () => {
//     const { state } = useLocation();
//     const { name1, name2, name3, name4 } = state;
//     const navigate = useNavigate();
//     const canvasRef = useRef(null);

//     //players
//     const players = [
//         {name: name1, x: 0, y: 0, w: 20, h: 100, score: 0},
//         {name: name2, x: 0, y: 0, w: 20, h: 100, score: 0},
//         {name: name3, x: 0, y: 0, w: 20, h: 100, score: 0},
//         {name: name4, x: 0, y: 0, w: 20, h: 100, score: 0}
//     ];
//     const [p1, setP1] = useState("loading...");
//     const [p2, setP2] = useState("loading...");

//     //rounds
//     const round1 = useRef({id: 1, player1: null, player2: null, winner: null});
//     const round2 = useRef({id: 2, player1: null, player2: null, winner: null});
//     const round3 = useRef({id: 3, player1: null, player2: null, winner: null});
//     const [currentRound, setCurrentRound] = useState(round1.current);

//     //canvas
//     const net = {y: 0, w: 6, h: 12, x: 0};
//     const ball = {x: 0, y: 0, radius: 12, color: "white", speed: 9, velocityX: 9, velocityY: 9};

//     const player1PaddleMove = {up: false, down: false};
//     const player2PaddleMove = {up: false, down: false};


//     //get random number to set rounds players
//     const getRandomId = () => {
//         const randNb = Math.random();
//         return(randNb < 0.25 ? 0 : randNb < 0.5 ? 1 : randNb < 0.75 ? 2 : 3)
//     }

//     const setRoundsPlayers = () => {
//         const player1Id = getRandomId();
//         let player2Id = getRandomId();
//         while (player2Id === player1Id)
//             player2Id = getRandomId();
//         round1.current.player1 = players[player1Id];
//         round1.current.player2 = players[player2Id];

//         const remainingPlayers = players.filter(player => player !== round1.current.player1 && player !== round1.current.player2);

//         round2.current.player1 = remainingPlayers[0];
//         round2.current.player2 = remainingPlayers[1];
//         setP1(round1.current.player1.name);
//         setP2(round1.current.player2.name);
//     }

//     const draw = (ctx, canvas) => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // draw table
//         ctx.fillStyle = "#636987";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         // Draw net
//         ctx.fillStyle = "#D9D9D9";
//         for (let i = 0; i < canvas.height; i += 20){
//             ctx.fillRect(net.x, net.y + i, net.w, net.h);
//         }
//         // Draw ball
//         ctx.beginPath();
//         ctx.fillStyle = ball.color;
//         ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
//         ctx.fill();
//         ctx.closePath();

//         // Draw paddles
//         ctx.fillStyle = "#D8FD62";
//         ctx.fillRect(currentRound.player1.x, currentRound.player1.y, currentRound.player1.w, currentRound.player1.h);

//         ctx.fillStyle = "#E84172";
//         ctx.fillRect(currentRound.player2.x, currentRound.player2.y, currentRound.player2.w, currentRound.player2.h);

//         // Display scores
//         ctx.fillStyle = "white";
//         ctx.font = "60px rationale";
//         ctx.fillText(currentRound.player1.score, canvas.width / 4, canvas.height / 5);
//         ctx.fillText(currentRound.player2.score, (canvas.width / 4) * 3, canvas.height / 5);
//     };

//     const checkCollision = (paddle, ball) => {
//         paddle.top = paddle.y;
//         paddle.bottom = paddle.y + paddle.h;
//         paddle.right = paddle.x + paddle.w;
//         paddle.left = paddle.x;

//         ball.top = ball.y - ball.radius;
//         ball.bottom = ball.y + ball.radius;
//         ball.right = ball.x + ball.radius;
//         ball.left = ball.x - ball.radius;

//         return (ball.left <= paddle.right && ball.top <= paddle.bottom && ball.bottom >= paddle.top && ball.right >= paddle.left)
//     }

//     const setBall = (canvas) => {
//         ball.x = canvas.width/2;
//         ball.y = canvas.height/2;
//         ball.velocityX = -ball.velocityX;
//         ball.speed = 9;
//     }

//     const handleEndOfRound = () => {
//         //set the current round winner
//         if (currentRound.player1.score > currentRound.player2.score)
//             currentRound.winner = currentRound.player1;
//         else 
//             currentRound.winner = currentRound.player2;
//         //move to next round
//         if (currentRound === round1.current){
//             setP1(round2.current.player1.name);
//             setP2(round2.current.player2.name);
//             console.log ("round1 " + currentRound.player1.score)
//             round3.current.player1 = currentRound.winner;
//             setCurrentRound(round2.current);
//         }
//         else if (currentRound === round2.current){
//             round3.current.player2 = currentRound.winner;
//             setP1(round3.current.player1.name);
//             setP2(round3.current.player2.name);
//             console.log ("round2 " + currentRound.player1.score)
//             setCurrentRound(round3.current);
//         }
//         else if (currentRound === round3.current){
//             console.log ("round3 " + currentRound.player1.score)
//             // round3.winner = currentRound.winner;
//             navigate(`/game/Local/TournamentLocal/Tournament/Results`, 
//             {state: currentRound.winner.name}
//         );
//         }
//     };
    
//     const updateGame = (ctx, canvas) => {
//         // Handle ball movement and collision detection logic
//         ball.x += ball.velocityX;
//         ball.y += ball.velocityY;

//         //check collision with top and bottom walls
//         if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
//             ball.velocityY = -ball.velocityY;

//         // Check for collision and update scores
//         const paddle = ((ball.x > canvas.width/2) ? currentRound.player2 : currentRound.player1);
//         if (checkCollision(paddle, ball)){
//             let angleRad = (ball.y === (paddle.y + paddle.h/2)) ? 0 : ( ball.velocityY > 0) ? Math.PI/4 : -Math.PI/4;//move the ball to the opposite direction from which it come
//             const direction = (ball.x < canvas.width/2) ? 1 : -1;

//             ball.velocityX = (Math.cos(angleRad) * ball.speed) * direction;
//             ball.velocityY = Math.sin(angleRad) * ball.speed;
//             ball.speed += 0.1;
//         }
//         // Ball reset on scoring
//         if (ball.x - ball.radius <= 0){
//             currentRound.player2.score++;
//             setBall(canvas);}
//         else if (ball.x + ball.radius >= canvas.width){
//             currentRound.player1.score++;
//             setBall(canvas);}
//             draw(ctx, canvas);
//         // Check if the current round has ended to move to the next round
//         if (currentRound.player1.score === 5 || currentRound.player2.score === 5){
//             handleEndOfRound();
//         }
//     }

//     useEffect(() => {
//         setRoundsPlayers(); // Initialize the players for round 1 and 2
//         const canvas = canvasRef.current;
//         canvas.width = 1000;
//         canvas.height = 700;
//         const ctx = canvas.getContext("2d");
        
//         ball.x = canvas.width / 2;
//         ball.y = canvas.height / 2;
//         net.x = canvas.width/2 - net.w/2;

//         currentRound.player2.x = canvas.width - currentRound.player2.w;
//         currentRound.player2.y = canvas.height - currentRound.player2.h;

//         //draw Canvas
//         draw(ctx, canvas);
//         const handleKeyDown = (event) => {
//             if (event.key === 'ArrowDown')
//                 player2PaddleMove.down = true;
//             if (event.key === 'ArrowUp')
//                 player2PaddleMove.up = true;
//             if (event.key === 's' || event.key === 'S')
//                 player1PaddleMove.down = true;
//             if (event.key === 'w' || event.key === 'W')
//                 player1PaddleMove.up = true;
//         };
//         const handleKeyUp = (event) => {
//             if (event.key === 'ArrowDown')
//                 player2PaddleMove.down = false;
//             if (event.key === 'ArrowUp')
//                 player2PaddleMove.up = false;
//             if (event.key === 's' || event.key === 'S')
//                 player1PaddleMove.down = false;
//             if (event.key === 'w' || event.key === 'W')
//                 player1PaddleMove.up = false;
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         window.addEventListener('keyup', handleKeyUp);

//         const movePaddle = (event) => {
//         if (player2PaddleMove.up)
//             currentRound.player2.y = Math.max(0, currentRound.player2.y - 10);
//         if (player2PaddleMove.down)
//             currentRound.player2.y = Math.min(canvas.height - currentRound.player2.h, currentRound.player2.y + 10);
//         if (player1PaddleMove.up)
//             currentRound.player1.y = Math.max(0, currentRound.player1.y - 10);
//         if (player1PaddleMove.down)
//             currentRound.player1.y = Math.min(canvas.height - currentRound.player1.h, currentRound.player1.y + 10);
//     }
//     // Start the game loop
//     const interval = setInterval(() => updateGame(ctx, canvas), 1000 / 60);
//     const keyPressInterval = setInterval(movePaddle, 1000 / 60);

//     return () => {
//         clearInterval(interval);
//         clearInterval(keyPressInterval);
//     }; 
//         }, [ currentRound ]);
//     return (
//         <div className='game_container'>
//             <div className='adversaries'>
//                 <div className='player1'>
//                     {/* <div className='player1-info'> */}
//                         {/* <img src={profile} alt=""></img> */}
//                         <span className="p-img"><img src={profile} alt=""></img></span>
//                         <span className="p-name1">{p1}</span>
//                         <span className="V">V</span>
//                     {/* </div> */}
//                 </div>
//                 <div className='player2'>
//                     {/* <div className='player2-info'> */}
//                         <span className="S">S</span>
//                         <span className="p-name2">{p2}</span>
//                         <span className="p-img"><img src={profile} alt=""></img></span>
//                         {/* <img src={profile} alt=""></img> */}
//                     {/* </div> */}
//                 </div>
//             </div>
//             <canvas ref={canvasRef}></canvas>
//         </div>
//     )
// }
// export default Tournament