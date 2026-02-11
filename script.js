const startScreen = document.getElementById("startScreen");
const mainContent = document.getElementById("mainContent");
const music = document.getElementById("music");
const text = document.getElementById("magicText");
const images = document.querySelectorAll(".fade-img");
const themeToggle = document.getElementById("themeToggle");

// ===== فتح الصفحة وتشغيل الموسيقى =====
startScreen.addEventListener("click", () => {
    startScreen.style.opacity = 0;
    setTimeout(() => startScreen.style.display = 'none', 500);
    mainContent.classList.remove("hidden");
    themeToggle.classList.remove("hidden");
    music.play().catch(e => console.log("Audio play prevented:", e));
});

// ===== تبديل الوضع الليلي/النهاري =====
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("day-mode");
    
    // تغيير خلفية النجوم
    if (document.body.classList.contains("day-mode")) {
        starsArray = []; // مسح النجوم في وضع النهار
    } else {
        createStars(); // إعادة النجوم في وضع الليل
    }
});

// ===== الصور تظهر تدريجيًا عند التمرير Parallax =====
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    images.forEach(img => {
        const speed = img.dataset.speed;
        img.style.transform = `translateY(${40 - scrollTop * speed}px) scale(1)`;
        const rect = img.getBoundingClientRect();
        if(rect.top < window.innerHeight - 100) img.classList.add("show");
        else img.classList.remove("show");
    });
});

// ===== الرسائل المخفية التفاعلية =====
const messageDisplay = document.getElementById("messageDisplay");
const starBtns = document.querySelectorAll(".star-btn");

starBtns.forEach(star => {
    star.addEventListener("click", () => {
        const message = star.dataset.message;
        messageDisplay.textContent = message;
        messageDisplay.classList.add("show");
        
        // تأثير الانفجار
        createParticles(
            star.getBoundingClientRect().left + star.offsetWidth / 2,
            star.getBoundingClientRect().top + star.offsetHeight / 2,
            30
        );
    });
});

// ===== مشغل الموسيقى المتقدم =====
const playlist = [
    { src: "music.mp3", title: "أغنية الذكريات 🎼" },
    { src: "music2.mp3", title: "رحلة الصداقة 🎸" },
    { src: "music3.mp3", title: "وعد اللقاء 🎹" }
];

let currentTrack = 0;
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeControl = document.getElementById("volumeControl");
const progressBar = document.getElementById("progressBar");
const songElements = document.querySelectorAll(".song");

// تشغيل/إيقاف
playPauseBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        playPauseBtn.textContent = "⏸️";
    } else {
        music.pause();
        playPauseBtn.textContent = "▶️";
    }
});

// الأغنية السابقة
prevBtn.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
});

// الأغنية التالية
nextBtn.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
});

// تحميل أغنية
function loadTrack(index) {
    music.src = playlist[index].src;
    music.play();
    playPauseBtn.textContent = "⏸️";
    
    // تحديث القائمة
    songElements.forEach((song, i) => {
        song.classList.toggle("active", i === index);
    });
}

// النقر على أغنية
songElements.forEach((song, index) => {
    song.addEventListener("click", () => {
        currentTrack = index;
        loadTrack(currentTrack);
    });
});

// التحكم بالصوت
volumeControl.addEventListener("input", (e) => {
    music.volume = e.target.value / 100;
});

// شريط التقدم
music.addEventListener("timeupdate", () => {
    const progress = (music.currentTime / music.duration) * 100;
    progressBar.style.width = progress + "%";
});

// الانتقال التلقائي للأغنية التالية
music.addEventListener("ended", () => {
    nextBtn.click();
});

// ===== معرض الصور 3D =====
const photoCards = document.querySelectorAll(".photo-card");

photoCards.forEach(card => {
    card.addEventListener("click", () => {
        card.style.transform = card.style.transform.includes("rotateY(180deg)") 
            ? "rotateY(0deg)" 
            : "rotateY(180deg)";
    });
});

// ===== لعبة اجمع القلوب =====
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");
gameCanvas.width = 600;
gameCanvas.height = 400;

let gameRunning = false;
let score = 0;
let hearts = [];
let player = { x: 300, y: 350, width: 50, height: 50 };

document.getElementById("startGame").addEventListener("click", startGame);

function startGame() {
    gameRunning = true;
    score = 0;
    hearts = [];
    document.getElementById("score").textContent = score;
    gameLoop();
}

function createHeart() {
    hearts.push({
        x: Math.random() * (gameCanvas.width - 30),
        y: -30,
        speed: Math.random() * 2 + 2,
        size: 30
    });
}

function drawPlayer() {
    gctx.font = "50px Arial";
    gctx.fillText("🎯", player.x, player.y);
}

function drawHeart(heart) {
    gctx.font = heart.size + "px Arial";
    gctx.fillText("💙", heart.x, heart.y);
}

function updateGame() {
    // إضافة قلوب جديدة
    if (Math.random() < 0.02) {
        createHeart();
    }
    
    // تحديث القلوب
    hearts.forEach((heart, index) => {
        heart.y += heart.speed;
        
        // التحقق من التصادم
        if (
            heart.x < player.x + player.width &&
            heart.x + heart.size > player.x &&
            heart.y < player.y + player.height &&
            heart.y + heart.size > player.y
        ) {
            score += 10;
            document.getElementById("score").textContent = score;
            hearts.splice(index, 1);
            createParticles(heart.x + 15, heart.y + 15, 20);
        }
        
        // إزالة القلوب التي خرجت من الشاشة
        if (heart.y > gameCanvas.height) {
            hearts.splice(index, 1);
        }
    });
}

function gameLoop() {
    if (!gameRunning) return;
    
    gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    drawPlayer();
    hearts.forEach(drawHeart);
    updateGame();
    
    requestAnimationFrame(gameLoop);
}

// تحريك اللاعب بالماوس
gameCanvas.addEventListener("mousemove", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    player.x = e.clientX - rect.left - player.width / 2;
    player.y = e.clientY - rect.top - player.height / 2;
});

// ===== لعبة تخمين الذكريات =====
const memoryGrid = document.getElementById("memoryGrid");
const emojis = ["💙", "✨", "🌟", "🎉", "🎁", "🌈", "⭐", "💫"];
const memoryCards = [...emojis, ...emojis];
let flippedCards = [];
let matchedPairs = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createMemoryGame() {
    memoryGrid.innerHTML = "";
    const shuffled = shuffleArray([...memoryCards]);
    matchedPairs = 0;
    
    shuffled.forEach((emoji, index) => {
        const card = document.createElement("div");
        card.className = "memory-card";
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.textContent = "❓";
        
        card.addEventListener("click", () => flipCard(card));
        memoryGrid.appendChild(card);
    });
}

function flipCard(card) {
    if (flippedCards.length >= 2 || card.classList.contains("flipped")) return;
    
    card.classList.add("flipped");
    card.textContent = card.dataset.emoji;
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;
        
        if (matchedPairs === emojis.length) {
            setTimeout(() => {
                alert("🎉 مبروك! أكملت اللعبة!");
                createMemoryGame();
            }, 500);
        }
    } else {
        card1.classList.remove("flipped");
        card2.classList.remove("flipped");
        card1.textContent = "❓";
        card2.textContent = "❓";
    }
    
    flippedCards = [];
}

document.getElementById("resetMemory").addEventListener("click", createMemoryGame);
createMemoryGame();

// ===== كبسولة الزمن =====
const unlockDate = new Date("2025-12-31T23:59:59");
const secretCode = "صداقة"; // الرمز السري
const countdownElement = document.getElementById("countdown");
const secretInput = document.getElementById("secretCode");
const unlockBtn = document.getElementById("unlockBtn");
const lockedCapsule = document.getElementById("lockedCapsule");
const unlockedCapsule = document.getElementById("unlockedCapsule");

// تحديث العد التنازلي
function updateCountdown() {
    const now = new Date();
    const diff = unlockDate - now;
    
    if (diff <= 0) {
        countdownElement.textContent = "⏰ حان وقت الفتح!";
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    countdownElement.textContent = `${days} يوم، ${hours} ساعة، ${minutes} دقيقة، ${seconds} ثانية`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// فتح الكبسولة
unlockBtn.addEventListener("click", () => {
    const now = new Date();
    const inputCode = secretInput.value.trim();
    
    if (now >= unlockDate || inputCode === secretCode) {
        lockedCapsule.classList.add("hidden");
        unlockedCapsule.classList.remove("hidden");
        
        // تأثير الاحتفال
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                createParticles(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight,
                    5
                );
            }, i * 50);
        }
    } else {
        secretInput.style.borderColor = "red";
        secretInput.placeholder = "❌ رمز خاطئ!";
        setTimeout(() => {
            secretInput.style.borderColor = "";
            secretInput.placeholder = "أدخل الرمز السري";
        }, 2000);
    }
});

// ===== Particles =====
const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];

function createParticles(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 8 + 3,
            speedX: (Math.random() - 0.5) * 6,
            speedY: (Math.random() - 0.5) * 6,
            life: 150,
            color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`
        });
    }
}

function drawParticle(p) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        drawParticle(p);
        if (p.life <= 0) particles.splice(index, 1);
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Particles على النص
text.addEventListener("mousemove", (e) => createParticles(e.clientX, e.clientY, 15));
text.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    createParticles(touch.clientX, touch.clientY, 15);
});

document.body.addEventListener("click", (e) => createParticles(e.clientX, e.clientY, 25));
document.body.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    createParticles(touch.clientX, touch.clientY, 25);
});

// تكبير النص
text.addEventListener("mouseover", () => text.classList.add("active-touch"));
text.addEventListener("mouseout", () => text.classList.remove("active-touch"));
text.addEventListener("touchstart", (e) => {
    e.preventDefault();
    text.classList.add("active-touch");
});
text.addEventListener("touchend", () => text.classList.remove("active-touch"));

// ===== النجوم المتلألئة =====
const starsCanvas = document.getElementById("starsCanvas");
const sctx = starsCanvas.getContext("2d");
starsCanvas.width = window.innerWidth;
starsCanvas.height = window.innerHeight;

let starsArray = [];
let shootingStars = [];

class Star {
    constructor() {
        this.x = Math.random() * starsCanvas.width;
        this.y = Math.random() * starsCanvas.height;
        this.size = Math.random() * 2;
        this.brightness = Math.random();
        this.twinkleSpeed = Math.random() * 0.05 + 0.01;
    }
    
    update() {
        this.brightness += this.twinkleSpeed;
        if (this.brightness > 1 || this.brightness < 0) {
            this.twinkleSpeed = -this.twinkleSpeed;
        }
    }
    
    draw() {
        sctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        sctx.beginPath();
        sctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        sctx.fill();
    }
}

class ShootingStar {
    constructor() {
        this.x = Math.random() * starsCanvas.width;
        this.y = Math.random() * starsCanvas.height * 0.5;
        this.length = Math.random() * 80 + 50;
        this.speed = Math.random() * 10 + 15;
        this.opacity = 1;
    }
    
    update() {
        this.x -= this.speed;
        this.y += this.speed * 0.5;
        this.opacity -= 0.01;
    }
    
    draw() {
        sctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        sctx.lineWidth = 2;
        sctx.beginPath();
        sctx.moveTo(this.x, this.y);
        sctx.lineTo(this.x + this.length, this.y - this.length * 0.5);
        sctx.stroke();
    }
}

function createStars() {
    starsArray = [];
    for (let i = 0; i < 200; i++) {
        starsArray.push(new Star());
    }
}

function createShootingStar() {
    if (Math.random() < 0.01 && !document.body.classList.contains("day-mode")) {
        shootingStars.push(new ShootingStar());
    }
}

function animateStars() {
    sctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    
    if (!document.body.classList.contains("day-mode")) {
        starsArray.forEach(star => {
            star.update();
            star.draw();
        });
        
        createShootingStar();
        
        shootingStars.forEach((star, index) => {
            star.update();
            star.draw();
            if (star.opacity <= 0) {
                shootingStars.splice(index, 1);
            }
        });
    }
    
    requestAnimationFrame(animateStars);
}

createStars();
animateStars();

// تتبع الماوس للنجوم
starsCanvas.addEventListener("mousemove", (e) => {
    if (!document.body.classList.contains("day-mode")) {
        for (let i = 0; i < 3; i++) {
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                life: 60,
                color: `rgba(255, 255, 255, ${Math.random()})`
            });
        }
    }
});

// ===== الخلفية المتحركة مع الطائرات =====
const travelCanvas = document.getElementById("travelCanvas");
const tctx = travelCanvas.getContext("2d");
travelCanvas.width = window.innerWidth;
travelCanvas.height = window.innerHeight;

let elements = [];
const planeImg = new Image();
planeImg.src = 'images/plane.png';

for (let i = 0; i < 20; i++) {
    elements.push({
        x: Math.random() * travelCanvas.width,
        y: Math.random() * travelCanvas.height,
        size: Math.random() * 30 + 20,
        speed: Math.random() * 1.5 + 0.2,
        type: 'plane',
        angle: Math.random() * Math.PI * 2
    });
}

function animateTravel() {
    tctx.clearRect(0, 0, travelCanvas.width, travelCanvas.height);
    elements.forEach((el) => {
        el.x += Math.cos(el.angle) * el.speed;
        el.y += Math.sin(el.angle) * el.speed;
        if (el.x > travelCanvas.width) el.x = 0;
        if (el.x < 0) el.x = travelCanvas.width;
        if (el.y > travelCanvas.height) el.y = 0;
        if (el.y < 0) el.y = travelCanvas.height;

        if (el.type === 'plane' && planeImg.complete) {
            tctx.save();
            tctx.translate(el.x, el.y);
            tctx.rotate(el.angle);
            tctx.drawImage(planeImg, -el.size / 2, -el.size / 4, el.size, el.size * 0.5);
            tctx.restore();
        }
    });
    requestAnimationFrame(animateTravel);
}

planeImg.onload = animateTravel;

// ===== Resize =====
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    travelCanvas.width = window.innerWidth;
    travelCanvas.height = window.innerHeight;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    createStars();
});
