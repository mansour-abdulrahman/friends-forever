// ===== تحسين الأداء - تهيئة المتغيرات =====
const loadingScreen = document.getElementById("loadingScreen");
const loadingBar = document.getElementById("loadingBar");
const startScreen = document.getElementById("startScreen");
const mainContent = document.getElementById("mainContent");
const controlButtons = document.getElementById("controlButtons");
const music = document.getElementById("music");
const text = document.getElementById("magicText");
const themeToggle = document.getElementById("themeToggle");
const muteToggle = document.getElementById("muteToggle");
const skipAnimations = document.getElementById("skipAnimations");

// متغيرات عامة
let starsArray = [];
let shootingStars = [];
let particles = [];
let isAnimationsPaused = false;
let isMuted = false;

// ===== Loading Screen =====
let loadProgress = 0;
const loadingInterval = setInterval(() => {
    loadProgress += Math.random() * 15;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(loadingInterval);
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                startScreen.classList.remove('hidden');
            }, 500);
        }, 500);
    }
    loadingBar.style.width = loadProgress + '%';
}, 200);

// ===== localStorage للحفظ =====
const Storage = {
    get: (key, defaultValue = null) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// ===== نظام الإشعارات =====
const notificationContainer = document.getElementById('notificationContainer');

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== فتح الصفحة وتشغيل الموسيقى =====
startScreen.addEventListener("click", () => {
    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'none';
        mainContent.classList.remove("hidden");
        controlButtons.classList.remove("hidden");
        
        // تشغيل الموسيقى فقط إذا لم تكن مكتومة
        if (!isMuted) {
            music.play().catch(e => {
                console.log("Audio play prevented:", e);
                showNotification('اضغط على أي مكان لتشغيل الموسيقى 🎵', 'info');
            });
        }
        
        // تهيئة الإحصائيات
        initStats();
        
        // رسالة ترحيب
        showNotification('مرحباً بك! استكشف المفاجآت 💙', 'success');
    }, 500);
});

// ===== تبديل الوضع الليلي/النهاري =====
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("day-mode");
    
    // حفظ التفضيل
    Storage.set('theme', document.body.classList.contains('day-mode') ? 'day' : 'night');
    
    // تغيير النجوم
    if (document.body.classList.contains("day-mode")) {
        starsArray = [];
        shootingStars = [];
    } else {
        createStars();
    }
});

// تحميل التفضيل المحفوظ
if (Storage.get('theme') === 'day') {
    document.body.classList.add('day-mode');
}

// ===== زر الوضع الصامت =====
muteToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    document.body.classList.toggle("muted");
    
    if (isMuted) {
        music.pause();
        music.volume = 0;
    } else {
        music.volume = volumeControl.value / 100;
        music.play().catch(e => console.log("Audio play prevented:", e));
    }
    
    Storage.set('muted', isMuted);
    showNotification(isMuted ? 'تم كتم الصوت 🔇' : 'تم تشغيل الصوت 🔊', 'info');
});

// تحميل حالة الصوت
if (Storage.get('muted')) {
    muteToggle.click();
}

// ===== زر تخطي الأنيميشنات =====
skipAnimations.addEventListener("click", () => {
    isAnimationsPaused = !isAnimationsPaused;
    document.body.classList.toggle("skip-animations");
    
    skipAnimations.style.opacity = isAnimationsPaused ? '1' : '0.7';
    showNotification(
        isAnimationsPaused ? 'تم إيقاف الأنيميشنات ⏸️' : 'تم تشغيل الأنيميشنات ▶️',
        'info'
    );
});

// ===== إحصائيات الصداقة =====
const friendshipStartDate = new Date('2020-01-01'); // غيّر هذا التاريخ

function initStats() {
    // حساب الأيام
    const now = new Date();
    const daysSince = Math.floor((now - friendshipStartDate) / (1000 * 60 * 60 * 24));
    document.getElementById('daysSince').textContent = daysSince.toLocaleString('ar-EG');
    
    // مجموع النقاط
    const totalScore = Storage.get('totalScore', 0);
    document.getElementById('totalScore').textContent = totalScore.toLocaleString('ar-EG');
    
    // الإنجازات
    const achievements = Storage.get('achievements', []);
    document.getElementById('achievementsCount').textContent = achievements.length;
}

// ===== عداد المسافة =====
const distanceValue = document.getElementById('distanceValue');
const updateDistanceBtn = document.getElementById('updateDistance');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومترات
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

updateDistanceBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        updateDistanceBtn.textContent = 'جاري التحديث...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // إحداثيات لبنان (مثال)
                const distance = calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    34.5197, // طرابلس، لبنان
                    35.8278
                );
                distanceValue.textContent = distance.toLocaleString('ar-EG') + ' كم';
                Storage.set('lastDistance', distance);
                updateDistanceBtn.textContent = 'تحديث الموقع 📍';
                showNotification('تم تحديث المسافة بنجاح 🌍', 'success');
            },
            (error) => {
                updateDistanceBtn.textContent = 'تحديث الموقع 📍';
                showNotification('لم نتمكن من الوصول إلى موقعك', 'error');
            }
        );
    } else {
        showNotification('المتصفح لا يدعم تحديد الموقع', 'error');
    }
});

// تحميل آخر مسافة محفوظة
const lastDistance = Storage.get('lastDistance');
if (lastDistance) {
    distanceValue.textContent = lastDistance.toLocaleString('ar-EG') + ' كم';
}

// ===== الصور تظهر تدريجيًا عند التمرير Parallax =====
const fadeImages = document.querySelectorAll(".fade-img");

function checkScroll() {
    const scrollTop = window.scrollY;
    
    fadeImages.forEach(img => {
        const speed = parseFloat(img.dataset.speed || 0.1);
        img.style.transform = `translateY(${40 - scrollTop * speed}px) scale(1)`;
        
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            img.classList.add("show");
        }
    });
}

// استخدام requestAnimationFrame للأداء الأفضل
let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            checkScroll();
            ticking = false;
        });
        ticking = true;
    }
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
        
        // إنجاز
        unlockAchievement('message_reader');
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
    if (isMuted) {
        showNotification('قم بإلغاء كتم الصوت أولاً', 'info');
        return;
    }
    
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
    if (isMuted) return;
    
    music.src = playlist[index].src;
    music.play().catch(e => console.log("Audio error:", e));
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
    if (!isMuted) {
        music.volume = e.target.value / 100;
    }
});

// شريط التقدم
music.addEventListener("timeupdate", () => {
    if (music.duration) {
        const progress = (music.currentTime / music.duration) * 100;
        progressBar.style.width = progress + "%";
    }
});

// النقر على شريط التقدم
document.querySelector('.progress-container').addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    music.currentTime = percent * music.duration;
});

// الانتقال التلقائي للأغنية التالية
music.addEventListener("ended", () => {
    nextBtn.click();
});

// ===== معرض الصور 3D =====
const photoCards = document.querySelectorAll(".photo-card");

photoCards.forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
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
let highScore = Storage.get('highScore', 0);

document.getElementById("highScore").textContent = highScore;
document.getElementById("startGame").addEventListener("click", startGame);

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    score = 0;
    hearts = [];
    document.getElementById("score").textContent = score;
    gameLoop();
    unlockAchievement('game_starter');
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
            
            // تحقق من الرقم القياسي
            if (score > highScore) {
                highScore = score;
                Storage.set('highScore', highScore);
                document.getElementById("highScore").textContent = highScore;
                showNotification('رقم قياسي جديد! 🎉', 'success');
            }
            
            // إنجازات
            if (score >= 100) unlockAchievement('score_100');
            if (score >= 500) unlockAchievement('score_500');
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

// دعم اللمس للموبايل
gameCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = gameCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    player.x = touch.clientX - rect.left - player.width / 2;
    player.y = touch.clientY - rect.top - player.height / 2;
});

// ===== لعبة تخمين الذكريات =====
const memoryGrid = document.getElementById("memoryGrid");
const emojis = ["💙", "✨", "🌟", "🎉", "🎁", "🌈", "⭐", "💫"];
const memoryCards = [...emojis, ...emojis];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameTimer = null;
let gameTime = 0;

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createMemoryGame() {
    memoryGrid.innerHTML = "";
    const shuffled = shuffleArray(memoryCards);
    matchedPairs = 0;
    moves = 0;
    gameTime = 0;
    
    document.getElementById('movesCount').textContent = moves;
    document.getElementById('timerDisplay').textContent = '00:00';
    
    // إيقاف المؤقت السابق
    if (gameTimer) clearInterval(gameTimer);
    
    // بدء المؤقت
    gameTimer = setInterval(() => {
        gameTime++;
        const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
        const seconds = (gameTime % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
    }, 1000);
    
    shuffled.forEach((emoji, index) => {
        const card = document.createElement("div");
        card.className = "memory-card";
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.textContent = "❓";
        
        card.addEventListener("click", () => flipCard(card));
        memoryGrid.appendChild(card);
    });
    
    unlockAchievement('memory_player');
}

function flipCard(card) {
    if (flippedCards.length >= 2 || card.classList.contains("flipped")) return;
    
    moves++;
    document.getElementById('movesCount').textContent = moves;
    
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
            clearInterval(gameTimer);
            setTimeout(() => {
                showNotification(`🎉 مبروك! أكملت اللعبة في ${moves} حركة و ${gameTime} ثانية!`, 'success');
                
                // حفظ مجموع النقاط
                const totalScore = Storage.get('totalScore', 0);
                Storage.set('totalScore', totalScore + 100);
                initStats();
                
                unlockAchievement('memory_master');
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
const secretCode = "صداقة";
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
        
        Storage.set('capsuleUnlocked', true);
        unlockAchievement('time_traveler');
        showNotification('تم فتح كبسولة الزمن! 🎉', 'success');
    } else {
        secretInput.classList.add('error');
        showNotification('❌ رمز خاطئ! حاول مرة أخرى', 'error');
        
        setTimeout(() => {
            secretInput.classList.remove('error');
        }, 500);
    }
});

// مشاركة على واتساب
document.getElementById('shareMessage').addEventListener('click', () => {
    const message = encodeURIComponent('شاهد هذه الرسالة الرائعة من صديقي! 💙');
    window.open(`https://wa.me/?text=${message}`, '_blank');
});

// تحميل حالة الكبسولة
if (Storage.get('capsuleUnlocked')) {
    lockedCapsule.classList.add("hidden");
    unlockedCapsule.classList.remove("hidden");
}

// ===== نظام الإنجازات =====
const achievementsList = [
    { id: 'first_visit', title: 'الزيارة الأولى', desc: 'قمت بزيارة الموقع', icon: '🎉', unlocked: true },
    { id: 'message_reader', title: 'قارئ الرسائل', desc: 'قرأت رسالة من القلب', icon: '💌', unlocked: false },
    { id: 'game_starter', title: 'اللاعب', desc: 'بدأت لعبة القلوب', icon: '🎮', unlocked: false },
    { id: 'score_100', title: 'المحترف', desc: 'حققت 100 نقطة', icon: '🏆', unlocked: false },
    { id: 'score_500', title: 'الأسطورة', desc: 'حققت 500 نقطة', icon: '👑', unlocked: false },
    { id: 'memory_player', title: 'الذاكرة القوية', desc: 'لعبت لعبة الذاكرة', icon: '🧠', unlocked: false },
    { id: 'memory_master', title: 'سيد الذاكرة', desc: 'أكملت لعبة الذاكرة', icon: '🌟', unlocked: false },
    { id: 'time_traveler', title: 'مسافر عبر الزمن', desc: 'فتحت كبسولة الزمن', icon: '⏰', unlocked: false }
];

function loadAchievements() {
    const saved = Storage.get('achievements', []);
    achievementsList.forEach(achievement => {
        if (saved.includes(achievement.id)) {
            achievement.unlocked = true;
        }
    });
}

function unlockAchievement(id) {
    const achievement = achievementsList.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    
    // حفظ
    const saved = Storage.get('achievements', []);
    if (!saved.includes(id)) {
        saved.push(id);
        Storage.set('achievements', saved);
    }
    
    // إشعار
    showNotification(`🏆 إنجاز جديد: ${achievement.title}`, 'success');
    
    // تحديث العداد
    initStats();
    renderAchievements();
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';
    
    achievementsList.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        grid.appendChild(card);
    });
}

// تهيئة الإنجازات
loadAchievements();
renderAchievements();

// ===== Particles (محسّن) =====
const canvas = document.getElementById("particlesCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createParticles(x, y, count = 20) {
    if (isAnimationsPaused) return;
    
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
    ctx.globalAlpha = p.life / 150;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isAnimationsPaused) {
        particles.forEach((p, index) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.life--;
            p.speedY += 0.1; // جاذبية
            drawParticle(p);
            if (p.life <= 0) particles.splice(index, 1);
        });
    }
    
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Particles على النص
text.addEventListener("mousemove", (e) => createParticles(e.clientX, e.clientY, 10));
text.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    createParticles(touch.clientX, touch.clientY, 10);
});

// تكبير النص
text.addEventListener("mouseover", () => text.classList.add("active-touch"));
text.addEventListener("mouseout", () => text.classList.remove("active-touch"));
text.addEventListener("touchstart", (e) => {
    e.preventDefault();
    text.classList.add("active-touch");
});
text.addEventListener("touchend", () => text.classList.remove("active-touch"));

// ===== النجوم المتلألئة (محسّن) =====
const starsCanvas = document.getElementById("starsCanvas");
const sctx = starsCanvas.getContext("2d");
starsCanvas.width = window.innerWidth;
starsCanvas.height = window.innerHeight;

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
    for (let i = 0; i < 150; i++) { // تقليل العدد من 200 إلى 150
        starsArray.push(new Star());
    }
}

function createShootingStar() {
    if (Math.random() < 0.005 && !document.body.classList.contains("day-mode")) {
        shootingStars.push(new ShootingStar());
    }
}

function animateStars() {
    sctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    
    if (!document.body.classList.contains("day-mode") && !isAnimationsPaused) {
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

// ===== Resize =====
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        starsCanvas.width = window.innerWidth;
        starsCanvas.height = window.innerHeight;
        
        if (!document.body.classList.contains("day-mode")) {
            createStars();
        }
    }, 250);
});

// ===== تنظيف عند مغادرة الصفحة =====
window.addEventListener('beforeunload', () => {
    // حفظ إجمالي النقاط
    const totalScore = Storage.get('totalScore', 0) + score;
    Storage.set('totalScore', totalScore);
});

console.log('✨ الموقع جاهز! استمتع بالمغامرة 💙');
