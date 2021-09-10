class Sprite {
  constructor(game, url) {
    this.url = url;
    this.game = game;
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }

  initializeImagePromise() {
    return new Promise((resolve, reject) => {
      this.image = new Image();
      this.image.src = this.url;
      this.image.onload = () => {
        this.reset();
        resolve(true);
      };
      this.image.onerror = () => reject(new Error("Could not load" + this.url));
    });
  }

  intersectsWith(sprite) {
    if (this.x + this.width < sprite.x) return false;
    if (this.y + this.height < sprite.y) return false;
    if (this.x > sprite.x + sprite.width) return false;
    if (this.y > sprite.y + sprite.width) return false;
    return true;
  }

  update() {}
  draw() {
    this.game.context.drawImage(this.image, this.x, this.y);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = canvas.getContext("2d");

    this.score = 0;
    this.acceleration = 0.1;
    this.friction = 0.99;

    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.sprites = [];

    this.background = new Sprite(this, "picnic.jpeg");
    this.sprites[this.sprites.length] = this.background;
    for (let i = 0; i < 30; i = i + 1) {
      this.sprites[this.sprites.length] = new Cracker(
        this,
        "cracker.png",
        "sounds/burp.wav"
      );
    }

    this.cheese = new Cheese(this, "cheese.png");
    this.sprites[this.sprites.length] = this.cheese;

    for (let tomatoCount = 0; tomatoCount < 5; tomatoCount = tomatoCount + 1) {
      let entryDelay = 300 + tomatoCount * 600;
      this.sprites[this.sprites.length] = new Tomato(
        this,
        "tomato.png",
        entryDelay
      );
    }
  }

  displayMessage(text, yPos) {
    var textSize = this.context.measureText(text);
    var x = (this.canvasWidth - textSize.width) / 2.0;
    this.context.fillStyle = "black";
    this.context.fillText(text, x, yPos);
    this.context.fillStyle = "red";
    this.context.fillText(text, x + 2, yPos + 2);
  }

  drawStartScreen() {
    this.background.draw();
    this.context.font = "50px Arial";
    this.displayMessage("Cracker Chase", 70);
    this.context.font = "40px Arial";

    if (this.highScore !== undefined) {
      this.displayMessage("High score: " + this.topScore, 110);
    }

    this.displayMessage("Welcome to Cracker Chase", 240);
    this.displayMessage("Steer the cheese to capture the crackers", 280);
    this.displayMessage("BEWARE THE KILLER TOMATOES", 320);
    this.displayMessage("Arrow keys to move", 470);
    this.displayMessage("Press G to play", 520);
  }

  gameUpdate(timeStamp) {
    for (let sprite of this.sprites) {
      sprite.update();
    }

    if (!this.gameRunning) {
      this.drawStartScreen();
      this.displayMessage("Your score: " + this.score, 150);
      return;
    }

    for (let sprite of this.sprites) {
      sprite.draw();
    }

    this.context.font = "40px Arial";
    this.context.fillStyle = "red";
    this.context.fillText("Score: " + this.score, 10, 40);

    window.requestAnimationFrame(this.gameUpdate.bind(this));
  }

  gameReset() {
    for (let sprite of this.sprites) {
      sprite.reset();
    }

    this.score = 0;
  }

  async gameInitialize() {
    let promiseList = [];
    for (let sprite of this.sprites) {
      promiseList[promiseList.length] = sprite.initializeImagePromise();
    }

    await Promise.all(promiseList);
  }

  gameStart() {
    this.drawStartScreen();

    window.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyG":
          if (!this.gameRunning) {
            this.gameRun();
          }
          break;
        default:
      }
    });
  }

  gameRun() {
    this.gameReset();
    this.gameRunning = true;
    window.requestAnimationFrame(this.gameUpdate.bind(this));
  }

  gameEnd() {
    this.gameRunning = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }
}

class Cheese extends Sprite {
  constructor(game, url) {
    super(game, url);

    this.width = game.canvasWidth / 15;
    this.height = game.canvasWidth / 15;

    this.speed = 5;
    this.xSpeed = 0;
    this.ySpeed = 0;

    window.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "ArrowLeft":
          this.xSpeed = -this.speed;
          break;
        case "ArrowRight":
          this.xSpeed = this.speed;
          break;
        case "ArrowUp":
          this.ySpeed = -this.speed;
          break;
        case "ArrowDown":
          this.ySpeed = this.speed;
          break;
      }
    });
    window.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "ArrowLeft":
          this.xSpeed = 0;
          break;
        case "ArrowRight":
          this.xSpeed = 0;
          break;
        case "ArrowUp":
          this.ySpeed = 0;
          break;
        case "ArrowDown":
          this.ySpeed = 0;
          break;
      }
    });
  }

  reset() {
    this.x = (this.game.canvasWidth - this.width) / 2.0;
    this.y = (this.game.canvasHeight - this.height) / 2.0;
  }

  update() {
    super.update();

    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.game.canvasWidth) {
      this.x = this.game.canvasWidth - this.width;
    }

    if (this.y < 0) this.y = 0;
    if (this.y + this.height > this.game.canvasHeight) {
      this.y = this.game.canvasHeight - this.height;
    }
  }

  draw() {
    this.game.context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class Cracker extends Sprite {
  constructor(game, url, audioURL) {
    super(game, url);

    this.audioURL = audioURL;
    this.audio = new Audio();
    this.audio.src = this.audioURL;
    this.width = game.canvasWidth / 20;
    this.height = game.canvasHeight / 20;
    this.x = 0;
    this.y = 0;
  }

  getRandomInt(min, max) {
    let range = max - min + 1;
    let result = Math.floor(Math.random() * range) + min;
    return result;
  }

  update() {
    if (this.intersectsWith(this.game.cheese)) {
      this.game.score = this.game.score + 10;

      this.reset();

      this.audio.play();
    }
  }

  reset() {
    this.x = this.getRandomInt(0, this.game.canvasWidth - this.width);
    this.y = this.getRandomInt(0, this.game.canvasHeight - this.height);
  }

  draw() {
    this.game.context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class Tomato extends Sprite {
  constructor(game, imageUrl, entryDelay) {
    super(game, imageUrl);

    this.entryDelay = entryDelay;

    this.width = game.canvasWidth / 12;
    this.height = game.canvasWidth / 12;
    this.acceleration = 0.1 + entryDelay / 10000;
    this.friction = 0.99;
  }

  reset() {
    this.x = -this.width;
    this.y = -this.height;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.entryCount = 0;
  }

  update() {
    this.entryCount = this.entryCount + 1;

    if (this.entryCount < this.entryDelay) {
      return;
    }

    if (this.game.cheese.x > this.x) {
      this.xSpeed = this.xSpeed + this.acceleration;
    } else {
      this.xSpeed = this.xSpeed - this.acceleration;
    }

    if (this.game.cheese.y > this.y) {
      this.ySpeed = this.ySpeed + this.acceleration;
    } else {
      this.ySpeed = this.ySpeed - this.acceleration;
    }

    this.xSpeed = this.xSpeed * this.friction;
    this.ySpeed = this.ySpeed * this.friction;

    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;

    if (this.intersectsWith(this.game.cheese)) {
      this.game.gameEnd();
    }
  }

  draw() {
    this.game.context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

async function doGame() {
  var activeGame = new Game();
  await activeGame.gameInitialize();
  activeGame.gameStart();
}
