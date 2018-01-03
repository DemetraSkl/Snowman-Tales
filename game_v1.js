// Files that need to be loaded
var files = ["gameElements.json"];

// Create Hexi instance
var g = hexi(910, 512, setupTitleScreen, files);

// Set background color and scale to canvas
g.backgroundColor = "black";
g.scaleToWindow();

// Start Hexi
g.start();

//healthBar = undefined,

var title = undefined,
    playButton = undefined,
    resetButton = undefined,
    sky = undefined,
    gravity = undefined,
    snowman = undefined,
    snowflakes = undefined,
    iceBlocks = undefined,
    penguins = undefined,
    gameOverScene = undefined,
    finish = undefined,
    floorLevel = undefined,
    penguinFloorLevel = undefined,
    maxVelocityY = undefined,
    maxVelocityX = undefined,
    friction = undefined,
    snowmanDirection = undefined,
    snowballs = undefined,
    targetX = undefined,
    targetY = undefined,
    spring = undefined,
    attackSnowball = undefined,
    igloo = undefined,
    bouncingPenguins = undefined,
    maxBouncePenguins = undefined,
    bouncingRight = undefined,
    bouncingLeft = undefined,
    skatingPenguin = undefined,
    skatingRight = undefined,
    skatingLeft = undefined,
    totalPenguins = undefined,
    points = undefined,
    numberOfPillars = undefined,
    courseWidth = undefined;
var snowballCount = 0;
var pointCount = 0;
var renderParticles = false;


function setupTitleScreen() {
    // The scrolling canvas background
    sky = g.tilingSprite(
        "night-sky.png",
        g.canvas.width,
        g.canvas.height
    );
    // Title and instructions
    title = g.sprite("title.png");
    g.stage.putCenter(title, 0, -35);
    // Start button
    playButton = g.button(["up.png", "over.png", "down.png"]);
    g.stage.putCenter(playButton, 0, 200);

    playButton.release = function() {
        g.state = setup;
    };

}

// Setup function is run once to init game
function setup() {

    //Make the title and play button invisible.
    title.visible = false;
    playButton.visible = false;
    playButton.enabled = false;

    // Init floor level
    floorLevel = g.canvas.height;

    // Setting course width
    numberOfPillars = 50;
    var numberOfSnowflakes = 150;
    courseWidth = numberOfPillars * 64;

    // Create snowflakes
    snowflakes = g.group();

    for (var i = 0; i < numberOfSnowflakes; i++) {
        var snowflake = g.sprite("snowflake-small.png");
        snowflakes.addChild(snowflake);

        snowflake.x = randomInt(1, courseWidth);
        snowflake.y = randomInt(-1 * courseWidth, g.canvas.height);
    }
    snowflakes.vx = 0;
    snowflakes.vy = 0.5;


    // Make ice block levels
    var numLevels = 1; // num of blocks per column
    var direction = 0;

    // Render trees for the end of the snowman course
    var treeFrames = ["frozenTree.png", "frozenTreeTheEnd.png"];
    finish = g.sprite(treeFrames);
    finish.x = (numberOfPillars) * 64 - 45;
    finish.y = 90;
    finish.scale.x = 0.5;
    finish.scale.y = 0.5;
    finish.vx = 0;

    iceBlocks = g.group();

    for (var i = 0; i < numberOfPillars; i++) {

        if (i < numberOfPillars - 10) {
            if (numLevels < 1) {
                direction = 1;
            } else if (numLevels === 3) {
                direction = -1
            } else {
                direction = randomDirection();
            }
            numLevels += direction;
            //numLevels = 1;
            for (var j = 1; j <= numLevels; j++) {
                var block = g.sprite("iceBlock.png");
                iceBlocks.addChild(block);
                block.type = "block";
                block.x = i * 64;
                block.y = g.canvas.height - j * 64;
            }
        }

        if (i >= numberOfPillars - 10) {
            var block = g.sprite("iceBlock.png");
            iceBlocks.addChild(block);
            block.type = "block";
            block.x = i * 64;
            block.y = g.canvas.height - 64;
        }

        // Ice block level with trees
        if (i === numberOfPillars - 1) {
            for (var j = 5; j > 0; j--) {
                var treeBlock = g.sprite("iceBlock.png");
                iceBlocks.addChild(treeBlock);
                treeBlock.type = "finish";
                treeBlock.x = i * 64 + 30 * j;
                treeBlock.y = 264;
                treeBlock.scale.x = 0.5;
                treeBlock.scale.y = 0.5;

            }
        }
    }
    iceBlocks.vx = 0;



    // The snowman
    let snowmanFrames = [
        "snowman-small.png",
        "snowman-small-jump.png",
        "snowman-small-hurt.png"
    ];
    snowman = g.sprite(snowmanFrames);
    snowman.y = 325;
    snowman.vx = 0;
    snowman.vy = 0;
    snowman.ay = 0;

    // Set gravity
    gravity = 0.2;
    // Set friction
    friction = 0.9;
    // Set snowball spring factor
    spring = 0.01;

    // Set upper bound for velocity in (neg) Y direction
    minVelocityY = -1;
    // Set upper bound for velocity in X direction
    maxVelocityX = 3;


    // Create the frames array for when snowman collides w/ a snowflake
    dustFrames = ["pink.png", "yellow.png", "green.png", "violet.png"];


    // Snowballs
    var maxSnowballs = 5;
    snowballs = g.group();

    for (var i = 0; i < maxSnowballs; i++) {
        var snowball = g.sprite("snowball.png");
        snowballs.addChild(snowball);
        snowball.num = i;
    }

    // Bouncing penguins
    var bouncingPenguinFrames = [
        "penguin-1-bouncing-R.png",
        "penguin-2-bouncing-R.png",
        "penguin-1-bouncing-L.png",
        "penguin-2-bouncing-L.png"
    ];
    bouncingRight = [0, 1];
    bouncingLeft = [2, 3];
    maxBouncePenguins = 3;
    bouncingPenguins = g.group();
    for (var i = 0; i < maxBouncePenguins; i++) {
        var bouncingPenguin = g.sprite(bouncingPenguinFrames);
        bouncingPenguins.addChild(bouncingPenguin);
        // bouncingPenguin.num = i;
        bouncingPenguin.oX = 160;
        bouncingPenguin.x = 160;
        bouncingPenguin.y = 80;
        bouncingPenguin.vx = randomNum(0.2, 0.7);
        bouncingPenguin.oVx = bouncingPenguin.vx;
        bouncingPenguin.vy = 0;
        // bouncingPenguin.dirX = 1;
        bouncingPenguin.floorL = g.canvas.height;
        bouncingPenguin.playAnimation(bouncingRight);
    }

    // The igloo
    igloo = g.sprite("igloo-R.png");
    igloo.x = 10;
    igloo.y = 20;
    igloo.vx = 0;

    // Skating penguin
    var skatingPenguinFrames = [
        "penguin-1-skating-R.png",
        "penguin-2-skating-R.png",
        "penguin-1-skating-L.png",
        "penguin-2-skating-L.png"
    ];
    skatingRight = [0, 1];
    skatingLeft = [2, 3];
    skatingPenguin = g.sprite(skatingPenguinFrames);
    skatingPenguin.x = (numberOfPillars - 10) * 64;
    skatingPenguin.oX = skatingPenguin.x;
    skatingPenguin.y = g.canvas.height - 64 - skatingPenguin.height;
    skatingPenguin.vx = 0.5;
    skatingPenguin.vy = 0;
    skatingPenguin.fps = 1;
    skatingPenguin.playAnimation(skatingRight);

    totalPenguins = maxBouncePenguins + 1;

    // Snowball used for attack
    attackSnowball = g.sprite("snowball.png");
    attackSnowball.x = snowman.centerX;
    attackSnowball.y = snowman.centerY - snowman.halfHeight;
    attackSnowball.vx = 0;
    attackSnowball.vy = 0;
    attackSnowball.w = 0.05; // angular velocity
    attackSnowball.angle = 0;
    attackSnowball.radius = 40;
    attackSnowball.attack = false; // set to true when ball is thrown
    attackSnowball.visible = false;


    // Orange snowflake game points
    points = g.group();
    var numMaxPoints = totalPenguins;
    for (var i = 0; i < numMaxPoints; i++) {
        var point = g.sprite("snowflake-orange.png");
        point.num = i;
        point.x = g.canvas.width - 100 - 30 * i;
        point.y = 25;
        point.scale.x = 0.5;
        point.scale.y = 0.5;
        point.visible = false;
        points.addChild(point);
    }

    // gameScene = g.group(
    //     finish,
    //     iceBlocks,
    //     snowman,
    //     bouncingPenguins,
    //     skatingPenguin,
    //     attackSnowball,
    //     points,
    //     snowballs,
    //     snowflakes,
    //     sky
    //     );

    // Game over scene
    gameOverTitle = g.sprite("gameOver.png");
    gameOverTitle.scale.x = 0.5;
    gameOverTitle.scale.y = 0.5;
    g.stage.putCenter(gameOverTitle, 0, -55);


    // Reset button
    resetButton = g.button(["up-reset.png", "over-reset.png", "down-reset.png"]);
    g.stage.putCenter(resetButton, 0, 100);
    resetButton.enabled = false;

    gameOverScene = g.group(resetButton, gameOverTitle);
    gameOverScene.visible = false;

    //Capture the keyboard arrow keys
    let left = keyboard(65), //A
        up = keyboard(38), // Up Arrow
        right = keyboard(68), //D
        down = keyboard(83),
        spacebar = keyboard(32); // Spacebar

    //Left arrow key `press` method
    left.press = () => {
        snowmanDirection = "left";
        iceBlocks.vx = 2;
        if ((snowman.vx < maxVelocityX) && (snowman.vx > -1 * maxVelocityX)) {
            snowman.vx = -2;
        }
    };
    //Left arrow key `release` method
    left.release = () => {
        snowmanDirection = "";
        snowman.vx = 0;
        iceBlocks.vx = 0;
    };

    //Right
    right.press = () => {
        snowmanDirection = "right";
        iceBlocks.vx = -2;
        if ((snowman.vx < maxVelocityX) && (snowman.vx > -1 * maxVelocityX)) {
            snowman.vx = 2;
        }
    };
    right.release = () => {
        snowmanDirection = "";
        snowman.vx = 0;
        iceBlocks.vx = 0;
    };

    //Up
    up.press = () => {
        snowman.gotoAndStop(1);
        //snowman.playAnimation([0,1]);
        snowman.ay = -0.6;
    };
    up.release = () => {
        snowman.gotoAndStop(0);
        g.wait(300, function() {
            snowman.ay = 0;
        });
    };

    spacebar.press = () => {
        if ((snowballCount > 0) && (attackSnowball.attack === false)) {
            snowballCount--;
            attackSnowball.visible = true;
        }
    };
    spacebar.release = () => {
        if (attackSnowball.visible === true) {
            attackSnowball.vx = 6 * Math.cos(attackSnowball.angle);
            attackSnowball.vy = 6 * Math.sin(attackSnowball.angle);
            attackSnowball.attack = true;

            g.wait(1000, function() {
                attackSnowball.attack = false;
                attackSnowball.visible = false;
            });
        }
    };

    // Set game state
    g.state = play;
}



// The `play` function contains all the game logic and runs in a loop
function play() {
    // Move background sky to make infinitely scrolling background
    sky.tileX -= 1


    //Loop through all the blocks and check for a collision between
    //each block and the snowman.
    var snowmanVsBlock = iceBlocks.children.some(function(block) {
        let snowmanVsBlockCollisionType = g.rectangleCollision(snowman, block);
        if (snowmanVsBlockCollisionType === "bottom") {
            floorLevel = block.gy;
            if (block.type === "finish") {
                finish.gotoAndStop(1);
                g.wait(2000, function() {
                    g.state = end;
                });
            }
        } else if ((snowmanVsBlockCollisionType === "right") && (iceBlocks.vx < 0)) {
            iceBlocks.vx = 0;
        } else if ((snowmanVsBlockCollisionType === "left") && (iceBlocks.vx > 0)) {
            iceBlocks.vx = 0;
        }
    });


    var snowmanVsSnowflake = snowflakes.children.some(function(snowflake) {
        let collisionBoolean = g.hitTestRectangle(snowman, snowflake, true);
        if (collisionBoolean === true) {
            if (snowflake.visible) {
                renderParticles = true;
                snowflake.visible = false;
            } else {
                renderParticles = false;
            }
        }
    });


    if (renderParticles) {
        if (snowballCount < 5) {
            snowballCount++;
        }
        //Create dust explosion
        g.createParticles(
            snowman.centerX, snowman.centerY, //x and y position
            () => g.sprite(dustFrames), //Particle sprite
            g.stage, //The container to add the particles to  
            40, //Number of particles
            0.5, //Gravity
            false, //Random spacing
            3.95, 5.49, //Min/max angle
            5, 16, //Min/max size
            1, 2 //Min/max speed
        );
    }


    // Render snowballs depending on snowman course
    if (snowmanDirection === "left") {
        targetX = snowman.x + 40;
    } else {
        targetX = snowman.x - 10;
    }
    targetY = snowman.y + 70;

    let index = 0;
    var snowballBounce = snowballs.children.some(function(snowball) {
        snowball.visible = false;
        index++;
        snowball.vx += (targetX - snowball.x) * spring;
        snowball.vy += (targetY - snowball.y) * spring;
        // snowball.vy += gravity * 5;
        snowball.vx *= friction;
        snowball.vy *= friction;
        snowball.x += snowball.vx;
        snowball.y += snowball.vy;

        // Update target for next ball running through loop        
        if (snowmanDirection === "left") {
            targetX = snowball.x + 20;
        } else {
            targetX = snowball.x - 20;
        }
        targetY = snowball.y;

        if (index <= snowballCount) {
            snowball.visible = true;
        }
    });


    var penguinBounce = bouncingPenguins.children.some(function(bPenguin) {
        let penguinVSblock = iceBlocks.children.some(function(iBlock) {
            penguinCollisionType = g.rectangleCollision(bPenguin, iBlock, true);
            if (penguinCollisionType === "bottom") {
                bPenguin.floorL = iBlock.y;
            }
        });

        if (bPenguin.y < bPenguin.floorL - 150) {
            bPenguin.vy += gravity * 0.2;
        }
        bPenguin.vx = bPenguin.oVx + iceBlocks.vx;
        bPenguin.oX += bPenguin.oVx;
        var temp = numberOfPillars * 48;
        // Make bouncing penguins turn left when they've reached end of course
        if (bPenguin.oX > (numberOfPillars * 48)) {
            bPenguin.oVx = -bPenguin.oVx;
            bPenguin.playAnimation(bouncingLeft);
        }
        g.move(bPenguin);
    });

    var snowmanVsBouncePenguin = bouncingPenguins.children.some(function(bPenguin) {
        if (bPenguin.visible === true) {
            let snowmanPenguinCollisionType = g.rectangleCollision(snowman, bPenguin);
            if (snowmanPenguinCollisionType) {
                // Decrease snowball count
                if (snowballCount > 0) {
                    snowballCount--;
                }
                // Render hurt snowman for 0.3 sec
                snowman.gotoAndStop(2);
                g.wait(300, function() {
                    snowman.gotoAndStop(0);
                });
            }
        }

    });

    // Skating penguin motion
    skatingPenguin.oX += iceBlocks.vx;
    if (skatingPenguin.x > skatingPenguin.oX + 9 * 64) {
        skatingPenguin.vx = -skatingPenguin.vx;
        skatingPenguin.playAnimation(skatingLeft);
        skatingPenguin.x = skatingPenguin.oX + 9 * 64 - 30;
    } else if (skatingPenguin.x < skatingPenguin.oX) {
        skatingPenguin.vx = -skatingPenguin.vx;
        skatingPenguin.playAnimation(skatingRight);
        skatingPenguin.x = skatingPenguin.oX;
    }
    skatingPenguin.x += skatingPenguin.vx + iceBlocks.vx;

    let activePenguinIndex = 0;
    if (skatingPenguin.visible === true) {
        activePenguinIndex++;
        let snowmanVsSkatePenguin = g.rectangleCollision(snowman, skatingPenguin);
        if (snowmanVsSkatePenguin) {
            // Decrease snowball count
            if (snowballCount > 0) {
                snowballCount--;
            }
            // Render hurt snowman for 0.3 sec
            snowman.gotoAndStop(2);
            g.wait(300, function() {
                snowman.gotoAndStop(0);
            });
        }
    }

    // Set an upper limit for Y velocity
    // Even if user keeps pressing the up arrow, 
    // Y velocity will stop incrementing
    if (snowman.vy > minVelocityY) {
        snowman.vy += snowman.ay;
    }

    // Apply gravity only if snowman above floor level
    if (snowman.y < floorLevel - snowman.height) {
        snowman.vy += gravity;
    }

    // Attack snowball physics
    if (attackSnowball.attack === false) {
        attackSnowball.x = snowman.centerX + Math.cos(attackSnowball.angle) * attackSnowball.radius;
        attackSnowball.y = snowman.centerY - snowman.halfHeight + Math.sin(attackSnowball.angle) * attackSnowball.radius;
        if (attackSnowball.angle >= 0.785) {
            attackSnowball.w = -attackSnowball.w;
            //attackSnowball.angle += attackSnowball.w;
        } else if (attackSnowball.angle <= -3.926) {
            attackSnowball.w = -attackSnowball.w;
        }
        attackSnowball.angle += attackSnowball.w;
    }

    if (attackSnowball.attack === true) {
        g.move(attackSnowball);
    }

    var snowballVsBouncePenguin = bouncingPenguins.children.some(function(bPenguin) {
        if (bPenguin.visible === true) {
            activePenguinIndex++;
        }
        // Only if the penguin is active and if snowball has been thrown
        if ((bPenguin.visible === true) && (attackSnowball.attack === true) && (snowballCount >= 0)) {
            let snowballPenguinCollisionType = g.rectangleCollision(attackSnowball, bPenguin);
            if (snowballPenguinCollisionType) {
                bPenguin.visible = false;
                g.createParticles(
                    g.canvas.width - 130, 25, //x and y position
                    () => g.sprite(dustFrames), //Particle sprite
                    g.stage, //The container to add the particles to  
                    40, //Number of particles
                    0.5, //Gravity
                    false, //Random spacing
                    3.95, 5.49, //Min/max angle
                    5, 10, //Min/max size
                    1, 2 //Min/max speed
                );
            }
        }
    });

    let snowballVsSkatePenguin = g.rectangleCollision(attackSnowball, skatingPenguin);
    if (snowballVsSkatePenguin) {
        skatingPenguin.visible = false;
        g.createParticles(
            g.canvas.width - 130, 25, //x and y position
            () => g.sprite(dustFrames), //Particle sprite
            g.stage, //The container to add the particles to  
            40, //Number of particles
            0.5, //Gravity
            false, //Random spacing
            3.95, 5.49, //Min/max angle
            5, 10, //Min/max size
            1, 2 //Min/max speed
        );
    }

    // Update points 
    let pIndex = 0;
    if (activePenguinIndex < totalPenguins) {
        pointCount = totalPenguins - activePenguinIndex;
        var updatePoints = points.children.some(function(p) {
            //p.visible = false;
            pIndex++;
            if (pIndex <= pointCount) {
                p.visible = true;
            }
        });
    }


    // Move snowman
    g.move(snowman);


    // If we have not reached the finish, move blocks to the 
    // left each frame
    if ((finish.gx > 156)) {
        finish.vx = iceBlocks.vx;
        g.move(finish);
        snowflakes.vx = iceBlocks.vx;
        g.move(snowflakes);
        igloo.vx = iceBlocks.vx;
        g.move(igloo);
        g.move(iceBlocks);
    }

    // Keep player contained inside the stage area
    // Second argument here any JS object
    g.contain(snowman, {
        x: 32,
        y: 16,
        width: g.canvas.width * 3 / 4,
        height: g.canvas.height
    });



}


function end() {
    g.pause();
    gameOverScene.visible = true;
    resetButton.enabled = true;
    bouncingPenguins.visible =false;
    skatingPenguin.visible = false;

    resetButton.release = function() {
        location.reload(false);
    };
}

// Hepler Functions
// Random integer helper function
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNum(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function randomBoolean() {
    let randBin = Math.round(Math.random());
    if (randBin === 1) {
        return true;
    }
    return false;
}

// Return up or same or down direction
function randomDirection() {
    var rand = Math.random() * 100;
    if (rand < 33.3) {
        return -1;
    } else if (rand >= 33.3 && rand < 66.6) {
        return 0;
    } else {
        return 1;
    }

}