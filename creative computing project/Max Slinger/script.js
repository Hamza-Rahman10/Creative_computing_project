"use strict";

// Variable declarations for game elements
let player;
let land1;
let land2;
let land3;
let land4;
let land5;
let land6;
let land7;
let land8;
let land9;
let bullet1;
let bullet2;
let bullet3;
let crosshair;

// object array
let LandArray = [];
let bullets = [];
let aliens = [];

//player movement variables
let moveForward;
let moveBackwards;
let angle;
let movementSpeed = 0.5;

//bullet variables
let bulletAngle;
let bulletSpeed = 20;
let canShoot = true;
let shootAnimationOver;
let bulletActive;

//animation variables
let playerSprite = "Images/player.png";
let alienSprite = "Images/alien.png";
let imagesScale = 0.4;

//land variables
let currentMaxX = 1280;
let currentMinX = -1280;
let currentMaxY = 720;
let currentMinY = -720;

//gameplay variables
let gameOver = false;
let restartScreen;

//score variables
let highscore = 0;
let score = 0;

//alien variables
let aliensWaitTime = [];
let aliensAnimationPosition = [];
let aliensPlayerCollision = [];
let spawnAliensInterval;

function startGame() // Initializes the game components and settings
{
    GameArea.start();
    player = new Component(313*imagesScale,207*imagesScale,playerSprite,640-(313*imagesScale)/2,360-(202*imagesScale)/5,"player",0);
    land1 = new Component(1280,720,"Images/land.png",-1280,720,"land");
    land2 = new Component(1280,720,"Images/land.png",0,720,"land");
    land3 = new Component(1280,720,"Images/land.png",1280,720,"land");
    land4 = new Component(1280,720,"Images/land.png",-1280,0,"land");
    land5 = new Component(1280,720,"Images/land.png",0,0,"land");
    land6 = new Component(1280,720,"Images/land.png",1280,0,"land");
    land7 = new Component(1280,720,"Images/land.png",-1280,-720,"land");
    land8 = new Component(1280,720,"Images/land.png",0,-720,"land");
    land9 = new Component(1280,720,"Images/land.png",1280,-720,"land");
    bullet1 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    bullet2 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    bullet3 = new Component(10,2,"images/bullet.png",-10,-2,"image");
    restartScreen = new Component(1280,720,"images/game over.png", 0,0,"image");
    crosshair = new Component(40,40,"images/crosshair.png",640,360,"image");

    bullets = [bullet1,bullet2,bullet3];
    LandArray = [land1,land2,land3,land4,land5,land6,land7,land8,land9];


    //Input
    window.addEventListener("keydown", handleMovementPress);
    window.addEventListener("keyup", handleMovementRelease);
    window.addEventListener("mousedown", Shoot);

    spawnAliensInterval = setInterval(spawnAlien, getRandomInterval());    // Start alien spawning mechanism

    //reset game
    aliens = [];
    score = 0;
    gameOver = false;

}

// Game area setup and maintenance functions
let GameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.context = this.canvas.getContext("2d");
        clearInterval(GameArea.interval);
        this.interval = setInterval(updateGameArea, 20);
        this.canvas.id = "Game-Window";

        //Put the canvas underneath the Game Title
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        let h1Element = document.querySelector("h1.Game-Title");
        h1Element.insertAdjacentElement("afterend", this.canvas);
    },

    clear: function() {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}

// Component constructor for creating various game elements
function Component(width, height, source, x, y, type, angle=0){
    this.type = type;
    this.angle = angle;

    if (type === "image" || type === "land") {
        this.image = new Image();
        this.image.src = source;
    }
    else if (type === "player") {
        this.image = new Image();
        this.image.src = playerSprite;
    }
    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;


   // Method to update the state and position
    this.update = function(){

        let ctx = GameArea.context;

        ctx.save();

        if(gameOver === false)
        {
            ctx.font = "50px Comic Sans MS"
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.fillText(score.toString(), 640, 100);
        }
        else{
            ctx.font = "120px Comic Sans MS";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText("High Score: " + highscore.toString(), 640, 700);
        }

        // Rotate the player Images based on the angle
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        //Images and Animated Images
        if(type === "image" || type === "land")
        {
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }
        else if(type === "player")
        {
            this.image.src = playerSprite;
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        if(type === "land") 
        {
            if(moveForward)
            {
                //move player
                this.x -= movementSpeed * 10 * Math.cos(player.angle);
                this.y -= movementSpeed * 10 * Math.sin(player.angle);

                //bullet
                bullet1.x -= movementSpeed * Math.cos(bulletAngle);
                bullet1.y -= movementSpeed * Math.sin(bulletAngle);

                bullet2.x -= movementSpeed * Math.cos(bulletAngle);
                bullet2.y -= movementSpeed * Math.sin(bulletAngle);

                bullet3.x -= movementSpeed * Math.cos(bulletAngle);
                bullet3.y -= movementSpeed * Math.sin(bulletAngle);

                for(let i = 0; i<aliens.length; i++)
                {
                    aliens[i].x -= movementSpeed * Math.cos(player.angle);
                    aliens[i].y -= movementSpeed * Math.sin(player.angle);
                }

                //infinite land
                InfiniteLand();

            }
            else if(moveBackwards)
            {
                this.x += movementSpeed * 10 * Math.cos(player.angle);
                this.y += movementSpeed * 10 * Math.sin(player.angle);

                //bullet
                bullet1.x += movementSpeed * Math.cos(bulletAngle);
                bullet1.y += movementSpeed * Math.sin(bulletAngle);

                bullet2.x += movementSpeed * Math.cos(bulletAngle);
                bullet2.y += movementSpeed * Math.sin(bulletAngle);

                bullet3.x += movementSpeed * Math.cos(bulletAngle);
                bullet3.y += movementSpeed * Math.sin(bulletAngle);

                for(let i = 0; i<aliens.length; i++)
                {
                    aliens[i].x += movementSpeed * Math.cos(player.angle);
                    aliens[i].y += movementSpeed * Math.sin(player.angle);
                }

                //infinite land
                InfiniteLand();
            }

        }

        ctx.restore();
    }
}

function updateGameArea(){
    GameArea.clear();

    //direction of mouse
    onmousemove = function(e)
    {
        //player rotation
        let rect = GameArea.canvas.getBoundingClientRect();
        angle = Math.atan2(e.clientY - rect.top - player.y - 150/2, e.clientX - rect.left-player.x-250/2);
        player.angle = angle;

        //Set crosshair's position
        crosshair.x = e.clientX-rect.left-24;
        crosshair.y = e.clientY-rect.top-17;
    }


    //bullet movement
    if(bulletActive){
        let bullet1Turn = ((Math.random())*3) * Math.PI/180;
        let bullet2Turn = 0;
        let bullet3Turn = ((Math.random()-1)*3) * Math.PI/180;

        bullet1.x += bulletSpeed * Math.cos(bulletAngle+bullet1Turn);
        bullet1.y += bulletSpeed * Math.sin(bulletAngle+bullet1Turn);

        bullet2.x += bulletSpeed * Math.cos(bulletAngle+bullet2Turn);
        bullet2.y += bulletSpeed * Math.sin(bulletAngle+bullet2Turn);

        bullet3.x += bulletSpeed * Math.cos(bulletAngle+bullet3Turn);
        bullet3.y += bulletSpeed * Math.sin(bulletAngle+bullet3Turn);

        //Reload
        if(bullet1.x > 1280)
        {
            canShoot = true;
        }
        else if(bullet1.x < 0)
        {
            canShoot = true;
        }
        else if(bullet1.y < 0)
        {
            canShoot = true;
        }
        else if(bullet1.y > 720)
        {
            canShoot = true;
        }
    }



    //Game context
    let ctx = GameArea.context;

    ctx.fillText(score.toString(),640,60);
    //move aliens
    for(let i = 0; i<aliens.length; i++)
    {
        if(aliensPlayerCollision[i])
        {
            aliens[i].angle = Math.atan2(aliens[i].y - player.y, aliens[i].x-player.x) + Math.PI;
            aliens[i].x -= movementSpeed*5 * Math.cos(Math.atan2(aliens[i].y - player.y, aliens[i].x-player.x));
            aliens[i].y -= movementSpeed*5 * Math.sin(Math.atan2(aliens[i].y - player.y, aliens[i].x-player.x));
            //aliensMovementAnimationFunction[i];
        }

    }

    //kill aliens
    for(let j = 0; j<bullets.length; j++)
    {
        for(let i = 0; i<aliens.length; i++)
        {
            if(bullets[j].x>aliens[i].x+27*imagesScale && bullets[j].x<aliens[i].x+(27+206)*imagesScale)
            {
                if(bullets[j].y>aliens[i].y+77*imagesScale && bullets[j].y<aliens[i].y+(77+197)*imagesScale)
                {
                    aliens.splice(i,1);
                    aliensWaitTime.splice(i,1);
                    aliensAnimationPosition.splice(i,1);
                    aliensPlayerCollision.splice(i,1);

                    score+=1;
                    bullets[j].x = 9999;
                    bullets[j].y = 9999;
                }
            }
        }
    }

    //collision detection
    for(let i = 0; i<aliens.length; i++)
    {
        if(aliens[i].x+27*imagesScale>(640-37)-player.width*imagesScale && aliens[i].x+(27)*imagesScale<(640+(256-37)*imagesScale)-player.width*imagesScale)
        {
            if(aliens[i].y+79*imagesScale>(360-38*imagesScale)-player.height*imagesScale-80 && aliens[i].y+(79)*imagesScale<(360+(150-38)*imagesScale)-player.height*imagesScale+50)
            {
                aliensPlayerCollision[i] = false;
                alienAttackAnimationFunction(i);
            }
            else{
                if(aliensPlayerCollision[i] === false)
                {
                    aliensAnimationPosition[i] = 0;
                }
                aliensPlayerCollision[i] = true;

            }
        }
        else{
            if(aliensPlayerCollision[i] === false)
            {
                aliensAnimationPosition[i] = 0;
            }
            aliensPlayerCollision[i] = true;
        }
    }
    // load land bullet and player objects
    land1.update();
    land2.update();
    land3.update();
    land4.update();
    land5.update();
    land6.update();
    land7.update();
    land8.update();
    land9.update();
    player.update();
    bullet1.update();
    bullet2.update();
    bullet3.update();
    crosshair.update();

    for(let i = 0; i<aliens.length; i++)
    {
        aliens[i].update();
    }
    if(gameOver)
    {
        restartScreen.update();
        ctx.fillText("High Score: " + highscore.toString(), 640, 650);
    }
}

function endGame() //shows highscore once defeated
{
    if(highscore<score)
    {
        highscore = score;
    }
}
//infinite land array loop
function moveLandLeft()
{
    LandArray[2].x -= 1280*3;
    LandArray[5].x -= 1280*3;
    LandArray[8].x -= 1280*3;
    LandArray = [LandArray[2], LandArray[0], LandArray[1], LandArray[5], LandArray[3], LandArray[4], LandArray[8], LandArray[6], LandArray[7],];
}

function moveLandRight()
{
    LandArray[0].x += 1280*3;
    LandArray[3].x += 1280*3;
    LandArray[6].x += 1280*3;
    LandArray = [LandArray[1], LandArray[2], LandArray[0], LandArray[4], LandArray[5], LandArray[3], LandArray[7], LandArray[8], LandArray[6],];
}

function moveLandUp()
{
    LandArray[6].y += 720*3;
    LandArray[7].y += 720*3;
    LandArray[8].y += 720*3;
    LandArray = [LandArray[6], LandArray[7], LandArray[8], LandArray[0], LandArray[1], LandArray[2], LandArray[3], LandArray[4], LandArray[5],];
}

function moveLandDown()
{
    LandArray[0].y -= 720*3;
    LandArray[1].y -= 720*3;
    LandArray[2].y -= 720*3;
    LandArray = [LandArray[3], LandArray[4], LandArray[5], LandArray[6], LandArray[7], LandArray[8], LandArray[0], LandArray[1], LandArray[2],];
}

function InfiniteLand()
{
    //infinite land
    if(LandArray[4].x+currentMaxX>currentMaxX)
    {
        moveLandLeft();
        currentMaxX+=1280;
    }
    if(LandArray[4].x+currentMinX < currentMinX)
    {
        moveLandRight();
        currentMinX-=1280;
    }

    if(LandArray[4].y+currentMaxY > currentMaxY)
    {
        moveLandDown();
        currentMaxY+=720;
    }
    if(LandArray[4].y+currentMinY < currentMinY)
    {
        moveLandUp();
        currentMinY-=720;
    }
}

//movement input
function handleMovementPress(event) 
{
    let key = event.keyCode;
    if (key === 87) 
    {
        moveForward = true;
    }

    else if (key === 83) 
    {
        moveBackwards = true;
    }

}

function handleMovementRelease(event) 
{
    let key = event.keyCode;
    if (key === 87) 
    {
        moveForward = false;
    }

    else if (key === 83) 
    {
        moveBackwards = false;
    }

}

function Shoot(event)
{
    if(event.button === 0)
    {
        if(canShoot && !gameOver)
        {
            shootAnimationOver = false;
            bulletActive = true;

            bullet1.x = 640;
            bullet1.y = 360;
            bullet1.angle = player.angle;

            bullet2.x = 640;
            bullet2.y = 360;
            bullet2.angle = player.angle;

            bullet3.x = 640;
            bullet3.y = 360;
            bullet3.angle = player.angle;

            bulletAngle = player.angle;
            canShoot = false;
        }
    }
}

function spawnAlien()//spawn alien out of no where
{
    let newAlien = new Component(288*imagesScale, 311*imagesScale, alienSprite,640-(288*imagesScale)/2,360-(311*imagesScale)/2,"image");

    let randomPosition = Math.floor(Math.random()*4)+1;

    if(randomPosition === 1)
    {
        newAlien.x = 0-(288*imagesScale)/2;
        newAlien.y = Math.random()*720-(311*imagesScale)/2;
    }
    else if(randomPosition === 2)
    {
        newAlien.x = 1280-(288*imagesScale)/2;
        newAlien.y = Math.random()*720-(311*imagesScale)/2;
    }
    else if(randomPosition === 3)
    {
        newAlien.x = Math.random()*1280-(288*imagesScale)/2;
        newAlien.y = 720-(311*imagesScale)/2;
    }
    else if(randomPosition === 4)
    {
        newAlien.x = Math.random()*1280-(288*imagesScale)/2;
        newAlien.y = 0-(311*imagesScale)/2;
    }

    aliens.push(newAlien);
    aliensWaitTime.push(5);
    aliensAnimationPosition.push(0);
    aliensPlayerCollision.push(true);
}

//spawn settings
let difficulty = 0.05;
let maxTime = 5000;
let minTime = 100;

function getRandomInterval() {
    // Random interval between 2 to 3 seconds
    return Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);
    maxTime -= maxTime*difficulty;
    minTime -= minTime*difficulty;
}

function alienAttackAnimationFunction(alienNum) //alien collision
{
    if(aliensWaitTime[alienNum] === 0)
    {
        aliens[alienNum].image.src = alienAttackAnimation[aliensAnimationPosition[alienNum] % alienAttackAnimation.length].src;
        aliensAnimationPosition[alienNum] = (aliensAnimationPosition[alienNum] + 1) % alienAttackAnimation.length;
        aliensWaitTime[alienNum]=5;

        if(aliens[alienNum].image.src === alienAttackAnimation[6].src)
        {
            if(aliensPlayerCollision[alienNum] === false)
            {
                endGame();
            }
        }
    }
    else{
        aliensWaitTime[alienNum]--;
    }
}