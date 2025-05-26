// Main JavaScript file for personal portfolio website

// DOM Elements
const body = document.body;
const navLinks = document.querySelectorAll('.nav-link');
const menuBtn = document.getElementById('menuBtn');
const navLinksContainer = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const darkModeSwitch = document.getElementById('darkModeSwitch');
const gridSwitch = document.getElementById('gridSwitch');
const noiseSwitch = document.getElementById('noiseSwitch');
const colorOptions = document.querySelectorAll('.color-option');
const themeSettingsToggle = document.getElementById('themeSettingsToggle');
const themeSettings = document.querySelector('.theme-settings');
const sections = document.querySelectorAll('section');
const skillCategories = document.querySelectorAll('.skill-category');
const skillGrids = document.querySelectorAll('.skills-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const prevTestimonial = document.getElementById('prevTestimonial');
const nextTestimonial = document.getElementById('nextTestimonial');
const testimonialCards = document.querySelectorAll('.testimonial-card');
const testimonialDots = document.querySelectorAll('.dot');
const contactForm = document.getElementById('contactForm');
const typewriterText = document.getElementById('typewriter-text');

// Variables
let currentTestimonial = 0;
let isScrolling = false;
let lastScrollTop = 0;
const header = document.querySelector('header');
let cursor, cursorFollower;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTypewriter();
    initTechSphere();
    initSkillBars();
    setupEventListeners();
    setupCustomCursor();
    checkPreferredColorScheme();
});

// Initialize typewriter effect
function initTypewriter() {
    const phrases = [
        'Front-End Developer',
        'UI/UX Designer'
    ];

    let currentPhrase = 0;
    let currentChar = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const phrase = phrases[currentPhrase];

        if (isDeleting) {
            typewriterText.textContent = phrase.substring(0, currentChar - 1);
            currentChar--;
            typingSpeed = 50;
        } else {
            typewriterText.textContent = phrase.substring(0, currentChar + 1);
            currentChar++;
            typingSpeed = 100;
        }

        if (!isDeleting && currentChar === phrase.length) {
            isDeleting = true;
            typingSpeed = 1000; // Pause at end
        } else if (isDeleting && currentChar === 0) {
            isDeleting = false;
            currentPhrase = (currentPhrase + 1) % phrases.length;
            typingSpeed = 500; // Pause before new phrase
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

// Initialize tech icons marquee
function initTechSphere() {
    const techIcons = document.querySelector('.tech-icons');
    const iconData = [
        { icon: 'fab fa-html5', color: '#E44D26' },
        { icon: 'fab fa-css3-alt', color: '#264DE4' },
        { icon: 'fab fa-js', color: '#F7DF1E' },
        { icon: 'fab fa-react', color: '#61DAFB' },
        { icon: 'fab fa-node-js', color: '#339933' },
        { icon: 'fab fa-python', color: '#3776AB' },
        { icon: 'fab fa-vuejs', color: '#4FC08D' },
        { icon: 'fab fa-angular', color: '#DD0031' },
        { icon: 'fab fa-sass', color: '#CC6699' },
        { icon: 'fab fa-git-alt', color: '#F05032' },
        { icon: 'fab fa-docker', color: '#2496ED' },
        { icon: 'fab fa-aws', color: '#FF9900' }
    ];

    // Clear existing content
    techIcons.innerHTML = '';

    // Create marquee container
    const marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'marquee-container';

    // Create marquee track
    const marqueeTrack = document.createElement('div');
    marqueeTrack.className = 'marquee-track';

    // Create two sets of icons for continuous scrolling effect
    for (let j = 0; j < 2; j++) {
        const iconSet = document.createElement('div');
        iconSet.className = 'icon-set';

        // Create icons
        iconData.forEach(data => {
            const icon = document.createElement('div');
            icon.className = 'tech-icon';
            icon.innerHTML = `<i class="${data.icon}" style="color: ${data.color}"></i>`;
            iconSet.appendChild(icon);
        });

        marqueeTrack.appendChild(iconSet);
    }

    marqueeContainer.appendChild(marqueeTrack);
    techIcons.appendChild(marqueeContainer);
}

// Initialize skill bars with animation
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');

    // Initially set width to 0
    skillLevels.forEach(level => {
        level.style.width = '0';
    });

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get the original width from style attribute
                const targetWidth = entry.target.getAttribute('style').split('width:')[1].split(')')[0];
                // Animate to target width
                setTimeout(() => {
                    entry.target.style.width = targetWidth;
                }, 200);
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe all skill levels
    skillLevels.forEach(level => {
        observer.observe(level);
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuBtn.addEventListener('click', toggleMobileMenu);

    // Theme settings panel toggle
    themeSettingsToggle.addEventListener('click', () => {
        themeSettings.classList.toggle('open');
    });

    // Close theme settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeSettings.contains(e.target) && e.target !== themeSettingsToggle) {
            themeSettings.classList.remove('open');
        }
    });

    // Dark mode toggle
    darkModeSwitch.addEventListener('change', toggleDarkMode);
    themeToggle.addEventListener('click', () => {
        darkModeSwitch.checked = !darkModeSwitch.checked;
        toggleDarkMode();
    });

    // Grid overlay toggle
    gridSwitch.addEventListener('change', () => {
        body.classList.toggle('show-grid', gridSwitch.checked);
        localStorage.setItem('showGrid', gridSwitch.checked);
    });

    // Noise texture toggle
    noiseSwitch.addEventListener('change', () => {
        body.classList.toggle('show-noise', noiseSwitch.checked);
        localStorage.setItem('showNoise', noiseSwitch.checked);
    });

    // Accent color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            document.documentElement.style.setProperty('--primary-color', option.dataset.color);
            localStorage.setItem('accentColor', option.dataset.color);

            // Update active state
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });


    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Close mobile menu if open
                navLinksContainer.classList.remove('open');
                menuBtn.classList.remove('open');

                // Smooth scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Account for header height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Skill category tabs
    skillCategories.forEach(category => {
        category.addEventListener('click', () => {
            const targetCategory = category.dataset.category;

            // Update active states
            skillCategories.forEach(cat => cat.classList.remove('active'));
            category.classList.add('active');

            // Show corresponding skills grid
            skillGrids.forEach(grid => {
                grid.classList.remove('active');
                if (grid.id === `${targetCategory}-skills`) {
                    grid.classList.add('active');
                }
            });
        });
    });

    // Project filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Testimonial slider controls
    if (prevTestimonial && nextTestimonial) {
        prevTestimonial.addEventListener('click', () => {
            showTestimonial(currentTestimonial - 1);
        });

        nextTestimonial.addEventListener('click', () => {
            showTestimonial(currentTestimonial + 1);
        });

        // Testimonial dots
        testimonialDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
        });
    }

    // Contact form submission (prevent default for demo)
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Form submission is disabled in this demo. In a real website, this would send your message.');
            contactForm.reset();
        });
    }

    // Scroll event for header hide/show and active nav link
    window.addEventListener('scroll', handleScroll);

    // Load saved theme settings
    loadThemeSettings();
}

// Toggle mobile menu
function toggleMobileMenu() {
    menuBtn.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
    body.classList.toggle('no-scroll');
}

// Toggle dark/light mode
function toggleDarkMode() {
    const isDarkMode = darkModeSwitch.checked;
    body.classList.toggle('dark-mode', isDarkMode);

    // Update theme toggle icon
    themeToggle.innerHTML = isDarkMode ?
        '<i class="fas fa-sun"></i>' :
        '<i class="fas fa-moon"></i>';

    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

// Show testimonial by index
function showTestimonial(index) {
    // Handle wrapping
    if (index < 0) {
        index = testimonialCards.length - 1;
    } else if (index >= testimonialCards.length) {
        index = 0;
    }

    // Update current index
    currentTestimonial = index;

    // Update testimonial cards
    testimonialCards.forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });

    // Update dots
    testimonialDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// Handle scroll events
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Header hide/show on scroll
    if (scrollTop > 100) {
        if (scrollTop > lastScrollTop && !isScrolling) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
    } else {
        header.classList.remove('hidden');
    }

    lastScrollTop = scrollTop;

    // Update active nav link based on scroll position
    updateActiveNavLink();
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100; // Offset for header

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Setup custom cursor
function setupCustomCursor() {
    // Create cursor elements if they don't exist
    if (!document.querySelector('.cursor')) {
        cursor = document.createElement('div');
        cursor.classList.add('cursor');
        document.body.appendChild(cursor);
    } else {
        cursor = document.querySelector('.cursor');
    }

    if (!document.querySelector('.cursor-follower')) {
        cursorFollower = document.createElement('div');
        cursorFollower.classList.add('cursor-follower');
        document.body.appendChild(cursorFollower);
    } else {
        cursorFollower = document.querySelector('.cursor-follower');
    }

    // Update cursor position on mouse move
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Follower has slight delay for smooth effect
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 50);
    });

    // Add hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .skill-category, .project-card, .filter-btn, .social-link, .color-option');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('hover');
        });
    });

    // Add click effect
    document.addEventListener('mousedown', () => {
        cursorFollower.classList.add('click');
    });

    document.addEventListener('mouseup', () => {
        cursorFollower.classList.remove('click');
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorFollower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorFollower.style.opacity = '1';
    });

    // Disable custom cursor on touch devices
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
}

// Check user's preferred color scheme
function checkPreferredColorScheme() {
    // Check if user has saved preference
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedDarkMode === null) {
        // If no saved preference, check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        darkModeSwitch.checked = prefersDarkMode;
        toggleDarkMode();
    }
}

// Load saved theme settings from localStorage
function loadThemeSettings() {
    // Dark mode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        darkModeSwitch.checked = savedDarkMode === 'true';
        toggleDarkMode();
    }

    // Grid overlay
    const savedGrid = localStorage.getItem('showGrid');
    if (savedGrid !== null) {
        gridSwitch.checked = savedGrid === 'true';
        body.classList.toggle('show-grid', gridSwitch.checked);
    }

    // Noise texture
    const savedNoise = localStorage.getItem('showNoise');
    if (savedNoise !== null) {
        noiseSwitch.checked = savedNoise === 'true';
        body.classList.toggle('show-noise', noiseSwitch.checked);
    } else {
        // Mặc định là tắt (false) nếu chưa được lưu
        noiseSwitch.checked = false;
        body.classList.remove('show-noise');
    }


    // Accent color
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary-color', savedColor);

        // Update active color option
        colorOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.color === savedColor);
        });
    }
}

// Intersection Observer for animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.skill-item, .project-card, .timeline-item, .about-stats .stat');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Call animate on scroll after DOM is loaded
document.addEventListener('DOMContentLoaded', animateOnScroll);
