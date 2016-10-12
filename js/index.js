/*

   KNOWN ISSUES:

   - Git would be dope...

   - If ball hits the paddle at the very edge of the canvas, it sometimes gets stuck in the wall
   - Should be fixed now

   - New bug prolly cause of the fix above: Occasionally ball passes through the wall

   - Weird brick collisions

   - The ball goes through bricks that are under the ball at the start of the game

   - Do something about ricochets when hitting 2 bricks at the same frame

   - Do something about brick corner ricochets

*/

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var x = canvas.width / 2; // Ball starting position
var y = canvas.height / 2;

var origdx = 4; // Speed on bounce from paddle
var origdy = -4;

var startdx = 0; // Ball speed on game reset
var startdy = Math.sqrt(Math.pow(origdx, 2) + Math.pow(-origdy, 2));

var ballSpeed = Math.sqrt(Math.pow(origdx, 2) + Math.pow(-origdy, 2)); // The speed of the ball

var maxAngle = 45; // Angle for bounces from the corners of the paddle

var paddleWidth = canvas.width * (1 / 6); // Paddle width derived from canvas width
var paddleHeight = paddleWidth * (1 / 7); // Paddle height is 1/7th of paddle width
var paddleX;
var paddleStartPos = (canvas.width - paddleWidth) / 2; // Paddle position on game start
var paddleY = canvas.height - paddleHeight;

var paddleSpeed = 7;

var randomX = Math.floor(Math.random()*10) + 1; // Randomize brick count
var randomY = Math.floor(Math.random()*3) + 1;

var XY = {};
var brick = {};
var brickCount = 0;
var brickXCount = randomX;
var brickYCount = randomY;
var winCondition = brickXCount * brickYCount;
var winProgress = 0;
var brickMargin = 10;
var brickWidth = canvas.width / brickXCount - brickMargin;
var brickHeight = brickWidth * (1 / 3);
for (var X = 0; X < brickXCount; X++) { // Initiate the existence of the bricks
    for (var Y = 0; Y < brickYCount; Y++) {
        brick["x" + X + " y" + Y] = true;
    }
}
var brickXPos = canvas.width * (1 / brickXCount); // Draw bricks to fill the canvas horizontally
var brickYPos = (brickHeight + brickMargin) + (1 / brickYCount); // Brick height is 1/3 of width

var rightPressed = false; // Initiate the default state of the paddle's movement
var leftPressed = false;

var ballRadius = 10; // Ball size

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD" // Ball color
        ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD"; // Paddle color
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    var brickCount = 0;
    for (var X = 0; X < brickXCount; X++) { // Draw the bricks
        for (var Y = 0; Y < brickYCount; Y++) { // If brick is true/exists
            if (brick["x" + X + " y" + Y]) {
                var objNameX = "brickX" + brickCount + X; // Variables for naming brick locations for XY object
                var objNameY = "brickY" + brickCount + Y;
                XY[objNameX] = brickXPos * X + (brickMargin * (1 / 2));
                XY[objNameY] = brickYPos * Y + (brickMargin * (1 / 2));

                /* if (x >= XY[objNameX] && x <= XY[objNameX] + brickWidth && y >= XY[objNameY] && y <= XY[objNameY] + brickHeight) {
                   brick["x" + X + " y" + Y] = false;
                   }*/ // Check if the ball hits a brick without turn (legacy code) <-- cool word (Doesn't really work here tho, you dimwit)

                if (x + ballRadius >= XY[objNameX] && x + ballRadius <= (XY[objNameX] + brickWidth) && y >= XY[objNameY] && y <= (XY[objNameY] + brickHeight)) {
                    dx = -dx;
                    brick["x" + X + " y" + Y] = false; // Delete brick existence
                    winProgress++;
                } else if (x >= XY[objNameX] && x <= (XY[objNameX] + brickWidth) && y + ballRadius >= XY[objNameY] && y + ballRadius <= (XY[objNameY] + brickHeight)) {
                    dy = -dy;
                    brick["x" + X + " y" + Y] = false; // Delete brick existence
                    winProgress++;
                } else if (x - ballRadius >= XY[objNameX] && x - ballRadius <= (XY[objNameX] + brickWidth) && y >= XY[objNameY] && y <= (XY[objNameY] + brickHeight)) {
                    dx = -dx;
                    brick["x" + X + " y" + Y] = false; // Delete brick existence
                    winProgress++;
                } else if (x >= XY[objNameX] && x <= (XY[objNameX] + brickWidth) && y - ballRadius >= XY[objNameY] && y - ballRadius <= (XY[objNameY] + brickHeight)) {
                    dy = -dy;
                    brick["x" + X + " y" + Y] = false; // Delete brick existence
                    winProgress++;
                } else {

                    cornerBrickX = Math.pow(x - XY[objNameX], 2);
                    cornerBrickY = Math.pow(y - XY[objNameY], 2);
                    if (Math.sqrt(cornerBrickX + cornerBrickY) < ballRadius) {

                        if (dx <= 0) {
                            dy = -dy
                        } else if (dy <= 0) {
                            dx = -dx
                        } else if (dx >= dy) {
                            dy = -dy
                        } else if (dy > dx) {
                            dx = -dx
                        }
                        brick["x" + X + " y" + Y] = false; // Delete brick existence
                        winProgress++;
                    }
                    cornerBrickX = Math.pow(x - (XY[objNameX] + brickWidth), 2); // Count corner position
                    cornerBrickY = Math.pow(y - XY[objNameY], 2);
                    if (Math.sqrt(cornerBrickX + cornerBrickY) < ballRadius) { // Check if ball touches corner
                        if (dx > 0) { // Turn ball according to whatever direction it comes from
                            dy = -dy
                        } else if (dy < 0) {
                            dx = -dx
                        } else if (dy >= -dx) {
                            dy = -dy
                        } else if (-dx > dy) {
                            dx = -dx
                        }
                        brick["x" + X + " y" + Y] = false; // Delete brick existence
                        winProgress++;
                    }
                    cornerBrickX = Math.pow(x - XY[objNameX], 2);
                    cornerBrickY = Math.pow(y - (XY[objNameY] + brickHeight), 2);
                    if (Math.sqrt(cornerBrickX + cornerBrickY) < ballRadius) {
                        if (dx <= 0) {
                            dy = -dy
                        } else if (dy >= 0) {
                            dx = -dx
                        } else if (dx >= -dy) {
                            dx = -dx
                        } else if (-dy > dx) {
                            dy = -dy
                        }
                        brick["x" + X + " y" + Y] = false; // Delete brick existence
                        winProgress++;
                    }
                    cornerBrickX = Math.pow(x - (XY[objNameX] + brickWidth), 2);
                    cornerBrickY = Math.pow(y - (XY[objNameY] + brickHeight), 2);
                    if (Math.sqrt(cornerBrickX + cornerBrickY) < ballRadius) {
                        if (-dx < 0) {
                            dy = -dy
                        } else if (-dy < 0) {
                            dx = -dx
                        } else if (-dx >= -dy) {
                            dy = -dy
                        } else if (-dy > -dx) {
                            dx = -dx
                        }
                        brick["x" + X + " y" + Y] = false; // Delete brick existence
                        winProgress++;
                    }
                }

                ctx.beginPath();
                ctx.rect(XY[objNameX], XY[objNameY], brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();

                brickCount++;
            }
        }
    }
}

// Function that reloads the game after a loss
function reload() {
    winProgress = 0;
    paddleX = paddleStartPos;
    gameStart = 0;
    x = canvas.width / 2;
    y = canvas.height / 2;
    dx = startdx;
    dy = 0;
    for (var X = 0; X < brickXCount; X++) { // Reset the existence of the bricks
        for (var Y = 0; Y < brickYCount; Y++) {
            brick["x" + X + " y" + Y] = true;
        }
    }
    brickCount = 0;
}

var time;
var invis = 200; // How long before the ball can be hit again (Counted in ms)

// Change the ball direction on hitting the paddle
function turn(subtractTime, angleX, angleY) {
    if (subtractTime - time > invis) {
        dx = angleX;
        dy = angleY;
    }
    time = new Date();
}

// Hit the paddle from the left side (Always hits the corner of the paddle)
function turnLeft(subtractTime) {
    if (subtractTime - time > invis) { // If the ball hasn't hit for var invis ms execute this
        dx = -(Math.sin(maxAngle * (Math.PI / 180)) * ballSpeed); // Calculate ball x and y speed according to bounce angle
        dy = -(Math.cos(maxAngle * (Math.PI / 180)) * ballSpeed);
    }
    time = new Date();
}

// Hit the paddle from the right side (Always hits the corner of the paddle)
function turnRight(subtractTime) {
    if (subtractTime - time > invis) { // If the ball hasn't hit for var invis ms execute this
        dx = (Math.sin(maxAngle * (Math.PI / 180)) * ballSpeed); // Calculate ball x and y speed according to bounce angle
        dy = -(Math.cos(maxAngle * (Math.PI / 180)) * ballSpeed);

    }
    time = new Date();
}

var dx; // Change these when changing ball speed
var dy;

var speedX; // Initiate var for turn()
var speedY;
var angle;
var distX;

var newX; // Initiate var for turnLeft() and turnRight()
var newY;

var cornerBrickX; // Initiate var for hitting corners of bricks
var cornerBrickY;

var newWallTime;
var wallTime = new Date();
var newTime; // Initiate var for ball invis
var time = new Date();

reload(); // Runs the reload before the game starts so starting direction is received from startdx and startdy variables

// Game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Draws a blank background each frame to overwrite the previous frames' ball and paddle draws

    drawPaddle(); // Draws the paddle and ball each frame
    drawBall();
    drawBricks();

    x += dx; // Moves the ball each frame by the amount of dx and dy
    y += dy;

    // If the ball hits either side of the canvas, change direction and make it unable to bounce for invis ms
    if (x >= canvas.width - ballRadius || x <= ballRadius) {
        newWallTime = new Date();
        if (newWallTime - wallTime > invis) {
            dx = -dx;
        }
        wallTime = new Date();
    }

    // If the ball hits the top of the canvas, change direction
    if (y <= ballRadius) {
        dy = -dy;
    }

    if (x > paddleX && x < paddleX + paddleWidth) { // If the ball is on top of the paddle
        if (y + ballRadius >= paddleY) { // If the ball hits the paddle
            distX = ((paddleX + (paddleWidth / 2)) - x) / (paddleWidth / 2); // Count distX from paddle center in percents      
            angle = maxAngle * distX; // Count trajectory with percentual distance from paddle center
            var speedX = Math.sin(angle * (Math.PI / 180)) * ballSpeed; // Count the x and y speed of the ball with dem trigonometry magicks!!!11
            var speedY = Math.cos(angle * (Math.PI / 180)) * ballSpeed;

            newTime = new Date();
            turn(newTime, -speedX, -speedY);
        }
    } else if (x <= paddleX) { // If the ball is on the left side of the paddle and hits the corner of the paddle, turn the ball direction
        newX = Math.pow(x - paddleX, 2);
        newY = Math.pow(y - paddleY, 2);
        if (Math.sqrt(newX + newY) < ballRadius) {
            newTime = new Date();
            turnLeft(newTime);
        }
    } else if (x >= paddleX) { // If the ball is on the right side of the paddle and hits the corner of the paddle, turn the ball direction
        newX = Math.pow(x - (paddleX + paddleWidth), 2);
        newY = Math.pow(y - paddleY, 2);
        if (Math.sqrt(newX + newY) < ballRadius) {
            var newTime = new Date();
            turnRight(newTime);
        }
    }

    if (y + ballRadius > canvas.height) { // If the ball hits the canvas bottom, log "GAME OVER" and reset game
        console.log("GAME OVER");
        reload();
    }

    if (winProgress >= winCondition) {
        console.log("YOU WIN!!!! :D")
            reload();
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) { // Check if right arrow is pressed and the paddle isn't over the right edge of the canvas
        paddleX += paddleSpeed; // Add paddleSpeed each frame to paddle position
    }
    if (leftPressed && paddleX > 0) { // Check if left arrow is pressed and the paddle isn't over the left edge of the canvas
        paddleX -= paddleSpeed; // Add paddleSpeed each frame to paddle position
    }
    requestAnimationFrame(draw); // Draw canvas again in 60 fps
}

document.addEventListener("keydown", keyDownHandler, false); // Add event listeners that checks if a key is pressed down
document.addEventListener("keyup", keyUpHandler, false); // If there is a key pressed down, run keyDownHandler or keyUpHandler functions

var gameStart = 0; // When this is 1 the game will start, if it's over 1 it won't do anything

function keyDownHandler(e) {
    if (e.keyCode === 32) {
        gameStart++; // Super awfully anti elegant solution
        if (gameStart === 1) {
            dy = startdy;
        }
    }
    if (e.keyCode === 39) { // If right arrow is pressed change rightPressed to true
        gameStart++; // Super awfully anti elegant solution
        if (gameStart === 1) {
            dy = startdy;
        }
        rightPressed = true;
    } else if (e.keyCode === 37) { // If left arrow is pressed change rightPressed to true
        gameStart++; // Please figure out a substitution for this
        if (gameStart === 1) {
            dy = startdy;
        }
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode === 39) { // If right arrow is not pressed change rightPressed to true
        rightPressed = false;
    } else if (e.keyCode === 37) { // If left arrow is not pressed change rightPressed to true
        leftPressed = false;
    }
}

requestAnimationFrame(draw); // Start the game loop
