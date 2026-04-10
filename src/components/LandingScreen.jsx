import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

// Default character set for text scrambling animation
const DEFAULT_SCRAMBLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

/**
 * DecryptedText Component - Creates a text scrambling/decryption animation effect
 * Scrambles text characters and gradually reveals the original text on trigger
 */
const DecryptedText = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = DEFAULT_SCRAMBLE_CHARACTERS,
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  /**
   * Determines which character index to reveal next based on reveal direction
   * Supports revealing from start, end, or center outward
   */
  const getNextRevealIndex = (revealedSet) => {
    const textLength = text.length;
    
    switch (revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middleIndex = Math.floor(textLength / 2);
        const currentOffset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0
          ? middleIndex + currentOffset
          : middleIndex - currentOffset - 1;

        // Fallback to first available index if calculated index is invalid
        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }
        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  };

  /**
   * Creates array of available characters for scrambling based on settings
   * Either uses original text characters or provided character set
   */
  const getAvailableCharacters = () => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ')
      : characters.split('');
  };

  /**
   * Generates scrambled text while preserving revealed characters and spaces
   * Handles two modes: original chars only (shuffles existing) or random chars
   */
  const generateScrambledText = (originalText, currentRevealed) => {
    const availableChars = getAvailableCharacters();

    if (useOriginalCharsOnly) {
      // Create position mapping for each character
      const characterPositions = originalText.split('').map((char, index) => ({
        char,
        isSpace: char === ' ',
        index,
        isRevealed: currentRevealed.has(index),
      }));

      // Extract and shuffle non-revealed, non-space characters
      const shuffleableChars = characterPositions
        .filter((position) => !position.isSpace && !position.isRevealed)
        .map((position) => position.char);

      // Fisher-Yates shuffle algorithm
      for (let i = shuffleableChars.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffleableChars[i], shuffleableChars[randomIndex]] = [shuffleableChars[randomIndex], shuffleableChars[i]];
      }

      // Reconstruct text with shuffled characters
      let shuffledCharIndex = 0;
      return characterPositions
        .map((position) => {
          if (position.isSpace) return ' ';
          if (position.isRevealed) return originalText[position.index];
          return shuffleableChars[shuffledCharIndex++];
        })
        .join('');
    } else {
      // Generate random characters for non-revealed positions
      return originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (currentRevealed.has(index)) return originalText[index];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join('');
    }
  };

  /**
   * Main scrambling animation effect - handles both sequential and random modes
   * Sequential: reveals characters one by one, Random: scrambles for set iterations
   */
  useEffect(() => {
    let animationInterval;
    let currentIteration = 0;

    if (isHovering) {
      setIsScrambling(true);
      
      animationInterval = setInterval(() => {
        setRevealedIndices((previousRevealed) => {
          if (sequential) {
            // Sequential mode: reveal one character at a time
            if (previousRevealed.size < text.length) {
              const nextIndex = getNextRevealIndex(previousRevealed);
              const updatedRevealed = new Set(previousRevealed);
              updatedRevealed.add(nextIndex);
              setDisplayText(generateScrambledText(text, updatedRevealed));
              return updatedRevealed;
            } else {
              // Animation complete
              clearInterval(animationInterval);
              setIsScrambling(false);
              return previousRevealed;
            }
          } else {
            // Random mode: scramble for set number of iterations
            setDisplayText(generateScrambledText(text, previousRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(animationInterval);
              setIsScrambling(false);
              setDisplayText(text);
            }
            return previousRevealed;
          }
        });
      }, speed);
    } else {
      // Reset to original state when not hovering
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
    }

    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [
    isHovering,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
  ]);

  /**
   * Intersection Observer for viewport-triggered animations
   * Triggers animation when element enters viewport (only once)
   */
  useEffect(() => {
    if (animateOn !== 'view') return;

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsHovering(true);
          setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const currentContainerRef = containerRef.current;
    
    if (currentContainerRef) {
      observer.observe(currentContainerRef);
    }

    return () => {
      if (currentContainerRef) observer.unobserve(currentContainerRef);
    };
  }, [animateOn, hasAnimated]);

  // Conditional hover event handlers based on animation trigger
  const hoverEventHandlers = animateOn === 'hover'
    ? {
        onMouseEnter: () => setIsHovering(true),
        onMouseLeave: () => setIsHovering(false),
      }
    : {};

  return (
    <motion.span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...hoverEventHandlers}
      {...props}
    >
      {/* Screen reader accessible text */}
      <span className="sr-only">{displayText}</span>

      {/* Visual scrambled/revealed text */}
      <span aria-hidden="true">
        {displayText.split('').map((character, index) => {
          const isCharacterRevealed = revealedIndices.has(index) || !isScrambling || !isHovering;

          return (
            <span
              key={index}
              className={isCharacterRevealed ? className : encryptedClassName}
            >
              {character}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
};

/**
 * Floating particle animation configuration
 * Defines motion properties for background ambient elements
 */
const createFloatingParticleAnimation = (yRange, xRange, opacityRange, scaleRange, duration, delay = 0) => ({
  animate: {
    y: yRange,
    x: xRange,
    opacity: opacityRange,
    scale: scaleRange,
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
    delay,
  }
});

/**
 * Social media icon component with consistent styling and hover effects
 * Reusable component to reduce code duplication
 */
const SocialMediaIcon = ({ children, onClick }) => (
  <motion.div 
    className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300 cursor-pointer group border border-white/20"
    whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(255, 255, 255, 0.2)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    <div className="w-6 h-6 text-white group-hover:scale-110 transition-transform">
      {children}
    </div>
  </motion.div>
);

/**
 * Floating background particle component
 * Creates ambient floating elements with customizable animation properties
 */
const FloatingParticle = ({ className, animationConfig, children }) => (
  <motion.div
    className={className}
    {...animationConfig}
  >
    {children}
  </motion.div>
);

/**
 * Loading indicator with animated dots
 * Shows progress indication during auto-transition
 */
const LoadingIndicator = () => {
  const dotAnimationConfig = {
    animate: { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] },
    transition: { duration: 1.5, repeat: Infinity }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.5 }}
      className="mt-8"
    >
      <div className="flex justify-center items-center space-x-2">
        {[0, 0.2, 0.4].map((delay, index) => (
          <motion.div 
            key={index}
            className="w-2 h-2 bg-white/80 rounded-full"
            {...dotAnimationConfig}
            transition={{ ...dotAnimationConfig.transition, delay }}
          />
        ))}
      </div>
      <motion.p 
        className="text-gray-300 text-sm mt-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading amazing content...
      </motion.p>
    </motion.div>
  );
};

/**
 * Main landing screen component with animated intro sequence
 * Handles auto-transition and manual entry to portfolio content
 */
const LandingScreen = ({ onEnter }) => {
  const [fadeOut, setFadeOut] = useState(false);

  /**
   * Handles transition to main portfolio with fade effect
   * Provides smooth visual transition between landing and main content
   */
  const handlePortfolioEntry = () => {
    setFadeOut(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  /**
   * Auto-transition timer - automatically enters portfolio after 3 seconds
   * Provides fallback for users who don't interact with the landing screen
   */
  useEffect(() => {
    const autoTransitionTimer = setTimeout(() => {
      handlePortfolioEntry();
    }, 3000);

    return () => clearTimeout(autoTransitionTimer);
  }, []);

  // Hide component completely after fade transition
  if (fadeOut) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Pure black background with floating ambient elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating orbs with soft glow */}
          <FloatingParticle
            className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full blur-sm"
            animationConfig={createFloatingParticleAnimation(
              [0, -30, 0], [0, 15, 0], [0.3, 0.8, 0.3], [1, 1.2, 1], 6
            )}
          />
          
          <FloatingParticle
            className="absolute top-40 right-20 w-3 h-3 bg-gray-300/40 rounded-full blur-sm"
            animationConfig={createFloatingParticleAnimation(
              [0, 20, 0], [0, -12, 0], [0.4, 0.8, 0.4], [1, 1.3, 1], 4.5, 1.5
            )}
          />
          
          <FloatingParticle
            className="absolute bottom-32 left-20 w-2 h-2 bg-white/50 rounded-full blur-sm"
            animationConfig={createFloatingParticleAnimation(
              [0, -15, 0], [0, 8, 0], [0.3, 0.7, 0.3], [1, 1.4, 1], 7, 3
            )}
          />
          
          {/* Small rotating particles for additional depth */}
          <FloatingParticle
            className="absolute top-1/3 left-1/4 w-1 h-1 bg-gray-200/60 rounded-full blur-sm"
            animationConfig={{
              animate: {
                y: [0, -25, 0],
                x: [0, 20, 0],
                opacity: [0.2, 0.6, 0.2],
                rotate: [0, 180, 360],
              },
              transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
              }
            }}
          />
          
          <FloatingParticle
            className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white/50 rounded-full blur-sm"
            animationConfig={{
              animate: {
                y: [0, 18, 0],
                x: [0, -15, 0],
                opacity: [0.3, 0.7, 0.3],
                rotate: [360, 0, 360],
              },
              transition: {
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }
            }}
          />
          
          {/* Central ambient glow effect */}
          <FloatingParticle
            className="absolute top-1/2 left-1/2 w-6 h-6 bg-white/10 rounded-full blur-lg transform -translate-x-1/2 -translate-y-1/2"
            animationConfig={createFloatingParticleAnimation(
              undefined, undefined, [0.1, 0.3, 0.1], [1, 1.5, 1], 10
            )}
          />
        </div>
      </div>

      {/* Main content layer with text and interactive elements */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 px-8">
          {/* Social media navigation icons */}
          <motion.div 
            className="flex justify-center space-x-6 mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <SocialMediaIcon>
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </SocialMediaIcon>
            
            <SocialMediaIcon>
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </SocialMediaIcon>
            
            <SocialMediaIcon>
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </SocialMediaIcon>
          </motion.div>

          {/* Main hero titles with staggered animation entrance */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-wide"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            >
              <span className="text-white">Welcome To My</span>
            </motion.h1>
            
            <motion.h2 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.9 }}
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Portfolio Website
              </span>
            </motion.h2>
          </motion.div>

          {/* Interactive website domain card with scrambled text effect */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              onClick={handlePortfolioEntry}
              className="group relative px-8 py-4 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-black/40 hover:border-white/30"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Visit my portfolio at</p>
                <div className="text-white font-mono text-lg">
                  <DecryptedText
                    text="bibitdev.vercel.app"
                    speed={30}
                    maxIterations={15}
                    animateOn="hover"
                    className="text-white"
                    encryptedClassName="text-gray-500"
                    characters="abcdefghijklmnopqrstuvwxyz./_-0123456789"
                  />
                </div>
              </div>
              
              {/* Hover state visual enhancements */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </motion.div>

          {/* Loading progress indicator */}
          <LoadingIndicator />
        </div>
      </div>

      {/* Subtle bottom gradient overlay for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default LandingScreen;