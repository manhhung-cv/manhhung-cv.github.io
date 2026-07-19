import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Search, Home, Library, 
  Settings, Heart, Star, Clock, MoreVertical, Plus, Edit2, Trash2, 
  ChevronLeft, ChevronRight, ListMusic, UserCircle, LogOut, Check
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, updateDoc, addDoc
} from 'firebase/firestore';

// --- FIREBASE SETUP ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'audio-story-app';

// --- CONTEXTS ---
const AppContext = createContext();
const PlayerContext = createContext();

// --- MOCK YOUTUBE IDS FOR SEEDING ---
const FALLBACK_YT_ID = 'jfKfPfyJRdk'; // Lofi Girl as generic audio

// --- MAIN APP PROVIDER ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [ratings, setRatings] = useState([]);
  
  // Private Data States
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  // Navigation State
  const [currentView, setCurrentView] = useState('home'); // home, search, library, admin, detail
  const [currentStoryId, setCurrentStoryId] = useState(null);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching (Strictly adhering to no complex queries rule)
  useEffect(() => {
    if (!user) return;

    const publicPath = (col) => collection(db, 'artifacts', appId, 'public', 'data', col);
    const privatePath = (col) => collection(db, 'artifacts', appId, 'users', user.uid, col);

    const unsubscribers = [];

    // Fetch Public Data
    const publicCollections = {
      'stories': setStories,
      'authors': setAuthors,
      'chapters': setChapters,
      'genres': setGenres,
      'tags': setTags,
      'ratings': setRatings
    };

    Object.entries(publicCollections).forEach(([colName, setter]) => {
      const unsub = onSnapshot(publicPath(colName), (snap) => {
        setter(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error(`Error fetching ${colName}:`, err));
      unsubscribers.push(unsub);
    });

    // Fetch Private Data
    const unsubFav = onSnapshot(privatePath('favorites'), (snap) => {
      setFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, err => console.error(err));
    unsubscribers.push(unsubFav);

    const unsubHist = onSnapshot(privatePath('history'), (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, err => console.error(err));
    unsubscribers.push(unsubHist);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const ytPlayerRef = useRef(null);

  const navigateTo = (view, storyId = null) => {
    setCurrentView(view);
    if (storyId) setCurrentStoryId(storyId);
  };

  const appContextValue = {
    user,
    stories, authors, chapters, genres, tags, ratings, favorites, history,
    navigateTo, currentView, currentStoryId,
    db, appId
  };

  const playerContextValue = {
    isPlaying, setIsPlaying,
    currentChapter, setCurrentChapter,
    playbackProgress, setPlaybackProgress,
    duration, setDuration,
    currentTime, setCurrentTime,
    ytPlayerRef
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-500">Đang tải...</div>;

  return (
    <AppContext.Provider value={appContextValue}>
      <PlayerContext.Provider value={playerContextValue}>
        <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-24 flex flex-col">
            <TopBar />
            <div className="flex-1 p-6">
              <ViewManager />
            </div>
          </main>
          <PlayerBar />
          <YouTubeIframe />
        </div>
      </PlayerContext.Provider>
    </AppContext.Provider>
  );
}

// --- ROUTER / VIEW MANAGER ---
const ViewManager = () => {
  const { currentView } = useContext(AppContext);
  switch (currentView) {
    case 'home': return <HomeView />;
    case 'search': return <SearchView />;
    case 'library': return <LibraryView />;
    case 'admin': return <AdminView />;
    case 'detail': return <StoryDetailView />;
    default: return <HomeView />;
  }
};

// --- LAYOUT COMPONENTS ---
const Sidebar = () => {
  const { currentView, navigateTo } = useContext(AppContext);
  const navItems = [
    { id: 'home', icon: Home, label: 'Trang chủ' },
    { id: 'search', icon: Search, label: 'Tìm kiếm' },
    { id: 'library', icon: Library, label: 'Thư viện' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 hidden md:flex z-10">
      <div className="flex items-center gap-2 text-emerald-500 mb-10 font-bold text-2xl tracking-tighter">
        <ListMusic className="w-8 h-8" />
        <span>AudioTruyện</span>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex items-center gap-4 w-full p-3 rounded-lg font-medium transition-colors ${
              currentView === item.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-zinc-900">
         <button
            onClick={() => navigateTo('admin')}
            className={`flex items-center gap-4 w-full p-3 rounded-lg font-medium transition-colors ${
              currentView === 'admin' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Admin Dashboard
          </button>
      </div>
    </aside>
  );
};

const TopBar = () => {
  const { navigateTo } = useContext(AppContext);
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <button onClick={() => navigateTo('home')} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition opacity-50 cursor-not-allowed">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-zinc-900 p-2 rounded-full text-zinc-400 hover:text-white transition">
          <UserCircle className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

// --- YOUTUBE HIDDEN PLAYER ---
const YouTubeIframe = () => {
  const { currentChapter, setIsPlaying, setDuration, setCurrentTime, currentTime, ytPlayerRef, isPlaying } = useContext(PlayerContext);
  const { user, db, appId } = useContext(AppContext);
  const playerContainerRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => setApiReady(true);
    } else if (window.YT && window.YT.Player) {
      setApiReady(true);
    }
  }, []);

  useEffect(() => {
    if (apiReady && currentChapter && !ytPlayerRef.current) {
      ytPlayerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        videoId: currentChapter.youtubeId || FALLBACK_YT_ID,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, rel: 0 },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
            setIsPlaying(true);
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(event.target.getDuration());
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });
    } else if (ytPlayerRef.current && currentChapter) {
      ytPlayerRef.current.loadVideoById(currentChapter.youtubeId || FALLBACK_YT_ID);
      setIsPlaying(true);
    }
  }, [currentChapter, apiReady]);

  // Progress Tracker
  useEffect(() => {
    let interval;
    if (isPlaying && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        const time = ytPlayerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Save to Firebase History periodically
  useEffect(() => {
    const saveHistory = async () => {
      if (user && currentChapter && currentTime > 5) {
        try {
          const historyRef = doc(db, 'artifacts', appId, 'users', user.uid, 'history', currentChapter.storyId);
          await setDoc(historyRef, {
            storyId: currentChapter.storyId,
            chapterId: currentChapter.id,
            progressSeconds: currentTime,
            lastListenedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save history", error);
        }
      }
    };

    const interval = setInterval(saveHistory, 15000); // Save every 15s
    return () => {
      clearInterval(interval);
      saveHistory(); // Save on unmount
    };
  }, [user, currentChapter, currentTime]);

  return <div ref={playerContainerRef} className="absolute pointer-events-none opacity-0" />;
};

// --- PLAYER BAR ---
const PlayerBar = () => {
  const { 
    currentChapter, isPlaying, setIsPlaying, 
    currentTime, duration, ytPlayerRef 
  } = useContext(PlayerContext);
  const { stories, chapters } = useContext(AppContext);

  const togglePlay = () => {
    if (!ytPlayerRef.current || !ytPlayerRef.current.playVideo) return;
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      ytPlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentChapter) return null;

  const currentStory = stories.find(s => s.id === currentChapter.storyId) || {};
  const storyChapters = chapters.filter(c => c.storyId === currentChapter.storyId).sort((a,b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = storyChapters.findIndex(c => c.id === currentChapter.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950 border-t border-zinc-900 flex items-center px-4 md:px-6 z-50">
      {/* Left: Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[180px]">
        <img 
          src={currentStory.coverUrl || 'https://via.placeholder.com/150'} 
          alt="Cover" 
          className="w-14 h-14 rounded object-cover shadow-lg"
        />
        <div className="overflow-hidden">
          <h4 className="text-sm font-semibold truncate text-white">{currentChapter.title}</h4>
          <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">{currentStory.title}</p>
        </div>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
        <div className="flex items-center gap-6 mb-2">
          <button 
            className={`text-zinc-400 hover:text-white transition ${currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentIndex <= 0}
            onClick={() => {/* Implement Prev via Context */}}
          >
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-1" fill="currentColor" />}
          </button>
          
          <button 
            className={`text-zinc-400 hover:text-white transition ${currentIndex >= storyChapters.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentIndex >= storyChapters.length - 1}
            onClick={() => {/* Implement Next via Context */}}
          >
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full max-w-md text-xs text-zinc-400">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer accent-emerald-500"
          />
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume/Misc */}
      <div className="flex items-center justify-end gap-4 w-1/3 min-w-[150px]">
        <Volume2 className="w-5 h-5 text-zinc-400" />
        <input 
          type="range" 
          min="0" max="100" defaultValue="100"
          className="w-24 h-1 bg-zinc-800 rounded-full cursor-pointer accent-white"
          onChange={(e) => {
             if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
                 ytPlayerRef.current.setVolume(e.target.value);
             }
          }}
        />
      </div>
    </div>
  );
};

// --- VIEWS ---

const HomeView = () => {
  const { stories, authors, navigateTo, ratings } = useContext(AppContext);

  // Helper to get average rating
  const getRating = (storyId) => {
    const storyRatings = ratings.filter(r => r.storyId === storyId);
    if (!storyRatings.length) return 0;
    return (storyRatings.reduce((acc, curr) => acc + curr.rating, 0) / storyRatings.length).toFixed(1);
  };

  const getAuthorName = (authorId) => authors.find(a => a.id === authorId)?.name || 'Unknown';

  const newStories = [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const featuredStories = stories.filter(s => s.featured).slice(0, 5);
  const completedStories = stories.filter(s => s.status === 'Hoàn thành').slice(0, 5);

  const Section = ({ title, data }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {data.length === 0 ? (
        <p className="text-zinc-500">Chưa có dữ liệu.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {data.map(story => (
            <div 
              key={story.id} 
              className="bg-zinc-900/50 p-4 rounded-xl hover:bg-zinc-800 transition cursor-pointer group"
              onClick={() => navigateTo('detail', story.id)}
            >
              <div className="relative aspect-square mb-4 shadow-lg rounded-md overflow-hidden">
                <img src={story.coverUrl || 'https://via.placeholder.com/300'} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                  <Play className="w-5 h-5 text-black ml-1" fill="currentColor" />
                </button>
              </div>
              <h3 className="font-semibold text-white truncate">{story.title}</h3>
              <p className="text-sm text-zinc-400 truncate mb-1">{getAuthorName(story.authorId)}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-500">
                <Star className="w-3 h-3" fill="currentColor" />
                <span>{getRating(story.id) || 'Chưa đánh giá'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <Section title="Truyện Nổi Bật" data={featuredStories} />
      <Section title="Truyện Mới Cập Nhật" data={newStories} />
      <Section title="Đã Hoàn Thành" data={completedStories} />
    </div>
  );
};

const SearchView = () => {
  const { stories, genres, tags, navigateTo } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchName = story.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenres = selectedGenres.length === 0 || (story.genreIds && selectedGenres.every(g => story.genreIds.includes(g)));
    const matchTags = selectedTags.length === 0 || (story.tagIds && selectedTags.every(t => story.tagIds.includes(t)));
    return matchName && matchGenres && matchTags;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Tìm kiếm truyện, tác giả..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:border-emerald-500 transition shadow-lg"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-lg mb-3">Thể loại</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => toggleSelection(genre.id, selectedGenres, setSelectedGenres)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedGenres.includes(genre.id) ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3">Tags tình tiết</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleSelection(tag.id, selectedTags, setSelectedTags)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedTags.includes(tag.id) ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Kết quả tìm kiếm ({filteredStories.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStories.map(story => (
              <div 
                key={story.id} 
                onClick={() => navigateTo('detail', story.id)}
                className="bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition flex flex-col"
              >
                <img src={story.coverUrl || 'https://via.placeholder.com/200'} alt={story.title} className="w-full aspect-square object-cover rounded-md mb-3" />
                <h4 className="font-semibold text-sm truncate">{story.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StoryDetailView = () => {
  const { currentStoryId, stories, authors, chapters, genres, tags, ratings, user, db, appId, favorites, history } = useContext(AppContext);
  const { setCurrentChapter, setIsPlaying } = useContext(PlayerContext);
  
  if (!currentStoryId) return <div>Không tìm thấy truyện</div>;
  
  const story = stories.find(s => s.id === currentStoryId);
  if (!story) return <div>Đang tải thông tin truyện...</div>;

  const author = authors.find(a => a.id === story.authorId);
  const storyChapters = chapters.filter(c => c.storyId === story.id).sort((a,b) => a.chapterNumber - b.chapterNumber);
  const storyGenres = genres.filter(g => (story.genreIds || []).includes(g.id));
  const storyTags = tags.filter(t => (story.tagIds || []).includes(t.id));
  
  const storyRatings = ratings.filter(r => r.storyId === story.id);
  const avgRating = storyRatings.length > 0 
    ? (storyRatings.reduce((acc, curr) => acc + curr.rating, 0) / storyRatings.length).toFixed(1) 
    : 0;

  const isFavorite = favorites.some(f => f.storyId === story.id);
  const userHistory = history.find(h => h.storyId === story.id);

  const handlePlay = (chapterToPlay) => {
    setCurrentChapter(chapterToPlay);
    setIsPlaying(true);
  };

  const handlePlayMain = () => {
    if (userHistory) {
      const histChapter = storyChapters.find(c => c.id === userHistory.chapterId);
      if (histChapter) {
        handlePlay(histChapter);
        // Would need to seek to userHistory.progressSeconds here via Context effect
        return;
      }
    }
    if (storyChapters.length > 0) handlePlay(storyChapters[0]);
  };

  const toggleFavorite = async () => {
    if (!user) { alert("Vui lòng đăng nhập"); return; }
    try {
      if (isFavorite) {
        const favDoc = favorites.find(f => f.storyId === story.id);
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'favorites', favDoc.id));
      } else {
        await setDoc(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'favorites')), {
          storyId: story.id,
          addedAt: new Date().toISOString()
        });
      }
    } catch (e) { console.error("Error toggling fav", e); }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <img 
          src={story.coverUrl || 'https://via.placeholder.com/300'} 
          alt={story.title} 
          className="w-full md:w-64 aspect-square object-cover rounded-2xl shadow-2xl"
        />
        <div className="flex-1">
          <div className="text-sm font-semibold text-emerald-500 mb-2">{story.status || 'Đang cập nhật'}</div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">{story.title}</h1>
          <p className="text-lg text-zinc-400 mb-6 font-medium">{author?.name || 'Unknown Author'}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handlePlayMain}
              className="w-14 h-14 bg-emerald-500 hover:scale-105 transition rounded-full flex items-center justify-center text-black shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </button>
            <button 
              onClick={toggleFavorite}
              className="w-10 h-10 border border-zinc-600 rounded-full flex items-center justify-center hover:border-white transition"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-emerald-500 fill-emerald-500' : 'text-zinc-400'}`} />
            </button>
            <button className="w-10 h-10 border border-zinc-600 rounded-full flex items-center justify-center hover:border-white transition">
              <MoreVertical className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {storyGenres.map(g => <span key={g.id} className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-300">{g.name}</span>)}
            {storyTags.map(t => <span key={t.id} className="text-xs px-2 py-1 border border-zinc-700 rounded text-zinc-400">{t.name}</span>)}
          </div>
          
          <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 hover:line-clamp-none cursor-pointer">
            {story.description || 'Chưa có mô tả.'}
          </p>
        </div>
      </div>

      {/* Chapters Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 border-b border-zinc-800 pb-2">Danh sách chương ({storyChapters.length})</h2>
        {storyChapters.length === 0 ? (
          <p className="text-zinc-500">Chưa có chương nào.</p>
        ) : (
          <div className="space-y-1">
            {storyChapters.map((chapter) => (
              <div 
                key={chapter.id}
                onClick={() => handlePlay(chapter)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 group cursor-pointer transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500 font-mono w-8 text-right group-hover:hidden">{chapter.chapterNumber}</span>
                  <Play className="w-4 h-4 text-white hidden group-hover:block ml-4" fill="currentColor" />
                  <span className="font-medium text-zinc-200 group-hover:text-white">{chapter.title}</span>
                </div>
                <span className="text-xs text-zinc-500">Audio</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
          Đánh giá <span className="text-emerald-500 flex items-center text-lg"><Star className="w-5 h-5 mr-1" fill="currentColor" />{avgRating}</span>
        </h2>
        {/* Simple static review display for demo */}
        <div className="space-y-4">
           {storyRatings.map(r => (
             <div key={r.id} className="bg-zinc-900 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= r.rating ? 'text-emerald-500 fill-emerald-500' : 'text-zinc-600'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500">User</span>
                </div>
                <p className="text-sm text-zinc-300">{r.comment}</p>
             </div>
           ))}
           {storyRatings.length === 0 && <p className="text-zinc-500">Chưa có đánh giá nào.</p>}
        </div>
      </div>
    </div>
  );
};

const LibraryView = () => {
  const { favorites, history, stories, navigateTo } = useContext(AppContext);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold">Thư viện của bạn</h1>
      
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock className="text-zinc-400" /> Nghe gần đây</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {history.length === 0 && <p className="text-zinc-500">Chưa có lịch sử.</p>}
          {history.map(item => {
            const story = stories.find(s => s.id === item.storyId);
            if (!story) return null;
            return (
              <div 
                key={item.id} 
                className="w-40 flex-shrink-0 cursor-pointer hover:bg-zinc-900 p-2 rounded-lg transition"
                onClick={() => navigateTo('detail', story.id)}
              >
                <img src={story.coverUrl} className="w-full aspect-square object-cover rounded-md mb-2 shadow-lg" alt="" />
                <h4 className="font-semibold text-sm truncate">{story.title}</h4>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Heart className="text-emerald-500" fill="currentColor" /> Yêu thích</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {favorites.length === 0 && <p className="text-zinc-500">Chưa có truyện yêu thích.</p>}
           {favorites.map(item => {
            const story = stories.find(s => s.id === item.storyId);
            if (!story) return null;
            return (
              <div 
                key={item.id} 
                className="bg-zinc-900 p-3 rounded-lg hover:bg-zinc-800 cursor-pointer transition flex flex-col group"
                onClick={() => navigateTo('detail', story.id)}
              >
                <div className="relative">
                  <img src={story.coverUrl} className="w-full aspect-square object-cover rounded-md mb-3" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                     <Play className="w-10 h-10 text-white" fill="currentColor"/>
                  </div>
                </div>
                <h4 className="font-semibold text-sm truncate">{story.title}</h4>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// --- ADMIN DASHBOARD ---
const AdminView = () => {
  const [activeTab, setActiveTab] = useState('stories');
  const tabs = [
    { id: 'stories', label: 'Truyện' },
    { id: 'chapters', label: 'Chương' },
    { id: 'authors', label: 'Tác giả' },
    { id: 'genres', label: 'Thể loại' },
    { id: 'tags', label: 'Tags' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stories': return <AdminStories />;
      case 'chapters': return <AdminChapters />;
      case 'authors': return <AdminSimpleEntity collectionName="authors" title="Tác giả" />;
      case 'genres': return <AdminSimpleEntity collectionName="genres" title="Thể loại" />;
      case 'tags': return <AdminSimpleEntity collectionName="tags" title="Tags" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-zinc-900 min-h-[500px] rounded-xl border border-zinc-800 flex overflow-hidden">
      <div className="w-48 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <div className="p-4 font-bold text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-800">Quản trị</div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 text-left text-sm font-medium transition ${activeTab === tab.id ? 'bg-emerald-900/30 text-emerald-500 border-r-2 border-emerald-500' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

// Generic Admin component for Tags, Genres, Authors
const AdminSimpleEntity = ({ collectionName, title }) => {
  const { db, appId } = useContext(AppContext);
  const contextData = useContext(AppContext)[collectionName]; // accesses authors, genres, tags from context
  const [name, setName] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), { name });
      setName('');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, id));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          value={name} onChange={e => setName(e.target.value)}
          placeholder={`Thêm ${title.toLowerCase()} mới...`}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-4 py-2 focus:border-emerald-500 outline-none"
        />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {contextData.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-3 rounded">
            <span>{item.name}</span>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminStories = () => {
  const { db, appId, stories, authors, genres, tags } = useContext(AppContext);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', authorId: '', description: '', coverUrl: '', status: 'Đang cập nhật', featured: false, genreIds: [], tagIds: []
  });

  const handleToggleArray = (id, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(i => i !== id) : [...prev[field], id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData, createdAt: new Date().toISOString() };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'stories'), dataToSave);
      setShowForm(false);
      setFormData({ title: '', authorId: '', description: '', coverUrl: '', status: 'Đang cập nhật', featured: false, genreIds: [], tagIds: [] });
    } catch (err) { console.error(err); }
  };

  const handleSeedData = async () => {
    // Quick seeder for demo purposes
    try {
      const aRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'authors'), { name: "Nguyễn Nhật Ánh" });
      const gRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'genres'), { name: "Truyện Ngắn" });
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'stories'), {
        title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ (Demo Audio)",
        authorId: aRef.id,
        description: "Truyện có audio mẫu (nhạc lofi) để test tính năng player.",
        coverUrl: "https://upload.wikimedia.org/wikipedia/vi/2/23/Cho_toi_xin_mot_ve_di_tuoi_tho.jpg",
        status: "Hoàn thành",
        featured: true,
        genreIds: [gRef.id],
        tagIds: [],
        createdAt: new Date().toISOString()
      });
      alert("Đã tạo dữ liệu mẫu!");
    } catch(e) { console.error(e) }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Quản lý Truyện</h2>
        <div className="flex gap-2">
          <button onClick={handleSeedData} className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-medium">Tạo Dữ liệu Mẫu</button>
          <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-medium">
            {showForm ? 'Hủy' : 'Thêm Truyện Mới'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-950 p-6 rounded border border-zinc-800 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Tên truyện" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2" />
            <select required value={formData.authorId} onChange={e => setFormData({...formData, authorId: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2">
              <option value="">-- Chọn Tác giả --</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input placeholder="URL Ảnh bìa" value={formData.coverUrl} onChange={e => setFormData({...formData, coverUrl: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 col-span-2" />
            <textarea placeholder="Mô tả" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 col-span-2 h-24" />
          </div>
          
          <div>
            <span className="text-sm text-zinc-400 mb-2 block">Thể loại (chọn nhiều)</span>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <div key={g.id} onClick={() => handleToggleArray(g.id, 'genreIds')} className={`cursor-pointer px-2 py-1 text-xs rounded border ${formData.genreIds.includes(g.id) ? 'bg-emerald-900 border-emerald-500' : 'border-zinc-700'}`}>
                  {g.name}
                </div>
              ))}
            </div>
          </div>
          
          <button type="submit" className="w-full bg-emerald-600 py-2 rounded font-bold">Lưu Truyện</button>
        </form>
      )}

      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-950 border-b border-zinc-800">
          <tr>
            <th className="p-3">Tên</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Nổi bật</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {stories.map(story => (
            <tr key={story.id} className="border-b border-zinc-800/50 hover:bg-zinc-950/50">
              <td className="p-3 font-medium">{story.title}</td>
              <td className="p-3">{story.status}</td>
              <td className="p-3">{story.featured ? 'Có' : 'Không'}</td>
              <td className="p-3">
                <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'stories', story.id))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminChapters = () => {
  const { db, appId, chapters, stories } = useContext(AppContext);
  const [formData, setFormData] = useState({ storyId: '', title: '', chapterNumber: 1, youtubeId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chapters'), formData);
      setFormData({...formData, title: '', chapterNumber: parseInt(formData.chapterNumber) + 1, youtubeId: ''});
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Quản lý Chương Audio</h2>
      
      <form onSubmit={handleSubmit} className="bg-zinc-950 p-6 rounded border border-zinc-800 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select required value={formData.storyId} onChange={e => setFormData({...formData, storyId: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 col-span-2">
            <option value="">-- Chọn Truyện --</option>
            {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <input type="number" required placeholder="Số thứ tự chương" value={formData.chapterNumber} onChange={e => setFormData({...formData, chapterNumber: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2" />
          <input required placeholder="Tên chương (VD: Chương 1: Bắt đầu)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2" />
          <input required placeholder="YouTube ID (VD: jfKfPfyJRdk)" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded p-2 col-span-2" />
          <p className="text-xs text-zinc-500 col-span-2">Lấy ID từ link Youtube: https://www.youtube.com/watch?v=<b>ID_NẰM_Ở_ĐÂY</b></p>
        </div>
        <button type="submit" className="w-full bg-emerald-600 py-2 rounded font-bold">Thêm Chương</button>
      </form>

      <div className="space-y-2">
        {chapters.sort((a,b) => a.chapterNumber - b.chapterNumber).map(ch => {
          const storyName = stories.find(s => s.id === ch.storyId)?.title || 'N/A';
          return (
            <div key={ch.id} className="bg-zinc-950 p-3 rounded flex justify-between items-center border border-zinc-800">
              <div>
                <span className="text-emerald-500 font-mono text-xs mr-2">[{storyName}]</span>
                <span className="font-medium text-sm">Chương {ch.chapterNumber}: {ch.title}</span>
              </div>
              <button onClick={() => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chapters', ch.id))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          )
        })}
      </div>
    </div>
  );
};