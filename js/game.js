(function () {
    var Game = function(canvasId) {
        var self = this;
        
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", "100%");
        canvas.setAttribute("height", "100%");
        canvas.setAttribute("id", canvasId);
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth/2;
        
        var gameSize = { w: canvas.width, h: canvas.height };
        this.gameSize = gameSize;
        
        var images = [];
        var items = 0;
        
        var itemLoaded = function(e) {
            items ++;
            
            if (items >= images.length) {
                self.deaths = [];
                self.entities = createInvaders(self).concat(new Player(self, self.gameSize));
                tick();
            }
        };
        
        var tick = function() {
            self.update();
            self.draw(ctx, gameSize);
            requestAnimationFrame(tick);
        };
                
        var ctx = document.getElementById(canvasId).getContext("2d");
        this.ctx = ctx;


        var alien = new Image();
        this.alien = alien;
        alien.src = "img/alien1.png";
        images.push(alien);

        var alien2 = new Image();
        this.alien2 = alien2;
        alien2.src = "img/alien2.png";
        images.push(alien2);

        var alien3 = new Image();
        this.alien3 = alien3;
        alien3.src = "img/alien3.png";
        images.push(alien3);

        var sponsor =new Image();
        this.sponsor = sponsor;
        sponsor.src = "img/unicum.png";
        images.push(sponsor);

        var ship = new Image();
        this.ship = ship;
        ship.src = "img/ship2.png";
        ship.width = 50;
        ship.height = 53;
        images.push(ship);
        
        var death = new Image();
        this.death = death;
        death.src = "img/death.png";
        images.push(death);
        
        var xray = new Image();
        this.xray = xray;
        xray.src = "img/xray.png";
        images.push(xray);
        
        alien.onload = alien2.onload = alien3.onload = sponsor.onload = ship.onload = death.onload = xray.onload = itemLoaded;
        
        console.log("game running");
    };
    
    Game.prototype = {
        update: function() {
            var self = this;
            
            this.deaths = this.deaths.filter(function(d) {
                return d.count >= 0;
            });
            
            var entities = this.entities;
            
            var notCollidingWithAnything = function(entityA) {
                return entities.filter(function (entityB) {
                    var collided = colliding(entityA, entityB);
                    
                    if (collided && (entityA instanceof Invader || entityA instanceof Player)) {
                        self.addEntity(new Sponsor(self, entityA.position, self.sponsor, entityA.i));
                        self.addDeath(new Death(self, entityA.position));
                    }
                    
                    if (collided && (entityB instanceof Invader || entityB instanceof Player)) {
                        self.addEntity(new Sponsor(self, entityB.position, self.sponsor, entityB.i));
                        self.addDeath(new Death(self, entityB.position));
                    }
                    
                    return collided;
                }).length === 0;
            };
            
            var outOfBounds = function(ents) {
                return ents.filter(function(e) {
                    return e.position.x > 0 &&
                        e.position.x < self.gameSize.w &&
                        e.position.y > 0 &&
                        e.position.y < self.gameSize.h;
                });
            };
            
            this.entities = outOfBounds(this.entities);
            this.entities = this.entities.filter(notCollidingWithAnything);
            
            for (var i=0; i<this.entities.length; i++) {
                this.entities[i].update();
            }
            
            for (i=0; i<this.deaths.length; i++) {
                this.deaths[i].update();
            }
            
            //console.log("game updating");
        },
        draw: function(ctx, gameSize) {
            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.fillRect(0, 0, gameSize.w, gameSize.h);
            
            for (var i=0; i<this.deaths.length; i++) {
                this.deaths[i].draw();
            }
            
            for (i=0; i<this.entities.length; i++) {
                this.entities[i].draw();
            }
        },
        addEntity: function(entity) {
            this.entities.push(entity);
        },
        
        addDeath: function(death) {
            this.deaths.push(death);
        },
    };
    var Sponsor = function (game, position, sprite,i) {
        this.game = game;
        this.position = position;
        this.i = i;
        this.size = { w: 60, h: 60 };
        this.sprite = sprite;
        this.speedX = 0.4;
        this.patrol = 0;
        this.count = (i % 9) * 8;
    };
    Sponsor.prototype = {
        update: function() {
            this.count = (++this.count > 9) ? 0 : this.count;

            if (this.patrol < 0 || this.patrol > 74) {
                this.speedX = -this.speedX;
                this.position.y += 15;
            }

            this.patrol += this.speedX;
            this.position.x += this.speedX;

        },
        draw: function() {
            this.game.ctx.drawImage(this.sprite, 0, 0, this.size.w-1, this.size.h, this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Player = function(game, gameSize) {
        this.game = game;
        this.size = { w: 50, h: 53 };
        this.position = { x: (gameSize.w - this.size.w)/2, y: gameSize.h - this.size.h };
        this.pauseFire = 0;
        this.fireEnabled = true;
        this.controls = new Controls();
    };
    
    Player.prototype = {
        update: function() {
            if (!this.fireEnabled) this.pauseFire ++;
            if (this.pauseFire > 18) {
                this.pauseFire = 0;
                this.fireEnabled = true;
            }
            
            if (this.controls.isDown(this.controls.KEYS.LEFT)) {
                if(this.position.x > 50){
                    this.position.x -=4;
                }
            } else if (this.controls.isDown(this.controls.KEYS.RIGHT)) {
                if(this.position.x < window.innerWidth-50){
                    this.position.x += 4;
                }
            }
            
            if (this.fireEnabled && this.controls.isDown(this.controls.KEYS.FIRE)) {
                this.game.addEntity(new Bullet(this, { x: 0, y: -5 }));
                this.fireEnabled = false;
            }
        },
        draw: function() {
            this.game.ctx.drawImage(this.game.ship, 0, 0, this.size.w, this.size.h, this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Bullet = function(player, vel) {
        this.player = player;
        this.size = { w: 1, h: 4 };
        this.position = { x: player.position.x, y: player.position.y - player.size.h };
        this.vel = vel;
    };
    
    Bullet.prototype = {
        update: function() {
            this.position.x += this.vel.x;
            this.position.y += this.vel.y;
        },
        draw: function() {
            var ctx = this.player.game.ctx;
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Invader = function(game, position, i, sprite) {
        this.game = game;
        this.position = position;
        this.i = i;
        this.size = { w: 60, h: 60 };
        this.sprite = sprite;
        this.speedX = 0.4;
        this.patrol = 0;
        this.count = (i % 9) * 8;
    };
    
    Invader.prototype = {
        update: function() {
            this.count = (++this.count > 9) ? 0 : this.count;
            
            if (this.patrol < 0 || this.patrol > 74) {
                this.speedX = -this.speedX;
                this.position.y += 15;
            }
            
            this.patrol += this.speedX;
            this.position.x += this.speedX;

        },
        draw: function() {
            this.game.ctx.drawImage(this.sprite, 0, 0, this.size.w-1, this.size.h, this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Xray = function(game, position, vel) {
        this.game = game;
        this.size = { w: 3, h: 7 };
        this.position = position;
        this.vel = vel;
        this.sprite = this.game.xray;
        this.count = 0;
    };
    
    Xray.prototype = {
        update: function() {
            this.position.x += this.vel.x;
            this.position.y += this.vel.y;
            
            this.count = (++this.count > 10) ? 0 : this.count;
        },
        draw: function() {
            this.game.ctx.drawImage(this.sprite, 0, 0, this.size.w, this.size.h, this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Death = function(game, position) {
        this.game = game;
        this.size = { w: 80, h:56 };
        this.position = position;
        this.count = 13;
        this.sprite = this.game.death;
    };
    
    Death.prototype = {
        update: function() {
            this.count --;
        },
        draw: function() {
            this.game.ctx.drawImage(this.sprite, 0, 0, this.size.w, this.size.h, this.position.x - this.size.w/2, this.position.y - this.size.h/2, this.size.w, this.size.h);
        }
    };
    
    var Controls = function() {
        var keyState = {};
        
        window.onkeydown = function(e) {
            keyState[e.keyCode] = true;
        };
        
        window.onkeyup = function(e) {
            keyState[e.keyCode] = false;
        };
        
        this.isDown = function(keyCode) {
            return keyState[keyCode] === true;
        };
        
        this.KEYS = { LEFT: 37, RIGHT: 39, FIRE: 32 };
    };
    
    var createInvaders = function(game) {
        var invaders = [];
        var x = 50;
        var y = 50;
        for (var i=0; i<36; i++) {

            let sprite = game.alien;
            if(i > 8){
                sprite = game.alien2;
            }
            if(i > 17){
                sprite = game.alien;
            }
            if(i > 26){
                sprite = game.alien3;
            }
            invaders.push(new Invader(game, { x: x, y: y}, i, sprite));
            x += 100;
            if(i===8){
                y = 130;
                x = 50;
            }
            if(i === 17){
                y = 210;
                x = 50
            }
            if( i === 26){
                y = 290;
                x = 50;
            }
        }
        
        return invaders;
    };
    
    var colliding = function(b1, b2) {
        var b1right     = b1.position.x + b1.size.w / 2;
        var b1bottom    = b1.position.y + b1.size.h / 2;
        var b1left      = b1.position.x - b1.size.w / 2;
        var b1top       = b1.position.y - b1.size.h / 2;
        var b2right     = b2.position.x + b2.size.w / 2;
        var b2bottom    = b2.position.y + b2.size.h / 2;
        var b2left      = b2.position.x - b2.size.w / 2;
        var b2top       = b2.position.y - b2.size.h / 2;
        
        return !(b1 === b2 ||
                b1bottom < b2top ||
                b1right < b2left ||
                b1left > b2right ||
                b1top > b2bottom);
    };
    
    window.onload = function() {
        new Game("screen");
    };
})();