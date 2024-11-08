let cat, enemiesX = [], enemiesY = [], enemiesDir = [], projectilesX = [], projectilesY = [], projectilesVelX = [], projectilesVelY = [], projectilesSize = [];
let powerUpsX = [], powerUpsY = [];
let round = 1, maxRounds = 5, enemyCount = 3;
let active = false; 
let h, k, f, a; 
let gameState = 'start'; 
let timer = 20; 
let score = 0;
let missedEnemies = 0; 
let powerUpActive = false;
let powerUpType = 'rapidFire';
let shootSpeed = 1;
let timeBonus = 0;
let canShoot = true;
let shootCooldown = 1500; 
let lastShootTime = 0;
let powerUpTimer = 0; 
let powerUpSpawned = false;
let rapidFire = false; 
let catJumping = false;
let catY;
let catVelocityY = 0; 
let gravity = 0.5; 
let jumpStrength = 10; 
let preparationTime = 5; 
let preparationCountdown = preparationTime; 
let customFont; 
let backgroundMusic;
let gameMusic; 
let bossHealth = 0;
let bossX = 0;
let bossY = 0;
let bossSize = 0;
function preload() {
  customFont = loadFont('Rubik-Black.ttf'); 
  cat = loadImage('Gato.png');
  enemyImage = loadImage('Ratom.png');
  powerUpImage = loadImage('Estambre.png');
  backgroundImage = loadImage('Fondo-1.jpg');
  backgroundMusic = loadSound('Hol.mp3'); 
  gameMusic = loadSound('NAS.mp3'); 
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  catY = height - 150; 
  resetGame();
  backgroundMusic.loop(); 
}
function displayRulesMenu() {
  textAlign(CENTER);
  textSize(32);
  fill(255, 204, 0);
  text("Reglas del Juego", width / 2, height / 2 - 150);
  textSize(18);
  fill(0);
  text("1. El objetivo es eliminar todos los enemigos en cada ronda.", width / 2, height / 2 - 80);
  text("2. Los controles son: W (Mayus) para saltar y Espacio para disparar, utiliza el ratón para apuntar.", width / 2, height / 2 - 50);
  text("3. El juego tiene 6 rondas. A medida que avanzas, más enemigos aparecerán.", width / 2, height / 2 - 20);
  text("4. Usa la tecla espacio para disparar proyectiles y derrotar a los enemigos.", width / 2, height / 2 + 10);
  text("5. Al segundo 10 de cada ronda, aparecerá un power-up, salta y golpealo para obtener una mejora.", width / 2, height / 2 + 40);
  text("6. A partir de la ronda 4, los enemigos se moverán de arriba a abajo.", width / 2, height / 2 + 70);
  textSize(20);
  fill(255, 0, 0);
  text("Presiona 'B (Mayus)' para volver al menú principal", width / 2, height / 2 + 150);
}
function displayPreparationCountdown() {
  textAlign(CENTER);
  textSize(48);
  fill(255, 204, 0);
  if (round === 1) {
    text("Prepárate para la primera ronda", width / 2, height / 2 - 50);
  } else if (round === maxRounds + 1) { 
    text("Prepárate para el JEFE: RATMA", width / 2, height / 2 - 50);
  } else {
    text("Prepárate para la siguiente ronda", width / 2, height / 2 - 50);
  }
  textSize(36);
  text(preparationCountdown, width / 2, height / 2);
  if (frameCount % 60 === 0 && preparationCountdown > 0) {
    preparationCountdown--;
  }
  if (preparationCountdown === 0) {
    if (round === maxRounds + 1) {
      startBossRound(); 
    } else {
      resetRound();
      gameState = 'play';
    }
  }
}
function startBossRound() {
  rapidFire = false;
  powerUpActive = false; 
  powerUpType = ''; 
  timer = 40; 
  bossHealth = 30; 
  bossX = width - 300;
  bossY = height - 400;
  bossSize = 250; 
  for (let i = 0; i < 3; i++) {
    enemiesX.push(bossX - 100); 
    enemiesY.push(random(height - 200)); 
    enemiesDir.push(random([-1, 1])); 
  }
  gameState = 'play';
}
function playGame() {
  if (frameCount % 60 == 0 && timer > 0) timer--;
  if (timer <= 0) {
    if (round === maxRounds + 1) {
      if (bossHealth > 0) {
        gameState = 'lose'; 
      }
    } else {
      missedEnemies += enemiesX.length; 
      if (missedEnemies >= 3) {
        gameState = 'lose'; 
      } else {
        round++;
        if (round > maxRounds + 1) { 
          gameState = 'win';
        } else {
          gameState = 'prepare';
          preparationCountdown = preparationTime;
        }
      }
    }
  }
  manageCatMovement();
  if (millis() - lastShootTime >= shootCooldown) {
    canShoot = true;
  }
  for (let i = 0; i < enemiesX.length; i++) {
    if (enemiesX[i] > 0) {
      fill(255, 0, 0);
      image(enemyImage, enemiesX[i], enemiesY[i], 50, 50);
      enemiesX[i] += enemiesDir[i]; 
    } else {
      missedEnemies++;
      enemiesX.splice(i, 1); 
      enemiesY.splice(i, 1);
      enemiesDir.splice(i, 1);
      i--; 
    }
  }
  for (let i = 0; i < projectilesX.length; i++) {
    if (projectilesX[i] < width) {
      fill(0, 255, 0);
      ellipse(projectilesX[i], projectilesY[i], projectilesSize[i]);
      projectilesX[i] += projectilesVelX[i];
      projectilesY[i] += projectilesVelY[i];
    } else {
      projectilesX.splice(i, 1); 
      projectilesY.splice(i, 1);
      projectilesVelX.splice(i, 1);
      projectilesVelY.splice(i, 1);
      projectilesSize.splice(i, 1);
      i--; 
    }
  }
  if (powerUpActive) {
    fill(255, 255, 0);
    image(powerUpImage, powerUpsX[0], powerUpsY[0], 30, 30);
    powerUpTimer--;
    if (powerUpTimer <= 0) {
      powerUpActive = false; 
      powerUpsX.splice(0, 1);
      powerUpsY.splice(0, 1);
    }
  } else if (!powerUpSpawned && frameCount % 60 === 0 && timer <= 10) {
    powerUpsX.push(random(width)); 
    powerUpsY.push(random(height - 100)); 
    powerUpSpawned = true; 
    powerUpTimer = 300; 
  }
  fill(0);
  image(cat, mouseX, catY, 100, 100);
  for (let i = 0; i < powerUpsX.length; i++) {
    if (dist(mouseX, catY, powerUpsX[i], powerUpsY[i]) < 50) {
      activatePowerUp();
      powerUpsX.splice(i, 1);
      powerUpsY.splice(i, 1);
      break; 
    }
  }
  for (let i = projectilesX.length - 1; i >= 0; i--) {
    for (let j = enemiesX.length - 1; j >= 0; j--) {
      if (dist(projectilesX[i], projectilesY[i], enemiesX[j], enemiesY[j]) < 30) {
        enemiesX.splice(j, 1); 
        enemiesY.splice(j, 1);
        enemiesDir.splice(j, 1);
        projectilesX.splice(i, 1); 
        projectilesY.splice(i, 1);
        projectilesVelX.splice(i, 1);
        projectilesVelY.splice(i, 1);
        projectilesSize.splice(i, 1);
        score++; 
        break; 
      }
    }
  }
  if (round === maxRounds + 1) {
    if (bossHealth > 0) {
      fill(255, 0, 0);
      ellipse(bossX, bossY, bossSize);
      if (dist(mouseX, catY, bossX, bossY) < 125) {
        bossHealth--; 
      }
      if (bossHealth <= 0) {
        gameState = 'win'; 
      }
    }
  }
  fill(0);
  textSize(24);
  text("Puntuación: " + score, width - 150, 50);
  text("Ronda: " + round + "/" + maxRounds, width - 150, 80);
  text("Tiempo: " + timer, width - 150, 110);
}
function activatePowerUp() {
  powerUpActive = true;
  if (powerUpType === 'rapidFire') {
    rapidFire = true; 
    shootCooldown = 500; 
    powerUpTimer = 300; 
  }
}
function shootProjectile(targetX, targetY) {
  if (!active) {
    h = mouseX; 
    k = targetX; 
    f = (catY + targetY) / 2; 
    a = parabolic(catY, targetY, h, k, f);
    projectilesX.push(h);
    projectilesY.push(catY);
    projectilesVelX.push(0); 
    projectilesVelY.push(0); 
    projectilesSize.push(10); 
    active = true; 
  }
}
function parabolic(y, f, h, k) {
  return (y - f) / ((h - k) * (h - k));
}
function calculate(x) {
  return a * (x - h) * (x - k) + f;
}
function drawRef(targetX, targetY) {
  fill(255, 0, 0);
  ellipse(targetX, targetY, 20, 20); 
}
function updateProjectile() {
  if (active && projectilesX.length > 0) {
    for (let i = 0; i < projectilesX.length; i++) {
      projectilesX[i] += 1; 
      projectilesY[i] = calculate(projectilesX[i]); 
      if (!onScreen(projectilesX[i], projectilesY[i])) {
        active = false; 
      }
    }
  }
}
function onScreen(px, py) {
  return px >= 0 && px <= width && py >= 0 && py <= height;
}
function draw() {
  background(220);
  drawRef(mouseX, mouseY);
  updateProjectile();
  fill(0);
  for (let i = 0; i < projectilesX.length; i++) {
    ellipse(projectilesX[i], projectilesY[i], projectilesSize[i], projectilesSize[i]);
  }
}
function manageCatMovement() {
  if (catJumping) {
    catY += catVelocityY;
    catVelocityY += gravity; 
    if (catY >= height - 150) {
      catY = height - 150; 
      catJumping = false; 
    }
  }
}
function resetRound() {
  enemiesX = [];
  enemiesY = [];
  enemiesDir = [];
  projectilesX = [];
  projectilesY = [];
  projectilesVelX = [];
  projectilesVelY = [];
  projectilesSize = [];
  powerUpsX = [];
  powerUpsY = [];
  missedEnemies = 0; 
  timer = 20; 
  powerUpSpawned = false; 
}
function resetGame() {
  round = 1;
  score = 0;
  missedEnemies = 0;
  resetRound();
  gameState = 'start'; 
}
function displayWinMenu() {
  textAlign(CENTER);
  textSize(48);
  fill(0, 255, 0);
  text("¡Has ganado!", width / 2, height / 2 - 50);
  textSize(24);
  fill(0);
  text("Puntuación final: " + score, width / 2, height / 2);
  text("Presiona Enter para jugar de nuevo", width / 2, height / 2 + 50);
}
function displayLoseMenu() {
  textAlign(CENTER);
  textSize(48);
  fill(255, 0, 0);
  text("¡Has perdido!", width / 2, height / 2 - 50);
  textSize(24);
  fill(0);
  text("Puntuación final: " + score, width / 2, height / 2);
  text("Presiona Enter para jugar de nuevo", width / 2, height / 2 + 50);
}
function keyPressed() {
  if (key === 'Enter') {
    if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
      resetGame(); 
      gameState = 'prepare';
      preparationCountdown = preparationTime;
      backgroundMusic.stop(); 
      gameMusic.loop(); 
    }
  }
  if (key === 'T' && gameState === 'start') {
    gameState = 'rules';
  }
  if (key === 'B' && (gameState === 'rules' || gameState === 'lore')) {
    gameState = 'start';
  }
  if (key === 'L' && gameState === 'start') {
    gameState = 'lore';
  }
  if (key === ' ' && gameState === 'play') {
    if (canShoot || rapidFire) {
      shootProjectile(mouseX, mouseY);
      if (!rapidFire) {
        canShoot = false;
        lastShootTime = millis();
      }
    }
  }
  if (key ==='W' || key==='w'){
    if (gameState === 'play' && !catJumping) { 
      catJumping = true;
      catVelocityY = -jumpStrength; 
    }
  }
  if (key === 'E' && gameState === 'play') { 
    gameState = 'start'; 
    resetGame(); 
    backgroundMusic.loop(); 
    gameMusic.stop(); 
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
function startGame(){
  gameState = 'start'
  resetGame();
  gameState = 'prepare';
  preparationCountdown = preparationTime;
  backgroundMusic.stop(); 
  gameMusic.loop(); 
  button.remove()
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  button = createButton("Empezar Juego");
  button.mouseClicked(startGame);
  button.size(170, 70);
  button.position(580, 250);
  button.style("font-family", "Rubik-Black");
  button.style("font-size", "18px");
  button.style("font-weight", "bold"); 
  button.style("background-color", "#FFA726"); 
  button.style("border-radius", "10px"); 
  button.style("border", "2px solid black"); 
  catY = height - 150; 
  resetGame();
  backgroundMusic.loop(); 
}
function draw() {
  background(backgroundImage);
  if (gameState === 'start') {
    displayStartMenu();
  } else if (gameState === 'rules') {
    displayRulesMenu();
  } else if (gameState === 'lore') {
    displayLoreMenu();
  } else if (gameState === 'prepare') {
    displayPreparationCountdown();
  } else if (gameState === 'play') {
    playGame();
  } else if (gameState === 'win') {
    displayWinMenu();
  } else if (gameState === 'lose') {
    displayLoseMenu();
  }
}
function displayStartMenu() {
  textAlign(CENTER);
  textSize(48);
  textFont(customFont); 
  fill(255, 204, 0);
  text("Dientes y Colmillos - CAT GAME", width / 2, height / 2 - 100);
  textSize(24);
  fill(0);
  text("Presiona 'T (Mayus)' para leer las reglas", width / 2, height / 2 + 50);
  text("Presiona 'L (Mayus)' para saber del lore", width / 2, height / 2 + 80);
  textSize(18);
  text("By Joaquín Cortés and Valentina Robles", width / 2, height / 2 + 100);
}
function displayLoreMenu() {
  textAlign(CENTER);
  textSize(32);
  fill(255, 204, 0);
  text("La historia de Dientes y Colmillos", width / 2, height / 2 - 150);
  textSize(18);
  fill(0);
  text("Aquí irá un video (agrega el video más adelante)", width / 2, height / 2);
  textSize(20);
  fill(255, 0, 0);
  text("Presiona 'B (Mayus)' para volver al menú principal", width / 2, height / 2 + 100);
}
function displayPreparationCountdown() {
  textAlign(CENTER);
  textSize(48);
  fill(255, 204, 0);
  if (round === 1) {
    text("Prepárate para la primera ronda", width / 2, height / 2 - 50);
  } else if (round === maxRounds + 1) { 
    text("Prepárate para el JEFE: RATMA", width / 2, height / 2 - 50);
  } else {
    text("Prepárate para la siguiente ronda", width / 2, height / 2 - 50);
  }
  textSize(36);
  text(preparationCountdown, width / 2, height / 2);
  if (frameCount % 60 === 0 && preparationCountdown > 0) {
    preparationCountdown--;
  }
  if (preparationCountdown === 0) {
    if (round === maxRounds + 1) {
      startBossRound(); 
    } else {
      resetRound();
      gameState = 'play';
    }
  }
}
function playGame() {
  if (frameCount % 60 == 0 && timer > 0) timer--;
  if (timer <= 0) {
    if (round === maxRounds + 1) {
      if (bossHealth > 0) {
        gameState = 'lose'; 
      }
    } else {
      missedEnemies += enemiesX.length; 
      if (missedEnemies >= 3) {
        gameState = 'lose'; 
      } else {
        round++;
        if (round > maxRounds + 1) { 
          gameState = 'win';
        } else {
          gameState = 'prepare';
          preparationCountdown = preparationTime;
        }
      }
    }
  }
  manageCatMovement();
  if (millis() - lastShootTime >= shootCooldown) {
    canShoot = true;
  }
  manageProjectiles();
  manageEnemies();
  managePowerUps();
  displayHUD();
  if (enemiesX.length === 0 && gameState === 'play' && round !== maxRounds + 1) {
    round++;
    if (round > maxRounds + 1) { 
      gameState = 'win';
    } else {
      gameState = 'prepare';
      preparationCountdown = preparationTime;
    }
  }
}
function displayWinMenu() {
  textAlign(CENTER);
  textSize(48);
  fill(255, 204, 0);
  text("¡Has Ganado!", width / 2, height / 2 - 50);
  textSize(24);
  text("Presiona Enter para volver a empezar", width / 2, height / 2 + 50);
}
function displayLoseMenu() {
  textAlign(CENTER);
  textSize(48);
  fill(255, 204, 0);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(24);
  text("Presiona Enter para volver a empezar", width / 2, height / 2 + 50);
}
function resetRound() {
  timer = 20 + timeBonus;
  timeBonus = 0;
  enemiesX = [];
  enemiesY = [];
  enemiesDir = []; 
  powerUpSpawned = false;
  powerUpsX = [];
  powerUpsY = [];
  rapidFire = false; 
  for (let i = 0; i < round + enemyCount; i++) {
    enemiesX.push(random(width * 0.7, width - 50)); 
    enemiesY.push(random(height - 200)); 
    enemiesDir.push(random([-1, 1])); 
  }
}
function resetGame() {
  score = 0;
  missedEnemies = 0;
  round = 1;
  enemiesX = [];
  enemiesY = [];
  enemiesDir = [];
  projectilesX = [];
  projectilesY = [];
  projectilesVelX = [];
  projectilesVelY = [];
  projectilesSize = [];
  powerUpSpawned = false;
  for (let i = 0; i < enemyCount; i++) {
    enemiesX.push(random(width * 0.7, width - 50));
    enemiesY.push(random(height - 200));
    enemiesDir.push(random([-1, 1])); 
  }
}
function manageCatMovement() {
  if (catJumping) {
    catY += catVelocityY;
    catVelocityY += gravity; 
    if (catY >= height - 150) { 
      catY = height - 150;
      catJumping = false;
      catVelocityY = 0; 
    }
  }
  image(cat, 50, catY, 150, 150);
}
function manageProjectiles() {
  for (let i = projectilesX.length - 1; i >= 0; i--) {
    projectilesX[i] += projectilesVelX[i];
    projectilesY[i] += projectilesVelY[i];
    projectilesVelY[i] += 0.25;
    let size = 10;
    fill(255, 0, 0);
    ellipse(projectilesX[i], projectilesY[i], size, size);
    if (round === maxRounds + 1) { 
      if (dist(projectilesX[i], projectilesY[i], bossX + bossSize / 2, bossY + bossSize / 2) < bossSize / 2) {
        bossHealth--;
        projectilesX.splice(i, 1);
        projectilesY.splice(i, 1);
        projectilesVelX.splice(i, 1);
        projectilesVelY.splice(i, 1);
        projectilesSize.splice(i, 1);
        if (bossHealth <= 0) {
          gameState = 'win';
        }
      }
    } else {
      for (let j = enemiesX.length - 1; j >= 0; j--) {
        if (dist(projectilesX[i], projectilesY[i], enemiesX[j], enemiesY[j] + 45) < 35) {
          enemiesX.splice(j, 1);
          enemiesY.splice(j, 1);
          projectilesX.splice(i, 1);
          projectilesY.splice(i, 1);
          projectilesVelX.splice(i, 1);
          projectilesVelY.splice(i, 1);
          projectilesSize.splice(i, 1);
          score += 10;
          break;
        }
      }
    }
    if (projectilesX[i] > width || projectilesY[i] > height || projectilesX[i] < 0 || projectilesY[i] < 0) {
      projectilesX.splice(i, 1);
      projectilesY.splice(i, 1);
      projectilesVelX.splice(i, 1);
      projectilesVelY.splice(i, 1);
      projectilesSize.splice(i, 1);
    }
  }
}
function manageEnemies() {
  if (round === maxRounds + 1) {
    fill(255, 0, 0);
    rect(bossX, bossY - 50, bossHealth * 5, 20); 
    image(enemyImage, bossX, bossY, bossSize, bossSize);
  } else {
    for (let i = 0; i < enemiesX.length; i++) {
      if (round >= 4) {
        enemiesY[i] += enemiesDir[i] * 2;
        if (enemiesY[i] < 0 || enemiesY[i] > height - 50) {
          enemiesDir[i] *= -1;
        }
      }
      image(enemyImage, enemiesX[i], enemiesY[i], 75, 75);
    }
  }
}
function managePowerUps() {
  if (timer === 10 && !powerUpSpawned) {
    powerUpsX.push(50);
    powerUpsY.push(catY - 50);
    powerUpSpawned = true;
    powerUpTimer = 60;
  }
  if (powerUpSpawned) {
    for (let i = powerUpsX.length - 1; i >= 0; i--) {
      image(powerUpImage, powerUpsX[i], powerUpsY[i], 40, 40);
      if (catJumping && dist(powerUpsX[i], powerUpsY[i], 50, catY) < 50) {
        powerUpActive = true;
        powerUpType = random(['rapid','time'])
        powerUpsX.splice(i, 1);
        powerUpsY.splice(i, 1);
      }
    }
    powerUpTimer--;
    if (powerUpTimer <= 0) {
      powerUpSpawned = false;
      powerUpsX = [];
      powerUpsY = [];
    }
  }
  if (powerUpActive) {
    handlePowerUpEffects();
    powerUpActive = false; 
  }
}
function handlePowerUpEffects() {
  if (powerUpType === 'rapid') {
    rapidFire = true;
    canShoot = true;
  }
  else if (powerUpType === 'time') {
      timer += 10
    }
}
function displayHUD() {
  textSize(24);
  fill(255, 255, 0); 
  text(`Tiempo: ${timer}`, 75, 50);
  text(`Puntaje: ${score}`, 71, 80);
  text(`Ronda: ${round}`, 60, 110);
  text(`Enemigos Perdidos: ${missedEnemies}`, 144, 140);
}  
function shootProjectile(targetX, targetY) {
  projectilesX.push(100);
  projectilesY.push(height - 100);
  projectilesVelX.push((targetX - 100) / 30);
  projectilesVelY.push((targetY - (height - 100)) / 30);
  projectilesSize.push(10); 
}
