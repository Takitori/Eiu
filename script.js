// Danh sách memories tĩnh, có thể chỉnh sửa nội dung và ngày tháng
// Danh sách memories dựa trên file thực tế trong assets/memories/
const memories = [
    { id: 1, type: 'image', src: 'assets/memories/IMG_2560.jpg', title: 'Lần đầu tụi mình chụp chung', date: '2024-12-30' },
    { id: 2, type: 'image', src: 'assets/memories/IMG_2564.jpg', title: 'Đi qua khách sạn của Winwin ở nènè', date: '2024-12-30' },
    { id: 3, type: 'image', src: 'assets/memories/IMG_2570.jpg', title: 'Đi xem chân núi Phú sĩ nè', date: '2024-12-3131' },
    { id: 4, type: 'image', src: 'assets/memories/IMG_3376.jpg', title: 'Lần thứ 3 anh xuống nè', date: '2025-03-09' },
    { id: 5, type: 'image', src: 'assets/memories/IMG_3378.jpg', title: 'Chà yêu công chúa của anh', date: '22025-03-09' },
    { id: 6, type: 'image', src: 'assets/memories/IMG_3387.jpg', title: 'Muốn ôm công chúa', date: '2025-03-09' },
    { id: 7, type: 'image', src: 'assets/memories/IMG_3405.jpg', title: 'Ảnh kỷ niệm của tụi mìnhmình', date: '2025-03-09' },
    { id: 8, type: 'image', src: 'assets/memories/IMG_3462.jpg', title: 'Bé nhớ anh không', date: '2025-03-09' },
    { id: 9, type: 'image', src: 'assets/memories/IMG_3817.jpg', title: 'Sinh nhật của anh', date: '2025-04-11' },
    { id: 10, type: 'image', src: 'assets/memories/IMG_2560.jpg', title: 'Ảnh kỷ niệm', date: '2025-03-09' }, // Tái sử dụng IMG_2560 để lấp đầy
    { id: 11, type: 'image', src: 'assets/memories/IMG_2564.jpg', title: 'Ảnh kỷ niệm', date: '2025-03-09' }, // Tái sử dụng IMG_2564
    { id: 12, type: 'image', src: 'assets/memories/IMG_2570.jpg', title: 'Anh nhớ công chúa của anh quá', date: '2025-03-09' } // Tái sử dụng IMG_2570
];

// DOM Elements
const bgImage = document.getElementById('bgImage'); // Changed from bgVideo
const overlay = document.getElementById('overlay');
const bgMusic = document.getElementById('bgMusic');
const imageToggle = document.getElementById('imageToggle'); // Changed from videoToggle
const musicToggleBtn = document.getElementById('musicToggleBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const reloadBtn = document.getElementById('reloadBtn');
const memoriesGrid = document.getElementById('memoriesGrid');
const memoryModal = document.getElementById('memoryModal');
const modalImage = document.getElementById('modalImage');
const modalVideo = document.getElementById('modalVideo');
const modalCaption = document.getElementById('modalCaption');
const closeModal = document.getElementById('closeModal');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const shuffleBtn = document.getElementById('shuffleBtn');
const loadingIndicator = document.getElementById('loading');
const yearElement = document.getElementById('year');

// State variables
let currentMemories = [...memories];
let filteredMemories = [...currentMemories];
let currentIndex = 0;
let isDarkMode = false;
let isImageVisible = true;
let isMusicPlaying = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    yearElement.textContent = new Date().getFullYear();
    loadMemories();
    
    imageToggle.addEventListener('click', toggleImage);
    musicToggleBtn.addEventListener('click', toggleMusic);
    themeToggleBtn.addEventListener('click', toggleTheme);
    reloadBtn.addEventListener('click', () => location.reload());
    closeModal.addEventListener('click', closeMemoryModal);
    prevBtn.addEventListener('click', showPrevMemory);
    nextBtn.addEventListener('click', showNextMemory);
    shuffleBtn.addEventListener('click', shuffleMemories);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active', 'bg-pink-500'));
            btn.classList.add('active', 'bg-pink-500');
            filterMemories(btn.dataset.filter);
        });
    });
    
    setupScrollAnimations();
    
    bgMusic.volume = 0.3;
    try {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateMusicButton();
        }).catch(e => {
            isMusicPlaying = false;
            updateMusicButton();
        });
    } catch (e) {
        isMusicPlaying = false;
        updateMusicButton();
    }
    
    checkTimeForTheme();
    
    setTimeout(() => {
        loadingIndicator.classList.add('hidden');
    }, 1500);

    // Kiểm tra lỗi tải ảnh nền
    bgImage.onerror = () => console.error('Lỗi tải ảnh nền: background.gif không tìm thấy');
});

// Functions
function updateMusicButton() {
    if (isMusicPlaying) {
        musicToggleBtn.innerHTML = '<i class="fas fa-volume-up text-white"></i>';
        musicToggleBtn.classList.add('active');
    } else {
        musicToggleBtn.innerHTML = '<i class="fas fa-volume-mute text-white"></i>';
        musicToggleBtn.classList.remove('active');
    }
}

function updateThemeButton() {
    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun text-white"></i>';
        themeToggleBtn.classList.add('active');
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon text-white"></i>';
        themeToggleBtn.classList.remove('active');
    }
}

function updateImageButton() {
    if (isImageVisible) {
        imageToggle.innerHTML = '<i class="fas fa-image text-white"></i>';
    } else {
        imageToggle.innerHTML = '<i class="fas fa-eye-slash text-white"></i>';
    }
}

function loadMemories() {
    memoriesGrid.innerHTML = '';
    filteredMemories.forEach((memory, index) => {
        const memoryItem = document.createElement('div');
        memoryItem.className = 'memory-item animate-scroll bg-white bg-opacity-10 backdrop-blur-sm';
        memoryItem.dataset.index = index;
        
        if (memory.type === 'image') {
            memoryItem.innerHTML = `
                <div class="relative">
                    <img src="${memory.src}" alt="${memory.title}" class="w-full h-64 object-cover rounded">
                    <div class="p-4">
                        <p class="text-white font-medium">${memory.title}</p>
                        <p class="text-white text-opacity-70 text-sm mt-1">${memory.date}</p>
                    </div>
                </div>
            `;
            const img = memoryItem.querySelector('img');
            img.onerror = () => console.error(`Lỗi tải ảnh: ${memory.src}`);
        } else if (memory.type === 'video') {
            memoryItem.innerHTML = `
                <div class="relative">
                    <div class="video-thumbnail w-full h-64">
                        <img src="${memory.thumbnail}" alt="Ảnh đại diện video" class="w-full h-full object-cover rounded">
                        <div class="play-button">
                            <i class="fas fa-play text-gray-800 text-xl"></i>
                        </div>
                    </div>
                    <div class="p-4">
                        <p class="text-white font-medium">${memory.title}</p>
                        <p class="text-white text-opacity-70 text-sm mt-1">${memory.date}</p>
                    </div>
                </div>
            `;
        }
        
        memoryItem.addEventListener('click', () => openMemoryModal(memory, index));
        memoriesGrid.appendChild(memoryItem);
    });
    
    setTimeout(() => {
        const items = document.querySelectorAll('.animate-scroll');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('active');
            }, index * 100);
        });
    }, 100);
}

function filterMemories(filter) {
    if (filter === 'all') {
        filteredMemories = [...currentMemories];
    } else {
        filteredMemories = currentMemories.filter(m => m.type === filter);
    }
    loadMemories();
}

function shuffleMemories() {
    filteredMemories = [...currentMemories].sort(() => Math.random() - 0.5);
    loadMemories();
}

function openMemoryModal(memory, index) {
    currentIndex = index;
    
    if (memory.type === 'image') {
        modalImage.src = memory.src;
        modalImage.classList.remove('hidden');
        modalVideo.classList.add('hidden');
        modalVideo.pause();
    } else if (memory.type === 'video') {
        modalVideo.src = memory.src;
        modalVideo.classList.remove('hidden');
        modalImage.classList.add('hidden');
        modalVideo.play();
    }
    
    modalCaption.textContent = `${memory.title} - ${memory.date}`;
    memoryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMemoryModal() {
    memoryModal.classList.add('hidden');
    modalVideo.pause();
    document.body.style.overflow = 'auto';
}

function showPrevMemory() {
    if (filteredMemories.length === 0) return;
    
    currentIndex = (currentIndex - 1 + filteredMemories.length) % filteredMemories.length;
    const memory = filteredMemories[currentIndex];
    
    if (memory.type === 'image') {
        modalImage.src = memory.src;
        modalImage.classList.remove('hidden');
        modalVideo.classList.add('hidden');
        modalVideo.pause();
    } else {
        modalVideo.src = memory.src;
        modalVideo.classList.remove('hidden');
        modalImage.classList.add('hidden');
        modalVideo.play();
    }
    
    modalCaption.textContent = `${memory.title} - ${memory.date}`;
}

function showNextMemory() {
    if (filteredMemories.length === 0) return;
    
    currentIndex = (currentIndex + 1) % filteredMemories.length;
    const memory = filteredMemories[currentIndex];
    
    if (memory.type === 'image') {
        modalImage.src = memory.src;
        modalImage.classList.remove('hidden');
        modalVideo.classList.add('hidden');
        modalVideo.pause();
    } else {
        modalVideo.src = memory.src;
        modalVideo.classList.remove('hidden');
        modalImage.classList.add('hidden');
        modalVideo.play();
    }
    
    modalCaption.textContent = `${memory.title} - ${memory.date}`;
}

function toggleImage() {
    if (isImageVisible) {
        bgImage.style.display = 'none';
        isImageVisible = false;
    } else {
        bgImage.style.display = 'block';
        isImageVisible = true;
    }
    updateImageButton();
}

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => {
            alert('Vui lòng nhấp vào trang trước để bật nhạc');
        });
        isMusicPlaying = true;
    } else {
        bgMusic.pause();
        isMusicPlaying = false;
    }
    updateMusicButton();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('bg-gray-900');
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        bgImage.style.filter = 'brightness(0.5) blur(2px)';
    } else {
        document.body.classList.remove('bg-gray-900');
        overlay.style.background = 'rgba(0, 0, 0, 0.2)';
        bgImage.style.filter = 'brightness(0.7) blur(1px)';
    }
    
    updateThemeButton();
}

function checkTimeForTheme() {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
        isDarkMode = true;
        document.body.classList.add('bg-gray-900');
        overlay.style.background = 'rgba(0, 0, 0, 0.7)';
        bgImage.style.filter = 'brightness(0.5) blur(2px)';
        updateThemeButton();
    }
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-scroll').forEach(el => {
        observer.observe(el);
    });
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgMusic.pause();
    } else if (isMusicPlaying) {
        bgMusic.play().catch(e => console.log('Không thể phát nhạc'));
    }
});

document.addEventListener('click', () => {
    if (!isMusicPlaying) return;
    
    try {
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateMusicButton();
        });
    } catch (e) {
        console.log('Lỗi phát nhạc:', e);
    }
}, { once: true });
