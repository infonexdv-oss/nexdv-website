document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on software.html
    if (!window.location.pathname.includes('software.html')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const swId = urlParams.get('id');

    if (!swId) {
        document.getElementById('sw-title').textContent = "Software Not Found";
        document.getElementById('sw-desc').textContent = "Please return to the PC Software page and select a valid application.";
        document.getElementById('loader').style.display = 'none';
        return;
    }

    try {
        if (!window.supabaseClient) throw new Error("Supabase Client not initialized");

        // Fetch Software
        const { data: app, error } = await window.supabaseClient
            .from('software')
            .select('*')
            .eq('id', swId)
            .single();

        if (error || !app) {
            throw error || new Error("App not found");
        }

        // Fetch Screenshots
        const { data: screens, error: screenErr } = await window.supabaseClient
            .from('screenshots')
            .select('*')
            .eq('software_id', swId);

        let parsed = { description: app.description || "", features: [], special_note: "", download_link: "", category: "General", coming_soon: false };
        try {
            const parsedAttempt = JSON.parse(app.description);
            if (parsedAttempt.description !== undefined) {
                parsed = parsedAttempt;
            }
        } catch(e) {}

        const screenshots = screenErr ? [] : screens;
        const mainImgUrl = app.image_url || (screenshots.length > 0 ? screenshots[0].image_url : 'https://i.ibb.co/qLVD2YWg/d7bf73944e81.png');

        // Populate Hero
        document.getElementById('sw-category-badge').textContent = parsed.category.toUpperCase();
        document.getElementById('sw-title').textContent = app.title;
        document.getElementById('sw-desc').textContent = parsed.description || app.short_description;
        document.getElementById('sw-hero-version').textContent = 'v' + app.version;
        
        const heroImg = document.getElementById('sw-hero-img');
        if (screenshots.length > 0) {
            heroImg.src = screenshots[0].image_url;
            heroImg.style.display = 'block';
        }

        // Populate Features
        if (parsed.features_subtitle) {
            document.getElementById('sw-features-desc').textContent = parsed.features_subtitle;
        } else {
            document.getElementById('sw-features-desc').textContent = 'Designed for absolute reliability and speed.';
        }

        const featuresGrid = document.getElementById('sw-features-grid');
        if (parsed.features && parsed.features.length > 0) {
            featuresGrid.innerHTML = parsed.features.map(f => {
                const title = typeof f === 'object' ? f.title : f;
                const desc = typeof f === 'object' && f.desc ? f.desc : 'Enjoy the benefits of our optimized ' + title.toLowerCase() + ' capabilities.';
                return '<div class="glass-card reveal"><div class="icon-wrap"><i data-lucide="check-circle"></i></div><h3>' + title + '</h3><p>' + desc + '</p></div>';
            }).join('');
        } else {
            featuresGrid.innerHTML = '<div class="glass-card reveal"><div class="icon-wrap"><i data-lucide="zap"></i></div><h3>Lightning Fast</h3><p>Optimized for rapid execution with zero latency.</p></div><div class="glass-card reveal"><div class="icon-wrap"><i data-lucide="shield"></i></div><h3>Secure</h3><p>Enterprise-grade security built directly into the core.</p></div><div class="glass-card reveal"><div class="icon-wrap"><i data-lucide="monitor"></i></div><h3>Native PC</h3><p>Harness the full power of Windows desktop architecture.</p></div>';
        }

        // Populate Gallery
        const gallerySection = document.getElementById('gallery');
        const marqueeTrack = document.getElementById('sw-marquee-track');
        if (screenshots.length > 1) { 
            gallerySection.style.display = 'block';
            let galleryHTML = '';
            // Set 1
            screenshots.forEach(s => {
                galleryHTML += '<div class="gallery-item pc"><img src="' + s.image_url + '" alt="Screenshot"></div>';
            });
            // Set 2 for seamless loop
            screenshots.forEach(s => {
                galleryHTML += '<div class="gallery-item pc"><img src="' + s.image_url + '" alt="Screenshot"></div>';
            });
            // Set 3 for extra wide screens
            screenshots.forEach(s => {
                galleryHTML += '<div class="gallery-item pc"><img src="' + s.image_url + '" alt="Screenshot"></div>';
            });
            marqueeTrack.innerHTML = galleryHTML;
        } else if (screenshots.length === 1) {
            gallerySection.style.display = 'block';
            marqueeTrack.innerHTML = '<div class="gallery-item pc" style="margin: 0 auto;"><img src="' + screenshots[0].image_url + '" alt="Screenshot"></div>';
            marqueeTrack.style.animation = 'none'; 
            marqueeTrack.style.justifyContent = 'center';
            marqueeTrack.style.display = 'flex';
        }

        // Free Included App
        const downloadSection = document.getElementById('download');
        const existingFreeApp = document.getElementById('free-mobile');
        if (existingFreeApp) existingFreeApp.remove();

        if (parsed.included_app && parsed.included_app.title) {
            let featuresHtml = '';
            if (parsed.included_app.features && parsed.included_app.features.length > 0) {
                featuresHtml = '<ul class="feature-list">' + 
                    parsed.included_app.features.map(f => `<li><i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--primary);"></i> ${f}</li>`).join('') + 
                    '</ul>';
            }
            
            let visualHtml = '';
            if (parsed.included_app.logo_url) {
                visualHtml = `<img src="${parsed.included_app.logo_url}" alt="Bonus App Logo" style="width: 200px; height: 200px; border: 1px solid var(--border); border-radius: 20%; background: #111; object-fit: contain; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
            } else {
                visualHtml = `
                    <div style="width: 200px; height: 200px; background: rgba(59,130,246,0.1); border: 1px solid var(--primary); border-radius: 20%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <i data-lucide="smartphone" style="width: 80px; height: 80px; color: var(--primary);"></i>
                    </div>
                `;
            }

            const freeAppSection = document.createElement('section');
            freeAppSection.id = 'free-mobile';
            freeAppSection.style.cssText = 'background: var(--bg-card); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);';
            freeAppSection.innerHTML = `
                <div class="container">
                    <div class="app-row reveal active" style="background: transparent; border: none; padding: 0; box-shadow: none;">
                        <div class="app-content">
                            <div class="badge">Included Free</div>
                            <h2>${parsed.included_app.title}</h2>
                            <p>${parsed.included_app.desc}</p>
                            ${featuresHtml}
                            <a href="#download" class="btn-primary" style="margin-top: 10px;">
                                <i data-lucide="smartphone"></i> Get The Bundle
                            </a>
                        </div>
                        <div class="app-visual" style="display: flex; justify-content: center; align-items: center;">
                            ${visualHtml}
                        </div>
                    </div>
                </div>
            `;
            downloadSection.parentNode.insertBefore(freeAppSection, downloadSection);
        }

        // Populate Download Section
        const bottomLogo = document.getElementById('sw-bottom-logo');
        bottomLogo.src = app.image_url || 'https://i.ibb.co/qLVD2YWg/d7bf73944e81.png';
        if(app.image_url) {
            if(app.image_url.includes('f3e390d55185.png')) {
                bottomLogo.style.background = 'transparent';
                bottomLogo.style.padding = '0';
            }
            bottomLogo.style.display = 'block';
        }
        document.getElementById('sw-bottom-desc').textContent = 'Download the latest version of ' + app.title + '.';

        const btnContainer = document.getElementById('sw-download-btn-container');
        if (parsed.coming_soon) {
            btnContainer.innerHTML = `<button class="btn-primary" style="padding: 15px 40px; font-size: 1.1rem; pointer-events: none; opacity: 0.8;">Coming Soon</button>`;
        } else if (parsed.download_link && parsed.download_link !== 'javascript:void(0)') {
            btnContainer.innerHTML = `<a href="${parsed.download_link}" target="_blank" class="btn-primary" style="padding: 15px 40px; font-size: 1.1rem;"><i data-lucide="download"></i> Download Full Installer</a>`;
        } else {
            btnContainer.innerHTML = `<button class="btn-primary" style="padding: 15px 40px; font-size: 1.1rem; pointer-events: none; opacity: 0.5;"><i data-lucide="download"></i> Download Not Available</button>`;
        }

        const sysReqsContainer = document.getElementById('sw-system-reqs');
        if (sysReqsContainer && parsed.system_requirements && parsed.system_requirements.length > 0) {
            sysReqsContainer.innerHTML = parsed.system_requirements.map(req => {
                return '<div class="badge" style="background: transparent; border-color: #555;">' + req.toUpperCase() + '</div>';
            }).join('');
        }

        // Re-initialize Lucide icons for dynamically injected content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Trigger reveal animations for new elements
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('active');
            });
        }, 100);

    } catch (err) {
        console.error('Error fetching software:', err);
        document.getElementById('sw-title').textContent = "Error";
        document.getElementById('sw-desc').textContent = "Failed to load software details. Check console for details.";
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
});
