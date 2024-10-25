let cat, enemiesX = [], enemiesY = [], enemiesDir = [], projectilesX = [], projectilesY = [], projectilesVelX = [], projectilesVelY = [], projectilesSize = [];
let powerUpsX = [], powerUpsY = [];
let round = 1, maxRounds = 5, enemyCount = 3;
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
  catY = height - 150; // Ajusta la posición inicial del gato
  resetGame();
  backgroundMusic.loop(); // Reproducir música en bucle
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
  textFont(customFont); // Aplicar la fuente
  fill(255, 204, 0);
  text("Dientes y Colmillos - CAT GAME", width / 2, height / 2 - 100);
  textSize(24);
  text("By Joaquín Cortés and Valentina Robles", width / 2, height / 2 + 60);
  fill(0);
  text("Presiona Enter para empezar", width / 2, height / 2);
  text("Presiona 'T (Mayus)' para leer las reglas", width / 2, height / 2 + 30);
  text("Presiona 'L (Mayus)' para saber del lore", width / 2, height / 2 + 60);
  textSize(18);
}

function displayLoreMenu() {
  textAlign(CENTER);
  textSize(32);
  fill(255, 204, 0);
  text("La historia de Dientes y Colmillos", width / 2, height / 2 - 150);
  
  // Aquí puedes añadir tu video
  textSize(18);
  fill(0);
  text("Aquí irá un video (agrega el video más adelante)", width / 2, height / 2);
  
  textSize(20);
  fill(255, 0, 0);
  text("Presiona 'B (Mayus)' para volver al menú principal", width / 2, height / 2 + 100);
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
  } else if (round === maxRounds + 1) { // Ronda 6 es el jefe final
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
      startBossRound(); // Iniciar ronda de jefe
    } else {
      resetRound();
      gameState = 'play';
    }
  }
}

// Función para manejar la ronda del jefe
function startBossRound() {
  // Resetea los efectos de power-ups
  rapidFire = false;
  powerUpActive = false; // Asegúrate de que no haya power-ups activos
  powerUpType = ''; // Limpia el tipo de power-up

  timer = 40; // Mayor tiempo para la ronda del jefe
  bossHealth = 30; // 30 proyectiles necesarios para derrotar al jefe
  bossX = width - 300;
  bossY = height - 400;
  bossSize = 250; // Tamaño considerable para el jefe

  // Crear enemigos normales detrás del jefe
  for (let i = 0; i < 3; i++) {
    enemiesX.push(bossX - 100); // Posición fija a la izquierda del jefe
    enemiesY.push(random(height - 200)); // Posición vertical aleatoria
    enemiesDir.push(random([-1, 1])); // Dirección aleatoria
  }

  gameState = 'play';
}

function playGame() {
  if (frameCount % 60 == 0 && timer > 0) timer--;
  if (timer <= 0) {
    if (round === maxRounds + 1) {
      if (bossHealth > 0) {
        gameState = 'lose'; // Pierde si no elimina al jefe
      }
    } else {
      missedEnemies += enemiesX.length; 
      if (missedEnemies >= 3) {
        gameState = 'lose'; // Pierde si no elimina a los enemigos
      } else {
        round++;
        if (round > maxRounds + 1) { // Incluye ronda de jefe
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

  // Dibuja los enemigos
  for (let i = 0; i < enemiesX.length; i++) {
    if (enemiesX[i] > 0) {
      fill(255, 0, 0);
      image(enemyImage, enemiesX[i], enemiesY[i], 50, 50);
      enemiesX[i] += enemiesDir[i]; // Mover enemigos
    } else {
      missedEnemies++;
      enemiesX.splice(i, 1); // Elimina el enemigo
      enemiesY.splice(i, 1);
      enemiesDir.splice(i, 1);
      i--; // Ajusta el índice
    }
  }

  // Dibuja los proyectiles
  for (let i = 0; i < projectilesX.length; i++) {
    if (projectilesX[i] < width) {
      fill(0, 255, 0);
      ellipse(projectilesX[i], projectilesY[i], projectilesSize[i]);
      projectilesX[i] += projectilesVelX[i];
      projectilesY[i] += projectilesVelY[i];
    } else {
      projectilesX.splice(i, 1); // Elimina el proyectil
      projectilesY.splice(i, 1);
      projectilesVelX.splice(i, 1);
      projectilesVelY.splice(i, 1);
      projectilesSize.splice(i, 1);
      i--; // Ajusta el índice
    }
  }

  // Dibuja el power-up
  if (powerUpActive) {
    fill(255, 255, 0);
    image(powerUpImage, powerUpsX[0], powerUpsY[0], 30, 30);
    powerUpTimer--;
    if (powerUpTimer <= 0) {
      powerUpActive = false; // Desactivar el power-up
      powerUpsX.splice(0, 1);
      powerUpsY.splice(0, 1);
    }
  } else if (!powerUpSpawned && frameCount % 60 === 0 && timer <= 10) {
    powerUpsX.push(random(width)); // Posición aleatoria
    powerUpsY.push(random(height - 100)); // Posición aleatoria
    powerUpSpawned = true; // Evitar múltiples spawns
    powerUpTimer = 300; // Dura 5 segundos
  }

  // Dibuja al gato
  fill(0);
  image(cat, mouseX, catY, 100, 100);

  // Verifica colisiones con el power-up
  for (let i = 0; i < powerUpsX.length; i++) {
    if (dist(mouseX, catY, powerUpsX[i], powerUpsY[i]) < 50) {
      activatePowerUp();
      powerUpsX.splice(i, 1);
      powerUpsY.splice(i, 1);
      break; // Salir del bucle después de recoger un power-up
    }
  }

  // Verifica colisiones entre proyectiles y enemigos
  for (let i = projectilesX.length - 1; i >= 0; i--) {
    for (let j = enemiesX.length - 1; j >= 0; j--) {
      if (dist(projectilesX[i], projectilesY[i], enemiesX[j], enemiesY[j]) < 30) {
        enemiesX.splice(j, 1); // Elimina enemigo
        enemiesY.splice(j, 1);
        enemiesDir.splice(j, 1);
        projectilesX.splice(i, 1); // Elimina proyectil
        projectilesY.splice(i, 1);
        projectilesVelX.splice(i, 1);
        projectilesVelY.splice(i, 1);
        projectilesSize.splice(i, 1);
        score++; // Aumentar puntaje
        break; // Salir del bucle
      }
    }
  }

  // Verifica colisiones con el jefe
  if (round === maxRounds + 1) {
    if (bossHealth > 0) {
      fill(255, 0, 0);
      ellipse(bossX, bossY, bossSize);
      if (dist(mouseX, catY, bossX, bossY) < 125) {
        bossHealth--; // Disminuir salud del jefe
      }
      if (bossHealth <= 0) {
        gameState = 'win'; // Ganar
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
    rapidFire = true; // Habilita disparo rápido
    shootCooldown = 500; // Dispara más rápido
    powerUpTimer = 300; // 5 segundos
  }
}

function shootProjectile(targetX, targetY) {
  let angle = atan2(targetY - catY, targetX - mouseX);
  let velX = cos(angle) * 5;
  let velY = sin(angle) * 5;
  
  projectilesX.push(mouseX);
  projectilesY.push(catY);
  projectilesVelX.push(velX);
  projectilesVelY.push(velY);
  projectilesSize.push(10); // Tamaño del proyectil
}

function manageCatMovement() {
  if (catJumping) {
    catY += catVelocityY;
    catVelocityY += gravity; // Aplicar gravedad

    if (catY >= height - 150) {
      catY = height - 150; // Asegúrate de que no se salga de la pantalla
      catJumping = false; // Termina el salto
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
  missedEnemies = 0; // Reinicia los enemigos no eliminados
  timer = 20; // Reinicia el temporizador
  powerUpSpawned = false; // Reinicia el spawn del power-up
}

function resetGame() {
  round = 1;
  score = 0;
  missedEnemies = 0;
  resetRound();
  gameState = 'start'; // Volver al menú
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
      resetGame(); // Reiniciar el juego completo
      gameState = 'prepare';
      preparationCountdown = preparationTime;

      backgroundMusic.stop(); // Detener música de fondo
      gameMusic.loop(); // Reproducir música del juego
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
    if (gameState === 'play' && !catJumping) { // Solo permite saltar si no está saltando
      catJumping = true;
      catVelocityY = -jumpStrength; // Inicia el salto
    }
  }
  if (key === 'E' && gameState === 'play') { // Opción para salir al menú
    gameState = 'start'; // Vuelve al menú principal
    resetGame(); // Reinicia el juego
    backgroundMusic.loop(); // Reinicia la música de fondo
    gameMusic.stop(); // Detiene la música del juego
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}

function setup() {
  createCanvas(windowWidth, windowHeight);

  catY = height - 150; // Ajusta la posición inicial del gato
  resetGame();
  backgroundMusic.loop(); // Reproducir música en bucle
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
  textFont(customFont); // Aplicar la fuente
  fill(255, 204, 0);
  text("Dientes y Colmillos - CAT GAME", width / 2, height / 2 - 100);
  textSize(24);
  fill(0);
  text("Presiona Enter para empezar", width / 2, height / 2);
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
  
  // Aquí puedes añadir tu video
  textSize(18);
  fill(0);
  text("Aquí irá un video (agrega el video más adelante)", width / 2, height / 2);
  
  textSize(20);
  fill(255, 0, 0);
  text("Presiona 'B (Mayus)' para volver al menú principal", width / 2, height / 2 + 100);
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
  } else if (round === maxRounds + 1) { // Ronda 6 es el jefe final
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
      startBossRound(); // Iniciar ronda de jefe
    } else {
      resetRound();
      gameState = 'play';
    }
  }
}

// Función para manejar la ronda del jefe
function startBossRound() {
  // Resetea los efectos de power-ups
  rapidFire = false;
  powerUpActive = false; // Asegúrate de que no haya power-ups activos
  powerUpType = ''; // Limpia el tipo de power-up

  timer = 40; // Mayor tiempo para la ronda del jefe
  bossHealth = 30; // 30 proyectiles necesarios para derrotar al jefe
  bossX = width - 300;
  bossY = height - 400;
  bossSize = 250; // Tamaño considerable para el jefe

  // Crear enemigos normales detrás del jefe
  for (let i = 0; i < 3; i++) {
    enemiesX.push(bossX - 100); // Posición fija a la izquierda del jefe
    enemiesY.push(random(height - 200)); // Posición vertical aleatoria
    enemiesDir.push(random([-1, 1])); // Dirección aleatoria
  }

  gameState = 'play';
}

function playGame() {
  if (frameCount % 60 == 0 && timer > 0) timer--;
  if (timer <= 0) {
    if (round === maxRounds + 1) {
      if (bossHealth > 0) {
        gameState = 'lose'; // Pierde si no elimina al jefe
      }
    } else {
      missedEnemies += enemiesX.length; 
      if (missedEnemies >= 3) {
        gameState = 'lose'; // Pierde si no elimina a los enemigos
      } else {
        round++;
        if (round > maxRounds + 1) { // Incluye ronda de jefe
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
    if (round > maxRounds + 1) { // Incluye ronda de jefe
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
  // Aplicar gravedad
  if (catJumping) {
    catY += catVelocityY;
    catVelocityY += gravity; // Aumentar la gravedad
    if (catY >= height - 150) { // Aterriza
      catY = height - 150;
      catJumping = false;
      catVelocityY = 0; // Reiniciar velocidad
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

    if (round === maxRounds + 1) { // Ronda del jefe
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
    // Jefe final
    fill(255, 0, 0);
    rect(bossX, bossY - 50, bossHealth * 5, 20); // Barra de vida
    image(enemyImage, bossX, bossY, bossSize, bossSize);
  } else {
    // Enemigos normales
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
  fill(255, 255, 0); // Color amarillo
  text(`Tiempo: ${timer}`, 75, 50);
  text(`Puntaje: ${score}`, 71, 80);
  text(`Ronda: ${round}`, 60, 110);
  text(`Enemigos Perdidos: ${missedEnemies}`, 144, 140);
}

function keyPressed() {
  if (key === 'Enter') {
    if (gameState === 'start' || gameState === 'win' || gameState === 'lose') {
      resetGame(); // Reiniciar el juego completo
      gameState = 'prepare';
      preparationCountdown = preparationTime;

      backgroundMusic.stop(); // Detener música de fondo
      gameMusic.loop(); // Reproducir música del juego
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
    if (gameState === 'play' && !catJumping) { // Solo permite saltar si no está saltando
      catJumping = true;
      catVelocityY = -jumpStrength; // Inicia el salto
    }
  }
}

function shootProjectile(targetX, targetY) {
  projectilesX.push(100);
  projectilesY.push(height - 100);
  projectilesVelX.push((targetX - 100) / 30);
  projectilesVelY.push((targetY - (height - 100)) / 30);
  projectilesSize.push(10); 
}

<<<<<<< HEAD
=======
function touchStarted() {
  if (gameState === 'start') {
    resetGame(); // Reinicia el juego completo
    gameState = 'prepare';
    preparationCountdown = preparationTime;
    backgroundMusic.stop();
    gameMusic.loop(); // Inicia la música del juego
  } else if (gameState === 'play') {
    if (touchX < width / 2) {
      // Lado izquierdo para saltar
      if (!catJumping) {
        catJumping = true;
        catVelocityY = -jumpStrength;
      }
    } else {
      // Lado derecho para disparar
      shootProjectile(touchX, touchY);
    }
  }
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
    if (isMobile()) displayMobileControls(); // Mostrar controles móviles si es necesario
  } else if (gameState === 'win') {
    displayWinMenu();
  } else if (gameState === 'lose') {
    displayLoseMenu();
  }
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Mostrar botones en dispositivos móviles
function displayMobileControls() {
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text("SALTA", width * 0.15, height * 0.9);
  text("DISPARA", width * 0.85, height * 0.9);
}

// Detección de toques para dispositivos móviles
function touchStarted() {
  if (gameState === 'play') {
    if (touchX < width / 2) {
      // Lado izquierdo para saltar
      if (!catJumping) {
        catJumping = true;
        catVelocityY = -jumpStrength;
      }
    } else {
      // Lado derecho para disparar
      shootProjectile(touchX, touchY);
    }
  }
}
>>>>>>> 1168dfce39e20152a38f778a2d34145bca3c524c
