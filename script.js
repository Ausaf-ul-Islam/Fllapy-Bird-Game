const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const moreBirdsButton = document.getElementById('moreBirdsButton');
const birdSelectionPopup = document.getElementById('birdSelectionPopup');
const closePopupButton = document.getElementById('closePopupButton');
const gameOverPopup = document.getElementById('gameOverPopup');
const restartButton = document.getElementById('restartButton');
const gameHeader = document.getElementById('gameHeader');
const backgroundMusic = document.getElementById('backgroundMusic');
const gameInterface = document.getElementById('gameInterface');
const finalScore = document.getElementById('finalScore');
const birdMessage = document.getElementById('birdMessage');
const purchaseMessage = document.getElementById('purchaseMessage');
const flapSound = document.getElementById('flapSound'); // Reference to the flap sound element
const coinSound = document.getElementById('coinSound'); // Reference to the coin collection sound element
const purchaseSound = document.getElementById('purchaseSound'); // Reference to the purchase sound element

const backgroundImg = new Image();
backgroundImg.src = 'bg1.webp';

const birdImg = new Image();
birdImg.src = 'default.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'pipe1.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'pipe2.png';

const coinImg = new Image();
coinImg.src = 'coin.png';

const coinWidth = 60; // Width of the coin
const coinHeight = 60; // Height of the coin

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('load', () => {
    resizeCanvas();
});
window.addEventListener('resize', resizeCanvas);

let birdX = 100;
let birdY = 100;
let birdWidth = 70;
let birdHeight = 70;
let gravity = 0.5;
let jump = -8;
let velocity = 15;
let isGameOver = false;
let score = 0;
let totalCoins = 0; // Total coins across sessions
let scoreIncreaseInterval = 500;
let lastScoreUpdateTime = 0;
let pipes = [];
let coins = [];
let pipeWidth = 60;
let pipeGap = 220;
let pipeSpeed = 1.5;
let selectedBird = 'default.png'; // Default bird

function saveTotalCoins() {
    localStorage.setItem('totalCoins', totalCoins.toString());
}

function loadTotalCoins() {
    const savedCoins = localStorage.getItem('totalCoins');
    totalCoins = savedCoins ? parseInt(savedCoins) : 0;
}

function startGame() {
    gameInterface.classList.remove('blur');
    gameInterface.style.display = 'none';
    canvas.classList.remove('hidden');
    gameOverPopup.classList.add('hidden');
    playButton.style.display = 'none';
    birdY = 0;
    velocity = 0;
    score = 0;
    lastScoreUpdateTime = 0;
    isGameOver = false;
    pipes = [];
    coins = [];
    createPipe();
    
    
    // Restart background music when the game starts
    backgroundMusic.currentTime = 0;  // Reset the music to the beginning
    backgroundMusic.play();  // Play the music
    gameLoop();
}


function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({ x: canvas.width, height: pipeHeight });
    
    // Create a coin in the gap of pipes
    const coinY = pipeHeight + (pipeGap / 2) - (coinHeight / 2);
    coins.push({ x: canvas.width + pipeWidth, y: coinY });
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeTopImg, pipe.x, 0, pipeWidth, pipe.height);
        ctx.drawImage(pipeBottomImg, pipe.x, pipe.height + pipeGap, pipeWidth, canvas.height - pipe.height - pipeGap);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
}

function drawCoins() {
    coins.forEach(coin => {
        ctx.drawImage(coinImg, coin.x, coin.y, coinWidth, coinHeight);
    });
}

function updateCoins() {
    coins.forEach(coin => {
        coin.x -= pipeSpeed;
    });

    coins = coins.filter(coin => coin.x + coinWidth > 0);
}

function checkCollision() {
    pipes.forEach(pipe => {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipeWidth;
        const pipeTop = pipe.height;
        const pipeBottom = pipe.height + pipeGap;

        if (
            birdX < pipeRight &&
            birdX + birdWidth > pipeLeft &&
            (birdY < pipeTop || birdY > pipeBottom)
        ) {
            gameOver();
        }
    });

    coins.forEach((coin, index) => {
        if (
            birdX < coin.x + coinWidth &&
            birdX + birdWidth > coin.x &&
            birdY < coin.y + coinHeight &&
            birdY + birdHeight > coin.y
        ) {
            // Collision with coin
            totalCoins += 1; // Directly increase total coins
            coins.splice(index, 1); // Remove coin after collection
            coinSound.currentTime = 0; // Reset the sound to the beginning
            coinSound.play(); // Play the coin collection sound
        }
    });

    if (birdY + birdHeight > canvas.height || birdY < 0) {
        gameOver();
    }
}

function drawScore() {
    const marginX = 10;
    const marginY = 45;

    ctx.font = '35px ausaf';
    ctx.fillStyle = 'black';


    // Draw the coin image
    ctx.drawImage(coinImg, marginX, marginY - (coinHeight / 1.5), coinWidth, coinHeight);

    // Add shadow to text for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Shadow color
    ctx.shadowOffsetX = 2; // Horizontal shadow offset
    ctx.shadowOffsetY = 2; // Vertical shadow offset
    ctx.shadowBlur = 5; // Shadow blur radius
    // Draw the total coins next to the coin image
    ctx.fillText(`${totalCoins}`, marginX + coinWidth + 10, marginY);
}

function gameOver() {
    isGameOver = true;
    gameOverPopup.classList.remove('hidden'); // Show the game-over popup
    finalScore.textContent = 'Coins : ' + totalCoins; // Display final score
    gameHeader.classList.add('hidden'); // Hide the game header
    backgroundMusic.pause(); // Pause background music

    // Save the total coins to localStorage
    saveTotalCoins();
}

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updateBird();
    drawBird();
    updatePipes();
    drawPipes();
    updateCoins();
    drawCoins();
    checkCollision();
    drawScore();
    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    
}

function drawBird() {
    ctx.drawImage(birdImg, birdX, birdY, birdWidth, birdHeight);
}

function updateBird() {
    velocity += gravity;
    birdY += velocity;
}

function flap() {
    velocity = jump ;
    flapSound.currentTime = 0; // Reset the sound to the beginning
    flapSound.play(); // Play the sound
}

// Load the total coins when the game starts
window.addEventListener('load', () => {
    loadTotalCoins();
    resizeCanvas();
    
});

playButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    // Show the game interface again
    gameInterface.style.display = 'block';
    gameInterface.classList.add('blur');

    // style to the game interface
    gameInterface.style.display = 'grid';
    gameInterface.style.placeItems = 'center';
    
    // Hide the game-over popup and canvas
    gameOverPopup.classList.add('hidden');
    canvas.classList.add('hidden');
    
    // Reset other interface elements as needed
    playButton.style.display = 'block';

});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isGameOver) {
        flap();
    }
});

canvas.addEventListener('click', () => {
    if (!isGameOver) {
        flap();
        // Play flap sound on screen tap
        flapSound.currentTime = 0; // Reset the sound to the beginning
        flapSound.play(); // Play the sound
    }
});

canvas.addEventListener('touchstart', () => {
    if (!isGameOver) {
        flap();
        // Play flap sound on screen tap
        flapSound.currentTime = 0; // Reset the sound to the beginning
        flapSound.play(); // Play the sound
    }
});

moreBirdsButton.addEventListener('click', () => {
    birdSelectionPopup.classList.remove('hidden');
});

closePopupButton.addEventListener('click', () => {
    birdSelectionPopup.classList.add('hidden');
});

// Event listener for bird selection
document.querySelectorAll('.bird-option').forEach(bird => {
    bird.addEventListener('click', () => {
        const birdSrc = bird.getAttribute('data-bird-src');
        const birdCost = parseInt(bird.getAttribute('data-cost'));
        
        if (totalCoins >= birdCost) {
            totalCoins -= birdCost;
            selectedBird = birdSrc;
            birdImg.src = selectedBird;
            saveTotalCoins();
            birdSelectionPopup.classList.add();
            purchaseMessage.textContent = `You Have successfully Purchased.`;
            purchaseMessage.style.display = 'block';
            
            // Play purchase sound
            purchaseSound.currentTime = 0; // Reset the sound to the beginning
            purchaseSound.play(); // Play the sound
            
            setTimeout(() => purchaseMessage.style.display = 'none', 1000); // Hide message after 3 seconds
        } else {
            birdMessage.textContent = `You Need ${birdCost} Coins to Purchase.`;
            birdMessage.style.display = 'block';
            setTimeout(() => birdMessage.style.display = 'none', 1000); // Hide message after 3 seconds
        }
    });
});
function hideLoader() {
    const loader = document.getElementById('game-loader');
    const gameContent = document.getElementById('game-content');
    
    loader.style.display = 'none';
    gameContent.style.display = 'block';
    
}
setTimeout(hideLoader, 1000);

// Add event listeners for the "About Game" button and popup close button
document.getElementById('about-btn').addEventListener('click', function() {
    document.getElementById('aboutGamePopup').classList.remove('hidden'); // Show the popup
});

document.getElementById('closeAboutPopup').addEventListener('click', function() {
    document.getElementById('aboutGamePopup').classList.add('hidden'); // Hide the popup
});
