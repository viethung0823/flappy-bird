const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");

function start() {
  requestId = window.requestAnimationFrame(draw);
  let gameState = "gamePending";
  let scoreNum = 0;
  let xBase = 0;
  let yBird = 256;
  //pipe1
  let xPipe1 = 288;
  let hPipe_Top1 = 90; // hPipe_Top1 + hPipe_Bottom1 === 320 to keep gap_pipes === 80
  let hPipe_Bottom1 = 230;
  // pipe2
  let xPipe2 = 288;
  let hPipe_Top2 = 60; // hPipe_Top1 + hPipe_Bottom1 === 320 to keep gap_pipes === 100
  let hPipe_Bottom2 = 260;
  let birdState = "up";
  let positionFlap = "mid"; // mid(default) -- up -- down
  let isClick = false;

  function draw() {
    setTimeout(function () {
      requestId = window.requestAnimationFrame(draw);

      switch (gameState) {
        case "gamePending":
          updateBackground();
          updateBase();
          updateBird();
          updateMessage("guide");
          control();
          break;

        case "gamePlaying":
          updateBackground();
          updateBase();
          updatePipe();
          updateBird(requestId);
          updateScore();
          logic();
          control();
          break;

        case "gameOver":
          updateBackground();
          updateBase();
          updatePipe();
          updateBird();
          updateScore();
          updateMessage("gameOver");
          updateMessage("restart");
          control();
          break;
      }
    }, 1000 / 60);
  }

  function updateBackground() {
    const background = new Image(288, 512);
    background.src = "assets/sprites/background-day.png";
    ctx.drawImage(background, 0, 0);
  }

  function updateBase() {
    const base = new Image(336, 112);
    base.src = "assets/sprites/base.png";

    switch (gameState) {
      case "gamePending":
      case "gamePlaying":
        ctx.drawImage(base, xBase, 400);
        xBase--;
        if (xBase === -48) {
          xBase = 0;
        }
        break;

      case "gameOver":
        ctx.drawImage(base, xBase, 400);
        break;
    }
  }

  function updatePipe() {
    const pipeTop = new Image(52, 320);
    const pipeBottom = new Image(52, 320);
    pipeTop.src = "assets/sprites/pipe-green-top.jpg";
    pipeBottom.src = "assets/sprites/pipe-green-bottom.jpg";

    switch (gameState) {
      case "gamePlaying":
        if (xPipe1 === -120) {
          // reset first pipe
          xPipe1 = 288;
          hPipe_Top1 = randomHeightPipe(60, 260);
          hPipe_Bottom1 = 320 - hPipe_Top1;
        }
        if (xPipe2 === -52) {
          // reset second pipe
          xPipe2 = 288;
          hPipe_Top2 = randomHeightPipe(90, 210);
          hPipe_Bottom2 = 320 - hPipe_Top2;
        }
        if (xPipe1 <= 88 || xPipe2 <= 88) {
          // draw new pipe
          xPipe2--;
          ctx.drawImage(pipeTop, 0, 0, 52, 320, xPipe2, hPipe_Top2 - 320, 52, 320);
          ctx.drawImage(pipeBottom, 0, 0, 52, hPipe_Bottom2, xPipe2, 400 - hPipe_Bottom2, 52, hPipe_Bottom2);
        }
        xPipe1--;
        ctx.drawImage(pipeTop, 0, 0, 52, 320, xPipe1, hPipe_Top1 - 320, 52, 320);
        ctx.drawImage(pipeBottom, 0, 0, 52, hPipe_Bottom1, xPipe1, 400 - hPipe_Bottom1, 52, hPipe_Bottom1);
        break;

      case "gameOver":
        ctx.drawImage(pipeTop, 0, 0, 52, 320, xPipe1, hPipe_Top1 - 320, 52, 320);
        ctx.drawImage(pipeBottom, 0, 0, 52, hPipe_Bottom1, xPipe1, 400 - hPipe_Bottom1, 52, hPipe_Bottom1);
        ctx.drawImage(pipeTop, 0, 0, 52, 320, xPipe2, hPipe_Top2 - 320, 52, 320);
        ctx.drawImage(pipeBottom, 0, 0, 52, hPipe_Bottom2, xPipe2, 400 - hPipe_Bottom2, 52, hPipe_Bottom2);
        break;
    }

    function randomHeightPipe(min, max) {
      return Math.random() * (max - min) + min;
    }
  }

  function updateBird(frame) {
    const bird = new Image(34, 24);
    let disable = false;

    switch (positionFlap) {
      case "mid":
        bird.src = "assets/sprites/yellowbird-midflap.png";
        break;

      case "up":
        bird.src = "assets/sprites/yellowbird-upflap.png";
        break;

      case "down":
        bird.src = "assets/sprites/yellowbird-downflap.png";
        break;
    }

    if (gameState === "gamePending") {
      // animation bird up-down
      switch (birdState) {
        case "up":
          yBird--;
          if (yBird === 252) {
            birdState = "down";
          }
          break;

        case "down":
          yBird++;
          if (yBird === 260) {
            birdState = "up";
          }
          break;
      }
    }

    if (gameState === "gamePlaying" && frame % 4 === 0) {
      // animation bird flapping when play
      switch (positionFlap) {
        case "mid":
          positionFlap = "up";
          break;

        case "up":
          positionFlap = "down";
          break;

        case "down":
          positionFlap = "mid";
          break;
      }
    }

    if (gameState === "gamePlaying" && isClick) {
      yBird -= 3;
      ctx.save();
      ctx.translate(127, yBird);
      ctx.rotate(-25 * (Math.PI / 180));
      ctx.drawImage(bird, 0, 0);
      ctx.restore();
      disable = true;
    }

    if (gameState === "gamePlaying" && !isClick) {
      // bird falls when not click
      const gravity = yBird * 0.015;
      yBird += gravity;
    }

    if (gameState === "gameOver" && yBird < 374) {
      yBird += 10;
    }

    if (!disable) {
      ctx.drawImage(bird, 127, yBird);
    }
  }

  function updateScore() {
    const scores = ["assets/sprites/0.png", "assets/sprites/1.png", "assets/sprites/2.png", "assets/sprites/3.png", "assets/sprites/4.png", "assets/sprites/5.png", "assets/sprites/6.png", "assets/sprites/7.png", "assets/sprites/8.png", "assets/sprites/9.png"];

    if (xPipe1 === 110 || xPipe2 === 110) {
      scoreNum++;
      updateAudio("point");
    }

    if (scoreNum < 10) {
      const score1 = new Image(24, 36);
      score1.src = scores[scoreNum];
      ctx.drawImage(score1, 128, 50);
    } else if (scoreNum >= 10 && scoreNum < 100) {
      const score1 = new Image(24, 36);
      const score2 = new Image(24, 36);
      const index1 = parseInt(scoreNum.toString()[0]);
      const index2 = parseInt(scoreNum.toString()[1]);
      score1.src = scores[index1];
      ctx.drawImage(score1, 124, 50);
      score2.src = scores[index2];
      ctx.drawImage(score2, 152, 50);
    }
  }

  function updateMessage(typeOfMessage) {
    switch (typeOfMessage) {
      case "guide":
        const guideMessage = new Image(184, 267);
        guideMessage.src = "assets/sprites/message.png";
        ctx.drawImage(guideMessage, 52, 190);
        break;

      case "gameOver":
        const messageOver = new Image(192, 42);
        messageOver.src = "assets/sprites/gameover.png";
        ctx.drawImage(messageOver, 48, 235);
        break;

      case "restart":
        const messageRestart = new Image(196, 14);
        messageRestart.src = "assets/sprites/restart.png";
        ctx.drawImage(messageRestart, 36, 290);
        break;
    }
  }

  function updateAudio(state) {
    switch (state) {
      case "wing":
        const sound = new Audio();
        sound.src = "assets/audio/wing.ogg";
        sound.play();
        break;
      case "point":
        const sound1 = new Audio();
        sound1.src = "assets/audio/point.ogg";
        sound1.play();
        break;
      case "die":
        const sound2 = new Audio();
        sound2.src = "assets/audio/die.ogg";
        sound2.play();
        break;
      case "hit":
        const sound3 = new Audio();
        sound3.src = "assets/audio/hit.ogg";
        sound3.play();
        break;
      case "swoosh":
        const sound4 = new Audio();
        sound4.src = "assets/audio/swoosh.ogg";
        sound4.play();
        break;
    }
  }

  function logic() {
    if (yBird >= 374) {
      // bird hits ground
      gameState = "gameOver";
      birdState = "hitGround";
    }

    if (xPipe1 >= 100 && xPipe1 <= 160) {
      // bird hits pipe1
      if (yBird <= hPipe_Top1 + 1 || yBird >= 400 - (hPipe_Bottom1 + 24)) {
        gameState = "gameOver";
        birdState = "hitPipe";
      }
    }

    if (xPipe2 >= 100 && xPipe2 <= 160) {
      // bird hits pipe2
      if (yBird <= hPipe_Top2 + 1 || yBird >= 400 - (hPipe_Bottom2 + 24)) {
        gameState = "gameOver";
        birdState = "hitPipe";
      }
    }

    if (gameState === "gameOver") {
      updateAudio("hit");
      updateAudio("die");
      updateAudio("swoosh");
    }
  }

  function control() {
    switch (gameState) {
      case "gamePending":
        window.onkeydown = (e) => {
          if (e.keyCode == 32) {
            gameState = "gamePlaying";
          }
        };
        break;

      case "gamePlaying":
        window.onkeydown = (e) => {
          if (e.keyCode === 32) {
            updateAudio("wing");
            isClick = true;
          }
        };

        window.onkeyup = (e) => {
          if (e.keyCode === 32) {
            isClick = false;
          }
        };
        break;

      case "gameOver":
        window.onkeydown = (e) => {
          if (e.keyCode == 13) {
            resetDefault();
            gameState = "gamePending";
          }
        };
        break;
    }
  }

  function resetDefault() {
    scoreNum = 0;
    xBase = 0;
    yBird = 256;
    xPipe1 = 288;
    hPipe_Top1 = 90; // hPipe_Top1 + hPipe_Bottom1 === 320 to keep gap_pipes === 80
    hPipe_Bottom1 = 230;
    xPipe2 = 288;
    hPipe_Top2 = 60; // hPipe_Top1 + hPipe_Bottom1 === 320 to keep gap_pipes === 100
    hPipe_Bottom2 = 260;
    birdState = "up";
    positionFlap = "mid"; // mid(default) -- up -- down
    isClick = false;
  }
}

start();
