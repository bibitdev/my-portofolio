/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Instagram, MessageCircle, Zap, Heart, Coffee, Music } from 'lucide-react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';

// TikTok Logo Component
const TikTokIcon = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.42Z"
        fill="url(#tiktokGradient)"
      />
      <defs>
        <linearGradient id="tiktokGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Animation variants for scroll effects
const fadeInUp = {
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

const fadeInLeft = {
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
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.2
    }
  }
};

const fadeInRight = {
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
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
    filter: "blur(3px)"
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

const socialCardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateY: 15
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const formFieldVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: "easeOut"
    }
  }
};

// Custom hook for reliable scroll detection
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const inView = useInView(ref, { 
    threshold: threshold,
    once: false,
    margin: "-50px 0px"
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};

// Floating particles component
const FloatingParticles = ({ count = 5 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            opacity: [0.1, 0.4, 0.2, 0.1],
            scale: [1, 1.5, 0.8, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          style={{
            left: `${10 + i * 20}%`,
            top: `${20 + i * 15}%`,
          }}
        />
      ))}
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll animation hooks
  const headerAnimation = useScrollAnimation(0.1);
  const contactInfoAnimation = useScrollAnimation(0.15);
  const formAnimation = useScrollAnimation(0.15);
  const socialAnimation = useScrollAnimation(0.2);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validasi form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Mohon lengkapi semua field!');
      setIsSubmitting(false);
      return;
    }

    // Format pesan untuk WhatsApp dengan emoji dan formatting yang menarik
    const message = `🌟 *PESAN DARI WEBSITE PORTFOLIO* 🌟\n\n` +
      `👤 *Nama:* ${formData.name}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📝 *Subject:* ${formData.subject}\n\n` +
      `💬 *Pesan:*\n${formData.message}\n\n` +
      `⏰ Dikirim pada: ${new Date().toLocaleString('id-ID')}\n` +
      `🔗 Dari: Portfolio Website`;
    
    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(message);
    
    // Nomor WhatsApp Anda (format internasional tanpa +)
    const phoneNumber = '6281917742763';
    
    // URL WhatsApp
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    try {
      // Simulasi proses pengiriman
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Buka WhatsApp di tab baru
      window.open(whatsappURL, '_blank');
      
      // Reset form setelah berhasil
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
        
        // Tampilkan notifikasi sukses yang lebih menarik
        const notification = document.createElement('div');
        notification.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffffff, #e5e7eb);
            color: black;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
          ">
            ✅ Pesan berhasil diarahkan ke WhatsApp!<br>
            <small style="opacity: 0.8;">Silakan kirim dari aplikasi WhatsApp Anda</small>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Hapus notifikasi setelah 5 detik
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 5000);
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
      
      // Tampilkan error notification
      const errorNotification = document.createElement('div');
      errorNotification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #374151, #1f2937);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 500;
        ">
          ❌ Terjadi kesalahan. Silakan coba lagi!
        </div>
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 5000);
    }
  };

  return (
    <div id="contact" className="min-h-screen bg-gradient-to-br from-black via-gray-900/30 to-black px-8 md:px-16 py-16 lg:py-24 pt-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-48 h-48 bg-gray-300/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/2 rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Scroll Animation */}
        <motion.div 
          ref={headerAnimation.ref}
          className="text-center mb-16"
          initial="hidden"
          animate={headerAnimation.controls}
          variants={fadeInUp}
        >
          <motion.h2 
            className="text-5xl lg:text-6xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Let's Work{' '}
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
              Together
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Have an exciting project in mind? Let's discuss and make it happen together!
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Left Column - Contact Info */}
          <motion.div 
            ref={contactInfoAnimation.ref}
            className="space-y-8 flex flex-col h-full"
            initial="hidden"
            animate={contactInfoAnimation.controls}
            variants={staggerContainer}
          >
            {/* Contact Information Card */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-600/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
              variants={cardVariants}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <FloatingParticles count={3} />
              
              <motion.h3 
                className="text-2xl font-bold text-white mb-6"
                whileHover={{ x: 5 }}
              >
                Contact Information
              </motion.h3>
              
              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                animate={contactInfoAnimation.inView ? "visible" : "hidden"}
              >
                {[
                  { icon: Mail, label: "Email", value: "bibitraikhanazzaki@gmail.com", gradient: "from-white to-gray-300" },
                  { icon: Phone, label: "Phone", value: "+62 81917742763", gradient: "from-gray-200 to-white" },
                  { icon: MapPin, label: "Location", value: "Purwokerto, Indonesia", gradient: "from-gray-300 to-gray-100" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-4"
                    variants={cardVariants}
                  >
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center`}
                    >
                      <item.icon className="w-5 h-5 text-black" />
                    </motion.div>
                    <div>
                      <div className="text-gray-300 text-sm">{item.label}</div>
                      <motion.div 
                        className="text-white font-medium"
                      >
                        {item.value}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Social Media */}
            <motion.div 
              ref={socialAnimation.ref}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-600/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden flex-1"
              initial="hidden"
              animate={socialAnimation.controls}
              variants={cardVariants}
            >
              <FloatingParticles count={2} />
              
              <motion.h3 
                className="text-xl font-bold text-white mb-6"
                whileHover={{ x: 5 }}
              >
                Follow Me
              </motion.h3>
              
              <motion.div 
                className="grid grid-cols-2 gap-4"
                variants={staggerContainer}
                animate={socialAnimation.inView ? "visible" : "hidden"}
              >
                {[
                  { icon: Github, name: "GitHub", handle: "@bibitdev", url: "https://github.com/bibitdev", color: "text-white" },
                  { icon: Linkedin, name: "LinkedIn", handle: "Bibit Raikhan Azzaki", url: "https://www.linkedin.com/in/bibit-raikhan-azzaki/", color: "text-gray-200" },
                  { icon: Instagram, name: "Instagram", handle: "@raikhanazzz", url: "https://www.instagram.com/raikhanazzz/", color: "text-gray-300" },
                  { icon: TikTokIcon, name: "TikTok", handle: "@raikhanazz_", url: "https://www.tiktok.com/@raikhanazz_", color: "text-gray-100", customIcon: true }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 rounded-xl transition-all group"
                    variants={socialCardVariants}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 15px 30px rgba(255, 255, 255, 0.1)",
                      borderColor: "rgba(255, 255, 255, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {social.customIcon ? (
                        <social.icon className="w-6 h-6" />
                      ) : (
                        <social.icon className={`w-6 h-6 ${social.color}`} />
                      )}
                    </motion.div>
                    <div>
                      <motion.div 
                        className="text-white font-medium text-sm group-hover:text-gray-200 transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        {social.name}
                      </motion.div>
                      <div className="text-gray-400 text-xs">{social.handle}</div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div 
            ref={formAnimation.ref}
            className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-600/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
            initial="hidden"
            animate={formAnimation.controls}
            variants={fadeInRight}
          >
            <FloatingParticles count={4} />
            
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={staggerContainer}
              animate={formAnimation.inView ? "visible" : "hidden"}
            >
              {/* WhatsApp Integration Notice */}
              <motion.div 
                className="bg-gradient-to-r from-gray-500/10 to-gray-300/10 border border-gray-500/30 rounded-xl p-4 backdrop-blur-sm"
                variants={formFieldVariants}
                whileHover={{ scale: 1.02, borderColor: "rgba(156, 163, 175, 0.5)" }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: ["0 0 0 0 rgba(255, 255, 255, 0.3)", "0 0 0 10px rgba(255, 255, 255, 0)", "0 0 0 0 rgba(255, 255, 255, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">Pesan via WhatsApp</div>
                  </div>
                </div>
              </motion.div>

              {/* Form Fields */}
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                <motion.div variants={formFieldVariants}>
                  <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
                    Nama Lengkap *
                  </label>
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
                    placeholder="Masukkan nama Anda"
                    whileFocus={{ 
                      scale: 1.02,
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </motion.div>

                <motion.div variants={formFieldVariants}>
                  <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
                    placeholder="your@email.com"
                    whileFocus={{ 
                      scale: 1.02,
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label htmlFor="subject" className="block text-gray-300 text-sm font-medium mb-2">
                  Subject *
                </label>
                <motion.input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
                  placeholder="Topik yang ingin dibahas"
                  whileFocus={{ 
                    scale: 1.02,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)"
                  }}
                />
              </motion.div>

              <motion.div variants={formFieldVariants}>
                <label htmlFor="message" className="block text-gray-300 text-sm font-medium mb-2">
                  Message *
                </label>
                <motion.textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all resize-none"
                  placeholder="Ceritakan tentang project atau ide yang ingin Anda diskusikan"
                  whileFocus={{ 
                    scale: 1.01,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)"
                  }}
                ></motion.textarea>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-white to-gray-200 text-black rounded-xl font-semibold text-lg transition-all shadow-lg ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-gray-100 hover:to-white hover:shadow-xl'
                }`}
                variants={formFieldVariants}
                whileHover={!isSubmitting ? { 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
                } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div 
                        className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full mr-3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Mengarahkan ke WhatsApp...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <MessageCircle className="w-6 h-6 mr-3" />
                      </motion.div>
                      Kirim 
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Quick WhatsApp Button - Floating Action Button */}
        <motion.a
          href="https://wa.me/6281917742763?text=Halo%20Bibit!%20Saya%20tertarik%20untuk%20berdiskusi%20tentang%20project%20development."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-white to-gray-200 text-black rounded-full flex items-center justify-center shadow-lg z-50 group"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 2, type: "spring", stiffness: 200 }}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)"
          }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <MessageCircle className="w-8 h-8" />
          </motion.div>
          
          {/* Tooltip */}
          <motion.div
            className="absolute right-full mr-3 bg-black/80 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: 10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
          >
            Chat via WhatsApp
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
          </motion.div>
        </motion.a>
      </div>

      {/* Simple Footer Section */}
      <motion.footer 
        className="relative mt-24 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <motion.div 
            className="text-gray-500 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            © 2025 bibitdev™. All Rights Reserved.
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Contact;