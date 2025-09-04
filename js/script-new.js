// ================================
// NELIS0 TRAVEL VLOG WEBSITE - JS
// Interactive Features
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
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
                
                console.log('Theme switched to:', newTheme);
            });
        }
        
        function updateThemeIcon(isDark) {
            if (themeIcon) {
                themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    // Contact Form Handler
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                console.log('Contact form submitted');
                // Add form submission logic here
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
                hamburger.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                });
            });
        }
    }
    
    // YouTube Video Functions
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
                    duration: 'New Video'
                };
            }
        } catch (error) {
            console.warn('Could not fetch metadata for video ID:', videoId, error);
        }
        return null;
    }

    async function loadYouTubeThumbnails() {
        const videoCards = document.querySelectorAll('.video-card[data-video-url]');
        
        for (let card of videoCards) {
            const videoUrl = card.getAttribute('data-video-url');
            const videoId = extractYouTubeVideoId(videoUrl);
            
            if (videoId) {
                // Set thumbnail
                let thumbnail = card.querySelector('.video-thumbnail img');
                if (!thumbnail) {
                    thumbnail = document.createElement('img');
                    thumbnail.alt = 'Video Thumbnail';
                    thumbnail.loading = 'lazy';
                    const thumbnailContainer = card.querySelector('.video-thumbnail');
                    if (thumbnailContainer) {
                        thumbnailContainer.appendChild(thumbnail);
                    }
                }
                thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                
                // Fetch and set metadata
                try {
                    const metadata = await fetchVideoMetadata(videoId);
                    if (metadata) {
                        const titleElement = card.querySelector('h3');
                        if (titleElement && titleElement.textContent === 'Loading title...') {
                            titleElement.textContent = metadata.title;
                        }
                    }
                } catch (error) {
                    console.warn('Could not fetch metadata for video:', videoId, error);
                }
            }
        }
    }
    
    // Email Purchase Handler
    function initializePurchaseButtons() {
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            const buyButtons = document.querySelectorAll('a[href="#"]');
            console.log('🛒 Found', buyButtons.length, 'potential buy buttons');
            
            buyButtons.forEach((button, index) => {
                // Check if button text contains "Buy Now" or has shopping cart icon
                const buttonText = button.textContent.toLowerCase();
                const hasShoppingCart = button.querySelector('.fa-shopping-cart');
                
                if (buttonText.includes('buy now') || hasShoppingCart) {
                    console.log('🛒 Activating buy button', index + 1, ':', buttonText.trim());
                    
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        // Get book title from the nearest book card
                        const bookCard = button.closest('.book-detailed-card, .featured-book, .book-card, .book-card-horizontal');
                        let bookTitle = 'Book';
                        
                        if (bookCard) {
                            const titleElement = bookCard.querySelector('h3');
                            if (titleElement) {
                                bookTitle = titleElement.textContent.trim();
                            }
                        }
                        
                        // Create email content
                        const subject = `Book Purchase Request - ${bookTitle}`;
                        const body = `Hello Nelis,

I would like to purchase the book "${bookTitle}".

My contact details:
Name: [Please enter your full name here]
Email: [Please enter your email address here]
Phone: [Optional - your phone number]
Preferred format: [e.g., PDF, Physical copy, eBook, etc.]

Shipping address (if physical copy):
[Please enter your full address if you want a physical copy]

Additional message:
[Any additional comments or questions about the book]

Thank you for your time!

Best regards,
[Your name]`;
                        
                        // Create mailto link (replace with your actual email)
                        const mailtoLink = `mailto:nilsdaniels00@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        
                        // Open email client
                        window.location.href = mailtoLink;
                        
                        console.log('📧 Opening email client for book purchase:', bookTitle);
                        console.log('📧 Email subject:', subject);
                        console.log('📧 Mailto link created successfully');
                    });
                }
            });
        }, 100);
    }

    // Book Data Synchronization
    function syncBookData() {
        // This function could be used to dynamically load book data
        // For now, the data is manually synced in the HTML
        // In the future, you could fetch this from a JSON file or API
        console.log('📚 Book data synchronized between pages');
    }

    // PDF Preview Modal Logic
    function initializePdfPreviewModal() {
        const modal = document.getElementById('pdfPreviewModal');
        const closeBtn = document.getElementById('closePdfModal');
        const frame = document.getElementById('pdfPreviewFrame');
        
        // Find all Read Preview buttons
        const previewButtons = document.querySelectorAll('.btn-secondary, .btn-small.btn-secondary');
        previewButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Only trigger for enabled buttons
                if (btn.classList.contains('disabled')) return;
                e.preventDefault();
                // Determine which book preview to show
                let bookCard = btn.closest('.book-detailed-card, .featured-book');
                let bookTitle = bookCard ? bookCard.querySelector('h3')?.textContent.trim() : '';
                let pdfPath = '';
                if (bookTitle === 'Survivors of the Apocalypse') {
                    pdfPath = 'assets/previews/SurvivorsOfTheApocalypse-preview.pdf';
                } else if (bookTitle === 'Time Travelers') {
                    pdfPath = 'assets/previews/TimeTravelers-preview.pdf';
                } else if (bookTitle === 'Survival Island') {
                    pdfPath = 'assets/previews/SurvivalIsland-preview.pdf';
                } else {
                    pdfPath = '';
                }
                if (pdfPath) {
                    frame.src = pdfPath;
                    modal.style.display = 'flex';
                }
            });
        });
        // Close modal
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            frame.src = '';
        });
        // Close modal on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                frame.src = '';
            }
        });
    }

    // Initialize everything
    initializeThemeToggle();
    initializeContactForm();
    initializeHamburgerMenu();
    initializePurchaseButtons();
    syncBookData();
    initializePdfPreviewModal();
    
    // Load YouTube thumbnails if any exist
    if (document.querySelector('.video-card[data-video-url]')) {
        loadYouTubeThumbnails();
    }
    
    // Make functions globally available
    window.refreshThumbnails = loadYouTubeThumbnails;
    
    console.log('🚀 Nelis0 website initialized successfully!');
});
