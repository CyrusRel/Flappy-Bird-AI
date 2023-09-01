const pygame = require('pygame');
const neat = require('neat');

// Define the canvas width and height
const WIN_WIDTH = 500;
const WIN_HEIGHT = 800;

// Load bird images
const BIRD_IMGS = [];
const bird1 = new Image();
bird1.src = "/static/bird1.png";
BIRD_IMGS.push(bird1);

const bird2 = new Image();
bird2.src = "/static/bird2.png";
BIRD_IMGS.push(bird2);

const bird3 = new Image();
bird3.src = "/static/bird3.png";
BIRD_IMGS.push(bird3);

// Load pipe images
const PIPE_IMG = new Image();
PIPE_IMG.src = "/static/pipe.png";

// Flip PIPE_IMG vertically to get PIPE_TOP
const canvas = document.createElement("canvas");
canvas.width = PIPE_IMG.width;
canvas.height = PIPE_IMG.height;

const ctx = canvas.getContext("2d");
ctx.translate(0, PIPE_IMG.height);
ctx.scale(1, -1); // Flip vertically
ctx.drawImage(PIPE_IMG, 0, 0, PIPE_IMG.width, PIPE_IMG.height);

const PIPE_TOP = new Image();
PIPE_TOP.src = canvas.toDataURL(); // Set PIPE_TOP source to the flipped image

// Define other constants and classes
const BASE_IMG = new Image();
BASE_IMG.src = "/static/base.png";

const BG_IMG = new Image();
BG_IMG.src = "/static/bg.png";

const STAT_FONT = "50px 'comicsans'";

class Bird {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.tilt = 0;
        this.tick_count = 0;
        this.vel = 0;
        this.height = this.y;
        this.img_count = 0;
        this.img = BIRD_IMGS[0];
    }

    jump() {
        this.vel = -10.5;
        this.tick_count = 0;
        this.height = this.y;
    }

    move() {
        this.tick_count += 1;

        let d = this.vel * this.tick_count + 1.5 * this.tick_count ** 2;

        if (d >= 16) {
            d = 16;
        }

        if (d < 0) {
            d -= 2;
        }

        this.y = this.y + d;

        if (d < 0 || this.y < this.height + 50) {
            if (this.tilt < 25) {
                this.tilt = 25;
            }
        } else {
            if (this.tilt > -90) {
                this.tilt -= 20;
            }
        }
    }

    draw(win) {
        this.img_count += 1;

        if (this.img_count < 5) {
            this.img = BIRD_IMGS[0];
        } else if (this.img_count < 10) {
            this.img = BIRD_IMGS[1];
        } else if (this.img_count < 15) {
            this.img = BIRD_IMGS[2];
        } else if (this.img_count < 20) {
            this.img = BIRD_IMGS[1];
        } else if (this.img_count === 20) {
            this.img = BIRD_IMGS[0];
            this.img_count = 0;
        }

        if (this.tilt <= -80) {
            this.img = BIRD_IMGS[1];
            this.img_count = 10;
        }

        const rotated_img = this.rotateImage(this.img, this.tilt);
        const new_rect = rotated_img.getClientRects()[0];
        win.drawImage(rotated_img, this.x - new_rect.width / 2, this.y - new_rect.height / 2);
    }

    get_mask() {
        // Not implemented in JavaScript version, you can use other techniques or libraries for this
    }

    rotateImage(image, angle) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        return canvas;
    }
}

class Pipe {
    constructor(x) {
        this.x = x;
        this.height = 0;
        this.top = 0;
        this.bottom = 0;
        this.PIPE_TOP = PIPE_TOP;
        this.PIPE_BOTTOM = PIPE_IMG;
        this.passed = false;
        this.set_height();
    }

    set_height() {
        this.height = Math.floor(Math.random() * 400) + 50;
        this.top = this.height - this.PIPE_TOP.height;
        this.bottom = this.height + 200;
    }

    move() {
        this.x -= 5;
    }

    draw(win) {
        win.drawImage(this.PIPE_TOP, this.x, this.top);
        win.drawImage(this.PIPE_BOTTOM, this.x, this.bottom);
    }

    collide(bird) {
        // Not implemented in JavaScript version, you can use other techniques or libraries for this
        return false;
    }
}

class Base {
    constructor(y) {
        this.y = y;
        this.x1 = 0;
        this.x2 = BASE_IMG.width;
    }

    move() {
        this.x1 -= 5;
        this.x2 -= 5;

        if (this.x1 + BASE_IMG.width < 0) {
            this.x1 = this.x2 + BASE_IMG.width;
        }

        if (this.x2 + BASE_IMG.width < 0) {
            this.x2 = this.x1 + BASE_IMG.width;
        }
    }

    draw(win) {
        win.drawImage(BASE_IMG, this.x1, this.y);
        win.drawImage(BASE_IMG, this.x2, this.y);
    }
}

function draw_window(win, birds, pipes, base, score) {
    win.drawImage(BG_IMG, 0, 0);
    for (const pipe of pipes) {
        pipe.draw(win);
    }

    const text = document.createElement("p");
    text.textContent = "Score: " + score;
    text.style.font = STAT_FONT;
    text.style.color = "white";
    win.appendChild(text);

    base.draw(win);

    for (const bird of birds) {
        bird.draw(win);
    }
}

function main_ai(genomes, config) {
    var nets = [];
    var ge = [];
    var birds = [];

    for (var i = 0; i < genomes.length; i++) {
        var g = genomes[i][1];
        var net = neat.nn.FeedForwardNetwork.fromJSON(g, config);
        nets.push(net);
        birds.push(new Bird(230, 350));
        g.fitness = 0;
        ge.push(g);
        // added e to the g (ge)
    }

    var base = new Base(730);
    var pipes = [new Pipe(600)];
    var win = document.getElementById("game-canvas");
    var ctx = win.getContext("2d");

    var score = 0;
    var run = true;
    var pipe_ind = 0;

    function gameLoop() {
        if (!run) {
            return;
        }

        for (const bird of birds) {
            bird.move();
            ge[birds.indexOf(bird)].fitness += 0.1;

            var output = nets[birds.indexOf(bird)].activate([
                bird.y,
                Math.abs(bird.y - pipes[pipe_ind].height),
                Math.abs(bird.y - pipes[pipe_ind].bottom),
            ]);

            if (output[0] > 0.5) {
                bird.jump();
            }
        }

        // Clear canvas
        ctx.clearRect(0, 0, WIN_WIDTH, WIN_HEIGHT);

        // Draw elements on the canvas
        draw_window(ctx, birds, pipes, base, score);

        requestAnimationFrame(gameLoop); // Use requestAnimationFrame for smoother animation
    }

    gameLoop();
}


document.addEventListener("DOMContentLoaded", function () {
    fetch("/get_ai_code")
        .then(response => response.text())
        .then(code => {
            console.log("Fetched AI code:", code); // Log the fetched AI code
            eval(code);
            main_ai();
        })
        .catch(error => console.error("Error loading AI code:", error));
});