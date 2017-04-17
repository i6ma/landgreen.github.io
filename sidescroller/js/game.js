// game Object ********************************************************
//*********************************************************************
const game = {
    mouse: {
        x: 0,
        y: 0
    },
    mouseInGame: {
        x: 0,
        y: 0
    },
    levelsCleared: 0,
    g: 0.001,
    dmgScale: 1,
    testing: false, //testing mode: shows wireframe and some variables
    cycle: 0, //total cycles, 60 per second
    cyclePaused: 0,
    fallHeight: 4000, //below this y position the player dies
    lastTimeStamp: 0, //tracks time stamps for measuing delta
    delta: 0, //measures how slow the engine is running compared to 60fps
    buttonCD: 0,
    drawList: [], //so you can draw a first frame of explosions.. I know this is bad
    drawTime: 8, //how long circles are drawn.  use to push into drawlist.time
    mobDmgColor: "rgba(255,0,0,0.7)", //used top push into drawList.color
    playerDmgColor: "rgba(0,0,0,0.7)", //used top push into drawList.color
    drawCircle: function() {
        //draws a circle for two cycles, used for showing damage mostly
        let i = this.drawList.length;
        while (i--) {
            ctx.beginPath(); //draw circle
            ctx.arc(this.drawList[i].x, this.drawList[i].y, this.drawList[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.drawList[i].color;
            ctx.fill();
            if (this.drawList[i].time) {
                //remove when timer runs out
                this.drawList[i].time--;
            } else {
                this.drawList.splice(i, 1);
            }
        }
    },
    textList: [],
	lastLogTime: 0,
	textLogSVG: function(){
		if (game.lastLogTime && game.lastLogTime < game.cycle){
			game.lastLogTime = 0
			document.getElementById("text-log").textContent = ' '
		}
	},
    timing: function() {
        this.cycle++; //tracks game cycles
        //delta is used to adjust forces on game slow down;
        this.delta = (engine.timing.timestamp - this.lastTimeStamp) / 16.666666666666;
        this.lastTimeStamp = engine.timing.timestamp; //track last engine timestamp
    },
    track: true,
    setTracking: function() {
        //use in window resize in index.js
        this.track = true;
        this.zoom = canvas.height / 1500; //sets starting zoom scale
    },
    keyUp: function() {
        if (!keys[90]) {
            // z
            this.setTracking();
        }
    },
    keyPress: function() {
        //runs on key press event
        if (keys[90]) {
            // z
            this.zoom = 0.2;
        }
        if (keys[69]) {
            // e    swap to next active gun
            const next = function() {
                b.activeGun++;
                if (b.activeGun > b.guns.length - 1) b.activeGun = 0;
                if (b.guns[b.activeGun].have === false || b.guns[b.activeGun].ammo < 1) next();
            };
            next();
            b.updateHUD();
        } else if (keys[81]) {
            //q    swap to previous active gun
            const previous = function() {
                b.activeGun--;
                if (b.activeGun < 0) b.activeGun = b.guns.length - 1;
                if (b.guns[b.activeGun].have === false || b.guns[b.activeGun].ammo < 1) previous();
            };
            previous();
            b.updateHUD();
        }
        if (keys[84]) {
            // 84 = t
            if (this.testing) {
                this.testing = false;
            } else {
                this.testing = true;
            }
        } else if (this.testing) {
            if (keys[57]) {
                //9
                powerUps.spawnRandomPowerUp(game.mouseInGame.x, game.mouseInGame.y, 0, 0);
            }
            if (keys[80]) {
                //p
                Matter.Body.setPosition(player, this.mouseInGame);
                Matter.Body.setVelocity(player, { x: 0, y: 0 });
            }
        }
    },
    zoom: 1,
    camera: function() {
        ctx.translate(canvas.width2, canvas.height2); //center
        ctx.scale(this.zoom, this.zoom); //zoom in once centered
        ctx.translate(-canvas.width2 + mech.transX, -canvas.height2 + mech.transY); //uncenter, translate
        //calculate in game mouse position by undoing the zoom and translations
        this.mouseInGame.x = (this.mouse.x - canvas.width2) / this.zoom + canvas.width2 - mech.transX;
        this.mouseInGame.y = (this.mouse.y - canvas.height2) / this.zoom + canvas.height2 - mech.transY;
    },
    startZoomIn: function() {
        document.body.removeEventListener("keydown", game.startZoomIn);
        game.track = true;
        function zoomIn() {
            const max = canvas.height / 1500;
            // if (game.zoom>canvas.height/2900){
            // 	game.zoom += (max-game.zoom)*0.01+max*0.0002    //end with this
            // }else{
            // 	game.zoom += (max-game.zoom)*0.01+max*0.0002  	//first this
            // }
            game.zoom += (max - game.zoom) * 0.01 + max * 0.0002;
            if (game.zoom < max) {
                requestAnimationFrame(zoomIn);
            }
        }
        requestAnimationFrame(zoomIn);
    },
    wipe: function() {
        // if (this.isPaused) {
        //   ctx.fillStyle = "rgba(221,221,221,0.1)";
        //   ctx.fillRect(0, 0, canvas.width, canvas.height);
        // } else {
        //   ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }
        // if (mech.health < 1) {
        //     ctx.fillStyle = "rgba(255,255,255," + (0.05 + mech.health * mech.health) + ")";
        // 	ctx.fillRect(0, 0, canvas.width, canvas.height);
        // } else {
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);
        // }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    reset: function() {
        b.dmgScale = 1;
        b.activeGun = 0;
        //removes guns and ammo
        b.inventory = [0];
        for (let i = 1, len = b.guns.length; i < len; ++i) {
            b.guns[i].ammo = 0;
            b.guns[i].have = false;
        }
        b.updateHUD();
        mech.addHealth(1);
        game.dmgScale = 1;
        game.levelsCleared = 0;
        level.onLevel = Math.floor(Math.random() * level.levels.length); //picks a rnadom starting level
        //powerUps.startingPowerUps(); //setup gun
        game.clearMap();
        level.start(); //spawns the level
    },
    clearMap: function() {
        //stops sounds, removes bodies from engine and from arrays
        level.removeSVG();
        level.zones = [];
        this.drawList = [];
        // var sounds = document.getElementsByTagName('audio')
        // for(i=0; i<sounds.length; i++) sounds[i].pause()  //stops all sound
        //document.getElementById("ambient_crickets").pause()
        //document.getElementById("ambient_wind").pause()
        function removeAll(array) {
            //generic remove array from engine
            for (let i = 0; i < array.length; ++i)
                Matter.World.remove(engine.world, array[i]);
        }
        removeAll(map);
        map = [];
        removeAll(body);
        body = [];
        removeAll(mob);
        mob = [];
        removeAll(powerUp);
        powerUp = [];
        removeAll(cons);
        cons = [];
        removeAll(consBB);
        consBB = [];
        removeAll(bullet);
        bullet = [];
        removeAll(mobBullet);
        mobBullet = [];
    },
    getCoords: {
        //used when building maps, outputs a draw rect command to console, only works in testing mode
        pos1: {
            x: 0,
            y: 0
        },
        pos2: {
            x: 0,
            y: 0
        },
        out: function() {
            if (keys[49]) {
                this.pos1.x = Math.round(game.mouseInGame.x / 25) * 25;
                this.pos1.y = Math.round(game.mouseInGame.y / 25) * 25;
            }
            if (keys[50]) {
                //press 1 in the top left; press 2 in the bottom right;copy command from console
                this.pos2.x = Math.round(game.mouseInGame.x / 25) * 25;
                this.pos2.y = Math.round(game.mouseInGame.y / 25) * 25;
                window.getSelection().removeAllRanges();
                var range = document.createRange();
                range.selectNode(document.getElementById("test"));
                window.getSelection().addRange(range);
                document.execCommand("copy");
                window.getSelection().removeAllRanges();
                console.log(
                    `spawn.mapRect(${this.pos1.x}, ${this.pos1.y}, ${this.pos2.x - this.pos1.x}, ${this.pos2.y - this.pos1.y}); //`
                );
            }
        }
    },
    testingOutput: function() {
        ctx.textAlign = "left";
        ctx.fillStyle = "#000";
        let line = 100;
        ctx.fillText("Press T to exit testing mode", 5, line);
        line += 30;
        ctx.fillText("cycle: " + game.cycle, 5, line);
        line += 20;
        ctx.fillText("delta: " + game.delta.toFixed(6), 5, line);
        line += 20;
        ctx.fillText("x: " + player.position.x.toFixed(0), 5, line);
        line += 20;
        ctx.fillText("y: " + player.position.y.toFixed(0), 5, line);
        line += 20;
        ctx.fillText("Vx: " + mech.Vx.toFixed(2), 5, line);
        line += 20;
        ctx.fillText("Vy: " + mech.Vy.toFixed(2), 5, line);
        line += 20;
        ctx.fillText("Fx: " + player.force.x.toFixed(3), 5, line);
        line += 20;
        ctx.fillText("Fy: " + player.force.y.toFixed(3), 5, line);
        line += 20;
        ctx.fillText("yOff: " + mech.yOff.toFixed(1), 5, line);
        line += 20;
        ctx.fillText("mass: " + player.mass.toFixed(1), 5, line);
        line += 20;
        ctx.fillText("onGround: " + mech.onGround, 5, line);
        line += 20;
        ctx.fillText("crouch: " + mech.crouch, 5, line);
        line += 20;
        ctx.fillText("isHeadClear: " + mech.isHeadClear, 5, line);
        line += 20;
        ctx.fillText("HeadIsSensor: " + headSensor.isSensor, 5, line);
        line += 20;
        ctx.fillText("frictionAir: " + player.frictionAir.toFixed(3), 5, line);
        line += 20;
        ctx.fillText("stepSize: " + mech.stepSize.toFixed(2), 5, line);
        line += 20;
        ctx.fillText("zoom: " + this.zoom.toFixed(4), 5, line);
        line += 20;
        ctx.fillText("on " + mech.onBody.type + " id: " + mech.onBody.id + ", index: " + mech.onBody.index, 5, line);
        line += 20;
        ctx.fillText("action: " + mech.onBody.action, 5, line);
        ctx.textAlign = "center";
        ctx.fillText(`(${this.mouseInGame.x.toFixed(1)}, ${this.mouseInGame.y.toFixed(1)})`, this.mouse.x, this.mouse.y - 20);
    },
    output: function() {
        let line = 80;
        ctx.fillStyle = "#000";
        ctx.fillText(`fireCD: ${bullets.fireCD}`, 5, line);
        line += 20;
        ctx.fillText(`restitution: ${bullets.restitution.toFixed(2)}`, 5, line);
        line += 20;
        ctx.fillText(`speed: ${bullets.speed.toFixed(2)}`, 5, line);
        line += 20;
        ctx.fillText(`frictionAir: ${bullets.frictionAir.toFixed(4)}`, 5, line);
        line += 20;
        ctx.fillText(`size: ${bullets.size.toFixed(4)}`, 5, line);
        line += 20;
        ctx.fillText(`dmg: ${bullets.dmg.toFixed(2)}`, 5, line);
        line += 20;
        ctx.fillText(`gravity: ${bullets.gravity.toFixed(2)}`, 5, line);
        line += 20;
        ctx.fillText(`endCycle: ${bullets.endCycle.toFixed(2)}`, 5, line);
        line += 20;
    },
    draw: {
        powerUp: function() {
            // ctx.lineWidth = 5
            // for (let i = 0, len = powerUp.length; i < len; ++i) {
            //     let vertices = powerUp[i].vertices;
            //     ctx.beginPath();
            //     ctx.moveTo(vertices[0].x, vertices[0].y);
            //     for (let j = 1; j < vertices.length; j += 1) {
            //         ctx.lineTo(vertices[j].x, vertices[j].y);
            //     }
            //     ctx.lineTo(vertices[0].x, vertices[0].y);
            // 	ctx.globalAlpha = powerUp[i].alpha;
            //     ctx.strokeStyle = powerUp[i].color
            //     ctx.stroke()
            // }
            // ctx.globalAlpha = 1;
            const a = 0.3 * Math.sin(game.cycle * 0.25) + 0.7;
            for (let i = 0, len = powerUp.length; i < len; ++i) {
                let vertices = powerUp[i].vertices;
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
                ctx.fillStyle = `hsla(${powerUp[i].color}, 100%, 50%, ${a})`; //powerUp[i].color;
                ctx.fill();
            }
        },
        mobBullet: function() {
            let i = mobBullet.length;
            ctx.beginPath();
            while (i--) {
                let vertices = mobBullet[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
                if (mobBullet[i].endCycle < game.cycle) {
                    Matter.World.remove(engine.world, mobBullet[i]);
                    mobBullet.splice(i, 1);
                }
            }
            //ctx.fillStyle = ((game.cycle%2) ? '#000' : '#f00');
            ctx.fillStyle = "#f00";
            ctx.fill();
        },
        map: function() {
            ctx.beginPath();
            for (let i = 0, len = map.length; i < len; ++i) {
                let vertices = map[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.fillStyle = "#444";
            ctx.fill();
        },
        body: function() {
            ctx.beginPath();
            for (let i = 0, len = body.length; i < len; ++i) {
                let vertices = body[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.lineWidth = 1.5;
            ctx.fillStyle = "#777";
            ctx.fill();
            ctx.strokeStyle = "#222";
            ctx.stroke();
        },
        cons: function() {
            ctx.beginPath();
            for (let i = 0, len = cons.length; i < len; ++i) {
                ctx.moveTo(cons[i].pointA.x, cons[i].pointA.y);
                ctx.lineTo(cons[i].bodyB.position.x, cons[i].bodyB.position.y);
            }
            for (let i = 0, len = consBB.length; i < len; ++i) {
                ctx.moveTo(consBB[i].bodyA.position.x, consBB[i].bodyA.position.y);
                ctx.lineTo(consBB[i].bodyB.position.x, consBB[i].bodyB.position.y);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#999";
            ctx.stroke();
        },
        wireFrame: function() {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#999";
            const bodies = Composite.allBodies(engine.world);
            ctx.beginPath();
            for (let i = 0; i < bodies.length; ++i) {
                //ctx.fillText(bodies[i].id,bodies[i].position.x,bodies[i].position.y);  //shows the id of every body
                let vertices = bodies[i].vertices;
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j += 1) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.lineTo(vertices[0].x, vertices[0].y);
            }
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.stroke();
        },
        testing: function() {
            //zones
            ctx.beginPath();
            for (let i = 0, len = level.zones.length; i < len; ++i) {
                ctx.rect(
                    level.zones[i].x1,
                    level.zones[i].y1 + 70,
                    level.zones[i].x2 - level.zones[i].x1,
                    level.zones[i].y2 - level.zones[i].y1
                );
            }
            ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
            ctx.fill();
            //jump
            ctx.beginPath();
            let bodyDraw = jumpSensor.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
            //main body
            ctx.beginPath();
            bodyDraw = playerBody.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
            ctx.fill();
            ctx.stroke();
            //head
            ctx.beginPath();
            bodyDraw = playerHead.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
            ctx.fill();
            ctx.stroke();
            //head sensor
            ctx.beginPath();
            bodyDraw = headSensor.vertices;
            ctx.moveTo(bodyDraw[0].x, bodyDraw[0].y);
            for (let j = 1; j < bodyDraw.length; ++j) {
                ctx.lineTo(bodyDraw[j].x, bodyDraw[j].y);
            }
            ctx.lineTo(bodyDraw[0].x, bodyDraw[0].y);
            ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
            ctx.fill();
            ctx.stroke();
        }
    }
};
