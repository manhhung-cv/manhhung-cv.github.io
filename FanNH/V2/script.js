// Cấu hình Supabase (Cần thay thế bằng key thật của bạn)
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// YouTube API Setup
let ytPlayer;
function onYouTubeIframeAPIReady() {
    window.dispatchEvent(new CustomEvent('yt-api-ready'));
}

document.addEventListener('alpine:init', () => {
    Alpine.data('audioApp', () => ({
        // App State
        theme: localStorage.getItem('theme') || 'oled',
        page: 'home',
        searchQuery: '',
        
        // Data State
        exploreTags: [
            { id: 1, name: 'Nghịch tập', icon: '🔥' },
            { id: 2, name: 'Hệ thống', icon: '🧠' },
            { id: 3, name: 'Cẩu đạo', icon: '🐢' },
            { id: 4, name: 'Hài hước', icon: '😂' }
        ],
        listeningHistory: [],
        recommendedStories: [],

        // Player State
        player: {
            isFull: false,
            currentChapter: null,
            youtubeId: null,
            storyTitle: '',
            chapterTitle: '',
            storyCover: '',
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            speed: 1,
            sleepTimerActive: false,
            queue: []
        },

        init() {
            this.applyTheme();
            this.loadInitialData();
            this.initYouTubeAPI();

            // Tracking progress định kỳ
            setInterval(() => {
                if (this.player.isPlaying && ytPlayer && ytPlayer.getCurrentTime) {
                    this.player.currentTime = Math.floor(ytPlayer.getCurrentTime());
                    this.player.duration = Math.floor(ytPlayer.getDuration());
                    this.saveProgressDebounced();
                }
            }, 1000);
        },

        // --- THEME & UI ---
        toggleTheme() {
            const themes = ['light', 'dark', 'oled'];
            let currentIndex = themes.indexOf(this.theme);
            this.theme = themes[(currentIndex + 1) % themes.length];
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
        },
        applyTheme() {
            document.documentElement.classList.remove('light', 'dark', 'oled');
            document.documentElement.classList.add(this.theme);
        },
        navigate(view) {
            this.page = view;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        // --- DATA FETCHING (Supabase) ---
        async loadInitialData() {
            // Skeleton mô phỏng
            this.recommendedStories = Array(10).fill({
                id: 'loading',
                title: 'Đang tải...',
                cover_url: 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', // placeholder xám
                rating: 0
            });

            // Fetch thực tế từ DB
            const { data: stories } = await supabase
                .from('stories')
                .select('id, title, cover_url, rating, authors(name)')
                .order('created_at', { ascending: false })
                .limit(10);
                
            if(stories) {
                this.recommendedStories = stories.map(s => ({
                    ...s, author_name: s.authors?.name
                }));
            }
            
            // Tạm mock history để show UI Tiếp tục nghe
            this.listeningHistory = [{
                storyId: '123',
                title: 'Đại Phụng Đả Canh Nhân',
                currentChapterTitle: 'Chương 142: Sát cơ ẩn giấu',
                cover: 'https://images.unsplash.com/photo-1614314169000-4cf229a1490b?q=80&w=200&auto=format&fit=crop',
                progressPercent: 65,
                youtubeId: 'dQw4w9WgXcQ' // Thay bằng ID thực
            }];
        },

        // --- AUDIO PLAYER (YouTube API Ẩn) ---
        initYouTubeAPI() {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.addEventListener('yt-api-ready', () => {
                ytPlayer = new YT.Player('youtube-player-container', {
                    height: '0', width: '0',
                    playerVars: { 'autoplay': 0, 'controls': 0, 'playsinline': 1 },
                    events: {
                        'onStateChange': this.onPlayerStateChange.bind(this),
                        'onError': this.onPlayerError.bind(this)
                    }
                });
            });
        },

        playChapter(historyItem) {
            this.player.currentChapter = historyItem.storyId;
            this.player.youtubeId = historyItem.youtubeId;
            this.player.storyTitle = historyItem.title;
            this.player.chapterTitle = historyItem.currentChapterTitle;
            this.player.storyCover = historyItem.cover;
            
            if (ytPlayer && ytPlayer.loadVideoById) {
                // Tải audio ẩn và tự động phát
                ytPlayer.loadVideoById(this.player.youtubeId);
                this.player.isPlaying = true;
            }
        },

        togglePlay() {
            if (!ytPlayer) return;
            if (this.player.isPlaying) {
                ytPlayer.pauseVideo();
            } else {
                ytPlayer.playVideo();
            }
            this.player.isPlaying = !this.player.isPlaying;
        },

        seekAudio(seconds) {
            if(ytPlayer && ytPlayer.seekTo) ytPlayer.seekTo(seconds, true);
        },

        cycleSpeed() {
            const speeds = [0.75, 1, 1.25, 1.5, 2];
            let idx = speeds.indexOf(this.player.speed);
            this.player.speed = speeds[(idx + 1) % speeds.length];
            if(ytPlayer && ytPlayer.setPlaybackRate) ytPlayer.setPlaybackRate(this.player.speed);
        },

        onPlayerStateChange(event) {
            // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
            if (event.data === 0) {
                this.playerNext(); // Autoplay next
            }
            this.player.isPlaying = (event.data === 1);
        },

        onPlayerError(event) {
            console.error("YouTube Error", event.data);
            alert("Nguồn audio bị lỗi hoặc đã bị xóa. Đang chuyển nguồn dự phòng...");
            // Logic đổi nguồn fallback ở đây
        },

        openFullPlayer() { this.player.isFull = true; },
        
        // --- UTILS ---
        formatTime(seconds) {
            if(isNaN(seconds)) return "00:00";
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = Math.floor(seconds % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        },

        saveProgressDebounced() {
            // Gọi Supabase để update progress_seconds
            // Dùng debounce thủ công hoặc logic time gap (chỉ gọi DB mỗi 10s để giảm load)
            if (this.player.currentTime % 10 === 0) {
                // supabase.from('listening_history').upsert(...)
            }
        },

        // Picture In Picture API cho thẻ <video> của YouTube (Hack via iframe dom, cần config thêm)
        // Hiện tại trình duyệt support PiP tốt nhất cho native <video> tag. 
        // Với YT Iframe, ta dùng giao diện Mini Player nổi (như đã code HTML) thay thế PiP native.
    }));
});