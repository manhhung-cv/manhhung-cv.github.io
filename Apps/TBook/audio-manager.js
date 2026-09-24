/**
 * iOS Audio Session Keeper & MediaSession Controller
 * Giải quyết triệt để lỗi Safari freeze JavaScript khi tắt màn hình
 */
export class IOSAudioManager {
  constructor() {
    this.audioElement = document.getElementById('main-voice-player');
    this.keeperElement = document.getElementById('ios-background-audio-keeper');
    this.audioCtx = null;
    this.isSessionStarted = false;
    this.initSilentWav();
  }

  // Tạo base64 của một đoạn âm thanh im lặng (silent WAV 1 giây, loop liên tục)
  initSilentWav() {
    // 1-second silent WAV base64
    const silentBase64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    if (this.keeperElement) {
      this.keeperElement.src = silentBase64;
    }
  }

  // Khởi động session âm thanh ngay sau cử chỉ bấm (User Gesture) đầu tiên của người dùng
  unlockAudioSession() {
    if (this.isSessionStarted) return;

    try {
      // 1. Kích hoạt audio keeper loop
      if (this.keeperElement) {
        this.keeperElement.volume = 0.01;
        this.keeperElement.play().catch(() => {});
      }

      // 2. Kích hoạt Web Audio Context (Secondary guard)
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        gain.gain.value = 0.001; // Âm lượng cực nhỏ không gây ồn nhưng giữ WebKit thread thức
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
      }

      this.isSessionStarted = true;
    } catch (e) {
      console.warn("Không thể kích hoạt AudioSession nền:", e);
    }
  }

  // Cập nhật giao diện Lockscreen & Control Center trên iOS
  updateMediaSession(bookTitle, chapterTitle, isPlaying = true) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: chapterTitle || "Chương truyện",
      artist: bookTitle || "Truyện Voice",
      album: "Truyện Voice Reader",
      artwork: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-192.png', sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }

  // Đăng ký các nút bấm trên màn hình khóa iPhone
  bindMediaSessionActions({ onPlay, onPause, onNext, onPrev, onNextChap, onPrevChap }) {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', onPlay);
      navigator.mediaSession.setActionHandler('pause', onPause);
      navigator.mediaSession.setActionHandler('nexttrack', onNext || onNextChap);
      navigator.mediaSession.setActionHandler('previoustrack', onPrev || onPrevChap);
    } catch (err) {
      console.warn("MediaSession handler error:", err);
    }
  }
}