const CONFIG = {
  API_ENDPOINT: "https://be-api-service.vercel.app/api/tts",
  APP_KEY: "TTS-Hunq",
  CHUNK_MAX_CHARS: 170,
  BATCH_BLOCK_CHARS: 2000,
  WORKER_CONCURRENCY: 2
};

// Vô hiệu hóa khôi phục cuộn tự động của Safari WebKit
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const db = new Dexie('TruyenVoiceDB_TBZ');
db.version(1).stores({
  books: '++id, title, author, totalChapters, rawBlob, rawExt, lastReadChapterIndex, lastReadChunkIndex, updatedAt',
  chapters: '++id, bookId, chapterIndex, title, content, chunks',
  audio_offline: '++id, bookId, chapterIndex, voice, audioBlob, size, timestamps',
  custom_fonts: '++id, name, family, cssContent'
});

const State = {
  currentBook: null,
  chapters: [],
  currentChapter: null,
  currentChapterIndex: 0,
  currentChunkIndex: 0,
  isPlaying: false,
  isOfflinePlay: false,
  isReadingOnly: false,
  isZenMode: false,
  offlineTimestamps: [],
  playbackSpeed: 1.0,
  readMode: 'flip',
  currentPageIndex: 0,
  pages: [],
  infiniteLoadedChapters: new Set(),
  isInfiniteFetching: false,
  isFlipping: false,
  settings: {
    theme: 'theme-sepia',
    font: 'font-lora',
    fontSize: 18,
    voice: 'vi-VN-HoaiMyNeural',
    audioQuality: '128k',
    autoBuffer: true,
    bufferCount: 5
  },
  onlineMemCache: new Map(),
  downloader: {
    queue: [],
    isPaused: false,
    aborted: false,
    totalTasks: 0,
    completedTasks: 0,
    controller: null
  }
};

// ==========================================
// 1. MODULE GIỮ TIẾN TRÌNH ÂM THANH NỀN TRÊN IOS 16
// ==========================================
const IOSBackgroundKeeper = {
  audioEl: null,
  audioCtx: null,
  isActivated: false,

  init() {
    if (!this.audioEl) {
      this.audioEl = document.createElement('audio');
      this.audioEl.id = 'ios-background-audio-keeper';
      this.audioEl.setAttribute('playsinline', '');
      this.audioEl.setAttribute('webkit-playsinline', '');
      this.audioEl.loop = true;
      // Đoạn mã WAV im lặng 1 giây chuẩn base64
      this.audioEl.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      this.audioEl.style.display = 'none';
      document.body.appendChild(this.audioEl);
    }
  },

  unlock() {
    if (this.isActivated) return;
    this.init();
    try {
      this.audioEl.volume = 0.005;
      this.audioEl.play().catch(() => {});

      // Kích hoạt thêm Web Audio Context để ngăn Safari đóng băng JS Thread
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        gain.gain.value = 0.0001; // Không nghe thấy nhưng audio stream luôn active
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
      }
      this.isActivated = true;
    } catch (e) {
      console.warn('Không thể bật âm thanh nền:', e);
    }
  }
};

const AudioEngine = {
  playerA: new Audio(),
  playerB: new Audio(),
  offlinePlayer: new Audio(),
  activeSlot: 'A',
  currentAbortCtrl: null,
  offlineObjectUrl: null,

  init() {
    // Khởi tạo thẻ audio cho iOS
    [this.playerA, this.playerB, this.offlinePlayer].forEach(p => {
      p.preload = 'auto';
      p.setAttribute('playsinline', '');
      p.setAttribute('webkit-playsinline', '');
    });

    const onTimeUpdate = (e) => {
      if (e.target.duration && !isNaN(e.target.duration)) {
        const pct = (e.target.currentTime / e.target.duration) * 100;
        const progressActive = document.getElementById('progress-active');
        const currentTimeEl = document.getElementById('player-current-time');
        if (progressActive) progressActive.style.width = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(e.target.currentTime);
      }
    };

    this.playerA.ontimeupdate = onTimeUpdate;
    this.playerB.ontimeupdate = onTimeUpdate;

    this.offlinePlayer.ontimeupdate = (e) => {
      onTimeUpdate(e);
      const currentTime = e.target.currentTime;
      if (State.offlineTimestamps && State.offlineTimestamps.length > 0) {
        const foundIdx = State.offlineTimestamps.findIndex(
          t => currentTime >= t.start && currentTime < t.end
        );
        if (foundIdx !== -1 && foundIdx !== State.currentChunkIndex) {
          State.currentChunkIndex = foundIdx;
          ActionController.highlightActiveSentence();
          ActionController.syncSentenceToView(foundIdx);
          BookManager.persistReadingProgress();
        }
      }
    };

    this.playerA.onended = () => this.handleTrackEnded('A');
    this.playerB.onended = () => this.handleTrackEnded('B');
    this.offlinePlayer.onended = () => {
      if (State.currentChapterIndex < State.chapters.length - 1) {
        ActionController.loadChapterByIndex(State.currentChapterIndex + 1, true);
      } else {
        ActionController.pause();
        showToast('Đã đọc xong cuốn sách');
      }
    };

    const errorHandler = (e) => {
      console.warn('Audio tag event handled:', e);
      // Tự động bỏ qua lỗi để phát tiếp khi chạy ngầm trên iOS
      if (State.isPlaying && !State.isReadingOnly) {
        setTimeout(() => ActionController.stepSentence(1, true), 800);
      }
    };
    this.playerA.onerror = errorHandler;
    this.playerB.onerror = errorHandler;
    this.offlinePlayer.onerror = errorHandler;
  },

  getActivePlayer() {
    return State.isOfflinePlay ? this.offlinePlayer : (this.activeSlot === 'A' ? this.playerA : this.playerB);
  },

  getStandbyPlayer() {
    return this.activeSlot === 'A' ? this.playerB : this.playerA;
  },

  swapSlot() {
    this.activeSlot = this.activeSlot === 'A' ? 'B' : 'A';
  },

  applySpeed(speed) {
    this.playerA.playbackRate = speed;
    this.playerB.playbackRate = speed;
    this.offlinePlayer.playbackRate = speed;
  },

  handleTrackEnded(slot) {
    if (slot !== this.activeSlot) return;
    ActionController.stepSentence(1, true);
  },

  stopAll() {
    this.playerA.pause();
    this.playerB.pause();
    this.offlinePlayer.pause();
    this.playerA.removeAttribute('src');
    this.playerB.removeAttribute('src');
    this.offlinePlayer.removeAttribute('src');
    this.playerA.load();
    this.playerB.load();
    this.offlinePlayer.load();

    if (this.offlineObjectUrl) {
      URL.revokeObjectURL(this.offlineObjectUrl);
      this.offlineObjectUrl = null;
    }
  }
};

function updateMediaSessionMetadata(title, chapterName) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: chapterName || 'Chương',
      artist: title || 'Truyện Voice',
      album: 'Truyện Voice Offline',
      artwork: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png' }
      ]
    });

    navigator.mediaSession.playbackState = State.isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => ActionController.resume());
    navigator.mediaSession.setActionHandler('pause', () => ActionController.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => ActionController.stepSentence(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => ActionController.stepSentence(1));
  }
}

function fastHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `${Math.abs(hash)}`;
}

function parseTextToParagraphsAndChunks(rawText) {
  if (!rawText) return { paragraphs: [], allChunks: [] };
  const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const rawParas = clean.split(/\n+/);
  const paragraphs = [];
  const allChunks = [];

  rawParas.forEach(pText => {
    const p = pText.trim();
    if (!p) return;

    const regex = /([^.!?…]+[.!?…]+|[^.!?…]+$)/g;
    let match;
    const sentences = [];

    while ((match = regex.exec(p)) !== null) {
      let s = match[0].trim();
      if (!s) continue;

      while (s.length > CONFIG.CHUNK_MAX_CHARS) {
        let splitIdx = s.lastIndexOf(',', CONFIG.CHUNK_MAX_CHARS);
        if (splitIdx < 40) splitIdx = s.lastIndexOf(' ', CONFIG.CHUNK_MAX_CHARS);
        if (splitIdx < 40) splitIdx = CONFIG.CHUNK_MAX_CHARS;

        sentences.push(s.substring(0, splitIdx).trim());
        s = s.substring(splitIdx).trim();
      }
      if (s.length > 0) sentences.push(s);
    }

    if (sentences.length > 0) {
      paragraphs.push(sentences);
      allChunks.push(...sentences);
    }
  });

  return { paragraphs, allChunks };
}

function createBatchBlocks(chunks) {
  const blocks = [];
  let curBlock = [];
  let curLen = 0;

  chunks.forEach(s => {
    if (curLen + s.length > CONFIG.BATCH_BLOCK_CHARS && curBlock.length > 0) {
      blocks.push(curBlock.join(' '));
      curBlock = [];
      curLen = 0;
    }
    curBlock.push(s);
    curLen += s.length;
  });

  if (curBlock.length > 0) blocks.push(curBlock.join(' '));
  return blocks;
}

const BatchDownloadEngine = {
  async downloadChapter(bookId, chapterIndex, signal, onBlockDownloaded) {
    const bId = Number(bookId);
    const cIdx = Number(chapterIndex);

    const chapter = await db.chapters.where({ bookId: bId, chapterIndex: cIdx }).first();
    if (!chapter || !chapter.chunks || chapter.chunks.length === 0) return null;

    const blocks = createBatchBlocks(chapter.chunks);
    const audioParts = [];

    for (let i = 0; i < blocks.length; i++) {
      if (signal?.aborted) throw new Error('ABORTED');

      const blockText = blocks[i];
      const res = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': CONFIG.APP_KEY
        },
        body: JSON.stringify({
          text: blockText,
          voice: State.settings.voice,
          rate: '0%',
          pitch: '0Hz',
          volume: '0%',
          quality: State.settings.audioQuality || '128k'
        }),
        signal
      });

      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const buffer = await res.arrayBuffer();
      audioParts.push(buffer);

      if (typeof onBlockDownloaded === 'function') {
        onBlockDownloaded(i + 1, blocks.length, buffer.byteLength);
      }
    }

    const chapterBlob = new Blob(audioParts, { type: 'audio/mpeg' });

    const totalChars = chapter.chunks.reduce((acc, c) => acc + c.length, 0);
    const estimatedTotalDuration = Math.max(1, totalChars / 5.5);

    let accumulatedTime = 0;
    const timestamps = chapter.chunks.map(chunk => {
      const duration = (chunk.length / totalChars) * estimatedTotalDuration;
      const start = accumulatedTime;
      accumulatedTime += duration;
      return {
        start: Number(start.toFixed(2)),
        end: Number(accumulatedTime.toFixed(2))
      };
    });

    await db.audio_offline.where({
      bookId: bId,
      chapterIndex: cIdx,
      voice: State.settings.voice
    }).delete();

    await db.audio_offline.add({
      bookId: bId,
      chapterIndex: cIdx,
      voice: State.settings.voice,
      audioBlob: chapterBlob,
      size: chapterBlob.size,
      timestamps
    });

    return chapterBlob;
  }
};

const DownloadManager = {
  stats: {
    startTime: 0,
    downloadedBytes: 0,
    lastBytes: 0,
    lastTime: 0,
    timerInterval: null
  },

  async queueChapters(chapIndices, isSilent = false) {
    if (!State.currentBook || !State.chapters.length) return;

    const bId = Number(State.currentBook.id);
    const needed = [];
    for (const idx of chapIndices) {
      const cIdx = Number(idx);
      const exists = await db.audio_offline.where({
        bookId: bId,
        chapterIndex: cIdx,
        voice: State.settings.voice
      }).first();
      if (!exists && !State.downloader.queue.includes(cIdx)) {
        needed.push(cIdx);
      }
    }

    if (needed.length === 0) return;

    State.downloader.queue.push(...needed);
    State.downloader.totalTasks += needed.length;
    State.downloader.aborted = false;
    State.downloader.isPaused = false;
    if (!State.downloader.controller) State.downloader.controller = new AbortController();

    this.stats.startTime = Date.now();
    this.stats.downloadedBytes = 0;
    this.stats.lastBytes = 0;
    this.stats.lastTime = Date.now();

    if (!isSilent) this.showDownloadBanner();
    this.startMetricsTimer();
    this.runWorkerPool();
  },

  startMetricsTimer() {
    if (this.stats.timerInterval) clearInterval(this.stats.timerInterval);
    this.stats.timerInterval = setInterval(() => {
      if (State.downloader.isPaused || State.downloader.aborted) return;
      this.updateSpeedAndETA();
    }, 1000);
  },

  stopMetricsTimer() {
    if (this.stats.timerInterval) {
      clearInterval(this.stats.timerInterval);
      this.stats.timerInterval = null;
    }
  },

  updateSpeedAndETA() {
    const now = Date.now();
    const timeDelta = (now - this.stats.lastTime) / 1000;
    if (timeDelta <= 0) return;

    const bytesDelta = this.stats.downloadedBytes - this.stats.lastBytes;
    const currentSpeed = bytesDelta / timeDelta;

    this.stats.lastBytes = this.stats.downloadedBytes;
    this.stats.lastTime = now;

    const speedEl = document.getElementById('dl-speed');
    if (speedEl) {
      speedEl.textContent = currentSpeed > 1024 * 1024 
        ? `${(currentSpeed / (1024 * 1024)).toFixed(1)} MB/s`
        : `${Math.round(currentSpeed / 1024)} KB/s`;
    }

    const sizeEl = document.getElementById('dl-downloaded-size');
    if (sizeEl) {
      sizeEl.textContent = `${(this.stats.downloadedBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    const completed = State.downloader.completedTasks;
    const total = State.downloader.totalTasks;
    const remaining = total - completed;
    const etaEl = document.getElementById('dl-eta');

    if (etaEl) {
      if (completed > 0) {
        const elapsedTime = (now - this.stats.startTime) / 1000;
        const avgTimePerChap = elapsedTime / completed;
        const remainingSeconds = Math.round(remaining * avgTimePerChap);

        if (remainingSeconds <= 0) {
          etaEl.textContent = 'Gần xong';
        } else {
          const m = Math.floor(remainingSeconds / 60);
          const s = remainingSeconds % 60;
          etaEl.textContent = `~${m > 0 ? `${m}p ` : ''}${s}s`;
        }
      } else {
        etaEl.textContent = 'Đang tính...';
      }
    }
  },

  async runWorkerPool() {
    const maxWorkers = CONFIG.WORKER_CONCURRENCY;

    const worker = async () => {
      while (!State.downloader.aborted && State.downloader.queue.length > 0) {
        if (State.downloader.isPaused) {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }

        const chapIdx = State.downloader.queue.shift();
        const targetChap = State.chapters[chapIdx];

        if (targetChap) {
          try {
            const chunkDetail = document.getElementById('dl-chunk-detail');
            if (chunkDetail) chunkDetail.textContent = targetChap.title;

            await BatchDownloadEngine.downloadChapter(
              State.currentBook.id,
              targetChap.chapterIndex,
              State.downloader.controller.signal,
              (currentBlock, totalBlocks, blockBytes) => {
                this.stats.downloadedBytes += blockBytes;
                const blockCount = document.getElementById('dl-block-count');
                if (blockCount) blockCount.textContent = `${currentBlock}/${totalBlocks}`;
              }
            );

            State.downloader.completedTasks++;
            this.updateProgressUI();
            updateOfflineCheckBadges();
            ActionController.checkOfflineStatus();
          } catch (err) {
            if (err.message === 'ABORTED') break;
            console.error(err);
          }
        }
      }
    };

    const activePromises = [];
    for (let i = 0; i < maxWorkers; i++) activePromises.push(worker());
    await Promise.all(activePromises);

    if (State.downloader.queue.length === 0 && !State.downloader.aborted) {
      this.completeDownload();
    }
  },

  showDownloadBanner() {
    document.getElementById('dl-mini-pill')?.classList.add('hidden');
    document.getElementById('global-download-banner')?.classList.remove('hidden');
    this.updateProgressUI();
  },

  minimizeToPill() {
    document.getElementById('global-download-banner')?.classList.add('hidden');
    document.getElementById('dl-mini-pill')?.classList.remove('hidden');
  },

  expandFromPill() {
    document.getElementById('dl-mini-pill')?.classList.add('hidden');
    document.getElementById('global-download-banner')?.classList.remove('hidden');
  },

  updateProgressUI() {
    const d = State.downloader;
    const pct = d.totalTasks > 0 ? Math.round((d.completedTasks / d.totalTasks) * 100) : 0;

    const progressBar = document.getElementById('dl-progress-bar');
    const progressChap = document.getElementById('dl-progress-chap');
    const pctText = document.getElementById('dl-pct-text');
    const miniPct = document.getElementById('dl-mini-pct');

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressChap) progressChap.textContent = `${d.completedTasks}/${d.totalTasks}`;
    if (pctText) pctText.textContent = `${pct}%`;
    if (miniPct) miniPct.textContent = `${pct}%`;
  },

  completeDownload() {
    this.stopMetricsTimer();
    const title = document.getElementById('dl-status-title');
    const icon = document.getElementById('dl-status-icon');
    const eta = document.getElementById('dl-eta');

    if (title) title.textContent = 'Đã hoàn tất';
    if (icon) icon.className = 'fa-solid fa-check text-xs';
    if (eta) eta.textContent = 'Xong';

    setTimeout(() => {
      document.getElementById('global-download-banner')?.classList.add('hidden');
      document.getElementById('dl-mini-pill')?.classList.add('hidden');
      State.downloader.totalTasks = 0;
      State.downloader.completedTasks = 0;
      State.downloader.controller = null;
    }, 2500);

    updateOfflineCheckBadges();
    updateStorageStats();
    ActionController.checkOfflineStatus();
  },

  pause() {
    State.downloader.isPaused = true;
    const title = document.getElementById('dl-status-title');
    const icon = document.getElementById('dl-status-icon');
    if (title) title.textContent = 'Đã tạm dừng';
    if (icon) icon.className = 'fa-solid fa-pause text-xs';
  },

  resume() {
    State.downloader.isPaused = false;
    const title = document.getElementById('dl-status-title');
    const icon = document.getElementById('dl-status-icon');
    if (title) title.textContent = 'Đang tải audio...';
    if (icon) icon.className = 'fa-solid fa-spinner fa-spin text-xs';
  },

  abort() {
    this.stopMetricsTimer();
    State.downloader.aborted = true;
    State.downloader.queue = [];
    State.downloader.totalTasks = 0;
    State.downloader.completedTasks = 0;
    if (State.downloader.controller) State.downloader.controller.abort();
    State.downloader.controller = null;
    document.getElementById('global-download-banner')?.classList.add('hidden');
    document.getElementById('dl-mini-pill')?.classList.add('hidden');
    showToast('Đã dừng tải');
  }
};

async function triggerRollingBuffer(currentIdx) {
  if (!State.settings.autoBuffer || !State.chapters.length) return;
  const bufferLimit = Math.min(currentIdx + State.settings.bufferCount + 1, State.chapters.length);
  const targetIndices = [];

  for (let i = currentIdx + 1; i < bufferLimit; i++) targetIndices.push(i);

  if (targetIndices.length > 0) {
    DownloadManager.queueChapters(targetIndices, true);
  }
}

const ExportEngine = {
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },

  async exportFullTBZ() {
    if (!State.currentBook) return showToast('Chưa chọn sách để xuất');

    const bId = Number(State.currentBook.id);
    const offlines = await db.audio_offline.where({
      bookId: bId,
      voice: State.settings.voice
    }).toArray();

    showToast('Đang đóng gói file .TBZ...');

    const zip = new JSZip();
    const bookRawBlob = State.currentBook.rawBlob;
    const bookRawExt = State.currentBook.rawExt || 'txt';
    if (bookRawBlob) zip.file(`book.${bookRawExt}`, bookRawBlob);

    const metadata = {
      title: State.currentBook.title,
      author: State.currentBook.author,
      totalChapters: State.chapters.length,
      voice: State.settings.voice,
      rawExt: bookRawExt,
      chapters: State.chapters.map(c => ({
        chapterIndex: Number(c.chapterIndex),
        title: c.title,
        content: c.content,
        chunks: c.chunks
      })),
      offlineMetadata: offlines.map(o => ({
        chapterIndex: Number(o.chapterIndex),
        timestamps: o.timestamps,
        size: o.size
      }))
    };
    zip.file('metadata.json', JSON.stringify(metadata));

    if (offlines.length > 0) {
      const audioFolder = zip.folder('audios');
      offlines.forEach(item => {
        audioFolder.file(`chapter_${item.chapterIndex}.mp3`, item.audioBlob);
      });
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const safeTitle = State.currentBook.title.replace(/[\\/:*?"<>|]/g, '_');
    this.downloadBlob(zipBlob, `${safeTitle}.tbz`);
    showToast('Đã xuất file .TBZ thành công!');
  }
};

const FontManager = {
  async extractAndImportFont(inputUrl) {
    if (!inputUrl) return showToast('Vui lòng nhập link Google Fonts');
    showToast('Đang nạp phông chữ...');

    try {
      let fontName = '';
      if (inputUrl.includes('specimen/')) {
        const parts = inputUrl.split('specimen/')[1].split('?')[0].replace(/\+/g, ' ');
        fontName = decodeURIComponent(parts);
      } else if (inputUrl.includes('family=')) {
        const parts = inputUrl.split('family=')[1].split('&')[0].split(':')[0].replace(/\+/g, ' ');
        fontName = decodeURIComponent(parts);
      } else {
        fontName = inputUrl.trim();
      }

      if (!fontName) throw new Error('Không nhận diện được tên phông');

      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName).replace(/%20/g, '+')}:wght@400;600;700&display=swap`;
      const res = await fetch(cssUrl);
      if (!res.ok) throw new Error('Không thể tải CSS');
      const cssText = await res.text();

      const familyClass = `custom-font-${Date.now()}`;
      const finalCss = `${cssText}\n.${familyClass} { font-family: "${fontName}", sans-serif !important; }`;

      await db.custom_fonts.add({
        name: fontName,
        family: familyClass,
        cssContent: finalCss
      });

      await this.loadAllCustomFonts();
      this.applyCustomFont(familyClass);
      showToast(`Đã lưu font ${fontName}!`);
    } catch (e) {
      console.error(e);
      showToast(`Lỗi: ${e.message}`);
    }
  },

  async loadAllCustomFonts() {
    const fonts = await db.custom_fonts.toArray();
    const styleSheet = document.getElementById('custom-font-style-sheet');
    if (styleSheet) styleSheet.textContent = fonts.map(f => f.cssContent).join('\n');

    const deck = document.getElementById('font-options-deck');
    if (!deck) return;
    deck.querySelectorAll('.btn-custom-font-item').forEach(el => el.remove());

    fonts.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `btn-set-font btn-custom-font-item py-2 rounded-xl text-center truncate px-1 ${f.family}`;
      btn.dataset.font = f.family;
      btn.textContent = f.name;
      btn.onclick = () => FontManager.applyCustomFont(f.family);
      deck.appendChild(btn);
    });
  },

  applyCustomFont(fontClass) {
    document.body.classList.remove('font-lora', 'font-newsreader', 'font-vietnam');
    document.body.className = document.body.className.replace(/custom-font-\d+/g, '').trim();
    document.body.classList.add(fontClass);
    State.settings.font = fontClass;

    document.querySelectorAll('.btn-set-font').forEach(b => {
      if (b.dataset.font === fontClass) {
        b.classList.add('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
      } else {
        b.classList.remove('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
      }
    });
    saveSettings();
  }
};

const ImportEngine = {
  async handleFile(file) {
    showToast(`Đang nạp: ${file.name}...`);
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'tbz') {
        await this.parseTBZ(file);
        return;
      }

      let parsedData = null;
      if (ext === 'epub') parsedData = await this.parseEPUB(file);
      else if (ext === 'txt') parsedData = await this.parseTXT(file);
      else if (ext === 'json') parsedData = await this.parseJSON(file);
      else throw new Error('Định dạng không hỗ trợ');

      if (!parsedData || parsedData.chapters.length === 0) throw new Error('Nội dung trống');

      const bookId = await db.books.add({
        title: parsedData.title,
        author: parsedData.author || 'Tác giả',
        totalChapters: parsedData.chapters.length,
        rawBlob: file,
        rawExt: ext,
        lastReadChapterIndex: 0,
        lastReadChunkIndex: 0,
        updatedAt: Date.now()
      });

      const chapterEntities = parsedData.chapters.map((ch, idx) => ({
        bookId: Number(bookId),
        chapterIndex: Number(idx),
        title: ch.title,
        content: ch.content,
        chunks: ch.chunks
      }));

      await db.chapters.bulkAdd(chapterEntities);
      showToast('Đã lưu sách mới');
      await BookManager.selectBook(bookId, 0, 0);
    } catch (err) {
      console.error(err);
      showToast(`Lỗi: ${err.message}`);
    }
  },

  async parseTBZ(file) {
    showToast('Đang giải nén .TBZ...');
    const zip = await JSZip.loadAsync(file);

    const metaFile = zip.file('metadata.json');
    if (!metaFile) throw new Error('Tệp .TBZ không hợp lệ');

    const metadata = JSON.parse(await metaFile.async('text'));

    let rawBlob = null;
    const rawExt = metadata.rawExt || 'epub';
    const rawFile = zip.file(`book.${rawExt}`);
    if (rawFile) rawBlob = await rawFile.async('blob');

    const bookId = await db.books.add({
      title: metadata.title,
      author: metadata.author || 'Khuyết Danh',
      totalChapters: metadata.totalChapters,
      rawBlob,
      rawExt,
      lastReadChapterIndex: 0,
      lastReadChunkIndex: 0,
      updatedAt: Date.now()
    });

    const chapterEntities = metadata.chapters.map(ch => ({
      bookId: Number(bookId),
      chapterIndex: Number(ch.chapterIndex),
      title: ch.title,
      content: ch.content,
      chunks: ch.chunks
    }));
    await db.chapters.bulkAdd(chapterEntities);

    const audioOfflineEntities = [];
    if (metadata.offlineMetadata && Array.isArray(metadata.offlineMetadata)) {
      for (const oMeta of metadata.offlineMetadata) {
        const mp3File = zip.file(`audios/chapter_${oMeta.chapterIndex}.mp3`);
        if (mp3File) {
          const audioBlob = await mp3File.async('blob');
          audioOfflineEntities.push({
            bookId: Number(bookId),
            chapterIndex: Number(oMeta.chapterIndex),
            voice: metadata.voice || State.settings.voice,
            audioBlob: new Blob([audioBlob], { type: 'audio/mpeg' }),
            size: audioBlob.size,
            timestamps: oMeta.timestamps
          });
        }
      }
    }

    if (audioOfflineEntities.length > 0) {
      await db.audio_offline.bulkAdd(audioOfflineEntities);
    }

    showToast('Nạp .TBZ thành công!');
    await BookManager.selectBook(bookId, 0, 0);
  },

  async parseEPUB(file) {
    const zip = await JSZip.loadAsync(file);
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const opfPath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');

    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfXml = await zip.file(opfPath)?.async('text');
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    const title = opfDoc.querySelector('metadata > title, dc\\:title')?.textContent || file.name.replace(/\.[^/.]+$/, "");
    const author = opfDoc.querySelector('metadata > creator, dc\\:creator')?.textContent || 'Khuyết Danh';

    const manifestMap = new Map();
    opfDoc.querySelectorAll('manifest > item').forEach(item => {
      manifestMap.set(item.getAttribute('id'), item.getAttribute('href'));
    });

    const spineIds = [];
    opfDoc.querySelectorAll('spine > itemref').forEach(ref => spineIds.push(ref.getAttribute('idref')));

    const chapters = [];
    let indexCounter = 0;

    for (const id of spineIds) {
      const href = manifestMap.get(id);
      if (!href) continue;

      const fullPath = opfDir ? opfDir + href : href;
      const htmlContent = await zip.file(fullPath)?.async('text');
      if (!htmlContent) continue;

      const doc = parser.parseFromString(htmlContent, 'text/html');
      const pElements = doc.body.querySelectorAll('p');
      const fullText = pElements.length > 0
        ? Array.from(pElements).map(p => p.innerText.trim()).filter(Boolean).join('\n\n')
        : doc.body.innerText;

      const { allChunks } = parseTextToParagraphsAndChunks(fullText);

      if (allChunks.length > 0) {
        let chapterTitle = doc.querySelector('h1, h2, h3, title')?.innerText?.trim() || `Chương ${indexCounter + 1}`;
        if (chapterTitle.length > 60) chapterTitle = chapterTitle.substring(0, 60) + '...';

        chapters.push({
          title: chapterTitle,
          content: fullText,
          chunks: allChunks
        });
        indexCounter++;
      }
    }

    return { title, author, chapters };
  },

  async parseTXT(file) {
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, "");
    const chapterRegex = /(?:^|\n)(?=(?:Chương|Hồi|Tiết|Quyển|Chapter|Part)\s+\d+[:\s\n])/i;
    const rawChapters = text.split(chapterRegex);
    const chapters = [];

    let index = 0;
    rawChapters.forEach(rc => {
      const chunk = rc.trim();
      if (!chunk) return;

      const lines = chunk.split('\n');
      const titleCandidate = lines[0].trim();
      const body = lines.slice(1).join('\n');
      const content = body.length > 50 ? body : chunk;
      const { allChunks } = parseTextToParagraphsAndChunks(content);

      if (allChunks.length > 0) {
        chapters.push({
          title: titleCandidate.length < 50 ? titleCandidate : `Phần ${index + 1}`,
          content,
          chunks: allChunks
        });
        index++;
      }
    });

    if (chapters.length === 0) {
      const { allChunks } = parseTextToParagraphsAndChunks(text);
      chapters.push({
        title,
        content: text,
        chunks: allChunks
      });
    }

    return { title, author: 'Khuyết Danh', chapters };
  },

  async parseJSON(file) {
    const text = await file.text();
    const json = JSON.parse(text);
    const title = json.title || file.name.replace(/\.[^/.]+$/, "");
    const author = json.author || 'Khuyết Danh';
    const chapters = [];

    if (Array.isArray(json.chapters)) {
      json.chapters.forEach((c, idx) => {
        const raw = typeof c === 'string' ? c : c.content;
        const { allChunks } = parseTextToParagraphsAndChunks(raw);
        if (allChunks.length > 0) {
          chapters.push({
            title: c.title || `Chương ${idx + 1}`,
            content: raw,
            chunks: allChunks
          });
        }
      });
    }

    return { title, author, chapters };
  }
};

const BookManager = {
  async loadAllBooks() {
    return await db.books.orderBy('updatedAt').reverse().toArray();
  },

  async selectBook(bookId, targetChapIdx = null, targetChunkIdx = null) {
    const bId = Number(bookId);
    const book = await db.books.get(bId);
    if (!book) return;

    State.currentBook = book;
    const bookTitle = document.getElementById('book-title');
    if (bookTitle) bookTitle.textContent = book.title;

    State.chapters = await db.chapters.where({ bookId: bId }).sortBy('chapterIndex');
    const tocCount = document.getElementById('toc-count');
    if (tocCount) tocCount.textContent = `${State.chapters.length} chương`;

    document.getElementById('empty-state')?.classList.add('hidden');

    await this.renderLibraryDrawer();
    await this.renderTOC();

    const chapIndex = targetChapIdx !== null ? targetChapIdx : (book.lastReadChapterIndex || 0);
    const chunkIndex = targetChunkIdx !== null ? targetChunkIdx : (book.lastReadChunkIndex || 0);

    await ActionController.loadChapterByIndex(chapIndex, false, chunkIndex);
    updateOfflineCheckBadges();
  },

  async deleteBook(bookId, e) {
    if (e) e.stopPropagation();
    if (!confirm('Xóa sách này và toàn bộ audio?')) return;

    const bId = Number(bookId);
    await db.transaction('rw', db.books, db.chapters, db.audio_offline, async () => {
      await db.books.delete(bId);
      await db.chapters.where({ bookId: bId }).delete();
      await db.audio_offline.where({ bookId: bId }).delete();
    });

    showToast('Đã xóa sách');

    if (State.currentBook?.id === bId) {
      AudioEngine.stopAll();
      State.currentBook = null;
      State.chapters = [];
      State.currentChapter = null;
      document.getElementById('book-title').textContent = 'Chưa chọn sách';
      document.getElementById('chapter-title').textContent = 'Nạp file để đọc';
      document.getElementById('reading-content-scroll-single').innerHTML = '';
      document.getElementById('reading-content-scroll-single').classList.add('hidden');
      document.getElementById('reading-content-scroll-infinite').innerHTML = '';
      document.getElementById('reading-content-scroll-infinite').classList.add('hidden');
      document.getElementById('book-viewport-container').classList.add('hidden');
      document.getElementById('empty-state')?.classList.remove('hidden');
    }

    await this.renderLibraryDrawer();
    updateStorageStats();
  },

  async persistReadingProgress() {
    if (!State.currentBook) return;
    await db.books.update(Number(State.currentBook.id), {
      lastReadChapterIndex: Number(State.currentChapterIndex),
      lastReadChunkIndex: Number(State.currentChunkIndex),
      updatedAt: Date.now()
    });
  },

  async renderLibraryDrawer() {
    const books = await this.loadAllBooks();
    const listEl = document.getElementById('library-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    const libraryCount = document.getElementById('library-count');
    if (libraryCount) libraryCount.textContent = `${books.length} cuốn`;

    if (books.length === 0) {
      listEl.innerHTML = `<div class="text-xs opacity-40 text-center py-8 font-sans">Trống</div>`;
      return;
    }

    books.forEach(b => {
      const isCurrent = State.currentBook?.id === b.id;
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 ${
        isCurrent ? 'bg-black/10 dark:bg-white/10 font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5'
      }`;
      card.innerHTML = `
        <div class="flex-1 min-w-0">
          <div class="text-xs line-clamp-1">${b.title}</div>
          <div class="text-[10px] opacity-60 font-mono mt-0.5">${b.totalChapters} chương • C.${(b.lastReadChapterIndex || 0) + 1}</div>
        </div>
        <button class="btn-del-book w-8 h-8 rounded-xl hover:bg-red-500/10 text-red-500 flex items-center justify-center transition" title="Xóa">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      `;
      card.onclick = () => {
        this.selectBook(b.id);
        toggleDrawer('library-drawer', false);
      };
      card.querySelector('.btn-del-book').onclick = (e) => this.deleteBook(b.id, e);
      listEl.appendChild(card);
    });
  },

  async renderTOC() {
    const list = document.getElementById('toc-list');
    if (!list) return;
    list.innerHTML = '';

    State.chapters.forEach((c, idx) => {
      const div = document.createElement('div');
      div.className = 'toc-item flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition';
      div.innerHTML = `
        <span class="line-clamp-1 flex-1 pr-2">${c.title}</span>
        <div class="flex items-center gap-2">
          <i id="cloud-badge-${c.chapterIndex}" class="fa-solid fa-circle-check text-emerald-500 hidden text-xs" title="Đã có Offline"></i>
          <button class="btn-delete-chap-cache opacity-50 hover:opacity-100 hover:text-red-500 hidden p-1" data-chap-idx="${c.chapterIndex}" title="Xóa offline">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      `;
      div.onclick = (e) => {
        if (e.target.closest('.btn-delete-chap-cache')) return;
        ActionController.loadChapterByIndex(idx, true);
        toggleDrawer('toc-sidebar', false);
      };
      div.querySelector('.btn-delete-chap-cache').onclick = async (e) => {
        e.stopPropagation();
        await removeChapterOffline(c.chapterIndex);
      };
      list.appendChild(div);
    });
  }
};

const PaginationEngine = {
  paginateCurrentChapter(paragraphs) {
    const pages = [];
    let curPage = [];
    let charCount = 0;
    let sCounter = 0;

    paragraphs.forEach(para => {
      const pData = {
        sentences: para.map(s => ({ idx: sCounter++, text: s }))
      };
      const pLen = para.reduce((acc, s) => acc + s.length, 0);

      if (charCount + pLen > 540 && curPage.length > 0) {
        pages.push(curPage);
        curPage = [];
        charCount = 0;
      }
      curPage.push(pData);
      charCount += pLen;
    });

    if (curPage.length > 0) pages.push(curPage);
    State.pages = pages;
  },

  renderCurrentPage(direction = 'none') {
    const sheet = document.getElementById('page-sheet-element');
    const container = document.getElementById('page-sheet-content');

    if (!sheet || !container) return;

    if (direction === 'next') {
      State.isFlipping = true;
      sheet.classList.add('flip-next-active');
      setTimeout(() => {
        this.buildPageDOM(container);
        sheet.classList.remove('flip-next-active');
        State.isFlipping = false;
      }, 320);
    } else if (direction === 'prev') {
      State.isFlipping = true;
      sheet.classList.add('flip-prev-active');
      setTimeout(() => {
        this.buildPageDOM(container);
        sheet.classList.remove('flip-prev-active');
        State.isFlipping = false;
      }, 320);
    } else {
      this.buildPageDOM(container);
    }
  },

  buildPageDOM(container) {
    container.innerHTML = '';
    const pageData = State.pages[State.currentPageIndex] || [];

    pageData.forEach(para => {
      const pEl = document.createElement('p');
      pEl.className = 'story-paragraph';
      para.sentences.forEach(s => {
        const span = document.createElement('span');
        span.className = 'sentence-block';
        span.id = `sent-flip-${s.idx}`;
        span.textContent = s.text + ' ';
        span.onclick = (e) => {
          e.stopPropagation();
          ActionController.jumpToSentence(s.idx);
        };
        pEl.appendChild(span);
      });
      container.appendChild(pEl);
    });

    const chapIndicator = document.getElementById('page-indicator-chap');
    const numIndicator = document.getElementById('page-indicator-num');
    if (chapIndicator) chapIndicator.textContent = State.currentChapter.title;
    if (numIndicator) numIndicator.textContent = `Trang ${State.currentPageIndex + 1}/${State.pages.length || 1}`;
    ActionController.highlightActiveSentence();
  },

  turnPage(delta) {
    if (State.isFlipping) return;

    const target = State.currentPageIndex + delta;
    if (target >= 0 && target < State.pages.length) {
      State.currentPageIndex = target;
      this.renderCurrentPage(delta > 0 ? 'next' : 'prev');
    } else if (delta > 0 && State.currentChapterIndex < State.chapters.length - 1) {
      ActionController.loadChapterByIndex(State.currentChapterIndex + 1, State.isPlaying);
    } else if (delta < 0 && State.currentChapterIndex > 0) {
      ActionController.loadChapterByIndex(State.currentChapterIndex - 1, State.isPlaying);
    }
  },

  findPageForSentence(sentenceIdx) {
    for (let pIdx = 0; pIdx < State.pages.length; pIdx++) {
      const page = State.pages[pIdx];
      for (const para of page) {
        if (para.sentences.some(s => s.idx === sentenceIdx)) return pIdx;
      }
    }
    return 0;
  }
};

const ActionController = {
  // ==========================================
  // 2. HÀM RESET CUỘN VÀ CHỈ SỐ TRANG VỀ ĐỈNH
  // ==========================================
  resetScrollAndPositionToTop() {
    const single = document.getElementById('reading-content-scroll-single');
    const infinite = document.getElementById('reading-content-scroll-infinite');
    const dropzone = document.getElementById('reader-dropzone');

    if (single) single.scrollTop = 0;
    if (infinite) infinite.scrollTop = 0;
    if (dropzone) dropzone.scrollTop = 0;
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      if (single) single.scrollTop = 0;
      if (infinite) infinite.scrollTop = 0;
      if (dropzone) dropzone.scrollTop = 0;
      window.scrollTo(0, 0);
    });

    setTimeout(() => {
      if (single) single.scrollTop = 0;
      if (infinite) infinite.scrollTop = 0;
      if (dropzone) dropzone.scrollTop = 0;
    }, 50);
  },

  async loadChapterByIndex(chapIndex, autoPlay = false, targetChunkIdx = 0) {
    if (chapIndex < 0 || chapIndex >= State.chapters.length) return;

    State.currentChapterIndex = Number(chapIndex);
    State.currentChunkIndex = Number(targetChunkIdx);
    State.currentChapter = State.chapters[chapIndex];

    AudioEngine.stopAll();

    const chapTitleEl = document.getElementById('chapter-title');
    const sentIdxEl = document.getElementById('player-sentence-idx');
    if (chapTitleEl) chapTitleEl.textContent = State.currentChapter.title;
    if (sentIdxEl) sentIdxEl.textContent = `${State.currentChunkIndex + 1}/${State.currentChapter.chunks.length}`;

    updateMediaSessionMetadata(State.currentBook?.title, State.currentChapter?.title);

    const { paragraphs } = parseTextToParagraphsAndChunks(State.currentChapter.content);

    PaginationEngine.paginateCurrentChapter(paragraphs);
    
    // Nếu chuyển sang chương mới từ đầu, luôn gán về trang 0
    if (targetChunkIdx === 0) {
      State.currentPageIndex = 0;
    } else {
      State.currentPageIndex = PaginationEngine.findPageForSentence(targetChunkIdx);
    }

    const singleBox = document.getElementById('reading-content-scroll-single');
    if (singleBox) {
      singleBox.innerHTML = '';
      let counter = 0;
      paragraphs.forEach(para => {
        const pEl = document.createElement('p');
        pEl.className = 'story-paragraph';
        para.forEach(sent => {
          const sIdx = counter++;
          const span = document.createElement('span');
          span.className = 'sentence-block';
          span.id = `sent-single-${sIdx}`;
          span.textContent = sent + ' ';
          span.onclick = () => ActionController.jumpToSentence(sIdx);
          pEl.appendChild(span);
        });
        singleBox.appendChild(pEl);
      });
    }

    const infiniteBox = document.getElementById('reading-content-scroll-infinite');
    if (infiniteBox) {
      infiniteBox.innerHTML = '';
      State.infiniteLoadedChapters.clear();
      this.appendChapterToInfiniteScroll(chapIndex);
    }

    this.applyReadMode();
    this.highlightActiveSentence();
    this.updateTOCActiveItem();
    await this.checkOfflineStatus();
    await BookManager.persistReadingProgress();

    // Reset cuộn lên đỉnh đầu sau khi đã render DOM
    this.resetScrollAndPositionToTop();

    triggerRollingBuffer(chapIndex);

    if (autoPlay && !State.isReadingOnly) {
      this.playSentence(State.currentChunkIndex);
    } else {
      State.isPlaying = false;
      updatePlayPauseButton();
    }
  },

  appendChapterToInfiniteScroll(chapIndex) {
    if (chapIndex < 0 || chapIndex >= State.chapters.length) return;
    if (State.infiniteLoadedChapters.has(chapIndex)) return;

    State.infiniteLoadedChapters.add(chapIndex);
    const chap = State.chapters[chapIndex];
    const { paragraphs } = parseTextToParagraphsAndChunks(chap.content);
    const infiniteBox = document.getElementById('reading-content-scroll-infinite');
    if (!infiniteBox) return;

    const block = document.createElement('div');
    block.className = 'infinite-chapter-block space-y-4';
    block.dataset.chapIdx = chapIndex;
    block.innerHTML = `<h2 class="text-sm font-bold opacity-50 uppercase tracking-widest pt-6 border-t border-current/10">${chap.title}</h2>`;

    let counter = 0;
    paragraphs.forEach(para => {
      const pEl = document.createElement('p');
      pEl.className = 'story-paragraph';
      para.forEach(sent => {
        const sIdx = counter++;
        const span = document.createElement('span');
        span.className = 'sentence-block';
        span.id = `sent-inf-${chapIndex}-${sIdx}`;
        span.textContent = sent + ' ';
        span.onclick = () => {
          if (State.currentChapterIndex !== chapIndex) {
            ActionController.loadChapterByIndex(chapIndex, !State.isReadingOnly, sIdx);
          } else {
            ActionController.jumpToSentence(sIdx);
          }
        };
        pEl.appendChild(span);
      });
      block.appendChild(pEl);
    });

    infiniteBox.appendChild(block);

    const allBlocks = infiniteBox.querySelectorAll('.infinite-chapter-block');
    if (allBlocks.length > 6) {
      const firstBlock = allBlocks[0];
      State.infiniteLoadedChapters.delete(parseInt(firstBlock.dataset.chapIdx));
      firstBlock.remove();
    }
  },

  applyReadMode() {
    const flipBox = document.getElementById('book-viewport-container');
    const singleBox = document.getElementById('reading-content-scroll-single');
    const infiniteBox = document.getElementById('reading-content-scroll-infinite');

    flipBox?.classList.add('hidden');
    singleBox?.classList.add('hidden');
    infiniteBox?.classList.add('hidden');

    const icon = document.getElementById('read-mode-icon');
    const label = document.getElementById('read-mode-label');

    if (State.readMode === 'flip') {
      flipBox?.classList.remove('hidden');
      PaginationEngine.renderCurrentPage();
      if (icon) icon.className = 'fa-solid fa-book-open text-xs text-sky-500';
      if (label) label.textContent = 'Lật trang';
    } else if (State.readMode === 'scroll-single') {
      singleBox?.classList.remove('hidden');
      if (icon) icon.className = 'fa-solid fa-file-lines text-xs text-amber-500';
      if (label) label.textContent = 'Cuộn chương';
    } else {
      infiniteBox?.classList.remove('hidden');
      if (icon) icon.className = 'fa-solid fa-infinity text-xs text-emerald-500';
      if (label) label.textContent = 'Vô cực';
    }
  },

  async checkOfflineStatus() {
    if (!State.currentBook || !State.currentChapter) return false;

    const bId = Number(State.currentBook.id);
    const cIdx = Number(State.currentChapter.chapterIndex);

    const offlineRecord = await db.audio_offline.where({
      bookId: bId,
      chapterIndex: cIdx,
      voice: State.settings.voice
    }).first();

    const badge = document.getElementById('player-mode-badge');
    const bufferBar = document.getElementById('progress-buffered');

    if (offlineRecord && offlineRecord.audioBlob && offlineRecord.audioBlob.size > 0) {
      State.isOfflinePlay = true;
      State.offlineTimestamps = offlineRecord.timestamps || [];
      if (badge) {
        badge.textContent = 'OFFLINE';
        badge.className = 'px-2 py-0.5 text-[9px] rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      }
      if (bufferBar) bufferBar.style.width = '100%';

      if (AudioEngine.offlineObjectUrl) URL.revokeObjectURL(AudioEngine.offlineObjectUrl);
      
      const blobWithMime = new Blob([offlineRecord.audioBlob], { type: 'audio/mpeg' });
      AudioEngine.offlineObjectUrl = URL.createObjectURL(blobWithMime);
      AudioEngine.offlinePlayer.src = AudioEngine.offlineObjectUrl;
      AudioEngine.offlinePlayer.load();
      AudioEngine.applySpeed(State.playbackSpeed);
      return true;
    } else {
      State.isOfflinePlay = false;
      State.offlineTimestamps = [];
      if (badge) {
        badge.textContent = 'ONLINE';
        badge.className = 'px-2 py-0.5 text-[9px] rounded-full font-semibold bg-black/5 dark:bg-white/10 opacity-70';
      }
      if (bufferBar) bufferBar.style.width = '0%';
      return false;
    }
  },

  async playSentence(idx) {
    const chunks = State.currentChapter?.chunks || [];
    if (!chunks.length || idx >= chunks.length) {
      if (State.currentChapterIndex < State.chapters.length - 1) {
        this.loadChapterByIndex(State.currentChapterIndex + 1, !State.isReadingOnly);
      } else {
        this.pause();
        showToast('Đã đọc xong toàn bộ tác phẩm');
      }
      return;
    }

    // Mở khoá luồng audio background cho iOS 16 ngay tại đây
    IOSBackgroundKeeper.unlock();

    State.currentChunkIndex = idx;
    this.highlightActiveSentence();
    this.syncSentenceToView(idx);
    BookManager.persistReadingProgress();

    if (State.isReadingOnly) {
      State.isPlaying = false;
      updatePlayPauseButton();
      return;
    }

    State.isPlaying = true;
    updatePlayPauseButton();

    if (State.isOfflinePlay) {
      try {
        if (!AudioEngine.offlinePlayer.src || AudioEngine.offlinePlayer.src === window.location.href) {
          const bId = Number(State.currentBook.id);
          const cIdx = Number(State.currentChapter.chapterIndex);
          const offlineRecord = await db.audio_offline.where({
            bookId: bId,
            chapterIndex: cIdx,
            voice: State.settings.voice
          }).first();

          if (!offlineRecord?.audioBlob) {
            State.isOfflinePlay = false;
            return this.playSentence(idx);
          }

          State.offlineTimestamps = offlineRecord.timestamps || [];
          if (AudioEngine.offlineObjectUrl) URL.revokeObjectURL(AudioEngine.offlineObjectUrl);
          const blobWithMime = new Blob([offlineRecord.audioBlob], { type: 'audio/mpeg' });
          AudioEngine.offlineObjectUrl = URL.createObjectURL(blobWithMime);
          AudioEngine.offlinePlayer.src = AudioEngine.offlineObjectUrl;
          AudioEngine.offlinePlayer.load();
        }

        AudioEngine.applySpeed(State.playbackSpeed);

        if (isNaN(AudioEngine.offlinePlayer.duration) || AudioEngine.offlinePlayer.duration === 0) {
          await new Promise((resolve) => {
            AudioEngine.offlinePlayer.onloadedmetadata = resolve;
            setTimeout(resolve, 500);
          });
        }

        if (State.offlineTimestamps && State.offlineTimestamps[idx]) {
          AudioEngine.offlinePlayer.currentTime = State.offlineTimestamps[idx].start;
        } else if (AudioEngine.offlinePlayer.duration && !isNaN(AudioEngine.offlinePlayer.duration)) {
          AudioEngine.offlinePlayer.currentTime = (idx / chunks.length) * AudioEngine.offlinePlayer.duration;
        }

        await AudioEngine.offlinePlayer.play();
      } catch (err) {
        console.warn('[Offline Playback Error]:', err);
        if (navigator.onLine) {
          State.isOfflinePlay = false;
          this.playSentence(idx);
        } else {
          showToast('Lỗi phát offline: Hãy bấm Play thử lại');
        }
      }
      return;
    }

    if (!navigator.onLine) {
      showToast('Chương này chưa tải offline và thiết bị đang mất mạng');
      State.isPlaying = false;
      updatePlayPauseButton();
      return;
    }

    if (AudioEngine.currentAbortCtrl) AudioEngine.currentAbortCtrl.abort();
    AudioEngine.currentAbortCtrl = new AbortController();

    try {
      const curText = chunks[idx];
      const res = await this.getOnlineAudio(curText, State.currentChapter.id, AudioEngine.currentAbortCtrl.signal);

      if (!res || !res.blobUrl) throw new Error('Không thể nạp online');

      const player = AudioEngine.getActivePlayer();
      player.src = res.blobUrl;
      player.load();
      AudioEngine.applySpeed(State.playbackSpeed);
      await player.play();

      // Nạp gối đầu câu kế tiếp vào player chờ để tránh bị gián đoạn khi tắt màn hình
      if (idx + 1 < chunks.length) {
        const nextText = chunks[idx + 1];
        this.getOnlineAudio(nextText, State.currentChapter.id).then(nextRes => {
          if (nextRes?.blobUrl) {
            const standby = AudioEngine.getStandbyPlayer();
            standby.src = nextRes.blobUrl;
            standby.load();
          }
        }).catch(() => {});
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[Online Playback Error]:', err);
        setTimeout(() => ActionController.stepSentence(1, true), 800);
      }
    }
  },

  async getOnlineAudio(text, chapterId, signal) {
    const hash = fastHash(`${text}_${State.settings.voice}`);
    const key = `${chapterId}_${hash}`;

    if (State.onlineMemCache.has(key)) return { blobUrl: State.onlineMemCache.get(key) };

    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': CONFIG.APP_KEY
      },
      body: JSON.stringify({
        text,
        voice: State.settings.voice,
        rate: '0%',
        pitch: '0Hz',
        volume: '0%'
      }),
      signal
    });

    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    State.onlineMemCache.set(key, blobUrl);
    return { blobUrl };
  },

  stepSentence(step, fromAutoEnd = false) {
    if (State.isOfflinePlay && AudioEngine.offlinePlayer.duration) {
      const maxIdx = (State.currentChapter?.chunks?.length || 1) - 1;
      const nextIdx = Math.max(0, Math.min(State.currentChunkIndex + step, maxIdx));
      this.playSentence(nextIdx);
      return;
    }

    const nextIdx = State.currentChunkIndex + step;
    if (fromAutoEnd) AudioEngine.swapSlot();
    this.playSentence(nextIdx);
  },

  jumpToSentence(idx) {
    this.playSentence(idx);
  },

  togglePlayPause() {
    if (!State.currentChapter) return;
    if (State.isReadingOnly) {
      showToast('Đang ở chế độ Chỉ Đọc. Bật tai nghe để nghe đọc');
      return;
    }
    IOSBackgroundKeeper.unlock();
    if (State.isPlaying) this.pause();
    else this.resume();
  },

  pause() {
    State.isPlaying = false;
    AudioEngine.getActivePlayer().pause();
    updatePlayPauseButton();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  },

  resume() {
    IOSBackgroundKeeper.unlock();
    const player = AudioEngine.getActivePlayer();
    if (player.src && player.src !== window.location.href && !player.error) {
      State.isPlaying = true;
      updatePlayPauseButton();
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      AudioEngine.applySpeed(State.playbackSpeed);
      player.play().catch(() => {
        this.playSentence(State.currentChunkIndex);
      });
    } else {
      this.playSentence(State.currentChunkIndex);
    }
  },

  highlightActiveSentence() {
    document.querySelectorAll('.sentence-block.is-active').forEach(el => el.classList.remove('is-active'));

    const elFlip = document.getElementById(`sent-flip-${State.currentChunkIndex}`);
    if (elFlip) elFlip.classList.add('is-active');

    const elSingle = document.getElementById(`sent-single-${State.currentChunkIndex}`);
    if (elSingle) elSingle.classList.add('is-active');

    const elInf = document.getElementById(`sent-inf-${State.currentChapterIndex}-${State.currentChunkIndex}`);
    if (elInf) elInf.classList.add('is-active');

    const total = State.currentChapter?.chunks?.length || 0;
    const sentIdxEl = document.getElementById('player-sentence-idx');
    if (sentIdxEl) sentIdxEl.textContent = `${State.currentChunkIndex + 1}/${total}`;
  },

  syncSentenceToView(idx) {
    if (State.readMode === 'flip') {
      const targetPage = PaginationEngine.findPageForSentence(idx);
      if (targetPage !== State.currentPageIndex) {
        const dir = targetPage > State.currentPageIndex ? 'next' : 'prev';
        State.currentPageIndex = targetPage;
        PaginationEngine.renderCurrentPage(dir);
      }
    } else if (State.readMode === 'scroll-single') {
      const el = document.getElementById(`sent-single-${idx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const el = document.getElementById(`sent-inf-${State.currentChapterIndex}-${idx}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  updateTOCActiveItem() {
    document.querySelectorAll('.toc-item').forEach((el, idx) => {
      if (idx === State.currentChapterIndex) {
        el.classList.add('bg-black/10', 'dark:bg-white/10', 'font-semibold');
      } else {
        el.classList.remove('bg-black/10', 'dark:bg-white/10', 'font-semibold');
      }
    });
  },

  toggleZenMode(forceState = null) {
    State.isZenMode = forceState !== null ? forceState : !State.isZenMode;
    const headerWrapper = document.getElementById('main-header-wrapper');
    const player = document.getElementById('main-player-capsule');
    const exitBtn = document.getElementById('btn-exit-zen');
    const dropzone = document.getElementById('reader-dropzone');
    const bookBox = document.getElementById('book-viewport-container');

    if (State.isZenMode) {
      headerWrapper?.classList.add('zen-hidden');
      player?.classList.add('zen-hidden-bottom');
      exitBtn?.classList.remove('hidden');
      dropzone?.classList.add('zen-layout');
      bookBox?.classList.add('zen-viewport');
      showToast('Đã mở rộng toàn màn hình');
    } else {
      headerWrapper?.classList.remove('zen-hidden');
      player?.classList.remove('zen-hidden-bottom');
      exitBtn?.classList.add('hidden');
      dropzone?.classList.remove('zen-layout');
      bookBox?.classList.remove('zen-viewport');
    }
  },

  toggleReadingOnly() {
    State.isReadingOnly = !State.isReadingOnly;
    const icon = document.getElementById('icon-reading-only');

    if (State.isReadingOnly) {
      AudioEngine.stopAll();
      State.isPlaying = false;
      updatePlayPauseButton();
      if (icon) icon.className = 'fa-solid fa-book-open-reader text-amber-500 text-sm md:text-base';
      showToast('Chế độ Chỉ Đọc');
    } else {
      if (icon) icon.className = 'fa-solid fa-headphones text-sky-500 text-sm md:text-base';
      showToast('Chế độ Nghe Đọc');
      this.playSentence(State.currentChunkIndex);
    }
  }
};

async function updateOfflineCheckBadges() {
  if (!State.currentBook) return;
  const bId = Number(State.currentBook.id);
  const offlines = await db.audio_offline.where({
    bookId: bId,
    voice: State.settings.voice
  }).toArray();

  const offlineMap = new Set(offlines.map(o => Number(o.chapterIndex)));

  State.chapters.forEach(ch => {
    const cIdx = Number(ch.chapterIndex);
    const badge = document.getElementById(`cloud-badge-${cIdx}`);
    const delBtn = document.querySelector(`.btn-delete-chap-cache[data-chap-idx="${cIdx}"]`);
    if (badge) {
      if (offlineMap.has(cIdx)) {
        badge.classList.remove('hidden');
        if (delBtn) delBtn.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
        if (delBtn) delBtn.classList.add('hidden');
      }
    }
  });
}

async function removeChapterOffline(chapterIndex) {
  if (!State.currentBook) return;
  const bId = Number(State.currentBook.id);
  const cIdx = Number(chapterIndex);

  await db.audio_offline.where({
    bookId: bId,
    chapterIndex: cIdx,
    voice: State.settings.voice
  }).delete();

  updateOfflineCheckBadges();
  updateStorageStats();
  ActionController.checkOfflineStatus();
  showToast('Đã xóa offline chương này');
}

async function updateStorageStats() {
  const all = await db.audio_offline.toArray();
  const totalBytes = all.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  
  const storageDetail = document.getElementById('storage-detail');
  if (storageDetail) storageDetail.textContent = `${all.length} chương | ${mb} MB`;

  const booksCount = await db.books.count();
  const fontsCount = await db.custom_fonts.count();

  const statMb = document.getElementById('db-stat-total-mb');
  const statBooks = document.getElementById('db-stat-books');
  const statAudio = document.getElementById('db-stat-audio');
  const statFonts = document.getElementById('db-stat-fonts');

  if (statMb) statMb.textContent = `${mb} MB`;
  if (statBooks) statBooks.textContent = `${booksCount} cuốn`;
  if (statAudio) statAudio.textContent = `${all.length} chương`;
  if (statFonts) statFonts.textContent = `${fontsCount} font`;
}

async function loadDatabaseDetailTables() {
  const fontsList = document.getElementById('db-detail-fonts-list');
  const audioList = document.getElementById('db-detail-audio-list');

  if (fontsList) fontsList.innerHTML = '';
  if (audioList) audioList.innerHTML = '';

  const fonts = await db.custom_fonts.toArray();
  if (fontsList) {
    if (fonts.length === 0) {
      fontsList.innerHTML = `<div class="text-[10px] opacity-40 italic">Chưa có font tải ngoài</div>`;
    } else {
      fonts.forEach(f => {
        const item = document.createElement('div');
        item.className = 'p-3 input-field rounded-xl flex justify-between items-center text-xs';
        item.innerHTML = `
          <span>${f.name}</span>
          <button class="text-red-500 hover:underline text-[11px]" onclick="deleteSingleFont(${f.id})">Xóa</button>
        `;
        fontsList.appendChild(item);
      });
    }
  }

  const audios = await db.audio_offline.toArray();
  if (audioList) {
    if (audios.length === 0) {
      audioList.innerHTML = `<div class="text-[10px] opacity-40 italic">Chưa có file audio offline</div>`;
    } else {
      audios.slice(0, 50).forEach(a => {
        const mb = (a.size / (1024 * 1024)).toFixed(2);
        const item = document.createElement('div');
        item.className = 'p-3 input-field rounded-xl flex justify-between items-center text-xs';
        item.innerHTML = `
          <span>Chương ${a.chapterIndex + 1} (${mb} MB)</span>
          <button class="text-red-500 hover:underline text-[11px]" onclick="deleteSingleAudio(${a.id})">Xóa</button>
        `;
        audioList.appendChild(item);
      });
    }
  }
}

async function deleteSingleFont(id) {
  await db.custom_fonts.delete(id);
  await FontManager.loadAllCustomFonts();
  await updateStorageStats();
  await loadDatabaseDetailTables();
  showToast('Đã xóa font');
}

async function deleteSingleAudio(id) {
  await db.audio_offline.delete(id);
  await updateStorageStats();
  await loadDatabaseDetailTables();
  updateOfflineCheckBadges();
  ActionController.checkOfflineStatus();
  showToast('Đã xóa audio chương');
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function updatePlayPauseButton() {
  const icon = document.getElementById('icon-play');
  if (!icon) return;
  if (State.isPlaying) {
    icon.className = 'fa-solid fa-pause';
  } else {
    icon.className = 'fa-solid fa-play ml-1';
  }
}

function toggleDrawer(id, show) {
  const drawer = document.getElementById(id);
  const backdrop = document.getElementById('backdrop-overlay');
  if (!drawer || !backdrop) return;
  if (show) {
    drawer.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  } else {
    drawer.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  }
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `flat-glass px-5 py-3 rounded-full text-xs font-sans font-medium shadow-lg flex items-center justify-center pointer-events-auto transition-all transform duration-300 -translate-y-2 opacity-0 text-center`;
  toast.textContent = msg;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('-translate-y-2', 'opacity-0'));
  setTimeout(() => {
    toast.classList.add('-translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function applyTheme(theme) {
  document.body.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
  document.body.classList.add(theme);
  State.settings.theme = theme;

  document.querySelectorAll('.btn-set-theme').forEach(b => {
    if (b.dataset.theme === theme) {
      b.classList.add('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    } else {
      b.classList.remove('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    }
  });
  saveSettings();
}

function applyQuality(quality) {
  State.settings.audioQuality = quality;
  document.querySelectorAll('.btn-set-quality').forEach(b => {
    if (b.dataset.quality === quality) {
      b.classList.add('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    } else {
      b.classList.remove('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    }
  });
  saveSettings();
}

function applyFont(font) {
  document.body.classList.remove('font-lora', 'font-newsreader', 'font-vietnam');
  document.body.className = document.body.className.replace(/custom-font-\d+/g, '').trim();
  document.body.classList.add(font);
  State.settings.font = font;

  document.querySelectorAll('.btn-set-font').forEach(b => {
    if (b.dataset.font === font) {
      b.classList.add('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    } else {
      b.classList.remove('bg-white', 'dark:bg-zinc-800', 'shadow-sm', 'font-bold');
    }
  });
  saveSettings();
}

function applyFontSize(size) {
  const single = document.getElementById('reading-content-scroll-single');
  const infinite = document.getElementById('reading-content-scroll-infinite');
  const pageContent = document.getElementById('page-sheet-content');
  const lbl = document.getElementById('lbl-font-size');

  if (single) single.style.fontSize = `${size}px`;
  if (infinite) infinite.style.fontSize = `${size}px`;
  if (pageContent) pageContent.style.fontSize = `${size}px`;
  if (lbl) lbl.textContent = `${size}px`;

  State.settings.fontSize = size;
  saveSettings();
}

function setPlaybackSpeed(speed) {
  const val = parseFloat(speed);
  State.playbackSpeed = val;
  AudioEngine.applySpeed(val);

  const label = `${val.toFixed(1)}x`;
  const capsuleSpeed = document.getElementById('capsule-speed-val');
  const quickSpeed = document.getElementById('quick-lbl-speed');
  const quickRng = document.getElementById('quick-rng-speed');

  if (capsuleSpeed) capsuleSpeed.textContent = label;
  if (quickSpeed) quickSpeed.textContent = label;
  if (quickRng) quickRng.value = val;

  document.querySelectorAll('.btn-quick-speed').forEach(btn => {
    if (parseFloat(btn.dataset.speed) === val) {
      btn.classList.add('bg-black/15', 'dark:bg-white/20', 'font-bold');
    } else {
      btn.classList.remove('bg-black/15', 'dark:bg-white/20', 'font-bold');
    }
  });
  saveSettings();
}

function saveSettings() {
  localStorage.setItem('truyen_voice_v30_settings', JSON.stringify({
    ...State.settings,
    playbackSpeed: State.playbackSpeed,
    readMode: State.readMode
  }));
}

function loadSettings() {
  const saved = localStorage.getItem('truyen_voice_v30_settings');
  if (saved) {
    const parsed = JSON.parse(saved);
    State.settings = { ...State.settings, ...parsed };
    if (parsed.playbackSpeed) State.playbackSpeed = parsed.playbackSpeed;
    if (parsed.readMode) State.readMode = parsed.readMode;
  }
  applyTheme(State.settings.theme);
  applyQuality(State.settings.audioQuality || '128k');
  applyFont(State.settings.font);
  applyFontSize(State.settings.fontSize);

  const rngFont = document.getElementById('rng-font-size');
  const selVoice = document.getElementById('quick-sel-voice');
  const chkBuffer = document.getElementById('chk-auto-buffer');
  const rngBuffer = document.getElementById('rng-buffer-count');
  const lblBuffer = document.getElementById('lbl-buffer-count');

  if (rngFont) rngFont.value = State.settings.fontSize;
  if (selVoice) selVoice.value = State.settings.voice;
  if (chkBuffer) chkBuffer.checked = State.settings.autoBuffer !== false;
  if (rngBuffer) rngBuffer.value = State.settings.bufferCount || 5;
  if (lblBuffer) lblBuffer.textContent = `${State.settings.bufferCount || 5} chương`;

  setPlaybackSpeed(State.playbackSpeed || 1.0);
}

let newWorkerWaiting = null;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    if (reg.waiting) {
      newWorkerWaiting = reg.waiting;
      showUpdateBanner();
    }

    reg.addEventListener('updatefound', () => {
      const installingWorker = reg.installing;
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          newWorkerWaiting = installingWorker;
          showUpdateBanner();
        }
      });
    });
  }).catch(err => console.warn('SW Register Error:', err));

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

function showUpdateBanner() {
  const banner = document.getElementById('update-notification-banner');
  if (banner) {
    banner.classList.remove('hidden');
    // Kích hoạt animation mượt mà
    requestAnimationFrame(() => {
      banner.classList.remove('-translate-y-8', 'opacity-0');
      banner.classList.add('translate-y-0', 'opacity-100');
    });
  }
}

// Xử lý đóng banner mượt mà
document.getElementById('btn-dismiss-update')?.addEventListener('click', () => {
  const banner = document.getElementById('update-notification-banner');
  if (banner) {
    banner.classList.remove('translate-y-0', 'opacity-100');
    banner.classList.add('-translate-y-8', 'opacity-0');
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 300);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  IOSBackgroundKeeper.init();
  AudioEngine.init();
  loadSettings();
  await FontManager.loadAllCustomFonts();

  const headerSub = document.getElementById('header-sub');
  const iconSubToggle = document.getElementById('icon-header-sub-toggle');
  const btnToggleHeaderSub = document.getElementById('btn-toggle-header-sub');

  if (btnToggleHeaderSub && headerSub && iconSubToggle) {
    btnToggleHeaderSub.onclick = () => {
      const isHidden = headerSub.classList.contains('hidden');
      if (isHidden) {
        headerSub.classList.remove('hidden');
        headerSub.classList.add('flex');
        iconSubToggle.className = 'fa-solid fa-xmark text-base';
      } else {
        headerSub.classList.add('hidden');
        headerSub.classList.remove('flex');
        iconSubToggle.className = 'fa-solid fa-ellipsis text-base';
      }
    };
  }

  const readModePopover = document.getElementById('read-mode-popover');
  document.getElementById('btn-mobile-readmode')?.addEventListener('click', (e) => {
    e.stopPropagation();
    readModePopover?.classList.toggle('hidden');
    readModePopover?.classList.toggle('flex');
  });

  document.getElementById('btn-mobile-download')?.addEventListener('click', () => {
    headerSub?.classList.add('hidden');
    headerSub?.classList.remove('flex');
    if (iconSubToggle) iconSubToggle.className = 'fa-solid fa-ellipsis text-base';
    document.getElementById('btn-open-download')?.click();
  });

  document.getElementById('btn-mobile-export-tbz')?.addEventListener('click', () => {
    headerSub?.classList.add('hidden');
    headerSub?.classList.remove('flex');
    if (iconSubToggle) iconSubToggle.className = 'fa-solid fa-ellipsis text-base';
    ExportEngine.exportFullTBZ();
  });

  document.getElementById('btn-mobile-db')?.addEventListener('click', () => {
    headerSub?.classList.add('hidden');
    headerSub?.classList.remove('flex');
    if (iconSubToggle) iconSubToggle.className = 'fa-solid fa-ellipsis text-base';
    document.getElementById('btn-open-db-manager')?.click();
  });

  const settingsPanel = document.getElementById('quick-settings-panel');
  document.getElementById('btn-mobile-settings')?.addEventListener('click', (e) => {
    e.stopPropagation();
    headerSub?.classList.add('hidden');
    headerSub?.classList.remove('flex');
    if (iconSubToggle) iconSubToggle.className = 'fa-solid fa-ellipsis text-base';
    settingsPanel?.classList.toggle('hidden');
    settingsPanel?.classList.toggle('flex');
  });

  document.getElementById('btn-apply-update')?.addEventListener('click', () => {
    if (newWorkerWaiting) newWorkerWaiting.postMessage({ action: 'SKIP_WAITING' });
    else window.location.reload();
  });

  document.getElementById('btn-dismiss-update')?.addEventListener('click', () => {
    const banner = document.getElementById('update-notification-banner');
    banner?.classList.add('hidden');
    banner?.classList.remove('flex');
  });

  document.getElementById('btn-clear-app-cache')?.addEventListener('click', async () => {
    if (confirm('Xoá sạch cache trình duyệt? (Toàn bộ sách và audio đã lưu sẽ được giữ nguyên)')) {
      showToast('Đang xoá cache...');
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let r of regs) await r.unregister();
      }
      State.onlineMemCache.clear();
      showToast('Xong! Đang khởi động lại...');
      setTimeout(() => { window.location.href = window.location.pathname + '?nocache=' + Date.now(); }, 1000);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (State.readMode === 'flip') PaginationEngine.turnPage(1);
      else ActionController.stepSentence(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (State.readMode === 'flip') PaginationEngine.turnPage(-1);
      else ActionController.stepSentence(-1);
    } else if (e.code === 'Space') {
      e.preventDefault();
      ActionController.togglePlayPause();
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      ActionController.toggleZenMode();
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  const sheetEl = document.getElementById('page-sheet-element');

  if (sheetEl) {
    sheetEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    sheetEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 40 && Math.abs(diffY) < 40) {
        if (diffX < 0) PaginationEngine.turnPage(1);
        else PaginationEngine.turnPage(-1);
      }
    }, { passive: true });
  }

  document.getElementById('touch-click-left')?.addEventListener('click', (e) => {
    e.stopPropagation();
    PaginationEngine.turnPage(-1);
  });
  document.getElementById('touch-click-right')?.addEventListener('click', (e) => {
    e.stopPropagation();
    PaginationEngine.turnPage(1);
  });

  document.getElementById('btn-enter-zen')?.addEventListener('click', () => ActionController.toggleZenMode(true));
  document.getElementById('btn-exit-zen')?.addEventListener('click', () => ActionController.toggleZenMode(false));
  document.getElementById('btn-toggle-reading-only')?.addEventListener('click', () => ActionController.toggleReadingOnly());

  const infContainer = document.getElementById('reading-content-scroll-infinite');
  if (infContainer) {
    infContainer.addEventListener('scroll', () => {
      if (State.readMode !== 'scroll-infinite' || State.isInfiniteFetching) return;

      const nearBottom = infContainer.scrollTop + infContainer.clientHeight >= infContainer.scrollHeight - 350;
      if (nearBottom) {
        const maxLoadedIdx = Math.max(...Array.from(State.infiniteLoadedChapters));
        if (maxLoadedIdx < State.chapters.length - 1) {
          State.isInfiniteFetching = true;
          ActionController.appendChapterToInfiniteScroll(maxLoadedIdx + 1);
          setTimeout(() => { State.isInfiniteFetching = false; }, 300);
        }
      }
    });
  }

  document.getElementById('btn-open-read-mode')?.addEventListener('click', (e) => {
    e.stopPropagation();
    readModePopover?.classList.toggle('hidden');
    readModePopover?.classList.toggle('flex');
  });

  document.addEventListener('click', (e) => {
    if (readModePopover && !readModePopover.contains(e.target)) {
      readModePopover.classList.add('hidden');
      readModePopover.classList.remove('flex');
    }
  });

  document.querySelectorAll('.btn-select-mode').forEach(b => {
    b.onclick = () => {
      State.readMode = b.dataset.mode;
      ActionController.applyReadMode();
      saveSettings();
      readModePopover?.classList.add('hidden');
      readModePopover?.classList.remove('flex');
    };
  });

  document.getElementById('btn-toggle-quick-settings')?.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel?.classList.toggle('hidden');
    settingsPanel?.classList.toggle('flex');
  });
  document.getElementById('btn-close-quick-settings')?.addEventListener('click', () => {
    settingsPanel?.classList.add('hidden');
    settingsPanel?.classList.remove('flex');
  });

  const fontBox = document.getElementById('font-importer-box');
  document.getElementById('btn-open-font-importer')?.addEventListener('click', () => fontBox?.classList.toggle('hidden'));
  document.getElementById('btn-cancel-font-import')?.addEventListener('click', () => fontBox?.classList.add('hidden'));
  document.getElementById('btn-save-font-import')?.addEventListener('click', async () => {
    const input = document.getElementById('inp-google-font-url');
    if (input) {
      await FontManager.extractAndImportFont(input.value);
      input.value = '';
    }
    fontBox?.classList.add('hidden');
  });

  document.getElementById('btn-open-db-manager')?.addEventListener('click', async () => {
    await updateStorageStats();
    document.getElementById('modal-db-manager')?.showModal();
  });

  document.getElementById('tab-db-basic')?.addEventListener('click', () => {
    document.getElementById('tab-db-basic').className = 'py-2 px-4 border-b-2 border-current font-bold';
    document.getElementById('tab-db-detail').className = 'py-2 px-4 border-b-2 border-transparent opacity-60 hover:opacity-100';
    document.getElementById('view-db-basic')?.classList.remove('hidden');
    document.getElementById('view-db-detail')?.classList.add('hidden');
  });

  document.getElementById('tab-db-detail')?.addEventListener('click', async () => {
    document.getElementById('tab-db-detail').className = 'py-2 px-4 border-b-2 border-current font-bold';
    document.getElementById('tab-db-basic').className = 'py-2 px-4 border-b-2 border-transparent opacity-60 hover:opacity-100';
    document.getElementById('view-db-detail')?.classList.remove('hidden');
    document.getElementById('view-db-basic')?.classList.add('hidden');
    await loadDatabaseDetailTables();
  });

  document.getElementById('btn-clear-all-audio')?.addEventListener('click', async () => {
    if (confirm('Xóa toàn bộ audio offline?')) {
      await db.audio_offline.clear();
      State.onlineMemCache.clear();
      updateOfflineCheckBadges();
      ActionController.checkOfflineStatus();
      await updateStorageStats();
      showToast('Đã dọn sạch audio offline');
    }
  });

  document.getElementById('btn-clear-entire-db')?.addEventListener('click', async () => {
    if (confirm('CẢNH BÁO: Xóa trắng toàn bộ dữ liệu sách, audio và font?')) {
      await db.delete();
      window.location.reload();
    }
  });

  document.getElementById('btn-page-prev')?.addEventListener('click', () => PaginationEngine.turnPage(-1));
  document.getElementById('btn-page-next')?.addEventListener('click', () => PaginationEngine.turnPage(1));

  document.getElementById('btn-toggle-library')?.addEventListener('click', () => {
    toggleDrawer('toc-sidebar', false);
    toggleDrawer('library-drawer', true);
    BookManager.renderLibraryDrawer();
  });

  document.getElementById('btn-toggle-toc')?.addEventListener('click', () => {
    if (!State.currentBook) return showToast('Vui lòng chọn sách');
    toggleDrawer('library-drawer', false);
    toggleDrawer('toc-sidebar', true);
  });

  document.getElementById('backdrop-overlay')?.addEventListener('click', () => {
    toggleDrawer('library-drawer', false);
    toggleDrawer('toc-sidebar', false);
  });

  document.getElementById('btn-open-download')?.addEventListener('click', () => {
    if (!State.currentBook || !State.chapters.length) return showToast('Chưa chọn sách');
    updateStorageStats();
    const fromInp = document.getElementById('inp-dl-from');
    const toInp = document.getElementById('inp-dl-to');
    if (fromInp) {
      fromInp.max = State.chapters.length;
      fromInp.value = State.currentChapterIndex + 1;
    }
    if (toInp) {
      toInp.max = State.chapters.length;
      toInp.value = Math.min(State.currentChapterIndex + 5, State.chapters.length);
    }
    document.getElementById('modal-download')?.showModal();
  });

  const quickPopover = document.getElementById('quick-audio-popover');
  const toggleQuickPopover = () => {
    quickPopover?.classList.toggle('hidden');
    quickPopover?.classList.toggle('flex');
  };

  document.getElementById('btn-open-quick-audio')?.addEventListener('click', toggleQuickPopover);
  document.getElementById('btn-speed-badge')?.addEventListener('click', toggleQuickPopover);
  document.getElementById('btn-close-quick-popover')?.addEventListener('click', () => {
    quickPopover?.classList.add('hidden');
    quickPopover?.classList.remove('flex');
  });

  const quickSelVoice = document.getElementById('quick-sel-voice');
  if (quickSelVoice) {
    quickSelVoice.onchange = (e) => {
      State.settings.voice = e.target.value;
      saveSettings();
      ActionController.checkOfflineStatus();
      updateOfflineCheckBadges();
      showToast(`Đã đổi giọng: ${e.target.selectedOptions[0].text}`);
    };
  }

  document.querySelectorAll('.btn-quick-speed').forEach(btn => {
    btn.onclick = () => setPlaybackSpeed(btn.dataset.speed);
  });

  const quickRng = document.getElementById('quick-rng-speed');
  if (quickRng) quickRng.oninput = (e) => setPlaybackSpeed(e.target.value);

  const dropzone = document.getElementById('reader-dropzone');
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('bg-black/5'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('bg-black/5'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('bg-black/5');
      if (e.dataTransfer.files.length) ImportEngine.handleFile(e.dataTransfer.files[0]);
    });
  }

  const fileUpload = document.getElementById('file-upload');
  if (fileUpload) {
    fileUpload.onchange = (e) => {
      if (e.target.files.length) ImportEngine.handleFile(e.target.files[0]);
    };
  }

  document.getElementById('btn-play-pause')?.addEventListener('click', () => ActionController.togglePlayPause());
  document.getElementById('btn-next-sent')?.addEventListener('click', () => ActionController.stepSentence(1));
  document.getElementById('btn-prev-sent')?.addEventListener('click', () => ActionController.stepSentence(-1));
  document.getElementById('btn-next-chap')?.addEventListener('click', () => ActionController.loadChapterByIndex(State.currentChapterIndex + 1, State.isPlaying));
  document.getElementById('btn-prev-chap')?.addEventListener('click', () => ActionController.loadChapterByIndex(State.currentChapterIndex - 1, State.isPlaying));

  document.getElementById('btn-dl-curr')?.addEventListener('click', () => {
    DownloadManager.queueChapters([State.currentChapterIndex]);
    document.getElementById('modal-download')?.close();
  });

  document.getElementById('btn-dl-range')?.addEventListener('click', () => {
    const fromVal = document.getElementById('inp-dl-from')?.value || '1';
    const toVal = document.getElementById('inp-dl-to')?.value || '1';
    const from = parseInt(fromVal) - 1;
    const to = parseInt(toVal) - 1;
    const indices = [];
    for (let i = Math.max(0, from); i <= Math.min(to, State.chapters.length - 1); i++) {
      indices.push(i);
    }
    DownloadManager.queueChapters(indices);
    document.getElementById('modal-download')?.close();
  });

  document.getElementById('btn-dl-all')?.addEventListener('click', () => {
    const indices = State.chapters.map((_, idx) => idx);
    DownloadManager.queueChapters(indices);
    document.getElementById('modal-download')?.close();
  });

  document.getElementById('btn-purge-cache')?.addEventListener('click', async () => {
    if (confirm('Xóa sạch toàn bộ audio offline?')) {
      await db.audio_offline.clear();
      State.onlineMemCache.clear();
      updateStorageStats();
      updateOfflineCheckBadges();
      ActionController.checkOfflineStatus();
      showToast('Đã dọn dẹp bộ nhớ');
    }
  });

  document.getElementById('btn-export-tbz')?.addEventListener('click', () => ExportEngine.exportFullTBZ());
  document.getElementById('btn-export-tbz-direct')?.addEventListener('click', () => {
    document.getElementById('modal-db-manager')?.close();
    ExportEngine.exportFullTBZ();
  });

  document.getElementById('btn-dl-minimize')?.addEventListener('click', () => DownloadManager.minimizeToPill());
  document.getElementById('dl-mini-pill')?.addEventListener('click', () => DownloadManager.expandFromPill());
  document.getElementById('btn-dl-pause')?.addEventListener('click', () => {
    if (State.downloader.isPaused) DownloadManager.resume();
    else DownloadManager.pause();
  });
  document.getElementById('btn-dl-abort')?.addEventListener('click', () => DownloadManager.abort());

  document.querySelectorAll('.btn-set-theme').forEach(btn => {
    btn.onclick = () => applyTheme(btn.dataset.theme);
  });
  document.querySelectorAll('.btn-set-quality').forEach(btn => {
    btn.onclick = () => applyQuality(btn.dataset.quality);
  });
  document.querySelectorAll('.btn-set-font').forEach(btn => {
    btn.onclick = () => applyFont(btn.dataset.font);
  });

  const rngFontSize = document.getElementById('rng-font-size');
  if (rngFontSize) rngFontSize.oninput = (e) => applyFontSize(e.target.value);

  const chkAutoBuf = document.getElementById('chk-auto-buffer');
  if (chkAutoBuf) {
    chkAutoBuf.onchange = (e) => {
      State.settings.autoBuffer = e.target.checked;
      saveSettings();
    };
  }

  const rngBufCount = document.getElementById('rng-buffer-count');
  if (rngBufCount) {
    rngBufCount.oninput = (e) => {
      State.settings.bufferCount = parseInt(e.target.value);
      const lbl = document.getElementById('lbl-buffer-count');
      if (lbl) lbl.textContent = `${e.target.value} chương`;
      saveSettings();
    };
  }

  const books = await BookManager.loadAllBooks();
  if (books.length > 0) {
    await BookManager.selectBook(books[0].id);
  }
});