import React, { useEffect, useRef } from 'react';
import "./PongGame.css"
import profile from "./logo.png"
// import AdversariesBar from '../../AdversariesBar';
// import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';


const OnePlayerGame = () => {
    console.log("hfhfhfhf");
    const canvasRef = useRef(null);
    
    const ballRef = useRef({x: 0, y: 0, radius: 12, color: "white", speed: 9, velocityX: -9, velocityY: 9});
    const netRef = useRef({x: 0, y: 0, w: 6, h: 12});
    const botRef = useRef({x: 0, y: 0, w: 20, h: 120, color: "#E84172", score: 0});
    const playerRef = useRef({x: 0, y: 0, w: 20, h: 120, color: "#D8FD62", score: 0});
    const paddleMoveRef = useRef({up: false, down: false});
    const isGameRunning = useRef(true);

    const navigate = useNavigate();

        useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 1000;
        canvas.height = 700;

        const paddleMove = paddleMoveRef.current;
    
        const ball = ballRef.current;
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;
        
        const bot = botRef.current;
        bot.x = canvas.width - bot.w;
        bot.y = canvas.height - bot.h;

        const player = playerRef.current;

        const net = netRef.current;
        net.x = canvas.width/2 - net.w/2;
        
        const ctx = canvas.getContext("2d");
        const renderGame = () => {
            //clear the canvas area before rendering
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // draw table
            ctx.fillStyle = "#636987";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //draw the net
            ctx.fillStyle = "#D9D9D9";
            for (let i = 0; i < canvas.height; i += 20){
                ctx.fillRect(net.x, net.y + i, net.w, net.h);
            }
            
            //draw ball
            ctx.beginPath();
            ctx.fillStyle = ball.color;
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.closePath();

            //draw player's paddle
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.w, player.h);
            
            //draw bot's paddle
            ctx.fillStyle = bot.color;
            ctx.fillRect(bot.x, bot.y, bot.w, bot.h);

            //the score
            ctx.fillStyle = "white";
            ctx.font = "60px rationale";
            ctx.fillText(player.score, canvas.width/4, canvas.height/5);
            ctx.fillText(bot.score, canvas.width/4 * 3, canvas.height/5);
        }
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
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
            
            //check collision with top and bottom walls
            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
                ball.velocityY *= -1;
            
            //controle the bot's paddle
            const newBotY = bot.y += (ball.y - (bot.y + bot.h/2)) * 0.1;//align the paddle's center with the ball //* 0.1 to be able to bet the computer/adversary so it won't be = to the ball's y 
            bot.y = (Math.max(0, Math.min(newBotY, canvas.height - bot.h)));
            
            const paddle = ((ball.x > canvas.width/2) ? bot : player);
            if (checkCollision(paddle, ball)){
                // let collidePoint = ball.y - paddle.y; //where does the ball hit the paddle; 50 if center, <50 if up and >50 if down
                // let angleRad = (collidePoint < paddle.h/2) ? -Math.PI/4 : (collidePoint > paddle.h/2) ? Math.PI/4 : 0;
                // if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
                //     angleRad = -angleRad;

                //controle the ball when it hits the paddle's center when placed at the top or the buttom of the canvs 
                // angleRad = (ball.y+ball.radius >= canvas.height) ? -45 : (ball.y-ball.radius <= 0) ? 45 : angleRad;

                let angleRad = (ball.y === (paddle.y + paddle.h/2)) ? 0 : ( ball.velocityY > 0) ? Math.PI/4 : -Math.PI/4;//move the ball to the opposite direction from which it come
                const direction = (ball.x < canvas.width/2) ? 1 : -1;

                ball.velocityX = (Math.cos(angleRad) * ball.speed) * direction;
                ball.velocityY = Math.sin(angleRad) * ball.speed;
                ball.speed += 0.1;
            }

            if (ball.x - ball.radius <= 0){
                bot.score++;
                setBall();
            }
            else if (ball.x + ball.radius >= canvas.width){
                player.score++;
                setBall();
            }
            if (player.score === 5 || bot.score === 5)
                isGameRunning.current = false;
        }
        
            const game = () => {
                renderGame();
                updateGame();
                if (isGameRunning.current === false){
                    setTimeout(() => {
                        setBall();
                        ctx.fillStyle = "white";
                        ctx.font = "90px rationale";
                        if (player.score === 5)
                            ctx.fillText("WIN!", canvas.width / 8, canvas.height / 2);
                        else
                            ctx.fillText("WIN!", (canvas.width/8)*5, canvas.height / 2);
                    }, 2000);
                    navigate(`/game/Local/SingleGame/SoloPractice/Score`, 
                    {state:{ player1:"YOU" , player2:"BOT", player1Score:player.score, player2Score:bot.score }});
                }
            }
            const handleKeyDown = (event) => {
                if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S')
                    paddleMove.down = true;
                if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W')
                    paddleMove.up = true;
            };
            const handleKeyUp = (event) => {
                if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S')
                    paddleMove.down = false;
                if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W')
                    paddleMove.up = false;
            };
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            const movePaddle = (event) => {
                if (paddleMove.up){
                    playerRef.current.y = Math.max(0, playerRef.current.y - 10);
                }
                else if (paddleMove.down){
                    playerRef.current.y = Math.min(canvasRef.current.height - playerRef.current.h, playerRef.current.y + 10);
                }
            }
            const gameInterval = setInterval(game, 1000 / 60);
            const keyPressInterval = setInterval(movePaddle, 1000 / 60);
            return () => {
                clearInterval(gameInterval);
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
                        <span className="p-name1">YOU</span>
                        <span className="V">V</span>
                    {/* </div> */}
                </div>
                <div className='player2'>
                    {/* <div className='player2-info'> */}
                        <span className="S">S</span>
                        <span className="p-name2">BOT</span>
                        <span className="p-img"><img src={profile} alt=""></img></span>
                        {/* <img src={profile} alt=""></img> */}
                    {/* </div> */}
                </div>
            </div>
          {/* <AdversariesBar className="adversariesBar"></AdversariesBar> */}
            <canvas ref={canvasRef}></canvas>
      </div>
    )
} 

export default OnePlayerGame




// const OnePlayerGame = () => {
//     const canvasRef = useRef(null);
//     const canvasW = 1000;
//     const canvasH = 700;
    
//     const [ball, setBall] = useState({x: canvasW/2, y: canvasH/2, radius: 12, color: "white", speed: 9, velocityX: -9, velocityY: 9});
//     const net = {w: 6, h: 12, x: canvasW/2, y: canvasW/2 - 6/2};
//     const [bot, setBot] = useState({w: 20, h: 120, color: "#E84172", score: 0, x: canvasW - 20, y: canvasH - 120});
//     const [player, setPlayer] = useState({x: 0, y: 0, w: 20, h: 120, color: "#D8FD62", score: 0});
//     const paddleMove = {up: false, down: false};
//     const end = useRef(false);
    
//     const navigate = useNavigate();

//     const renderGame = (ctx, canvas) => {
//         //clear the canvas area before rendering
//         // ctx.clearRect(0, 0, canvas.width, canvas.height);
        
//         // draw table
//         ctx.fillStyle = "#636987";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);
        
//         //draw the net
//         ctx.fillStyle = "#D9D9D9";
//         for (let i = 0; i < canvas.height; i += 20){
//             ctx.fillRect(net.x, net.y + i, net.w, net.h);
//         }
        
//         //draw ball
//         ctx.beginPath();
//         ctx.fillStyle = ball.color;
//         ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
//         ctx.fill();
//         ctx.closePath();
        
//         //draw player's paddle
//         ctx.fillStyle = player.color;
//         ctx.fillRect(player.x, player.y, player.w, player.h);
        
//         //draw bot's paddle
//         ctx.fillStyle = bot.color;
//         ctx.fillRect(bot.x, bot.y, bot.w, bot.h);
        
//         //the score
//         ctx.fillStyle = "white";
//             ctx.font = "60px rationale";
//             ctx.fillText(player.score, canvas.width/4, canvas.height/5);
//             ctx.fillText(bot.score, canvas.width/4 * 3, canvas.height/5);
//         }
        
//         const checkCollision = (paddle, ball) => {
//             paddle.top = paddle.y;
//             paddle.bottom = paddle.y + paddle.h;
            
//             paddle.right = paddle.x + paddle.w;
//             paddle.left = paddle.x;

//             ball.top = ball.y - ball.radius;
//             ball.bottom = ball.y + ball.radius;
//             ball.right = ball.x + ball.radius;
//             ball.left = ball.x - ball.radius;
  
//             return (ball.left <= paddle.right && ball.top <= paddle.bottom && ball.bottom >= paddle.top && ball.right >= paddle.left)
//         }

//         const resetBallPos = (canvas) =>{
//             setBall((prev) => ({
//                 ...prev, 
//                 x: canvas.width/2,
//                 y: canvas.height/2,
//                 velocityX: -prev.velocityX,
//                 speed: 9
//             }))
//         }

//         const updateGame = (ctx, canvas) => {
//             if (end.current)
//                 return;
//             setBall((prev) => ({
//                 ...prev, 
//                 x: prev.x + prev.velocityX,
//                 y: prev.y + prev.velocityY
//             }))
            
//             //check collision with top and bottom walls
//             if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0)
//                 setBall((prev) => ({...prev, velocityY: prev.velocityX * -1}))
            
//             //controle the bot's paddle
//             const newBotY = bot.y += (ball.y - (bot.y + bot.h/2)) * 0.1;//align the paddle's center with the ball //* 0.1 to be able to bet the computer/adversary so it won't be = to the ball's y 
//             setBot((prev) => ({...prev, y: (Math.max(0, Math.min(newBotY, canvas.height - prev.h)))}))
            
//             const paddle = ((ball.x > canvas.width/2) ? bot : player);
//             if (checkCollision(paddle, ball)){
//                 let angleRad = (ball.y === (paddle.y + paddle.h/2)) ? 0 : ( ball.velocityY > 0) ? Math.PI/4 : -Math.PI/4;//move the ball to the opposite direction from which it come
//                 const direction = (ball.x < canvas.width/2) ? 1 : -1;
                
//                 setBall((prev) => ({
//                     ...prev, 
//                     velocityX: (Math.cos(angleRad) * prev.speed) * direction,
//                     velocityY: Math.sin(angleRad) * prev.speed,
//                     speed: prev.speed + 0.1
//                 }))
//             }

//             if (ball.x - ball.radius <= 0){
//                 setBot((prev) => ({...prev, score: prev.score++}))
//                 resetBallPos(canvas);
//             }
//             else if (ball.x + ball.radius >= canvas.width){
//                 setPlayer((prev) => ({...prev, score: prev.score++}))
//                 resetBallPos(canvas);
//             }
//             if (player.score === 5 || bot.score === 5){
//                 end.current = true;
//                 setBall((prev) => ({
//                     ...prev, 
//                     x: canvas.width/2,
//                     y: canvas.height/2,
//                 }))
//                 setTimeout(() => {
//                     //win message
//                     ctx.font = "90px rationale";
//                     if (player.score === 5)
//                         ctx.fillText("WIN!", canvas.width / 8, canvas.height / 2);
//                     else
//                         ctx.fillText("WIN!", (canvas.width/8)*5, canvas.height / 2);
//                     renderGame(ctx, canvas);
//                     navigate(`/game/Local/SingleGame/SoloPractice/Score`, 
//                     {state:{ player1:"YOU" , player2:"BOT", player1Score:player.score, player2Score:bot.score }});
//                 }, 2000);
//             }
//         }
//         const game = (ctx, canvas) => {
//             renderGame(ctx, canvas);
//             updateGame(ctx, canvas);
//         }
//         useEffect(() => {
//             const canvas = canvasRef.current;
//             if (!canvas)
//                     return;
//             canvas.width = canvasW;
//             canvas.height = canvasH;
//             const ctx = canvas.getContext("2d");
            
//             const handleKeyDown = (event) => {
//                 if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S')
//                     paddleMove.down = true;
//                 if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W')
//                     paddleMove.up = true;
//             };
//             const handleKeyUp = (event) => {
//                 if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S')
//                     paddleMove.down = false;
//                 if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W')
//                     paddleMove.up = false;
//             };
//             window.addEventListener('keydown', handleKeyDown);
//             window.addEventListener('keyup', handleKeyUp);
            
//             const movePaddle = (event) => {
//                 if (paddleMove.up)
//                     setPlayer((prev) => ({...prev, y: Math.max(0, prev.y - 10)}))
//                 else if (paddleMove.down)
//                     setPlayer((prev) => ({...prev, y: Math.min(canvas.height - player.h, prev.y + 10)}))
//             }
//             const gameInterval = setInterval(() => game(ctx, canvas), 1000 / 60);
//             const keyPressInterval = setInterval(movePaddle, 1000 / 60);
//             return () => {
//                 clearInterval(gameInterval);
//                 clearInterval(keyPressInterval);
//             };
//         });
//     return (
//       <div className='game_container'>
//         <div className='adversaries'>
//                 <div className='player1'>
//                     {/* <div className='player1-info'> */}
//                         {/* <img src={profile} alt=""></img> */}
//                         <span className="p-img"><img src={profile} alt=""></img></span>
//                         <span className="p-name1">YOU</span>
//                         <span className="V">V</span>
//                     {/* </div> */}
//                 </div>
//                 <div className='player2'>
//                     {/* <div className='player2-info'> */}
//                         <span className="S">S</span>
//                         <span className="p-name2">BOT</span>
//                         <span className="p-img"><img src={profile} alt=""></img></span>
//                         {/* <img src={profile} alt=""></img> */}
//                     {/* </div> */}
//                 </div>
//             </div>
//           {/* <AdversariesBar className="adversariesBar"></AdversariesBar> */}
//             <canvas ref={canvasRef} ></canvas>
//       </div>
//     )
// } 

// export default OnePlayerGame
