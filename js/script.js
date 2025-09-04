// ================================
// NELIS0 TRAVEL VLOG WEBSITE - JS
// Interactive Features
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // YouTube Thumbnail Loader and Metadata Fetcher
    function extractYouTubeVideoId(url) {
        const regexPatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (let pattern of regexPatterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    // Fetch YouTube video metadata using oEmbed API
    async function fetchVideoMetadata(videoId) {
        try {
            const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oEmbedUrl);
            
            if (response.ok) {
                const data = await response.json();
                return {
                    title: data.title,
                    author: data.author_name,
                    description: `Video by ${data.author_name}`,
                    duration: 'Loading...' // Duration needs YouTube Data API
                };
            }
        } catch (error) {
            console.warn('Could not fetch metadata for video ID:', videoId, error);
        }
        return null;
    }

    // Advanced metadata fetching with multiple fallbacks
    async function fetchAdvancedVideoMetadata(videoId) {
        // Method 1: Try YouTube oEmbed API
        try {
            const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oEmbedUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                // Method 2: Try to get additional data from page scraping
                const pageData = await fetchPageMetadata(videoId);
                
                return {
                    title: data.title,
                    author: data.author_name,
                    description: pageData?.description || `Video by ${data.author_name}`,
                    duration: pageData?.duration || 'New Video',
                    thumbnailUrl: data.thumbnail_url
                };
            }
        } catch (error) {
            console.warn('oEmbed failed, trying alternative method:', error);
        }
        
        // Method 3: Fallback to page scraping only
        try {
            const pageData = await fetchPageMetadata(videoId);
            if (pageData) {
                return pageData;
            }
        } catch (error) {
            console.warn('Page scraping failed:', error);
        }
        
        return null;
    }

    // Fetch metadata by scraping the YouTube page (CORS-friendly approach)
    async function fetchPageMetadata(videoId) {
        try {
            // Note: This would require a CORS proxy in production
            // For now, we'll use a simulated approach with known patterns
            
            // This is a placeholder for a more robust solution
            // In a real implementation, you'd use:
            // 1. A CORS proxy service
            // 2. Your own backend API
            // 3. YouTube Data API v3 (requires API key)
            
            return {
                title: `Loading title for ${videoId}...`,
                description: 'Loading description...',
                duration: 'Loading...',
                author: 'Loading...'
            };
        } catch (error) {
            return null;
        }
    }

    // Format duration from seconds to MM:SS or HH:MM:SS
    function formatDuration(seconds) {
        if (!seconds || seconds === 0) return 'Live';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Enhanced function to load thumbnails and metadata
    async function loadYouTubeThumbnails() {
        const videoCards = document.querySelectorAll('.video-card');
        
        for (const card of videoCards) {
            const videoUrl = card.dataset.videoUrl;
            if (videoUrl) {
                const videoId = extractYouTubeVideoId(videoUrl);
                
                if (videoId && videoId !== 'YOUR_VIDEO_ID_1' && 
                    videoId !== 'YOUR_VIDEO_ID_2' && 
                    videoId !== 'YOUR_VIDEO_ID_3') {
                    
                    // Remove existing thumbnail if any
                    const existingThumbnail = card.querySelector('.video-thumbnail img');
                    if (existingThumbnail) {
                        existingThumbnail.remove();
                    }
                    
                    // Create thumbnail image element
                    const thumbnail = document.createElement('img');
                    thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                    thumbnail.alt = 'Video thumbnail';
                    thumbnail.loading = 'lazy';
                    
                    // Handle thumbnail load error (fallback to medium quality)
                    thumbnail.onerror = function() {
                        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        this.onerror = function() {
                            // Final fallback to standard quality
                            this.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                            this.onerror = function() {
                                // If all thumbnails fail, remove the image
                                this.remove();
                                console.warn(`Could not load thumbnail for video ID: ${videoId}`);
                            };
                        };
                    };
                    
                    // Insert thumbnail into video-thumbnail container
                    const thumbnailContainer = card.querySelector('.video-thumbnail');
                    if (thumbnailContainer) {
                        thumbnailContainer.appendChild(thumbnail);
                        
                        // Add loading animation
                        thumbnail.style.opacity = '0';
                        thumbnail.style.transition = 'opacity 0.3s ease-in-out';
                        
                        thumbnail.onload = function() {
                            this.style.opacity = '1';
                        };
                    }

                    // Fetch and update video metadata
                    try {
                        const metadata = await fetchAdvancedVideoMetadata(videoId);
                        if (metadata) {
                            const videoInfo = card.querySelector('.video-info');
                            const titleElement = videoInfo.querySelector('h3');
                            
                            // Update title only
                            if (titleElement && metadata.title) {
                                titleElement.style.transition = 'opacity 0.3s ease-in-out';
                                titleElement.style.opacity = '0.5';
                                setTimeout(() => {
                                    titleElement.textContent = metadata.title;
                                    titleElement.style.opacity = '1';
                                }, 150);
                            }
                        }
                    } catch (error) {
                        console.warn('Could not fetch metadata for video:', videoId, error);
                    }
                }
            }
        }
    }

    // Load thumbnails
    loadYouTubeThumbnails();
    
    // Function to refresh thumbnails (useful when video URLs are updated)
    window.refreshThumbnails = loadYouTubeThumbnails;
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            header.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            const button = this.querySelector('button[type="submit"]');
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');
            
            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            button.disabled = true;
            
            // Prepare email data
            const emailData = {
                to: 'nilsdaniels00@gmail.com', // Replace with your Gmail address
                subject: `New Contact Form Message from ${name}`,
                body: `
                    Name: ${name}
                    Email: ${email}
                    Message: ${message}
                    
                    Sent from Nelis0 Travel Website Contact Form
                `
            };
            
            // Simulate form submission (replace with actual email service)
            setTimeout(() => {
                // Here you would typically send the email using a service like EmailJS, Formspree, or Netlify Forms
                // For now, we'll simulate success and open email client
                
                // Option 1: Open default email client (works immediately)
                const mailtoLink = `mailto:your-email@gmail.com?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
                window.open(mailtoLink);
                
                // Show success state
                btnText.textContent = 'Message Sent!';
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                button.style.background = '#27ae60';
                
                // Reset form
                this.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    btnText.textContent = 'Send Message';
                    button.disabled = false;
                    button.style.background = '';
                }, 3000);
                
            }, 1500);
        });
    }

    // Video card interactions
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Play button click - opens YouTube videos
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', function() {
            const videoCard = this.closest('.video-card');
            const videoUrl = videoCard.dataset.videoUrl;
            
            if (videoUrl && videoUrl !== 'https://youtu.be/IJZT-HBmhFY?si=sNzWn5xYIl4iMEyd' && 
                videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_2' && 
                videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_3') {
                // Open the actual YouTube video
                window.open(videoUrl, '_blank');
                
                // Visual feedback
                this.innerHTML = '<i class="fas fa-external-link-alt"></i>';
                this.style.background = 'var(--primary-color)';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-play"></i>';
                    this.style.background = 'rgba(255, 255, 255, 0.9)';
                    this.style.color = 'var(--primary-color)';
                }, 2000);
            } else {
                // Fallback simulation for placeholder links
                this.innerHTML = '<i class="fas fa-pause"></i>';
                this.style.background = 'var(--primary-color)';
                this.style.color = 'white';
                
                // Show message to add real video link
                const videoInfo = videoCard.querySelector('.video-info h3');
                const originalTitle = videoInfo.textContent;
                videoInfo.textContent = 'Add your YouTube link!';
                videoInfo.style.color = 'var(--primary-color)';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-play"></i>';
                    this.style.background = 'rgba(255, 255, 255, 0.9)';
                    this.style.color = 'var(--primary-color)';
                    videoInfo.textContent = originalTitle;
                    videoInfo.style.color = '';
                }, 3000);
            }
        });
    });

    // Make entire video card clickable
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking the play button (it has its own handler)
            if (!e.target.closest('.play-button')) {
                const videoUrl = this.dataset.videoUrl;
                if (videoUrl && videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_1' && 
                    videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_2' && 
                    videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_3') {
                    window.open(videoUrl, '_blank');
                }
            }
        });
        
        // Add cursor pointer for clickable cards
        const videoUrl = card.dataset.videoUrl;
        if (videoUrl && videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_1' && 
            videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_2' && 
            videoUrl !== 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_3') {
            card.style.cursor = 'pointer';
        }
    });

    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat h3');
    const animateStats = () => {
        stats.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const finalValue = stat.textContent;
                const numericValue = parseInt(finalValue.replace(/\D/g, ''));
                const suffix = finalValue.replace(/\d/g, '');
                
                let current = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        current = numericValue;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current) + suffix;
                }, 30);
            }
        });
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Trigger stats animation for stats section
                if (entry.target.classList.contains('stats')) {
                    animateStats();
                }
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    document.querySelectorAll('.video-card, .about-text, .stats').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Dynamic year in footer
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear && footerYear.textContent.includes('2025')) {
        footerYear.textContent = footerYear.textContent.replace('2025', currentYear);
    }

    // Add loading animation to page
    const addLoadingAnimation = () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
    };

    addLoadingAnimation();

    // Console message for developers
    console.log(`
    🌍 Welcome to Nelis0 Travel Vlogs Website
    ========================================
    
    Website Features:
    ✈️  Responsive design for all devices
    🎥  Video showcase section
    📱  Mobile-friendly navigation
    🎨  Modern gradient animations
    📬  Newsletter subscription
    🔗  Social media integration
    
    Built with modern web technologies
    🚀 Ready for your travel adventures!
    `);
    
    // Dark Mode Toggle
    function initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const body = document.body;
        
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', savedTheme);
        
        // Update icon based on current theme
        updateThemeIcon(savedTheme === 'dark');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme === 'dark');
            });
        }
        
        function updateThemeIcon(isDark) {
            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    initializeThemeToggle();

    // EmailJS Integration (Optional - requires EmailJS account setup)
    /*
    // Initialize EmailJS (add this to your HTML head section):
    // <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

    const initEmailJS = () => {
        // Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
        emailjs.init('YOUR_PUBLIC_KEY');
    };

    const sendEmailViaEmailJS = async (formData) => {
        try {
            const templateParams = {
                from_name: formData.get('name'),
                from_email: formData.get('email'),
                message: formData.get('message'),
                to_email: 'your-email@gmail.com' // Your Gmail address
            };

            const response = await emailjs.send(
                'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
                'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
                templateParams
            );

            return response;
        } catch (error) {
            console.error('EmailJS error:', error);
            throw error;
        }
    };

    // To use EmailJS instead of mailto, replace the setTimeout content in the contact form handler with:
    // try {
    //     await sendEmailViaEmailJS(formData);
    //     // Show success message
    // } catch (error) {
    //     // Show error message
    // }
    */

    // Alternative: PHP Backend Email Sending
    const sendEmailViaPHP = async (formData) => {
        try {
            const response = await fetch('contact.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('PHP email error:', error);
            throw error;
        }
    };

    // YouTube Data API v3 integration (requires API key)
    // To use this, you need to:
    // 1. Get a YouTube Data API v3 key from Google Cloud Console
    // 2. Replace 'YOUR_API_KEY' with your actual API key
    // 3. Uncomment the function below

    /*
    async function fetchYouTubeDataAPI(videoId) {
        const API_KEY = 'YOUR_API_KEY'; // Replace with your YouTube Data API key
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const contentDetails = video.contentDetails;
                
                // Parse duration from ISO 8601 format (PT4M13S -> 4:13)
                const duration = parseDuration(contentDetails.duration);
                
                return {
                    title: snippet.title,
                    description: snippet.description.length > 100 
                        ? snippet.description.substring(0, 100) + '...'
                        : snippet.description,
                    duration: duration,
                    author: snippet.channelTitle,
                    publishedAt: snippet.publishedAt,
                    viewCount: video.statistics.viewCount
                };
            }
        } catch (error) {
            console.error('YouTube Data API error:', error);
        }
        return null;
    }

    function parseDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        if (hours) {
            return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        } else {
            return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
        }
    }
    */

    // Simple solution that works without API key (current implementation)
    // This version uses oEmbed and provides basic functionality

    // Function to add new video cards dynamically
        window.addVideoCard = function(videoUrl, containerId = 'videos-grid') {
            const container = document.querySelector(`.${containerId}`);
            if (!container) {
                console.error(`Container with class ${containerId} not found`);
                return;
            }

            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.setAttribute('data-video-url', videoUrl);
            
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3>Loading title...</h3>
                    <p>Your custom description here.</p>
                    <span class="video-duration">0:00</span>
                </div>
            `;
            
            container.appendChild(videoCard);
            
            // Load thumbnail and metadata for the new card
            setTimeout(() => {
                loadYouTubeThumbnails();
            }, 100);
            
            return videoCard;
        };

        // Function to update existing video card
        window.updateVideoCard = function(cardElement, newVideoUrl) {
            if (cardElement && cardElement.classList.contains('video-card')) {
                cardElement.setAttribute('data-video-url', newVideoUrl);
                
                // Reset title only
                const titleElement = cardElement.querySelector('h3');
                if (titleElement) titleElement.textContent = 'Loading title...';
                
                // Remove existing thumbnail
                const existingThumbnail = cardElement.querySelector('.video-thumbnail img');
                if (existingThumbnail) {
                    existingThumbnail.remove();
                }
                
                // Reload metadata
                setTimeout(() => {
                    loadYouTubeThumbnails();
                }, 100);
            }
        };

        // Load thumbnails and metadata
        loadYouTubeThumbnails();
    }
    
    // Contact Form Handler
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Add your contact form handling logic here
                console.log('Contact form submitted');
            });
        }
    }
    
    // Hamburger Menu Handler
    function initializeHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                navMenu.classList.toggle('active');
            });
        }
    }
    
    // Initialize all functionality
    initializeVideoSystem();
    initializeThemeToggle();
    initializeContactForm();
    initializeHamburgerMenu();
});
