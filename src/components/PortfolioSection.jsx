/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useMemo, Children, cloneElement } from 'react';
import {
  ExternalLink,
  Github,
  Eye,
  Star,
  GitFork,
  Award,
  Code,
  Monitor,
  Database,
  Smartphone,
  Globe,
  Palette,
  Settings
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useInView,
  useAnimation,
} from "framer-motion";

// ========== ANIMATION CONFIGURATIONS ==========
// Predefined animation variants for consistent motion across components

/** Standard fade-in animation with upward motion and blur effect */
const FADE_IN_UP_ANIMATION = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.9,
    filter: "blur(6px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

/** Scale animation with 3D rotation for enhanced visual appeal */
const FADE_IN_SCALE_ANIMATION = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: 15,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

/** Container animation for staggered children animations */
const STAGGER_CONTAINER_ANIMATION = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/** Individual card animation for grid items */
const CARD_ANIMATION_VARIANT = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

/** Dock-specific animation with delayed entrance */
const DOCK_ANIMATION_VARIANT = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    }
  }
};

// ========== CUSTOM HOOKS ==========

/**
 * Hook for triggering animations based on scroll position
 * Provides more reliable scroll detection with configurable thresholds
 * @param {number} threshold - Intersection threshold (0-1)
 * @returns {Object} - ref, controls, and inView state
 */
const useScrollTriggeredAnimation = (threshold = 0.1) => {
  const elementRef = useRef(null);
  const animationControls = useAnimation();
  const isElementInView = useInView(elementRef, {
    threshold: threshold,
    once: false, // Allow re-triggering for dynamic effects
    margin: "-100px 0px" // Trigger animation earlier for smoother experience
  });

  useEffect(() => {
    if (isElementInView) {
      animationControls.start("visible");
    } else {
      animationControls.start("hidden"); // Reset when out of view for re-animation
    }
  }, [animationControls, isElementInView]);

  return {
    ref: elementRef,
    controls: animationControls,
    inView: isElementInView
  };
};

// ========== UTILITY COMPONENTS ==========

/**
 * Fallback component for tech logos when images fail to load
 * Provides graceful degradation with styled placeholder
 */
const TechLogoWithFallback = ({ logoUrl, altText, fallbackText }) => {
  const [hasImageError, setHasImageError] = useState(false);

  // Show fallback if image failed to load or no URL provided
  if (hasImageError || !logoUrl) {
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white text-lg font-bold">
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={altText}
      className="w-12 h-12 object-contain"
      onError={() => setHasImageError(true)}
    />
  );
};

// ========== DOCK COMPONENTS ==========

/**
 * Individual dock item with magnification effect on hover
 * Handles mouse proximity calculations for smooth scaling animation
 */
function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  springConfig,
  magneticDistance,
  maxMagnification,
  defaultItemSize,
}) {
  const itemRef = useRef(null);
  const hoverState = useMotionValue(0);

  // Calculate distance from mouse for magnification effect
  const mouseDistanceFromItem = useTransform(mouseX, (mouseXValue) => {
    const itemBounds = itemRef.current?.getBoundingClientRect() ?? {
      x: 0,
      width: defaultItemSize,
    };
    return mouseXValue - itemBounds.x - defaultItemSize / 2;
  });

  // Apply magnification based on mouse distance
  const targetItemSize = useTransform(
    mouseDistanceFromItem,
    [-magneticDistance, 0, magneticDistance],
    [defaultItemSize, maxMagnification, defaultItemSize]
  );
  const animatedSize = useSpring(targetItemSize, springConfig);

  return (
    <motion.div
      ref={itemRef}
      style={{
        width: animatedSize,
        height: animatedSize,
      }}
      onHoverStart={() => hoverState.set(1)}
      onHoverEnd={() => hoverState.set(0)}
      onFocus={() => hoverState.set(1)}
      onBlur={() => hoverState.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-600/50 backdrop-blur-md shadow-lg hover:border-white/50 transition-all duration-300 cursor-pointer ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
      }}
      whileTap={{ scale: 0.95 }}
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered: hoverState })
      )}
    </motion.div>
  );
}

/**
 * Tooltip label that appears on dock item hover
 * Uses motion values to show/hide with smooth animations
 */
function DockLabel({ children, className = "", ...rest }) {
  const { isHovered } = rest;
  const [shouldShowLabel, setShouldShowLabel] = useState(false);

  // Subscribe to hover state changes
  useEffect(() => {
    const unsubscribeFromHover = isHovered.on("change", (latestValue) => {
      setShouldShowLabel(latestValue === 1);
    });
    return () => unsubscribeFromHover();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {shouldShowLabel && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -15, scale: 1 }}
          exit={{ opacity: 0, y: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`${className} absolute -top-12 left-1/2 w-fit whitespace-pre rounded-lg border border-white/50 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 text-sm text-white shadow-xl shadow-white/10`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Icon wrapper with active state styling
 * Provides visual feedback for current tab selection
 */
function DockIcon({ children, className = "", isActive = false }) {
  return (
    <motion.div
      className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-300'
        } ${className}`}
      animate={{
        color: isActive ? "rgb(255 255 255)" : "rgb(209 213 219)",
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Main dock component with macOS-style magnification
 * Provides navigation between different portfolio sections
 */
function NavigationDock({
  items,
  className = "",
  springConfig = { mass: 0.1, stiffness: 150, damping: 12 },
  maxMagnification = 80,
  magneticDistance = 200,
  panelHeight = 70,
  dockHeight = 256,
  defaultItemSize = 60,
}) {
  const mouseXPosition = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  // Calculate maximum height needed for magnification effect
  const maxRequiredHeight = useMemo(
    () => Math.max(panelHeight, maxMagnification + 20),
    [maxMagnification, panelHeight]
  );

  return (
    <div className="flex justify-center items-center w-full mb-16">
      <div
        style={{ height: maxRequiredHeight, scrollbarWidth: "none" }}
        className="flex items-center justify-center"
      >
        <motion.div
          onMouseMove={({ pageX }) => {
            isHovered.set(1);
            mouseXPosition.set(pageX);
          }}
          onMouseLeave={() => {
            isHovered.set(0);
            mouseXPosition.set(Infinity);
          }}
          className={`${className} flex items-center justify-center w-fit gap-4 rounded-3xl border-2 border-slate-600/50 bg-slate-800/40 backdrop-blur-md py-3 px-6 shadow-2xl shadow-white/5`}
          style={{ height: panelHeight }}
          role="toolbar"
          aria-label="Portfolio navigation dock"
          whileHover={{
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 50px rgba(255, 255, 255, 0.1)"
          }}
          transition={{ duration: 0.3 }}
        >
          {items.map((item, index) => (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseXPosition}
              springConfig={springConfig}
              magneticDistance={magneticDistance}
              maxMagnification={maxMagnification}
              defaultItemSize={defaultItemSize}
            >
              <DockIcon isActive={item.isActive}>{item.icon}</DockIcon>
              <DockLabel>{item.label}</DockLabel>
            </DockItem>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ========== DATA CONFIGURATIONS ==========

/**
 * Portfolio projects data with metadata and links
 * Centralized data structure for easy maintenance
 */
const PROJECT_DATA = [
  {
    id: 1,
    title: "Wisata POS",
    description: "A comprehensive point-of-sale (POS) cashier application designed for tourist attractions. Features include an integrated analytics dashboard for tracking ticket sales, monitoring visitor trends, and managing real-time business performance.",
    technologies: ["Flutter", "Laravel", "MySQL"],
    category: "Desktop and Mobile",
    repositoryUrl: "https://github.com/bibitdev/flutter-wisata-app",
    isFeatured: false,
    githubStats: { stars: 24, forks: 8 },
    previewImage: "/images/projects/flutter.png",
    imageContain: false
  },
  {
    id: 2,
    title: "BMS Trip",
    description: "A web platform for discovering tourist destinations across Banyumas Regency, Central Java. Provides comprehensive information on local attractions including locations, descriptions, and travel tips for visitors.",
    technologies: ["Laravel", "MySQL", "Docker"],
    category: "Web",
    repositoryUrl: "https://github.com/bibitdev/laravel-bmstrip",
    isFeatured: true,
    githubStats: { stars: 32, forks: 10 },
    previewImage: "/images/projects/bmstrip.png",
    imageContain: true
  },
  {
    id: 3,
    title: "Hayak AI",
    description: "A mobile app designed to prevent crime with an emergency scream-for-help feature. Built to quickly enhance user safety with a single SOS button powered by machine learning.",
    technologies: ["Kotlin", "Machine Learning", "Google Cloud"],
    category: "Mobile",
    repositoryUrl: "https://github.com/Hayak-AI",
    isFeatured: false,
    githubStats: { stars: 18, forks: 6 },
    previewImage: "/images/projects/hayak.png",
    imageContain: true
  }
];

/**
 * Professional certificates data with verification links
 * Each certificate includes issuer, date, and credential verification
 */
const CERTIFICATE_DATA = [
  {
    id: 1,
    title: "Memulai Pemrograman dengan Kotlin",
    issuer: "Dicoding",
    issuedDate: "19 September 2024",
    credentialId: "NVP7QM4VGZR0",
    certificateImage: "/images/certificates/dcgkotlinmemulai.png",
    verificationUrl: "https://www.dicoding.com/certificates/NVP7QM4VGZR0"
  },
  {
    id: 2,
    title: "Belajar Membuat Aplikasi Android untuk Pemula",
    issuer: "Dicoding",
    issuedDate: "30 September 2024",
    credentialId: "QLZ9VK2YEX5D",
    certificateImage: "/images/certificates/dcgkotlinpemula.png",
    verificationUrl: "https://www.dicoding.com/certificates/QLZ9VK2YEX5D"
  },
  {
    id: 3,
    title: "Belajar Fundamental Aplikasi Android",
    issuer: "Dicoding",
    issuedDate: "21 Oktober 2024",
    credentialId: "N9ZOYM4N6PG5",
    certificateImage: "/images/certificates/dcgkotlinfundamental.jpg",
    verificationUrl: "https://www.dicoding.com/certificates/N9ZOYM4N6PG5"
  },
  {
    id: 4,
    title: "Belajar Pengembangan Aplikasi Android Intermediate",
    issuer: "Dicoding",
    issuedDate: "17 Desember 2024",
    credentialId: "KEXL7EE80XG2",
    certificateImage: "/images/certificates/dcgkotlinintermadiate.png",
    verificationUrl: "https://www.dicoding.com/certificates/KEXL7EE80XG2"
  },
  {
    id: 5,
    title: "Belajar Penerapan Machine Learning untuk Android",
    issuer: "Dicoding",
    issuedDate: "04 November 2024",
    credentialId: "KEXLY22L0ZG2",
    certificateImage: "/images/certificates/dcgmachinelearning.jpg",
    verificationUrl: "https://www.dicoding.com/certificates/KEXLY22L0ZG2"
  },
  {
    id: 6,
    title: "Belajar Dasar AI",
    issuer: "Dicoding Indonesia",
    issuedDate: "29 Oktober 2024",
    credentialId: "07Z644NLRPQR",
    certificateImage: "/images/certificates/dcgdasarai.jpg",
    verificationUrl: "https://www.dicoding.com/certificates/07Z644NLRPQR"
  },
  {
    id: 7,
    title: "Belajar Dasar Git dengan GitHub",
    issuer: "Dicoding Indonesia",
    issuedDate: "22 September 2024",
    credentialId: "2VX34W6MVZYQ",
    certificateImage: "/images/certificates/dcggithubdasar.png",
    verificationUrl: "https://www.dicoding.com/certificates/2VX34W6MVZYQ"
  },
  {
    id: 8,
    title: "Pengenalan ke Logika Pemrograman (Programming Logic 101)",
    issuer: "Dicoding Indonesia",
    issuedDate: "21 September 2024",
    credentialId: "4EXG7EN9QPRL",
    certificateImage: "/images/certificates/dcgprograminglogic.png",
    verificationUrl: "https://www.dicoding.com/certificates/4EXG7EN9QPRL"
  },
  {
    id: 9,
    title: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software",
    issuer: "Dicoding Indonesia",
    issuedDate: "19 September 2024",
    credentialId: "JLX17N4LNX72",
    certificateImage: "/images/certificates/dcgsoftwaredev.png",
    verificationUrl: "https://www.dicoding.com/certificates/JLX17N4LNX72"
  },
  {
    id: 10,
    title: "Certificate of Completion — Bangkit Mobile Development",
    issuer: "Bangkit Academy (Google, GoTo, Traveloka)",
    issuedDate: "10 Januari 2025",
    credentialId: "BA24/GRAD/XXIV-01/A182B4KY0850",
    certificateImage: "/images/certificates/bangkitcomplete.jpg",
    verificationUrl: "https://bangkit.academy"
  },
  {
    id: 11,
    title: "Certificate of Achievement — Bangkit Top 50 Teams Capstone Project",
    issuer: "Bangkit Academy (Google, GoTo, Traveloka)",
    issuedDate: "13 Januari 2025",
    credentialId: "BA24/PROD/XXV-01/A182B4KY0850",
    certificateImage: "/images/certificates/bangkittop.jpg",
    verificationUrl: "https://bangkit.academy"
  },
  {
    id: 12,
    title: "Certificate in Artificial Intelligence Associate",
    issuer: "Logical Operations",
    issuedDate: "15 Februari 2025",
    credentialId: "-",
    certificateImage: "/images/certificates/sertifikat_ai.png",
    verificationUrl: "https://logicaloperations.com"
  }
];

/**
 * Technical skills and tools data with categorization
 * Organized by technology type for better presentation
 */
const TECH_STACK_DATA = [
  {
    name: "Flutter",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/flutter/flutter-original.svg",
    gradientColors: "from-gray-300 to-white",
    category: "Framework",
    fallbackText: "🦋"
  },
  {
    name: "Laravel",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/laravel/laravel-original.svg",
    gradientColors: "from-gray-400 to-gray-200",
    category: "Framework",
    fallbackText: "L"
  },
  {
    name: "Kotlin",
    logoUrl: "https://www.vectorlogo.zone/logos/kotlinlang/kotlinlang-icon.svg",
    gradientColors: "from-gray-400 to-gray-200",
    category: "Language",
    fallbackText: "K"
  },
  {
    name: "React",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/react/react-original.svg",
    gradientColors: "from-white to-gray-200",
    category: "Library",
    fallbackText: "⚛️"
  },
  {
    name: "JavaScript",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/javascript/javascript-original.svg",
    gradientColors: "from-gray-400 to-white",
    category: "Language",
    fallbackText: "JS"
  },
  {
    name: "TypeScript",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/typescript/typescript-original.svg",
    gradientColors: "from-gray-300 to-gray-100",
    category: "Language",
    fallbackText: "TS"
  },
  {
    name: "Python",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/python/python-original.svg",
    gradientColors: "from-gray-300 to-gray-100",
    category: "Language",
    fallbackText: "🐍"
  },
  {
    name: "Dart",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/dart/dart-original.svg",
    gradientColors: "from-gray-300 to-white",
    category: "Language",
    fallbackText: "🎯"
  },
  {
    name: "Tailwind CSS",
    logoUrl: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg",
    gradientColors: "from-gray-500 to-gray-300",
    category: "Framework",
    fallbackText: "TW"
  },
  {
    name: "Vite",
    logoUrl: "https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.svg",
    gradientColors: "from-gray-300 to-gray-100",
    category: "Build Tool",
    fallbackText: "⚡"
  },
  {
    name: "Firebase",
    logoUrl: "https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg",
    gradientColors: "from-gray-200 to-white",
    category: "Backend",
    fallbackText: "🔥"
  },
  {
    name: "Node.js",
    logoUrl: "https://raw.githubusercontent.com/devicons/devicon/v2.17.0/icons/nodejs/nodejs-original.svg",
    gradientColors: "from-gray-400 to-gray-200",
    category: "Runtime",
    fallbackText: "🟢"
  }
];

// ========== MAIN PORTFOLIO COMPONENT ==========

const PortfolioSection = () => {
  const [currentActiveTab, setCurrentActiveTab] = useState('Projects');

  // Initialize scroll-triggered animations for different sections
  const headerScrollAnimation = useScrollTriggeredAnimation(0.05);
  const dockScrollAnimation = useScrollTriggeredAnimation(0.1);
  const contentScrollAnimation = useScrollTriggeredAnimation(0.05);
  const githubLinkAnimation = useScrollTriggeredAnimation(0.2);

  /**
   * Configuration for dock navigation items
   * Centralizes navigation state and handlers
   */
  const dockNavigationItems = [
    {
      icon: <Code className="w-6 h-6" />,
      label: 'Projects',
      onClick: () => setCurrentActiveTab('Projects'),
      isActive: currentActiveTab === 'Projects'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Certificates',
      onClick: () => setCurrentActiveTab('Certificates'),
      isActive: currentActiveTab === 'Certificates'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: 'Tech Stack',
      onClick: () => setCurrentActiveTab('Tech Stack'),
      isActive: currentActiveTab === 'Tech Stack'
    }
  ];

  /**
   * Renders project cards with GitHub stats and preview images
   * Each project card displays technology stack and GitHub metrics
   */
  const renderProjectsGrid = () => (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={STAGGER_CONTAINER_ANIMATION}
      initial="hidden"
      animate={contentScrollAnimation.inView ? "visible" : "hidden"}
    >
      {PROJECT_DATA.map((project, index) => (
        <motion.div
          key={project.id}
          variants={CARD_ANIMATION_VARIANT}
          className="group bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/50 transition-all duration-300"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.5)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Project preview image with fallback */}
          <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-600/20 via-gray-500/20 to-gray-400/20">
            <motion.img
              src={project.previewImage}
              alt={project.title}
              className={`w-full h-full ${project.imageContain ? 'object-contain p-2' : 'object-cover object-center'}`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // Hide failed image and show fallback
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback content for failed image loads */}
            <motion.div
              className="w-full h-full bg-gradient-to-br from-gray-600/50 to-gray-700/50 items-center justify-center hidden"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📱</div>
                <div className="text-lg font-semibold">{project.title}</div>
                <div className="text-sm opacity-70">{project.category}</div>
              </div>
            </motion.div>

            {/* Featured project badge */}
            {project.isFeatured && (
              <motion.div
                className="absolute top-4 right-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <span className="px-3 py-1 bg-white/90 text-black text-xs rounded-full backdrop-blur-sm border border-white/50">
                  Featured
                </span>
              </motion.div>
            )}

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Project information and metadata */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <motion.h3
                className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {project.title}
              </motion.h3>

              {/* GitHub statistics display */}
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <motion.div
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.1, color: "#d1d5db" }}
                >
                  <Star className="w-3 h-3" />
                  <span>{project.githubStats.stars}</span>
                </motion.div>
                <motion.div
                  className="flex items-center space-x-1"
                  whileHover={{ scale: 1.1, color: "#d1d5db" }}
                >
                  <GitFork className="w-3 h-3" />
                  <span>{project.githubStats.forks}</span>
                </motion.div>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Technology stack badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((technology, techIndex) => (
                <motion.span
                  key={techIndex}
                  className="px-3 py-1 bg-slate-700/60 border border-slate-600/50 rounded-full text-xs text-gray-200 backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + techIndex * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.3)"
                  }}
                >
                  {technology}
                </motion.span>
              ))}
            </div>

            {/* GitHub repository link */}
            <div className="flex justify-center">
              <motion.a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-white/10 to-gray-200/10 hover:from-white/20 hover:to-gray-200/20 border border-white/30 text-white rounded-full text-sm font-medium transition-all"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 20px rgba(255, 255, 255, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Github className="w-3 h-3 mr-2" />
                View on GitHub
              </motion.a>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  /**
   * Renders professional certificates with verification links
   * Each certificate card includes issuer, date, and credential ID
   */
  const renderCertificatesGrid = () => (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={STAGGER_CONTAINER_ANIMATION}
      initial="hidden"
      animate={contentScrollAnimation.inView ? "visible" : "hidden"}
    >
      {CERTIFICATE_DATA.map((certificate, index) => (
        <motion.div
          key={certificate.id}
          variants={CARD_ANIMATION_VARIANT}
          className="group bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/50 transition-all duration-300"
          whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Certificate image display */}
          <div className="relative overflow-hidden h-64 bg-gradient-to-br from-slate-700/30 to-slate-800/50">
            <motion.img
              src={certificate.certificateImage}
              alt={certificate.title}
              className="w-full h-full object-contain object-center p-4"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                // Hide failed image and show fallback
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback content for failed certificate images */}
            <motion.div
              className="w-full h-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 items-center justify-center hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-48 h-32 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-slate-800 text-xs relative"
                initial={{ rotateY: -10 }}
                whileHover={{ rotateY: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-2 left-2 w-16 h-4 bg-gray-400 rounded opacity-80"></div>
                <div className="text-center px-4">
                  <div className="w-20 h-3 bg-slate-300 rounded mb-2 mx-auto"></div>
                  <div className="w-16 h-2 bg-slate-200 rounded mb-1 mx-auto"></div>
                  <div className="w-24 h-2 bg-slate-200 rounded mb-2 mx-auto"></div>
                  <div className="w-12 h-1 bg-slate-300 rounded mx-auto"></div>
                </div>
                <motion.div
                  className="absolute bottom-2 right-2 w-8 h-8 border-2 border-slate-700 rounded-full flex items-center justify-center text-xs font-bold"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✓
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Certificate badge indicator */}
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
            >
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/50">
                <Award className="w-6 h-6 text-black" />
              </div>
            </motion.div>
          </div>

          {/* Certificate information and metadata */}
          <div className="p-6">
            <motion.h3
              className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors mb-2 line-clamp-2"
              whileHover={{ x: 5 }}
            >
              {certificate.title}
            </motion.h3>
            <p className="text-gray-300 text-sm font-medium mb-2">{certificate.issuer}</p>
            <p className="text-gray-400 text-sm mb-4">{certificate.issuedDate}</p>

            {/* Credential ID display */}
            <motion.div
              className="bg-slate-700/40 rounded-lg p-3 mb-4"
              whileHover={{ backgroundColor: "rgba(71, 85, 105, 0.6)" }}
            >
              <p className="text-xs text-gray-400 mb-1">Credential ID</p>
              <p className="text-sm text-gray-200 font-mono">{certificate.credentialId}</p>
            </motion.div>

            {/* Certificate verification link */}
            <motion.a
              href={certificate.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-white/10 to-gray-200/10 hover:from-white/20 hover:to-gray-200/20 border border-white/30 text-white rounded-full text-sm font-medium transition-all"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              View Certificate
            </motion.a>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  /**
   * Renders technology stack grid with logos and categories
   * Displays technical skills organized by type (Language, Framework, etc.)
   */
  const renderTechStackGrid = () => (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
      variants={STAGGER_CONTAINER_ANIMATION}
      initial="hidden"
      animate={contentScrollAnimation.inView ? "visible" : "hidden"}
    >
      {TECH_STACK_DATA.map((technology, index) => (
        <motion.div key={index} className="group" variants={CARD_ANIMATION_VARIANT}>
          <motion.div
            className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 border border-slate-600/50 rounded-2xl p-6 text-center hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 15px 30px rgba(255, 255, 255, 0.1)",
              rotateY: 5
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${technology.gradientColors} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            {/* Technology logo container */}
            <div className="relative z-10 mb-4">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center p-3 shadow-lg border border-slate-600/30"
                whileHover={{
                  rotate: 360,
                  scale: 1.1
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <TechLogoWithFallback
                  logoUrl={technology.logoUrl}
                  altText={technology.name}
                  fallbackText={technology.fallbackText}
                />
              </motion.div>
            </div>

            {/* Technology name */}
            <motion.h3
              className="relative z-10 text-white font-semibold text-sm mb-2"
              whileHover={{ scale: 1.05 }}
            >
              {technology.name}
            </motion.h3>

            {/* Technology category */}
            <p className="relative z-10 text-gray-400 text-xs">{technology.category}</p>

            {/* Shine effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );

  /**
   * Content renderer based on active tab selection
   * Routes to appropriate grid component based on navigation state
   */
  const renderActiveTabContent = () => {
    switch (currentActiveTab) {
      case 'Projects':
        return renderProjectsGrid();
      case 'Certificates':
        return renderCertificatesGrid();
      case 'Tech Stack':
        return renderTechStackGrid();
      default:
        return renderProjectsGrid();
    }
  };

  /**
   * Creates animated floating particles for visual enhancement
   * Generates multiple particle elements with different animation patterns
   */
  const renderFloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary floating particles with varied animations */}
      <motion.div
        className="absolute top-20 left-10 w-3 h-3 bg-white/20 rounded-full blur-sm"
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          opacity: [0.1, 0.4, 0.1],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-20 w-2 h-2 bg-gray-300/30 rounded-full blur-sm"
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-32 left-1/4 w-4 h-4 bg-white/15 rounded-full blur-sm"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Additional decorative particles */}
      <motion.div
        className="absolute top-2/3 right-1/4 w-1 h-1 bg-gray-200/40 rounded-full blur-sm"
        animate={{
          y: [0, -30, 0],
          x: [0, 25, 0],
          opacity: [0.1, 0.4, 0.1],
          rotate: [0, 360, 720],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-1/5 right-10 w-2 h-2 bg-white/20 rounded-full blur-sm"
        animate={{
          y: [0, 18, 0],
          x: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
    </div>
  );

  /**
   * Creates ambient background decoration elements
   * Provides atmospheric visual enhancement without being distracting
   */
  const renderBackgroundDecorations = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-gray-300/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  return (
    <div id="portfolio" className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black px-8 md:px-16 py-16 lg:py-24 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Main section header with scroll-triggered animation */}
        <motion.div
          ref={headerScrollAnimation.ref}
          className="text-center mb-16"
          initial="hidden"
          animate={headerScrollAnimation.controls}
          variants={FADE_IN_UP_ANIMATION}
        >
          <motion.h1
            className="text-6xl lg:text-7xl font-bold mb-6"
            variants={FADE_IN_UP_ANIMATION}
          >
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              Portfolio Showcase
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            variants={FADE_IN_UP_ANIMATION}
          >
            A showcase of my dedication, creativity, and continuous pursuit of excellence in technology.
          </motion.p>
        </motion.div>

        {/* Navigation dock with scroll-triggered animation */}
        <motion.div
          ref={dockScrollAnimation.ref}
          className="flex justify-center mb-16"
          initial="hidden"
          animate={dockScrollAnimation.controls}
          variants={DOCK_ANIMATION_VARIANT}
        >
          <NavigationDock
            items={dockNavigationItems}
            panelHeight={80}
            defaultItemSize={65}
            maxMagnification={85}
            magneticDistance={150}
          />
        </motion.div>

        {/* Main content area with scroll-triggered animation */}
        <motion.div
          ref={contentScrollAnimation.ref}
          className="relative"
          initial="hidden"
          animate={contentScrollAnimation.controls}
          variants={FADE_IN_SCALE_ANIMATION}
        >
          {/* Background atmospheric decorations */}
          {renderBackgroundDecorations()}

          {/* Dynamic content container with tab switching */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentActiveTab}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {renderActiveTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* GitHub profile link - only shown for Projects tab */}
        {currentActiveTab === 'Projects' && (
          <motion.div
            ref={githubLinkAnimation.ref}
            className="text-center mt-16"
            initial="hidden"
            animate={githubLinkAnimation.controls}
            variants={FADE_IN_UP_ANIMATION}
          >
            <motion.a
              href="https://github.com/bibitdev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black rounded-full font-medium transition-all shadow-lg shadow-white/10"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Github className="w-5 h-5 mr-3" />
              </motion.div>
              View All Projects on GitHub
            </motion.a>
          </motion.div>
        )}

        {/* Enhanced floating particles for visual depth */}
        {renderFloatingParticles()}
      </div>
    </div>
  );
};

export default PortfolioSection;