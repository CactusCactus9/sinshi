import React, { useEffect, useRef } from 'react';
import {useParams } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// const RemoteGame = () => {
//     const canvasRef = useRef(null);
    // const {gameId} = useParams();
    // const {user} = useAuth();
    
//     const ballRef = useRef({x: 500, y: 350, radius: 15, color: "white", speed: 9, velocityX: 9, velocityY: 9});
//     const netRef = useRef({ x: 0, y: 0, w: 6, h: 12 });
//     const rightPlayerRef = useRef({ x: 980, y: 0, w: 20, h: 120, color: "#E84172", score: 0 });
//     const leftPlayerRef = useRef({ x: 0, y: 50, w: 20, h: 120, color: "#D8FD62", score: 0 });
    
//     const wsRef = useRef(null);
//     const playerRole = useRef(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         canvas.width = 1000;
//         canvas.height = 700;

//         wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/`);

//         wsRef.current.onopen = () => {
//             console.log("WebSocket connected7777");
//         };

//         wsRef.current.onmessage = (message) => {
//             const data = JSON.parse(message.data);
//             // console.log("Received WebSocket message:", data);
            
//             if(data.role) {
//                 playerRole.current = data.role;
//                 // console.log("++++++Player role assigned:", data.role);
//                 return;
//             }

//             if (data.ball) {
//                 ballRef.current = {...ballRef.current, ...data.ball};
//             }
            
            
//             if (data.leftPlayer && data.leftPlayer.y !== leftPlayerRef.current.y) {
//                 console.log("Updating left player from server:", data.leftPlayer);
//                 leftPlayerRef.current = { ...leftPlayerRef.current, ...data.leftPlayer };
//             }

//             if (data.rightPlayer && data.rightPlayer.y !== rightPlayerRef.current.y) {
//                 console.log("Updating right player from server:", data.rightPlayer);
//                 rightPlayerRef.current = { ...rightPlayerRef.current, ...data.rightPlayer };
//             }
            
//             if (data.winner) {
//                 console.log("WINNER");
//                 navigate(`/game/Local/SingleGame/SoloPractice/Score`);
//             }
//         };

//         const handleKeyDown = (event, mypaddel) => {
//             console.log("Key pressed:", event.key);
//             const role = leftPlayerRef.current;
//             console.log("Player role:", role);
            
//             if (!role || !wsRef.current) return;
            
//             console.log("heeere");
//             const PADDLE_SPEED = 15;
//             let paddleUpdate = null;
        
//                 let newY = leftPlayerRef.current.y;
        
//                 if (event.key.toLowerCase() === 'w') {
//                     newY -= PADDLE_SPEED;
//                 } else if (event.key.toLowerCase() === 's') {
//                     console.log(`prev : ${leftPlayerRef.current.y}`)
//                     newY = Math.min(canvas.height - leftPlayerRef.current.h, newY + PADDLE_SPEED);
//                     console.log(`prev : ${newY}`)
//                 }
        
//                 leftPlayerRef.current.y = newY;
//                 paddleUpdate = { leftPlayer: { y: newY, score: leftPlayerRef.current.score } };
//             if (role === 'rightPlayer') {
//                 let newY = rightPlayerRef.current.y;
        
//                 if (event.key === 'ArrowUp') {
//                     newY = Math.max(0, newY - PADDLE_SPEED);
//                 } else if (event.key === 'ArrowDown') {
//                     newY = Math.min(canvas.height - rightPlayerRef.current.h, newY + PADDLE_SPEED);
//                 }
        
//                 rightPlayerRef.current.y = newY;
//                 paddleUpdate = { rightPlayer: { y: newY, score: rightPlayerRef.current.score } };
//             }
        
//             if (paddleUpdate) {
//                 console.log("Sending paddle update:", paddleUpdate);
//                 wsRef.current.send(JSON.stringify(paddleUpdate));
//             }
//         };
        
        

//         const renderGame = () => {
//             const ctx = canvas.getContext("2d");
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             // Draw background
//             ctx.fillStyle = "#636987";
//             ctx.fillRect(0, 0, canvas.width, canvas.height);

//             // Draw net
//             ctx.fillStyle = "#D9D9D9";
//             for (let i = 0; i < canvas.height; i += 20) {
//                 ctx.fillRect(netRef.current.x + canvas.width/2, i, netRef.current.w, netRef.current.h);
//             }

//             // Draw ball
//             const ball = ballRef.current;
//             ctx.beginPath();
//             ctx.fillStyle = ball.color;
//             ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
//             ctx.fill();
//             ctx.closePath();

//             // Draw paddles
//             const leftPlayer = leftPlayerRef.current;
//             const rightPlayer = rightPlayerRef.current;
            
//             ctx.fillStyle = leftPlayer.color;
//             ctx.fillRect(leftPlayer.x, leftPlayer.y, leftPlayer.w, leftPlayer.h);
            
//             ctx.fillStyle = rightPlayer.color;
//             ctx.fillRect(rightPlayer.x, rightPlayer.y, rightPlayer.w, rightPlayer.h);

//             // Draw scores
//             ctx.fillStyle = "white";
//             ctx.font = "60px rationale";
//             ctx.fillText(leftPlayer.score, canvas.width/4, canvas.height/5);
//             ctx.fillText(rightPlayer.score, canvas.width/4 * 3, canvas.height/5);
//         };

//         window.addEventListener('keydown', handleKeyDown);
//         const gameLoop = setInterval(renderGame, 1000 / 60);

//         return () => {
//             clearInterval(gameLoop);
//             window.removeEventListener('keydown', handleKeyDown);
//             if (wsRef.current) {
//                 wsRef.current.close();
//             }
//         };
//     }, [gameId, navigate]);

//     return (
//         <div className='game_container'>
//             <canvas ref={canvasRef}></canvas>
//         </div>
//     );
// };

// export default RemoteGame; #zack


// import React, { useEffect, useRef } from 'react';
// // import "./Tournament.css"
// // import { Navigate } from 'react-router-dom';
// // import AdversariesBar from './AdversariesBar';
// import { useNavigate } from 'react-router-dom';

const RemoteGame = () => {
    const ballRef = useRef({x: 0, y: 0, radius: 15, color: "white", speed: 9, velocityX: 9, velocityY: 9});

    const rightPlayerRef = useRef({ x: 0, y: 0, w: 20, h: 120, color: "#E84172", score: 0 });
    const rPaddleMoveRef = useRef({ up: false, down: false });

    const lPaddleMoveRef = useRef({ up: false, down: false });
    const leftPlayerRef  = useRef({ x: 0, y: 0, w: 20, h: 120, color: "#D8FD62", score: 0 });

    const canvasRef      = useRef(null);
    const {gameId}       = useParams();
    const netRef         = useRef({ x: 0, y: 0, w: 6, h: 12 });
    const wsRef          = useRef(null); // WebSocket reference
    // const navigate = useNavigate();
    const playerRole     = useRef(null);
    // const lastSentStateRef = useRef({ leftY: 0, rightY: 0 });
    
    useEffect(() => {
        
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        const ball = ballRef.current;
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;

        const bot = rightPlayerRef.current;
        bot.x = canvas.width - bot.w;
        bot.y = canvas.height - bot.h;

        const net = netRef.current;
        net.x = canvas.width / 2 - net.w / 2;

        // Setup WebSocket
        //wsRef is s useRef hook that hols a reference to ws instance
        const setupWebSocket = () => {
            wsRef.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/`); // Replace with server address

            wsRef.current.onopen = () => {
                console.log("WebSocket connected9999999999");
            };
            wsRef.current.onmessage = (message) => {
                try{
                    // Parse the JSON string into an object
        
                    // Example: data = { leftPlayer: { y: 50 }, rightPlayer: { y: 100 } }
                    const data = JSON.parse(message.data);

                    if (data.action === "init_players"){
                        playerRole.current      = data.role;
                        leftPlayerRef.current.y = data.leftPlayer.y;
                        rightPlayerRef.current.y= data.rightPlayer.y;
                        Object.assign(ballRef.current, data.ball);
                    }
                    if (data.action === "update_ball"){
                        Object.assign(ballRef.current, data.ball);
                        leftPlayerRef.current.score = data.leftPlayer.score;
                        rightPlayerRef.current.score= data.rightPlayer.score;
                    }
                    if (data.action  === "update_girl") {
                        // console.log(`update the ${data.role}`)
                        if (data.role === playerRole.current){
                            console.log(`HEHEHE LEGUAAAA`);
                            return
                        }
                        if (data.role === "rightPlayer") {
                            rightPlayerRef.current.y = data.new_pos;
                        }
                        if (data.role === "leftPlayer") {
                            leftPlayerRef.current.y = data.new_pos;
                        }
                    }

                    // if (data.role){
                    //     playerRole.current = data.role;
                    // }
                    // if (data.ball) {
                    //     Object.assign(ballRef.current, data.ball);
                    // }
                    // if (data.leftPlayer ){
                    //     leftPlayerRef.current.y = data.leftPlayer.y;
                    //     leftPlayerRef.current.score = data.leftPlayer.score;
                    // }
                    // if (data.rightPlayer && data.rightPlayer.y !== rightPlayerRef.current.y){
                    //     rightPlayerRef.current.y = data.rightPlayer.y;
                    //     rightPlayerRef.current.score = data.rightPlayer.score;
                    // }
                    if (data.winner){
                        if (data.winner === "leftPlayer" || data.winner === "rightPlayer")
                            console.log("WINNNNEEEER");
                    }
                    // console.log("Updated from Backend:", data);
                    }
                    catch(error){
                        console.error('PARSING ERROR:', error);
                    }       
            };
                
            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            wsRef.current.onclose = () => {
                console.log("WebSocket disconnected");
            };
        };
        
    

        setupWebSocket();


        const renderGame = () => {
            const ctx = canvas.getContext("2d");
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

            // Draw paddles
            ctx.fillStyle = leftPlayerRef.current.color;
            ctx.fillRect(leftPlayerRef.current.x, leftPlayerRef.current.y, leftPlayerRef.current.w, leftPlayerRef.current.h);

            ctx.fillStyle = rightPlayerRef.current.color;
            ctx.fillRect(rightPlayerRef.current.x, rightPlayerRef.current.y, rightPlayerRef.current.w, rightPlayerRef.current.h);

            // // update tha paddles
            // movePaddle();

            //Draw score
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(leftPlayerRef.current.score, canvas.width/4, canvas.height/5);
            ctx.fillText(rightPlayerRef.current.score, canvas.width/4 * 3, canvas.height/5);

        };
        


/*
        // const movePaddle = () => {
        //     let stateChanged = false;

        //     if (lPaddleMoveRef.current.up) {
        //         Object.assign(leftPlayerRef.current, {
        //             y: Math.max(0, leftPlayerRef.current.y - 15),
        //         });
        //         stateChanged = true;
        //         console.log("left up", stateChanged);
        //     }
        //     if (lPaddleMoveRef.current.down) {
        //         Object.assign(leftPlayerRef.current, {
        //             y: Math.min(canvasRef.current.height - leftPlayerRef.current.h, leftPlayerRef.current.y + 15),
        //         });
        //         stateChanged = true;
        //         console.log("left down", stateChanged);
        //     }

        //     if (rPaddleMoveRef.current.up) {
        //         Object.assign(rightPlayerRef.current, {
        //             y: Math.max(0, rightPlayerRef.current.y - 15),
        //         });
        //         stateChanged = true;
        //         console.log("right up", stateChanged);
        //     }
        //     if (rPaddleMoveRef.current.down) {
        //         Object.assign(rightPlayerRef.current, {
        //             y: Math.min(canvasRef.current.height - rightPlayerRef.current.h, rightPlayerRef.current.y + 15),
        //         });
        //         stateChanged = true;
        //         console.log("right down", stateChanged);
        //     }
        //     console.log("-8-8-8-8-8-8…", leftPlayerRef.current.y);
        //     console.log("7-7-7-7-7-7-7:", rightPlayerRef.current.y)
        //     // Send paddle movement to server
        //     //?. to make sure wsRef isnt null or undefined
        //     if (stateChanged && wsRef.current?.readyState ===WebSocket.OPEN){
        //         const currentState = {
        //             leftY: leftPlayerRef.current.y,
        //             rightY: rightPlayerRef.current.y,
        //         };
        //         if (Math.abs(currentState.leftY - lastSentStateRef.current.leftY) > 1 ||
        //             Math.abs(currentState.rightY - lastSentStateRef.current.rightY) > 1){
        //                 wsRef.current?.send(
        //                     JSON.stringify({
        //                         //The client sends data as a JSON string
        //                         //leftPlayer is an object and y is its property
        //                         // {
        //                         //     "leftPlayer": { "y": 50 },
        //                         //     "rightPlayer": { "y": 100 }
        //                        // }
        //                         leftPlayer: { y: leftPlayerRef.current.y, score: leftPlayerRef.current.score },
        //                         rightPlayer: { y: rightPlayerRef.current.y, score: rightPlayerRef.current.score },
        //                     })
        //                 );
        //                 lastSentStateRef.current = currentState;
        //             }
        //     }
        // }; 
*/



        const movePaddle = (event) => {
            if (playerRole.current === 'rightPlayer') {

                if (rPaddleMoveRef.current.up){
                    rightPlayerRef.current.y = Math.max(0, rightPlayerRef.current.y - 10);
                }
                if (rPaddleMoveRef.current.down){
                    rightPlayerRef.current.y = Math.min(canvasRef.current.height - rightPlayerRef.current.h, rightPlayerRef.current.y + 10);
                    
                }
            }
            if (playerRole.current === 'leftPlayer') {


                if (lPaddleMoveRef.current.up){
                    leftPlayerRef.current.y = Math.max(0, leftPlayerRef.current.y - 10);
                    
                }
                if (lPaddleMoveRef.current.down){
                    leftPlayerRef.current.y = Math.min(canvasRef.current.height - leftPlayerRef.current.h, leftPlayerRef.current.y + 10);
                }
            }
        }

        const sendToPlayer = () =>  {
            let player;
            if (playerRole.current === "rightPlayer"){
                console.log('send right data')
                player = rightPlayerRef.current;
            }
            else if (playerRole.current === "leftPlayer"){
                console.log('send left data')
                player = leftPlayerRef.current;
            }
            else{
                console.log('HEHE GOT NOTHING')
                return
            }
            wsRef.current?.send(
                JSON.stringify({
                    type     : 'update_girl',
                    role     : playerRole.current,
                    player_y : player.y
                })
            );
        }
        let lastTime = 0;
        function gameLoop(currentTime) {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            sendToPlayer();
            movePaddle(deltaTime); // Update paddle positions
            renderGame(deltaTime); // Render the game
        
            requestAnimationFrame(gameLoop); // Schedule the next frame
        }


        requestAnimationFrame(gameLoop);
        console.log(`GAMEID= ${gameId}   =====`)
        // const keyPressInterval = setInterval(movePaddle, 1000 / 60);

        const handleKeyDown = (event) => {
            event.preventDefault()
            if (playerRole.current === 'rightPlayer'){
                if (event.key === 'ArrowDown')
                    rPaddleMoveRef.current.down = true;
                if (event.key === 'ArrowUp')
                    rPaddleMoveRef.current.up = true;
            }
            if (playerRole.current === 'leftPlayer'){
                if (event.key === 'ArrowDown')
                    lPaddleMoveRef.current.down = true;
                if (event.key === 'ArrowUp')
                    lPaddleMoveRef.current.up = true;
            }

        };
        const handleKeyUp = (event) => {
            event.preventDefault()
            if (playerRole.current === 'rightPlayer'){
                if (event.key === 'ArrowDown')
                    rPaddleMoveRef.current.down = false;
                if (event.key === 'ArrowUp')
                    rPaddleMoveRef.current.up = false;
            }
            if (playerRole.current === 'leftPlayer'){
                if (event.key === 'ArrowDown'){
                    lPaddleMoveRef.current.down = false;
                }
                if (event.key === 'ArrowUp')
                    lPaddleMoveRef.current.up = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            if (wsRef.current)
                    wsRef.current.close();
            // clearInterval(gameInterval);
            // clearInterval(keyPressInterval);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            
        };
    }, [gameId]);

    return (
        <div className='game_container'>
            <p>You are playing as: {playerRole.current}</p>
            <canvas ref={canvasRef}></canvas>
            <h1>{gameId}</h1>
        </div>
    );
};


export default RemoteGame;