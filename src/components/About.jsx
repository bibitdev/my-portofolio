/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { Download, ExternalLink, Zap } from 'lucide-react';
import { motion, useAnimation, useInView } from "framer-motion";

// ==================== CONSTANTS ====================
/**
 * Gradien default untuk efek background kartu
 * Memberikan efek radial yang mengikuti posisi pointer
 */
const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(0,0%,90%,var(--card-opacity)) 4%,hsla(0,0%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(0,0%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(0,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#ffffff44 0%,#00000000 100%),radial-gradient(100% 100% at 50% 50%,#ffffff66 1%,#00000000 76%),conic-gradient(from 124deg at 50% 50%,#ffffff77 0%,#cccccc77 40%,#cccccc77 60%,#ffffff77 100%)";

/**
 * Gradien default untuk bagian dalam kartu
 */
const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#2a2a2a8c 0%,#40404044 100%)";

/**
 * Konfigurasi durasi dan offset untuk animasi tilt card
 */
const TILT_ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

// ==================== ANIMATION VARIANTS ====================
/**
 * Variasi animasi fade in dari bawah dengan blur effect
 */
const fadeInUpVariant = {
  hidden: { 
    opacity: 0, 
    y: 80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  }
};

/**
 * Variasi animasi fade in dari kiri
 */
const fadeInLeftVariant = {
  hidden: { 
    opacity: 0, 
    x: -80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.2
    }
  }
};

/**
 * Variasi animasi fade in dari kanan
 */
const fadeInRightVariant = {
  hidden: { 
    opacity: 0, 
    x: 80,
    scale: 0.9,
    filter: "blur(4px)"
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 0.9, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    }
  }
};

/**
 * Container untuk mengelola stagger animation pada children
 */
const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================
/**
 * Membatasi nilai dalam rentang min dan max
 */
const clampValue = (value, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);

/**
 * Membulatkan angka dengan presisi tertentu
 */
const roundToDecimals = (value, precision = 3) =>
  parseFloat(value.toFixed(precision));

/**
 * Mengubah nilai dari satu rentang ke rentang lain
 */
const adjustValueRange = (
  value,
  fromMin,
  fromMax,
  toMin,
  toMax
) =>
  roundToDecimals(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

/**
 * Fungsi easing untuk animasi yang lebih smooth
 */
const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// ==================== PROFILE CARD COMPONENT ====================
const ProfileCardComponent = ({
  avatarUrl = "/images/spider.jpg",
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  name = "Bibit Raikhan Azzaki",
  title = "Full Stack Developer",
  handle = "bibitdev",
  status = "Online",
  contactText = "Contact Me",
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);

  /**
   * Membuat handler animasi untuk tilt effect
   * Mengembalikan fungsi-fungsi untuk mengupdate transform kartu
   */
  const tiltAnimationHandlers = useMemo(() => {
    if (!enableTilt) return null;

    let requestId = null;

    /**
     * Update CSS transform properties berdasarkan posisi pointer
     */
    const updateCardTransform = (
      offsetX,
      offsetY,
      cardElement,
      wrapperElement
    ) => {
      const width = cardElement.clientWidth;
      const height = cardElement.clientHeight;

      const percentX = clampValue((100 / width) * offsetX);
      const percentY = clampValue((100 / height) * offsetY);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const cssProperties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjustValueRange(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjustValueRange(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clampValue(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${roundToDecimals(-(centerX / 5))}deg`,
        "--rotate-y": `${roundToDecimals(centerY / 4)}deg`,
      };

      Object.entries(cssProperties).forEach(([property, value]) => {
        wrapperElement.style.setProperty(property, value);
      });
    };

    /**
     * Membuat animasi smooth dari posisi start ke center
     */
    const createSmoothAnimation = (
      duration,
      startX,
      startY,
      cardElement,
      wrapperElement
    ) => {
      const startTime = performance.now();
      const targetX = wrapperElement.clientWidth / 2;
      const targetY = wrapperElement.clientHeight / 2;

      const animationLoop = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = clampValue(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);

        const currentX = adjustValueRange(easedProgress, 0, 1, startX, targetX);
        const currentY = adjustValueRange(easedProgress, 0, 1, startY, targetY);

        updateCardTransform(currentX, currentY, cardElement, wrapperElement);

        if (progress < 1) {
          requestId = requestAnimationFrame(animationLoop);
        }
      };

      requestId = requestAnimationFrame(animationLoop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (requestId) {
          cancelAnimationFrame(requestId);
          requestId = null;
        }
      },
    };
  }, [enableTilt]);

  /**
   * Handler untuk mouse/pointer movement
   * Update posisi tilt berdasarkan pointer
   */
  const handlePointerMove = useCallback(
    (event) => {
      const cardElement = cardRef.current;
      const wrapperElement = wrapperRef.current;

      if (!cardElement || !wrapperElement || !tiltAnimationHandlers) return;

      const rect = cardElement.getBoundingClientRect();
      tiltAnimationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        cardElement,
        wrapperElement
      );
    },
    [tiltAnimationHandlers]
  );

  /**
   * Handler ketika pointer masuk area kartu
   * Aktifkan tilt mode dan hentikan animasi yang sedang berjalan
   */
  const handlePointerEnter = useCallback(() => {
    const cardElement = cardRef.current;
    const wrapperElement = wrapperRef.current;

    if (!cardElement || !wrapperElement || !tiltAnimationHandlers) return;

    tiltAnimationHandlers.cancelAnimation();
    wrapperElement.classList.add("active");
    cardElement.classList.add("active");
  }, [tiltAnimationHandlers]);

  /**
   * Handler ketika pointer keluar dari area kartu
   * Kembalikan kartu ke posisi center dengan animasi smooth
   */
  const handlePointerLeave = useCallback(
    (event) => {
      const cardElement = cardRef.current;
      const wrapperElement = wrapperRef.current;

      if (!cardElement || !wrapperElement || !tiltAnimationHandlers) return;

      tiltAnimationHandlers.createSmoothAnimation(
        TILT_ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        cardElement,
        wrapperElement
      );
      wrapperElement.classList.remove("active");
      cardElement.classList.remove("active");
    },
    [tiltAnimationHandlers]
  );

  /**
   * Setup event listeners untuk tilt effect dan animasi initial
   */
  useEffect(() => {
    if (!enableTilt || !tiltAnimationHandlers) return;

    const cardElement = cardRef.current;
    const wrapperElement = wrapperRef.current;

    if (!cardElement || !wrapperElement) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnter;
    const pointerLeaveHandler = handlePointerLeave;

    // Attach event listeners
    cardElement.addEventListener("pointerenter", pointerEnterHandler);
    cardElement.addEventListener("pointermove", pointerMoveHandler);
    cardElement.addEventListener("pointerleave", pointerLeaveHandler);

    // Setup posisi awal dan jalankan animasi initial
    const initialX = wrapperElement.clientWidth - TILT_ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = TILT_ANIMATION_CONFIG.INITIAL_Y_OFFSET;

    tiltAnimationHandlers.updateCardTransform(initialX, initialY, cardElement, wrapperElement);
    tiltAnimationHandlers.createSmoothAnimation(
      TILT_ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      cardElement,
      wrapperElement
    );

    return () => {
      cardElement.removeEventListener("pointerenter", pointerEnterHandler);
      cardElement.removeEventListener("pointermove", pointerMoveHandler);
      cardElement.removeEventListener("pointerleave", pointerLeaveHandler);
      tiltAnimationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    tiltAnimationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
  ]);

  /**
   * CSS custom properties untuk styling dinamis
   */
  const cardCustomStyles = useMemo(
    () => ({
      "--behind-gradient": showBehindGradient
        ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
        : "none",
      "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
      "--card-opacity": "0.8",
    }),
    [showBehindGradient, behindGradient, innerGradient]
  );

  /**
   * Handler untuk tombol contact
   */
  const handleContactButtonClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div
      ref={wrapperRef}
      className={`relative perspective-[1000px] ${className}`.trim()}
      style={{
        width: '320px',
        height: '480px',
        ...cardCustomStyles
      }}
    >
      <section 
        ref={cardRef} 
        className="relative w-full h-full cursor-pointer transition-transform duration-300 ease-out"
        style={{
          transform: 'rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background gradient layer untuk efek behind */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-90"
          style={{
            background: 'var(--behind-gradient)',
            filter: 'blur(1px)',
            transform: 'translateZ(-10px)',
          }}
        />
        
        {/* Main card container */}
        <div 
          className="relative w-full h-full rounded-3xl border border-gray-500/50 backdrop-blur-md overflow-hidden bg-gradient-to-b from-gray-900/90 to-black/95"
        >
          {/* Shine effect yang mengikuti posisi pointer */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at var(--pointer-x, 50%) var(--pointer-y, 50%), 
                           rgba(255,255,255,0.4) 0%, 
                           rgba(255,255,255,0.1) 20%, 
                           transparent 50%)`,
            }}
          />
          
          {/* Content area */}
          <div className="relative z-10 p-8 h-full flex flex-col items-center">
            {/* Header section dengan nama dan title */}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-light text-white mb-2">{name}</h3>
              <p className="text-lg text-gray-300">{title}</p>
            </div>
            
            {/* Avatar utama - dipusatkan dan diperbesar */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <img
                className="w-48 h-48 object-cover rounded-full border-2 border-white/20"
                src={avatarUrl}
                alt={`${name} avatar`}
                loading="lazy"
                style={{
                  filter: 'brightness(1.1) contrast(1.05) grayscale(0.2)',
                }}
              />
            </div>
            
            {/* Bottom section dengan user info dan tombol contact */}
            {showUserInfo && (
              <div className="w-full">
                <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-600/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-8 h-8 object-cover rounded-full border border-white/20"
                        src={avatarUrl}
                        alt={`${name} mini avatar`}
                        loading="lazy"
                        style={{ filter: 'grayscale(0.2)' }}
                      />
                      <div>
                        <div className="text-white font-medium text-sm">@{handle}</div>
                        <div className="text-gray-300 text-xs">{status}</div>
                      </div>
                    </div>
                    
                    <button
                      className="bg-gray-700/70 hover:bg-gray-600/70 rounded-lg px-4 py-2 text-white text-sm font-medium transition-all duration-200"
                      onClick={handleContactButtonClick}
                      type="button"
                    >
                      {contactText}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);

// ==================== CUSTOM HOOKS ====================
/**
 * Hook untuk scroll-triggered animation dengan kontrol yang lebih reliable
 * Menggunakan Intersection Observer untuk deteksi element masuk viewport
 */
const useScrollTriggeredAnimation = (threshold = 0.2) => {
  const elementRef = useRef(null);
  const animationControls = useAnimation();
  const isElementInView = useInView(elementRef, { 
    threshold: threshold,
    once: false,
    margin: "-100px 0px"
  });

  useEffect(() => {
    if (isElementInView) {
      animationControls.start("visible");
    } else {
      animationControls.start("hidden");
    }
  }, [animationControls, isElementInView]);

  return { 
    ref: elementRef, 
    controls: animationControls, 
    inView: isElementInView 
  };
};

// ==================== MAIN ABOUT COMPONENT ====================
/**
 * Komponen About utama yang menampilkan informasi pribadi
 * dengan animasi scroll-triggered dan interactive profile card
 */
const About = () => {
  // Setup scroll animations untuk berbagai section
  const headerScrollAnimation = useScrollTriggeredAnimation(0.1);
  const contentScrollAnimation = useScrollTriggeredAnimation(0.2);
  const cardScrollAnimation = useScrollTriggeredAnimation(0.2);

  /**
   * Handler untuk download CV
   * Membuka Google Drive dalam tab baru
   */
  const handleDownloadCV = () => {
    window.open('https://drive.google.com/drive/folders/1pUwnbGXDvZVzfdSbT8J9Dbx5a70qyBF8?usp=drive_link', '_blank');
  };

  /**
   * Function untuk scroll ke section contact dengan smooth animation
   * Menambahkan highlight effect setelah scroll selesai
   */
  const scrollToContactSection = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Optional: Highlight section contact setelah scroll
      setTimeout(() => {
        contactSection.classList.add('highlight-section');
        setTimeout(() => {
          contactSection.classList.remove('highlight-section');
        }, 2000);
      }, 500);
    }
  };

  return (
    <div id="about" className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black px-8 md:px-16 py-16 lg:py-24 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section dengan animated title */}
        <motion.div 
          ref={headerScrollAnimation.ref}
          className="text-center mb-16"
          initial="hidden"
          animate={headerScrollAnimation.controls}
          variants={fadeInUpVariant}
        >
          <motion.h1 
            className="text-7xl lg:text-8xl font-bold mb-4"
            variants={fadeInUpVariant}
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              About Me
            </span>
          </motion.h1>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-gray-300 text-lg"
            variants={fadeInUpVariant}
          >
            <span>✨</span>
            <span>Passionate about building intuitive and impactful mobile apps.</span>
            <span>✨</span>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content dengan description dan call-to-action */}
          <motion.div 
            ref={contentScrollAnimation.ref}
            className="space-y-8"
            initial="hidden"
            animate={contentScrollAnimation.controls}
            variants={staggerContainerVariant}
          >
            <motion.div variants={fadeInLeftVariant}>
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold text-white mb-6"
                variants={fadeInLeftVariant}
              >
                Hello, I'm<br />
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Bibit Raikhan Azzaki
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-gray-300 text-lg leading-relaxed mb-8"
                variants={fadeInLeftVariant}
              >
                An Informatics student passionate about full-stack and mobile application development.
                I specialize in building scalable backend systems, beautiful web interfaces, and cross-platform mobile apps,
                always striving to deliver the best user experience in every project I work on.
              </motion.p>

              {/* Quote section dengan animasi icon */}
              <motion.div 
                className="bg-gradient-to-r from-gray-900/40 to-black/40 border border-gray-600/40 rounded-2xl p-6 mb-8 backdrop-blur-sm w-fit"
                variants={fadeInLeftVariant}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <p className="text-gray-200 italic text-lg flex items-center whitespace-nowrap">
                  <motion.span 
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Zap className="w-5 h-5 mr-2 flex-shrink-0" />
                  </motion.span>
                  "AI as the brush, humans as the artist."
                </p>
              </motion.div>

              {/* Download CV Button */}
              <motion.div 
                className="flex justify-center sm:justify-start"
                variants={fadeInLeftVariant}
              >
                <motion.button 
                  onClick={handleDownloadCV}
                  className="flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-200 rounded-full text-black font-semibold transition-all hover:scale-105 shadow-lg shadow-white/25"
                  variants={fadeInLeftVariant}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                  </motion.div>
                  Get My Resume
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive ProfileCard */}
          <motion.div 
            ref={cardScrollAnimation.ref}
            className="flex justify-center lg:justify-end"
            initial="hidden"
            animate={cardScrollAnimation.controls}
            variants={fadeInRightVariant}
          >
            <motion.div 
              className="w-80 h-96 lg:w-96 lg:h-[500px] relative flex items-center justify-center"
              variants={fadeInRightVariant}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <ProfileCard 
                name="Bibit Raikhan Azzaki"
                title="Full Stack Developer"
                handle="bibitdev"
                status="Online"
                contactText="Contact Me"
                avatarUrl="/images/spider.jpg"
                showUserInfo={true}
                enableTilt={true}
                onContactClick={scrollToContactSection}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements untuk visual enhancement */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary floating orbs dengan timing berbeda */}
          <motion.div
            className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-3 h-3 bg-gray-400/30 rounded-full blur-sm"
            animate={{
              y: [0, 20, 0],
              x: [0, -12, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-2 h-2 bg-white/40 rounded-full blur-sm"
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
          
          {/* Additional floating particles untuk efek lebih dinamis */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-1 h-1 bg-gray-300/50 rounded-full blur-sm"
            animate={{
              y: [0, -25, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white/40 rounded-full blur-sm"
            animate={{
              y: [0, 18, 0],
              x: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2],
              rotate: [360, 0, 360],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default About;