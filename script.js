document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Navbar Scroll Effect
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });
});

function toggleGallery(btn, galleryId) {
    const gallery = document.getElementById(galleryId);
    const icon = btn.querySelector('i');
    if(gallery.classList.contains('expanded')) {
        gallery.classList.remove('expanded');
        btn.classList.remove('active');
        icon.setAttribute('data-lucide', 'image');
    } else {
        gallery.classList.add('expanded');
        btn.classList.add('active');
        icon.setAttribute('data-lucide', 'chevron-up');
    }
    lucide.createIcons();
}

// Modal Gallery Logic
let currentModalImages = [];
let currentModalIndex = 0;

function openModalGallery(btn, galleryId, appName) {
    if(event) event.preventDefault(); // Prevent page jump

    const modal = document.getElementById('gallery-modal');
    const title = document.getElementById('modal-title');
    const logo = document.getElementById('modal-app-logo');
    const sourceGallery = document.getElementById(galleryId);
    
    if (modal && sourceGallery) {
        // Extract Logo
        const card = btn.closest('.app-card');
        if(card) {
            const appLogoImg = card.querySelector('img.app-logo');
            if(appLogoImg) {
                logo.src = appLogoImg.src;
                logo.style.display = 'block';
            }
        }
        
        // Extract and deduplicate images
        const imgs = Array.from(sourceGallery.querySelectorAll('img')).map(img => img.src);
        currentModalImages = [...new Set(imgs)];
        currentModalIndex = 0;
        
        // Inject images into sliding track
        const track = document.getElementById('modal-slider-track');
        if(track) {
            track.innerHTML = ''; // clear
            currentModalImages.forEach(src => {
                const slide = document.createElement('div');
                slide.style.flex = '0 0 100vw';
                slide.style.display = 'flex';
                slide.style.justifyContent = 'center';
                slide.style.alignItems = 'center';
                slide.style.height = '100%';

                const img = document.createElement('img');
                img.src = src;
                img.style.maxHeight = '80vh'; 
                img.style.maxWidth = '60vw';
                img.style.height = 'auto';
                img.style.width = 'auto';
                img.style.objectFit = 'contain';
                
                slide.appendChild(img);
                track.appendChild(slide);
            });
            track.style.transform = 'translateX(0vw)';
        }
        
        // Update Title
        if(title && appName) title.innerText = appName + " Screenshots";
        
        // Open Modal
        modal.classList.add('active');
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');
        
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
}

function updateModalSlider() {
    const track = document.getElementById('modal-slider-track');
    if(track) {
        // Slide track by 100% per image
        track.style.transform = "translateX(-" + (currentModalIndex * 100) + "vw)";
    }
}

function nextModalImage() {
    if(currentModalImages.length > 0) {
        currentModalIndex = (currentModalIndex + 1) % currentModalImages.length;
        updateModalSlider();
    }
}

function prevModalImage() {
    if(currentModalImages.length > 0) {
        currentModalIndex = (currentModalIndex - 1 + currentModalImages.length) % currentModalImages.length;
        updateModalSlider();
    }
}

function closeModalGallery() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
    }
}

// Close modal when clicking outside of it
document.addEventListener('click', (e) => {
    const modal = document.getElementById('gallery-modal');
    if (modal && modal.classList.contains('active')) {
        if (e.target === modal || e.target.classList.contains('modal-center-area')) {
            closeModalGallery();
        }
    }
});















// Global Toast Logic
let toastTimeout;
function showComingSoon(event) {
    if(event) event.preventDefault();
    const toast = document.getElementById('coming-soon-toast');
    if(!toast) return;
    
    // Reset timeout if clicked rapidly
    if(toastTimeout) clearTimeout(toastTimeout);
    
    toast.classList.add('show');
    if(typeof lucide !== 'undefined') lucide.createIcons();
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
