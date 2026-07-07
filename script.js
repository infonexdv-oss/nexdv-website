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
                slide.style.flex = '0 0 100%';
                slide.style.display = 'flex';
                slide.style.justifyContent = 'center';
                slide.style.alignItems = 'center';
                slide.style.height = '100%';

                const img = document.createElement('img');
                img.src = src;
                img.style.maxHeight = '100%'; 
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.width = 'auto';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '12px';
                
                slide.appendChild(img);
                track.appendChild(slide);
            });
            track.style.transform = 'translateX(0%)';
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
        track.style.transform = "translateX(-" + (currentModalIndex * 100) + "%)";
    }
}

// Auto-detect icons for features
function getIconForFeature(feature) {
    if(!feature) return 'check-circle';
    const f = feature.toLowerCase();
    if (f.includes('sync') || f.includes('cloud')) return 'cloud-lightning';
    if (f.includes('dash') || f.includes('track') || f.includes('analy') || f.includes('revenue')) return 'activity';
    if (f.includes('admin') || f.includes('manage') || f.includes('control') || f.includes('override')) return 'sliders';
    if (f.includes('fast') || f.includes('speed') || f.includes('lightning') || f.includes('latency') || f.includes('performance')) return 'zap';
    if (f.includes('secure') || f.includes('protect') || f.includes('shield') || f.includes('reliability')) return 'shield';
    if (f.includes('mobile') || f.includes('android') || f.includes('ios')) return 'smartphone';
    if (f.includes('data') || f.includes('storage') || f.includes('inventory')) return 'database';
    if (f.includes('sos') || f.includes('emergency')) return 'alert-circle';
    if (f.includes('guide') || f.includes('tutorial') || f.includes('learn') || f.includes('rule')) return 'book-open';
    if (f.includes('location') || f.includes('map') || f.includes('gps')) return 'map-pin';
    if (f.includes('interface') || f.includes('design') || f.includes('ui') || f.includes('dark')) return 'layout';
    if (f.includes('vehicle') || f.includes('auto') || f.includes('car')) return 'car';
    if (f.includes('client') || f.includes('user') || f.includes('customer')) return 'users';
    if (f.includes('service') || f.includes('operation')) return 'briefcase';
    return 'check-circle';
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

// --- Supabase Dynamic Catalog Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    const isPcPage = window.location.pathname.includes('pc');
    const isMobilePage = window.location.pathname.includes('mobile');
    
    if(!isPcPage && !isMobilePage) return;

    const grid = document.getElementById('software-grid');
    const spinner = document.getElementById('loading-spinner');
    if(!grid) return;

    const typeFilter = isPcPage ? 'pc' : 'mobile';

    let software = [];
    let screenshots = [];

    try {
        if (!window.supabaseClient) throw new Error("Supabase Client not initialized");

        // Fetch Software
        const resSoft = await window.supabaseClient
            .from('software')
            .select('*')
            .ilike('type', `%${typeFilter}%`)
            .order('created_at', { ascending: false });

        if(resSoft.error) throw resSoft.error;
        
        // Filter out apps that are explicitly hidden (is_live === false)
        software = resSoft.data.filter(app => {
            try {
                const parsed = typeof app.description === 'string' ? JSON.parse(app.description) : (app.description || {});
                return parsed.is_live !== false;
            } catch(e) {
                return true;
            }
        });

        // Sort by order_index ascending, then created_at descending
        software.sort((a, b) => {
            let orderA = 0, orderB = 0;
            try { orderA = JSON.parse(a.description).order_index; } catch(e){}
            try { orderB = JSON.parse(b.description).order_index; } catch(e){}
            if (!orderA) orderA = 9999;
            if (!orderB) orderB = 9999;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.created_at) - new Date(a.created_at);
        });

        // Fetch Screenshots mapping
        const resScreen = await window.supabaseClient.from('screenshots').select('*');
        if(!resScreen.error) screenshots = resScreen.data;

    } catch (err) {
        console.error('Error fetching software:', err);
    }

    if(spinner) spinner.style.display = 'none';
    grid.style.display = 'grid';

    // If database is empty, we just let the hardcoded HTML remain!
    let newMobileGrid = null;
    let viewAllBtnContainer = null;
    
    if(software.length === 0) {
        // Do nothing, preserving hardcoded elements
    } else {
        if (isPcPage) {
            grid.innerHTML = ''; // Clear hardcoded items so we only show DB items
            const cat = document.getElementById('dynamic-catalog');
            if (cat) cat.style.display = 'block';
        }
    }

    const getScreenshot = (id) => {
        const s = screenshots?.find(sc => sc.software_id === id);
        return s ? s.image_url : 'https://i.ibb.co/qLVD2YWg/d7bf73944e81.png'; // fallback logo
    };

    software.forEach((app, index) => {
        const imgUrl = app.image_url || getScreenshot(app.id); 
        
        const appScreenshots = screenshots.filter(s => s.software_id === app.id);
        let screenshotsHTML = '';
        if (appScreenshots.length > 0) {
            screenshotsHTML = appScreenshots.map(s => `<div class="gallery-item"><img src="${s.image_url}" alt="Screenshot"></div>`).join('');
        } else {
            // Fallback
            screenshotsHTML = `<div class="gallery-item"><img src="${imgUrl}" alt="Screenshot"></div>`;
        }

        let parsed = { description: app.description || "", features: [], special_note: "", download_link: "", category: "General" };
        try {
            const parsedAttempt = JSON.parse(app.description);
            if(parsedAttempt.description !== undefined) {
                parsed = parsedAttempt;
            }
        } catch(e) {}

        const downloadAction = (!parsed.coming_soon && parsed.download_link && parsed.download_link !== '#') 
            ? `<a href="${parsed.download_link}" target="_blank" class="${isPcPage ? 'btn-outline' : 'btn-primary'}" style="${isPcPage ? '' : 'flex:1; display:flex; justify-content:center; align-items:center; gap:8px; padding:12px 15px;'}"><i data-lucide="download"></i> Download</a>`
            : `<button class="${isPcPage ? 'btn-outline' : 'btn-primary'}" onclick="showComingSoon(event)" style="${isPcPage ? '' : 'flex:1; display:flex; justify-content:center; align-items:center; gap:8px; padding:12px 15px;'}"><i data-lucide="download"></i> Download</button>`;

        let featuresHTML = '';
        if (parsed.features && parsed.features.length > 0) {
            parsed.features.forEach(f => {
                featuresHTML += `<div class="app-card-feature"><i data-lucide="${getIconForFeature(f)}" style="width:16px; height:16px; color:#ffffff;"></i> ${f}</div>`;
            });
        } else {
            if (!isPcPage) {
                featuresHTML = `
                    <div class="app-card-feature"><i data-lucide="smartphone" style="width:16px; height:16px; color:#ffffff;"></i> Native Android</div>
                    <div class="app-card-feature"><i data-lucide="zap" style="width:16px; height:16px; color:#ffffff;"></i> Lightning Fast</div>
                    <div class="app-card-feature"><i data-lucide="shield" style="width:16px; height:16px; color:#ffffff;"></i> Secure</div>
                `;
            }
        }

        let cardHTML = '';

        if (isPcPage) {
            const hoverBgUrl = appScreenshots.length > 0 ? appScreenshots[0].image_url : '';
            cardHTML = `
                <div class="pc-adobe-card reveal dynamic-app-card" onclick="window.location.href='software.html?id=${app.id}'" style="background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); border-top: 1px solid rgba(255, 255, 255, 0.15); border-left: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; height: 260px; cursor: pointer; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative; overflow: hidden; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);">
                    
                    ${hoverBgUrl ? `<div class="hover-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('${hoverBgUrl}'); background-size: cover; background-position: center; opacity: 0; transition: opacity 0.6s ease-in-out; z-index: 0;"></div>
                    <div class="hover-gradient" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(21,21,24,0.2) 0%, rgba(21,21,24,0.95) 100%); opacity: 0; transition: opacity 0.6s ease-in-out; z-index: 1;"></div>` : ''}

                    <div style="position: relative; z-index: 2; width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: ${imgUrl.includes('f3e390d55185.png') ? 'transparent' : 'rgba(0,0,0,0.4)'}; padding: ${imgUrl.includes('f3e390d55185.png') ? '0' : '6px'};">
                        <img src="${imgUrl}" alt="${app.title}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 6px;">
                    </div>
                    
                    <div style="position: relative; z-index: 2; margin-top: auto;">
                        <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; color: #ffffff;">${app.title}</h3>
                        <p style="font-size: 0.95rem; color: #a1a1aa; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${parsed.description || app.short_description}</p>
                    </div>
                </div>
            `;
        } else {
            const btnTitle = app.title.length > 15 ? app.title.substring(0, 15) + '...' : app.title;
            cardHTML = `
                <div class="app-card reveal dynamic-app-card" style="position: relative;">
                    <div class="badge" style="position: absolute; top: 15px; right: 15px; font-size: 0.65rem; padding: 3px 8px; display: inline-block; z-index: 10;">${parsed.category.toUpperCase()}</div>
                    <div class="app-card-header" style="margin-bottom: 15px;">
                        <img src="${imgUrl}" alt="${app.title}" class="app-logo" style="object-fit: ${imgUrl.includes('f3e390d55185.png') ? 'contain' : 'cover'}; ${imgUrl.includes('f3e390d55185.png') ? 'background: #0a0a0a; padding: 10px;' : ''}">
                        <div class="app-card-info" style="flex: 1;">
                            <h2 style="margin-top: 15px; margin-bottom: 5px;">${app.title}</h2>
                        </div>
                    </div>
                    <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin-bottom: 25px;">${parsed.description}</p>
                    ${parsed.special_note ? `<div class="note-card" style="margin-bottom: 25px; padding: 12px; border-radius: 8px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); font-size: 0.85rem; display: flex; gap: 10px; align-items: flex-start;"><i data-lucide="info" style="width: 16px; flex-shrink: 0; color: var(--primary);"></i> <span>${parsed.special_note}</span></div>` : ''}
                    
                    <div class="app-card-features">
                        ${featuresHTML}
                    </div>
                    
                    <div class="app-card-actions">
                        ${(!parsed.coming_soon && parsed.download_link && parsed.download_link !== '#') 
                            ? `<a href="${parsed.download_link}" target="_blank" class="btn-primary"><i data-lucide="download"></i> Download ${btnTitle}</a>`
                            : `<button class="btn-primary" onclick="showComingSoon(event)"><i data-lucide="download"></i> Download ${btnTitle}</button>`}
                        <button class="toggle-gallery-btn" onclick="openModalGallery(this, '${app.id}-gallery', '${app.title.replace(/'/g, "\\'")}')"><i data-lucide="image"></i> View Screenshots</button>
                    </div>
                    <div id="${app.id}-gallery" class="gallery-accordion">
                        <div class="marquee-container" style="padding-top: 0; padding-bottom: 20px;">
                            <div class="marquee-track">
                                ${screenshotsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        if (isPcPage) {
            grid.innerHTML += cardHTML;
        } else {
            grid.innerHTML += cardHTML;
        }
    });

    // --- Add Search Filtering Logic ---
    const searchInput = document.getElementById('app-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const allCards = grid.querySelectorAll('.app-card, .app-row');
            
            allCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const isMatch = text.includes(query);
                
                if (isMatch) {
                    if (card.style.display === 'none') {
                        card.style.display = card.classList.contains('app-row') ? 'grid' : 'flex';
                        card.style.animation = 'searchReveal 0.4s ease forwards';
                    } else if (card.style.animationName === 'searchHide') {
                        card.style.animation = 'searchReveal 0.4s ease forwards';
                    }
                } else {
                    if (card.style.display !== 'none' && card.style.animationName !== 'searchHide') {
                        card.style.animation = 'searchHide 0.3s ease forwards';
                        setTimeout(() => {
                            if (searchInput.value && !card.textContent.toLowerCase().includes(searchInput.value.toLowerCase())) {
                                card.style.display = 'none';
                            }
                        }, 280);
                    }
                }
            });
        });
    }

    lucide.createIcons();
    
    // Trigger animations for dynamically added items
    setTimeout(() => {
        document.querySelectorAll('#dynamic-catalog .reveal, .app-grid-container .reveal:not(.active)').forEach(el => {
            el.classList.add('active');
        });
    }, 50);
    
    // Store globally for modal
    window.catalogSoftware = software;
    window.catalogScreenshots = screenshots;
});

window.openSoftwareModal = function(id) {
    const app = window.catalogSoftware?.find(a => a.id === id);
    if(!app) return;
    
    const imgUrl = window.catalogScreenshots?.find(s => s.software_id === id)?.image_url || 'https://i.ibb.co/ZR9wZXvC/f3e390d55185.png';

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div style="text-align:center; margin-bottom: 30px;">
            <img src="${imgUrl}" style="max-height: 300px; max-width: 100%; border-radius: 12px; border: 1px solid var(--border);">
        </div>
        <div class="badge" style="margin-bottom: 10px;">Version ${app.version}</div>
        <h2 style="margin-bottom: 20px;">${app.title}</h2>
        <p style="color: var(--text-dim); line-height: 1.6; margin-bottom: 30px;">${app.description}</p>
        
        ${app.download_url ? `<a href="${app.download_url}" target="_blank" class="btn-primary" style="padding: 15px 30px;"><i data-lucide="download"></i> Download Now</a>` : ''}
    `;
    
    document.getElementById('software-modal').style.display = 'flex';
    lucide.createIcons();
};

// --- Contact Form Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('contact-btn');
            const status = document.getElementById('contact-status');
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            btn.textContent = 'Sending...';
            btn.disabled = true;

            const { error } = await window.supabaseClient.from('messages').insert([
                { name, email, message }
            ]);

            if (error) {
                console.error(error);
                status.style.color = 'var(--danger)';
                status.textContent = 'Failed to send message. Please try again.';
            } else {
                status.style.color = '#10b981';
                status.textContent = 'Message sent successfully! We will get back to you soon.';
                contactForm.reset();
            }
            
            status.style.display = 'block';
            btn.textContent = 'Send Message';
            btn.disabled = false;
            
            setTimeout(() => { status.style.display = 'none'; }, 5000);
        });
    }
});


// Hidden Admin Trigger: 3 rapid clicks on the copyright footer
document.addEventListener('DOMContentLoaded', () => {
    const copyright = document.querySelector('.footer-bottom');
    if (copyright) {
        let clickCount = 0;
        let clickTimer;
        copyright.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount >= 3) {
                window.open('admin/index.html', '_blank');
                clickCount = 0;
            }
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
        });
    }
});
