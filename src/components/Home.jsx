/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useCallback, useMemo, useState, createElement, memo } from 'react';
import { Github, Linkedin, Instagram, ExternalLink, Mail, Settings, Download, Cloud } from 'lucide-react';

// ================================
// CONSTANTS & CONFIGURATION
// ================================

const TECH_STACK = [
  { name: "Flutter", link: "https://flutter.dev/" },
  { name: "React", link: "https://react.dev/" },
  { name: "Laravel", link: "https://laravel.com/" },
  { name: "Kotlin", link: "https://kotlinlang.org/" },
  { name: "TypeScript", link: "https://www.typescriptlang.org/" }
];

const SOCIAL_LINKS = [
  { icon: Github, link: "https://github.com/bibitdev" },
  { icon: Linkedin, link: "https://www.linkedin.com/in/bibit-raikhan-azzaki/" },
  { icon: Instagram, link: "https://www.instagram.com/raikhanazzz/" }
];

const TYPING_ANIMATION_CONFIG = {
  DEFAULT_TYPING_SPEED: 50,
  DEFAULT_DELETING_SPEED: 30,
  DEFAULT_PAUSE_DURATION: 2000,
  CURSOR_BLINK_DURATION: 0.5,
  INTERSECTION_THRESHOLD: 0.1
};

const CURSOR_CONFIG = {
  BORDER_WIDTH: 3,
  CORNER_SIZE: 12,
  PARALLAX_STRENGTH: 0.00005
};

// ================================
// TYPING ANIMATION COMPONENT
// ================================

/**
 * TextType - Komponen untuk membuat efek animasi typing/mengetik
 * Mendukung multiple teks, kustomisasi kecepatan, dan berbagai opsi animasi
 */
const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = TYPING_ANIMATION_CONFIG.DEFAULT_TYPING_SPEED,
  initialDelay = 0,
  pauseDuration = TYPING_ANIMATION_CONFIG.DEFAULT_PAUSE_DURATION,
  deletingSpeed = TYPING_ANIMATION_CONFIG.DEFAULT_DELETING_SPEED,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = TYPING_ANIMATION_CONFIG.CURSOR_BLINK_DURATION,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  // State untuk mengatur kondisi animasi typing
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const textArray = Array.isArray(text) ? text : [text];

  /**
   * Menghasilkan kecepatan typing random untuk efek yang lebih natural
   */
  const getRandomTypingSpeed = () => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  };

  /**
   * Mendapatkan warna teks berdasarkan indeks saat ini
   */
  const getCurrentTextColor = () => {
    if (textColors.length === 0) return "#ffffff";
    return textColors[currentTextIndex % textColors.length];
  };

  /**
   * Observer untuk memulai animasi ketika elemen terlihat di viewport
   */
  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: TYPING_ANIMATION_CONFIG.INTERSECTION_THRESHOLD }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  /**
   * Mengatur animasi berkedip pada cursor
   */
  useEffect(() => {
    if (showCursor && cursorRef.current) {
      const blinkInterval = setInterval(() => {
        if (cursorRef.current) {
          cursorRef.current.style.opacity = 
            cursorRef.current.style.opacity === '0' ? '1' : '0';
        }
      }, cursorBlinkDuration * 1000);

      return () => clearInterval(blinkInterval);
    }
  }, [showCursor, cursorBlinkDuration]);

  /**
   * Logic utama untuk menjalankan animasi typing dan deleting
   */
  useEffect(() => {
    if (!isVisible) return;

    let timeout;

    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        // Mode deleting - menghapus karakter dari belakang
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => { }, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        // Mode typing - menambahkan karakter satu per satu
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText(
                (prev) => prev + processedText[currentCharIndex]
              );
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomTypingSpeed() : typingSpeed
          );
        } else if (textArray.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    // Memberikan delay awal sebelum mulai animasi
    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `inline-block whitespace-pre-wrap tracking-tight ${className}`,
      ...props,
    },
    React.createElement('span', { 
      className: "inline", 
      style: { color: getCurrentTextColor() } 
    }, displayedText),
    showCursor && React.createElement('span', {
      ref: cursorRef,
      className: `ml-1 inline-block opacity-100 ${shouldHideCursor ? "hidden" : ""} ${cursorClassName}`
    }, cursorCharacter)
  );
};

// ================================
// UI COMPONENTS (MEMOIZED)
// ================================

/**
 * Badge status yang menampilkan indikator aktif
 */
const StatusBadge = memo(() => (
  <div className="inline-flex items-center px-4 py-2 bg-gray-800/20 border border-gray-600/40 rounded-full text-gray-300 text-sm backdrop-blur-sm" data-aos="zoom-in" data-aos-delay="800">
    <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
    Turning Ideas into Apps
  </div>
));

/**
 * Komponen judul utama dengan gradient styling
 */
const MainTitle = memo(() => (
  <div className="space-y-2" data-aos="fade-up" data-aos-delay="1200">
    <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
      Full Stack &
    </h1>
    <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent leading-tight">
      Mobile Developer
    </h1>
  </div>
));

/**
 * Komponen untuk menampilkan technology stack dengan link
 */
const TechStackItem = memo(({ tech, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <div className="cursor-target px-5 py-2 rounded-full bg-gray-800/40 border border-gray-600/50 text-sm text-gray-200 backdrop-blur-sm hover:bg-gray-700/40 transition-colors">
      {tech}
    </div>
  </a>
));

/**
 * Tombol Call-to-Action dengan icon
 */
const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="cursor-target flex items-center justify-center px-8 py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-full text-white font-medium transition-all hover:scale-105 backdrop-blur-sm">
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </button>
  </a>
));

/**
 * Link sosial media dengan hover effects
 */
const SocialLink = memo(({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <button className="cursor-target p-3 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-300 hover:text-white transition-all backdrop-blur-sm hover:scale-110">
      <Icon className="w-5 h-5" />
    </button>
  </a>
));

// ================================
// CUSTOM CURSOR COMPONENT
// ================================

/**
 * TargetCursor - Komponen kursor kustom dengan animasi targeting
 * Hanya aktif di section home dan menghindari elemen navigasi
 */
const TargetCursor = ({
  targetSelector = ".cursor-target",
  scopeSelector = "#home",
  excludeSelectors = ["nav", "header", ".navbar", ".nav"],
  spinDuration = 2,
  hideDefaultCursor = true,
  isActive = true,
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const dotRef = useRef(null);
  const scopeElement = useRef(null);
  
  const cursorConstants = useMemo(
    () => ({
      borderWidth: CURSOR_CONFIG.BORDER_WIDTH,
      cornerSize: CURSOR_CONFIG.CORNER_SIZE,
      parallaxStrength: CURSOR_CONFIG.PARALLAX_STRENGTH,
    }),
    []
  );

  /**
   * Memindahkan posisi kursor ke koordinat yang diberikan
   */
  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  /**
   * Mengecek apakah kursor berada dalam scope yang diizinkan
   * dan tidak berada di elemen yang dikecualikan
   */
  const isWithinAllowedScope = useCallback((x, y) => {
    if (!scopeElement.current) return false;
    
    // Cek apakah berada dalam batas section home
    const rect = scopeElement.current.getBoundingClientRect();
    const inHomeBounds = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    
    if (!inHomeBounds) return false;
    
    // Cek apakah hover di elemen yang dikecualikan
    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return false;
    
    // Periksa apakah elemen atau parent-nya cocok dengan selector yang dikecualikan
    for (const selector of excludeSelectors) {
      if (elementAtPoint.closest(selector)) {
        return false;
      }
    }
    
    return true;
  }, [excludeSelectors]);

  /**
   * Setup event listeners dan logic untuk kursor kustom
   */
  useEffect(() => {
    if (!cursorRef.current) return;

    // Dapatkan elemen scope (section home)
    scopeElement.current = document.querySelector(scopeSelector);
    if (!scopeElement.current) return;

    const originalCursor = document.body.style.cursor;
    
    // Jika tidak aktif, kembalikan ke cursor default
    if (!isActive) {
      document.body.style.cursor = originalCursor;
      if (cursorRef.current) {
        cursorRef.current.style.opacity = '0';
      }
      return;
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll(".target-cursor-corner");

    let activeTarget = null;
    let currentTargetMoveHandler = null;
    let currentLeaveHandler = null;
    let isInScope = false;

    /**
     * Membersihkan event listeners dari target yang sedang aktif
     */
    const cleanupTargetListeners = (target) => {
      if (currentTargetMoveHandler) {
        target.removeEventListener("mousemove", currentTargetMoveHandler);
      }
      if (currentLeaveHandler) {
        target.removeEventListener("mouseleave", currentLeaveHandler);
      }
      currentTargetMoveHandler = null;
      currentLeaveHandler = null;
    };

    // Set posisi awal cursor
    cursor.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px)`;

    /**
     * Handler untuk pergerakan mouse global
     */
    const globalMouseMoveHandler = (e) => {
      const withinScope = isWithinAllowedScope(e.clientX, e.clientY);
      
      if (withinScope) {
        if (!isInScope) {
          // Masuk ke scope - tampilkan cursor kustom
          if (hideDefaultCursor) {
            document.body.style.cursor = 'none';
          }
          cursor.style.opacity = '1';
          isInScope = true;
        }
        moveCursor(e.clientX, e.clientY);
      } else {
        if (isInScope) {
          // Keluar dari scope - sembunyikan cursor kustom
          document.body.style.cursor = originalCursor;
          cursor.style.opacity = '0';
          isInScope = false;
          
          // Bersihkan target aktif
          if (activeTarget) {
            cleanupTargetListeners(activeTarget);
            activeTarget = null;
            
            // Reset posisi corners ke default
            resetCornersToDefault();
          }
        }
      }
    };

    /**
     * Reset posisi corners ke posisi default
     */
    const resetCornersToDefault = () => {
      if (cornersRef.current) {
        const corners = Array.from(cornersRef.current);
        const { cornerSize } = cursorConstants;
        const defaultPositions = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
        ];

        corners.forEach((corner, index) => {
          corner.style.transform = `translate(${defaultPositions[index].x}px, ${defaultPositions[index].y}px)`;
        });
      }
    };

    /**
     * Handler untuk mouse enter ke target elements
     */
    const targetEnterHandler = (e) => {
      // Hanya bekerja jika dalam scope yang diizinkan
      if (!isWithinAllowedScope(e.clientX, e.clientY)) return;
      
      const directTarget = e.target;

      // Double check - pastikan target tidak dalam elemen yang dikecualikan
      for (const selector of excludeSelectors) {
        if (directTarget.closest(selector)) {
          return;
        }
      }

      // Pastikan target berada dalam scope element
      if (!scopeElement.current.contains(directTarget)) return;

      // Cari target yang cocok dengan selector
      const allTargets = [];
      let current = directTarget;
      while (current && current !== scopeElement.current) {
        if (current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }

      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;

      if (activeTarget === target) return;

      if (activeTarget) {
        cleanupTargetListeners(activeTarget);
      }

      activeTarget = target;

      /**
       * Update posisi corners berdasarkan posisi target element
       */
      const updateCornerPositions = () => {
        const rect = target.getBoundingClientRect();
        const cursorRect = cursorRef.current.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner] = Array.from(cornersRef.current);

        const { borderWidth, cornerSize } = cursorConstants;

        const cornerOffsets = [
          {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.top - cursorCenterY - borderWidth,
          },
          {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.top - cursorCenterY - borderWidth,
          },
          {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
          },
          {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize,
          },
        ];

        const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];
        corners.forEach((corner, index) => {
          corner.style.transform = `translate(${cornerOffsets[index].x}px, ${cornerOffsets[index].y}px)`;
        });
      };

      updateCornerPositions();

      const targetMoveHandler = () => updateCornerPositions();

      const targetLeaveHandler = () => {
        activeTarget = null;
        resetCornersToDefault();
        cleanupTargetListeners(target);
      };

      currentTargetMoveHandler = targetMoveHandler;
      currentLeaveHandler = targetLeaveHandler;

      target.addEventListener("mousemove", targetMoveHandler);
      target.addEventListener("mouseleave", targetLeaveHandler);
    };

    window.addEventListener("mousemove", globalMouseMoveHandler);
    window.addEventListener("mouseover", targetEnterHandler, { passive: true });

    return () => {
      window.removeEventListener("mousemove", globalMouseMoveHandler);
      window.removeEventListener("mouseover", targetEnterHandler);

      if (activeTarget) {
        cleanupTargetListeners(activeTarget);
      }

      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, scopeSelector, spinDuration, moveCursor, cursorConstants, hideDefaultCursor, isActive, isWithinAllowedScope, excludeSelectors]);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2"
      style={{ willChange: 'transform', opacity: 0 }}
    >
      <div
        ref={dotRef}
        className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform translate-x-1/2 translate-y-1/2 border-l-0 border-t-0"
        style={{ willChange: 'transform' }}
      />
      <div
        className="target-cursor-corner absolute left-1/2 top-1/2 w-3 h-3 border-[3px] border-white transform -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

// ================================
// ILLUSTRATION COMPONENTS
// ================================

/**
 * Komponen monitor/layar dengan konten kode Flutter/Dart
 */
const CodeMonitorIllustration = memo(() => (
  <div className="absolute top-16 left-16 w-72 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-600/50 shadow-2xl transform rotate-6 hover:rotate-3 transition-all duration-500 hover:scale-105 animate-float">
    {/* Header monitor dengan control buttons */}
    <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
      </div>
      <div className="text-xs text-gray-400 animate-pulse">main.dart</div>
    </div>
    
    {/* Konten kode Flutter/Dart */}
    <div className="p-4 space-y-1 font-mono text-xs">
      <div className="flex items-center space-x-1">
        <span className="text-white">void</span>
        <span className="text-gray-200">main</span>
        <span className="text-gray-300">{'() {'}</span>
      </div>
      <div className="pl-4 flex items-center space-x-1">
        <span className="text-gray-200">runApp</span>
        <span className="text-gray-300">(</span>
        <span className="text-white">const</span>
        <span className="text-gray-100">MyApp</span>
        <span className="text-gray-300">());</span>
      </div>
      <div className="text-gray-300">{'}'}</div>
      <div className="flex items-center space-x-1 pt-1">
        <span className="text-white">class</span>
        <span className="text-gray-200">MyApp</span>
        <span className="text-white">extends</span>
        <span className="text-gray-100">StatelessWidget</span>
        <span className="text-gray-300">{'{'}</span>
      </div>
      <div className="pl-4 space-y-1">
        <div className="flex items-center space-x-1">
          <span className="text-gray-200">Widget</span>
          <span className="text-white">build</span>
          <span className="text-gray-300">(</span>
          <span className="text-gray-100">BuildContext</span>
          <span className="text-gray-300">ctx)</span>
          <span className="text-gray-300">{'{'}</span>
        </div>
        <div className="pl-4 flex items-center space-x-1">
          <span className="text-white">return</span>
          <span className="text-gray-200">MaterialApp</span>
          <span className="text-gray-300">(</span>
          <span className="text-gray-100">home:</span>
          <span className="text-gray-200">HomeScreen</span>
          <span className="text-gray-300">());</span>
        </div>
        <div className="text-gray-300">{'}'}</div>
      </div>
      <div className="text-gray-300">{'}'}</div>
    </div>
  </div>
));

/**
 * Komponen ilustrasi smartphone dengan konten UI
 */
const SmartphoneIllustration = memo(() => (
  <div className="absolute bottom-12 right-12 w-24 h-44 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-gray-600/50 shadow-2xl transform -rotate-12 hover:-rotate-6 transition-all duration-500 hover:scale-105 animate-float-delayed">
    {/* Notch smartphone */}
    <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto mt-2"></div>
    
    {/* Layar smartphone dengan konten */}
    <div className="w-20 h-36 bg-gradient-to-br from-white/10 to-gray-200/10 rounded-xl mx-auto mt-2 p-2">
      <div className="w-full h-6 bg-gradient-to-r from-white to-gray-200 rounded-lg mb-2 animate-pulse"></div>
      <div className="space-y-1">
        <div className="h-2 bg-gray-600/50 rounded w-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
        <div className="h-2 bg-gray-600/50 rounded w-3/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="h-2 bg-gray-600/50 rounded w-1/2 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="h-2 bg-gray-600/50 rounded w-2/3 animate-pulse" style={{animationDelay: '0.4s'}}></div>
      </div>
      
      {/* Grid icon aplikasi dengan animasi staggered */}
      <div className="grid grid-cols-3 gap-1 mt-4">
        <div className="w-3 h-3 bg-gray-300 rounded animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-3 h-3 bg-white rounded animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-3 h-3 bg-gray-400 rounded animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="w-3 h-3 bg-gray-200 rounded animate-bounce" style={{animationDelay: '0.4s'}}></div>
        <div className="w-3 h-3 bg-white rounded animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="w-3 h-3 bg-gray-300 rounded animate-bounce" style={{animationDelay: '0.6s'}}></div>
      </div>
    </div>
  </div>
));

/**
 * Elemen floating dengan berbagai icon dan shapes untuk dekorasi
 */
const FloatingElements = memo(() => (
  <>
    {/* Code brackets */}
    <div className="absolute top-8 right-8 text-4xl font-bold text-white/60 animate-bounce hover:text-white transition-colors duration-300">
      &lt;/&gt;
    </div>

    {/* Gear icons dengan rotasi berbeda */}
    <div className="absolute top-12 left-8 text-gray-400/60 animate-spin hover:text-gray-300 transition-colors duration-300" style={{animationDuration: '8s'}}>
      <Settings className="w-12 h-12" />
    </div>
    
    <div className="absolute bottom-8 left-8 text-gray-500/40 animate-spin hover:text-gray-400 transition-colors duration-300" style={{animationDuration: '12s', animationDirection: 'reverse'}}>
      <Settings className="w-8 h-8" />
    </div>

    {/* Download/Cloud icons */}
    <div className="absolute top-32 right-4 text-gray-300/60 animate-bounce hover:text-white transition-colors duration-300" style={{animationDelay: '1s'}}>
      <Download className="w-6 h-6" />
    </div>
    
    <div className="absolute bottom-32 left-4 text-gray-200/60 animate-bounce hover:text-white transition-colors duration-300" style={{animationDelay: '2s'}}>
      <Cloud className="w-6 h-6" />
    </div>

    {/* Geometric shapes floating */}
    <div className="absolute top-20 left-32 w-6 h-6 bg-gradient-to-br from-white to-gray-300 rounded-lg animate-bounce transform rotate-45 hover:scale-110 transition-transform duration-300" style={{animationDelay: '0.5s'}}></div>
    <div className="absolute bottom-20 right-32 w-4 h-4 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full animate-bounce hover:scale-110 transition-transform duration-300" style={{animationDelay: '1.5s'}}></div>
    <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-br from-white to-gray-200 rotate-45 animate-bounce hover:scale-110 transition-transform duration-300" style={{animationDelay: '2.5s'}}></div>

    {/* Elemen glow vertical */}
    <div className="absolute top-1/2 left-0 w-2 h-8 bg-gradient-to-b from-white/60 to-transparent rounded-full animate-pulse hover:from-white/80 transition-colors duration-300"></div>
    <div className="absolute top-1/3 right-0 w-2 h-6 bg-gradient-to-b from-gray-300/60 to-transparent rounded-full animate-pulse hover:from-gray-200/80 transition-colors duration-300" style={{animationDelay: '1s'}}></div>
  </>
));

/**
 * Background glow effects untuk memberikan atmosfer visual
 */
const BackgroundGlowEffects = memo(() => (
  <>
    <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-white/10 to-gray-200/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-gray-300/10 to-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
  </>
));

/**
 * Komponen ilustrasi kompleks yang menggabungkan semua elemen visual
 */
const ComplexIllustration = memo(() => (
  <div className="w-full lg:w-1/2 h-auto lg:h-[600px] xl:h-[750px] relative flex items-center justify-center order-2 lg:order-2"
    data-aos="fade-left"
    data-aos-delay="1000">
    
    <div className="relative w-96 h-96 lg:w-[500px] lg:h-[500px]">
      <BackgroundGlowEffects />
      <CodeMonitorIllustration />
      <SmartphoneIllustration />
      <FloatingElements />
    </div>
  </div>
));

// ================================
// CONTENT SECTIONS
// ================================

/**
 * Section konten teks utama di sisi kiri
 */
const MainContentSection = memo(() => (
  <div className="w-full lg:w-1/2 space-y-8 text-left order-1 lg:order-1 pt-24"
    data-aos="fade-right"
    data-aos-delay="400">
    
    <StatusBadge />
    <MainTitle />

    {/* Subtitle dengan animasi typing */}
    <div className="text-2xl text-gray-300 font-medium" data-aos="fade-up" data-aos-delay="1600">
      <TextType 
        text={["Full Stack Developer", "Mobile Developer", "Tech Enthusiast"]}
        typingSpeed={75}
        pauseDuration={2000}
        deletingSpeed={50}
        showCursor={true}
        cursorCharacter="|"
        cursorClassName="text-white animate-pulse"
        className="text-2xl text-gray-300 font-medium"
        loop={true}
      />
    </div>

    {/* Deskripsi singkat */}
    <p className="text-gray-300 text-lg leading-relaxed max-w-lg"
      data-aos="fade-up"
      data-aos-delay="2000">
      Crafting beautiful interfaces and powerful mobile experiences with passion and precision.
    </p>

    {/* Technology stack display */}
    <div className="flex flex-wrap gap-3 justify-start" data-aos="fade-up" data-aos-delay="2400">
      {TECH_STACK.map((tech, index) => (
        <TechStackItem key={index} tech={tech.name} link={tech.link} />
      ))}
    </div>

    {/* Call-to-action buttons */}
    <div className="flex flex-row gap-4 w-full justify-start" data-aos="fade-up" data-aos-delay="2800">
      <CTAButton href="#portfolio" text="Projects" icon={ExternalLink} />
      <CTAButton href="#contact" text="Contact" icon={Mail} />
    </div>

    {/* Social media links */}
    <div className="flex gap-4 justify-start" data-aos="fade-up" data-aos-delay="3200">
      {SOCIAL_LINKS.map((social, index) => (
        <SocialLink key={index} {...social} />
      ))}
    </div>
  </div>
));

// ================================
// ANIMATION SYSTEM
// ================================

/**
 * Hook untuk mengelola animasi AOS (Animate On Scroll)
 */
const useAOSAnimations = () => {
  useEffect(() => {
    // Setup sistem animasi mirip AOS
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-aos-delay') || 0;
          const animation = entry.target.getAttribute('data-aos') || 'fade-up';
          
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, parseInt(delay));
        }
      });
    }, observerOptions);

    // Observe semua elemen dengan data-aos attribute
    document.querySelectorAll('[data-aos]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
};

/**
 * Hook untuk mendeteksi apakah user sedang berada di section home
 */
const useHomeSectionDetection = () => {
  const [isInHomeSection, setIsInHomeSection] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const rect = homeSection.getBoundingClientRect();
        const isInView = rect.top <= 100 && rect.bottom >= 100;
        setIsInHomeSection(isInView);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isInHomeSection;
};

// ================================
// MAIN HOME COMPONENT
// ================================

/**
 * Komponen utama Home - Landing page dengan hero section
 * Menggabungkan semua elemen: konten, ilustrasi, animasi, dan cursor kustom
 */
const Home = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const isInHomeSection = useHomeSectionDetection();
  
  // Setup animasi loading page
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  // Setup sistem animasi
  useAOSAnimations();

  return (
    <>
      {/* Cursor kustom yang hanya aktif di section home */}
      <TargetCursor 
        targetSelector=".cursor-target" 
        scopeSelector="#home"
        excludeSelectors={["nav", "header", ".navbar", ".nav", ".navigation"]}
        spinDuration={2} 
        hideDefaultCursor={true}
        isActive={isInHomeSection}
      />
      
      {/* Container utama dengan background gradient */}
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black overflow-hidden px-8 md:px-16" id="home">
        <div className={`relative z-10 transition-all duration-1000 ${isPageLoaded ? "opacity-100" : "opacity-0"}`}>
          <div className="container mx-auto min-h-screen">
            <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-12 lg:gap-20">
              
              <MainContentSection />
              <ComplexIllustration />
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Home);

// ================================
// CUSTOM CSS ANIMATIONS
// ================================

/**
 * Menambahkan custom CSS animations ke DOM
 * Termasuk floating, AOS-like animations, dan page load effects
 */
const addCustomAnimationsToDOM = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Floating animations untuk elemen ilustrasi */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(6deg); }
      50% { transform: translateY(-10px) rotate(6deg); }
    }
    
    @keyframes float-delayed {
      0%, 100% { transform: translateY(0px) rotate(-12deg); }
      50% { transform: translateY(-8px) rotate(-12deg); }
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-float-delayed {
      animation: float-delayed 8s ease-in-out infinite;
      animation-delay: 2s;
    }
    
    .animate-blink {
      animation: blink 1s infinite;
    }
    
    /* Sistem animasi mirip AOS untuk scroll-triggered animations */
    [data-aos] {
      opacity: 0;
      transition-property: opacity, transform;
      transition-duration: 1.2s;
      transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    [data-aos="fade-up"] {
      transform: translateY(30px);
    }
    
    [data-aos="fade-right"] {
      transform: translateX(-30px);
    }
    
    [data-aos="fade-left"] {
      transform: translateX(30px);
    }
    
    [data-aos="zoom-in"] {
      transform: scale(0.8);
    }
    
    [data-aos].aos-animate {
      opacity: 1;
      transform: translateX(0) translateY(0) scale(1);
    }
    
    /* Animasi loading halaman yang smooth */
    .animate-page-load {
      animation: pageLoad 1s ease-out forwards;
    }
    
    @keyframes pageLoad {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
};

// Eksekusi penambahan CSS animations
addCustomAnimationsToDOM();