
// State
let currentSoftware = [];
let currentMessages = [];
let formFeatures = [];
let formReqs = [];
let formScreenshots = [];

// Parse logic
function parseDescription(descString) {
    try {
        const parsed = JSON.parse(descString);
        if (parsed.features !== undefined) {
            return {
                description: parsed.description || "",
                features: parsed.features || [],
                system_requirements: parsed.system_requirements || [],
                features_subtitle: parsed.features_subtitle || parsed.special_note || "",
                special_note: parsed.special_note || parsed.features_subtitle || "",
                included_app: parsed.included_app || null,
                download_link: parsed.download_link || "",
                category: parsed.category || "General",
                coming_soon: parsed.coming_soon || false,
                order_index: parsed.order_index || 0,
                is_live: parsed.is_live !== undefined ? parsed.is_live : true
            };
        }
    } catch (e) {
        return {
            description: descString || "",
            features: [],
            system_requirements: [],
            features_subtitle: "",
            special_note: "",
            included_app: null,
            download_link: "",
            category: "General",
            coming_soon: false,
            order_index: 0,
            is_live: true
        };
    }
    return {
        description: descString || "",
        features: [],
        system_requirements: [],
        features_subtitle: "",
        special_note: "",
        included_app: null,
        download_link: "",
        category: "General",
        coming_soon: false,
        order_index: 0,
        is_live: true
    };
}

// Icons mapping
function getIconForFeature(featureText) {
    const text = featureText.toLowerCase();
    if(text.includes('sync') || text.includes('cloud')) return 'cloud';
    if(text.includes('track') || text.includes('stat')) return 'bar-chart-2';
    if(text.includes('user') || text.includes('client')) return 'users';
    if(text.includes('fast') || text.includes('speed') || text.includes('rapid')) return 'zap';
    if(text.includes('secure') || text.includes('protect')) return 'shield';
    if(text.includes('time') || text.includes('live')) return 'clock';
    if(text.includes('update')) return 'refresh-cw';
    return 'check-circle';
}

// Render Software Lists
async function loadSoftware() {
    if (!window.supabaseClient) return;
    const { data, error } = await window.supabaseClient.from('software').select('*, screenshots(image_url)').order('created_at', { ascending: false });
    
    if (error) return console.error("Error loading software:", error);
    
    currentSoftware = data;
    
    const pcList = document.getElementById('pc-list');
    const mobileList = document.getElementById('mobile-list');
    
    if(!pcList || !mobileList) return;
    
    pcList.innerHTML = '';
    mobileList.innerHTML = '';
    
    try {
        
        data.sort((a, b) => {
            const parsedA = parseDescription(a.description);
            const parsedB = parseDescription(b.description);
            return (parsedA.order_index || 0) - (parsedB.order_index || 0);
        });

        data.forEach(item => {
            const parsed = parseDescription(item.description);
            const actualImg = (item.image_url && item.image_url !== 'null' && item.image_url !== 'undefined') ? item.image_url : null;
            let logoSrc = actualImg || (item.screenshots && item.screenshots.length > 0 ? item.screenshots[0].image_url : 'https://i.ibb.co/ZR9wZXvC/f3e390d55185.png');
            if (logoSrc && !logoSrc.startsWith('http') && !logoSrc.startsWith('/')) {
                logoSrc = '../' + logoSrc;
            }
            let cardHTML = '';
            
            // Build features preview HTML
            let featuresHTML = '';
            if (parsed.features && parsed.features.length > 0) {
                parsed.features.slice(0, 3).forEach(f => {
                    const fTitle = typeof f === 'object' ? f.title : f;
                    const fDesc = typeof f === 'object' && f.desc ? f.desc : '';
                    if (fDesc) {
                        featuresHTML += `<div class="app-card-feature" style="font-size: 0.8rem; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 8px;"><i data-lucide="${getIconForFeature(fTitle)}" style="width:14px; color: var(--primary);"></i> <span style="font-weight: 600; color: white;">${fTitle}</span></div>
                            <div style="font-size: 0.75rem; color: var(--text-dim); margin-left: 22px; line-height: 1.4; white-space: normal;">${fDesc}</div>
                        </div>`;
                    } else {
                        featuresHTML += `<div class="app-card-feature" style="font-size: 0.8rem;"><i data-lucide="${getIconForFeature(fTitle)}" style="width:14px;"></i> ${fTitle}</div>`;
                    }
                });
                if(parsed.features.length > 3) {
                    featuresHTML += `<div class="app-card-feature" style="font-size: 0.8rem; background: transparent; border: none;">+${parsed.features.length - 3} more</div>`;
                }
            } else {
                featuresHTML = '<div style="color: var(--text-dim); font-size: 0.8rem;">No features listed</div>';
            }
            
            const liveToggleHtml = `
                <div style="display: flex; align-items: center; justify-content: center; width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; margin-top: 15px; gap: 10px;">
                    <label class="premium-toggle" style="margin: 0;">
                        <input type="checkbox" onchange="toggleLiveStatus('${item.id}', this.checked)" ${parsed.is_live ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="font-size: 0.85rem; color: ${parsed.is_live ? '#4ade80' : 'var(--text-dim)'}; font-weight: 600;">${parsed.is_live ? 'LIVE' : 'HIDDEN'}</span>
                </div>
            `;

            if (item.type && item.type.toLowerCase() === 'pc') {
                // PC Card Format
                let reqsHtml = '';
                if(parsed.system_requirements && parsed.system_requirements.length > 0) {
                    reqsHtml = `<div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 15px;">` + 
                        parsed.system_requirements.slice(0,3).map(r => `<span style="font-size: 0.7rem; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); padding: 2px 8px; border-radius: 20px; color: #93c5fd;">${r}</span>`).join('') + 
                        `</div>`;
                }

                cardHTML = `
                        <div class="app-card reveal" style="background: rgba(255, 255, 255, 0.02); display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                            <div style="position: absolute; top: 15px; right: 15px; font-size: 0.75rem; color: var(--text-dim); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; z-index: 10;">Order: ${parsed.order_index}</div>
                            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
                                <div style="width: 250px; height: 250px; flex-shrink: 0; background: rgba(0,0,0,0.2); border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                                    <img src="${logoSrc}" alt="Logo" class="app-logo" style="width: 100%; height: 100%; object-fit: contain;">
                                </div>
                                <div class="app-card-info" style="flex: 1;">
                                    <div class="badge" style="font-size: 0.65rem; padding: 3px 8px; display: inline-block; margin-bottom: 5px;">${(parsed.category || 'Software').toUpperCase()}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; margin-top: 5px; width: 100%;">
                                        <h2 style="margin: 0; font-size: 1.4rem;">${item.title}</h2>
                                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                                            <span style="font-size: 0.85rem; color: ${parsed.is_live ? '#4ade80' : 'var(--text-dim)'}; font-weight: 600;">${parsed.is_live ? 'LIVE' : 'HIDDEN'}</span>
                                            <label class="premium-toggle" style="margin: 0;">
                                                <input type="checkbox" onchange="toggleLiveStatus('${item.id}', this.checked)" ${parsed.is_live ? 'checked' : ''}>
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <p style="margin-bottom: 15px; font-size: 0.85rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${parsed.description}</p>
                                    ${reqsHtml}
                                </div>
                          </div>
                          
                          <div class="app-card-features" style="grid-template-columns: 1fr 1fr; margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px;">
                              ${featuresHTML}
                          </div>
                          
                          <div class="app-card-actions" style="flex-wrap: wrap; justify-content: center; margin-top: auto;">
                              ${parsed.coming_soon ? `<button class="btn-primary" onclick="showToast('App is Coming Soon!', 'success')"><i data-lucide="download"></i> Link</button>` : (parsed.download_link && parsed.download_link !== 'javascript:void(0)' ? `<a href="${parsed.download_link}" target="_blank" class="btn-primary"><i data-lucide="download"></i> Link</a>` : `<button class="btn-primary" style="pointer-events: none;"><i data-lucide="download"></i> Link</button>`)}
                              <button class="toggle-gallery-btn" onclick="openAdminGallery('${item.id}', '${item.title.replace(/'/g, "\'")}')"><i data-lucide="image"></i> Gallery</button>
                              <button class="btn-outline" style="border-color: var(--primary); color: var(--primary);" onclick="editApp('${item.id}')"><i data-lucide="edit"></i> Edit</button>
                              <button class="btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="deleteApp('${item.id}')"><i data-lucide="trash-2"></i> Delete</button>
                          </div>
                      </div>
                  `;
            } else {
                // Mobile Card Format
                cardHTML = `
                        <div class="app-card reveal" style="display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                            <div style="position: absolute; top: 15px; right: 15px; font-size: 0.75rem; color: var(--text-dim); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; z-index: 10;">Order: ${parsed.order_index}</div>
                            <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 15px;">
                                <img src="${logoSrc}" alt="Logo" class="app-logo" style="width: 80px; height: 80px; border-radius: 18px; object-fit: ${logoSrc.includes('f3e390d55185.png') ? 'contain' : 'cover'}; ${logoSrc.includes('f3e390d55185.png') ? 'background: #0a0a0a; padding: 10px;' : ''} box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                <div class="app-card-info" style="flex: 1;">
                                    <div class="badge" style="font-size: 0.65rem; padding: 3px 8px; display: inline-block; margin-bottom: 5px;">${(parsed.category || 'App').toUpperCase()}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; width: 100%;">
                                        <h2 style="margin: 0; font-size: 1.3rem;">${item.title}</h2>
                                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                                            <span style="font-size: 0.85rem; color: ${parsed.is_live ? '#4ade80' : 'var(--text-dim)'}; font-weight: 600;">${parsed.is_live ? 'LIVE' : 'HIDDEN'}</span>
                                            <label class="premium-toggle" style="margin: 0;">
                                                <input type="checkbox" onchange="toggleLiveStatus('${item.id}', this.checked)" ${parsed.is_live ? 'checked' : ''}>
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p style="margin-bottom: 25px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1;">${parsed.description}</p>
                            ${parsed.special_note ? `<div class="note-card" style="margin-bottom: 25px; padding: 12px; border-radius: 8px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); font-size: 0.85rem; display: flex; gap: 10px; align-items: flex-start;"><i data-lucide="info" style="width: 16px; flex-shrink: 0; color: var(--primary);"></i> <span>${parsed.special_note}</span></div>` : ''}
                            
                            <div class="app-card-features">
                              ${featuresHTML}
                          </div>
                          
                          <div class="app-card-actions" style="flex-wrap: wrap; justify-content: center; margin-top: auto;">
                              ${parsed.coming_soon ? `<button class="btn-primary" onclick="showToast('App is Coming Soon!', 'success')"><i data-lucide="download"></i> Download</button>` : (parsed.download_link && parsed.download_link !== 'javascript:void(0)' ? `<a href="${parsed.download_link}" target="_blank" class="btn-primary"><i data-lucide="download"></i> Download</a>` : `<button class="btn-primary" style="pointer-events: none;"><i data-lucide="download"></i> Download</button>`)}
                              <button class="toggle-gallery-btn" onclick="openAdminGallery('${item.id}', '${item.title.replace(/'/g, "\'")}')"><i data-lucide="image"></i> View Screenshots</button>
                              <button class="btn-outline" style="border-color: var(--primary); color: var(--primary);" onclick="editApp('${item.id}')"><i data-lucide="edit"></i> Edit</button>
                              <button class="btn-outline" style="border-color: var(--danger); color: var(--danger);" onclick="deleteApp('${item.id}')"><i data-lucide="trash-2"></i> Delete</button>
                          </div>
                      </div>
                  `;
            }

            if (item.type && item.type.toLowerCase() === 'pc') {
                pcList.innerHTML += cardHTML;
            } else {
                mobileList.innerHTML += cardHTML;
            }
        });
    } catch(e) {
        showToast("Render error: " + e.message, 'error');
        console.error("Render error in loadSoftware:", e);
    }

    lucide.createIcons();
    
    // Make sure newly rendered items become visible
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => {
            el.classList.add('active');
        });
    }, 50);
}

function renderFeatures(type) {
    const list = document.getElementById(type + '-features-list-preview');
    if (!list) return;
    list.innerHTML = '';
    formFeatures.forEach((f, idx) => {
        const title = typeof f === 'object' ? f.title : f;
        const desc = typeof f === 'object' && f.desc ? f.desc : '';
        list.innerHTML += `
        <div class="feature-tag" style="display:flex; flex-direction:column; align-items:flex-start; padding: 10px 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
            <div style="display:flex; justify-content:space-between; width: 100%; align-items:center;">
                <b style="color:white; font-size: 0.95rem;">${title}</b>
                <i data-lucide="x" onclick="removeFeature(${idx}, '${type}')" style="cursor:pointer; color:var(--danger); width:16px;"></i>
            </div>
            ${desc ? `<span style="font-size:0.85rem; color:var(--text-dim); margin-top:5px; line-height: 1.4;">${desc}</span>` : ''}
        </div>`;
    });
    lucide.createIcons();
    if(type === 'mobile') updateLivePreview();
}

function addFeature(type) {
    if (type === 'pc') {
        const titleInput = document.getElementById('pc-feature-title-input');
        const descInput = document.getElementById('pc-feature-desc-input');
        if(titleInput.value.trim() !== '') {
            formFeatures.push({
                title: titleInput.value.trim(),
                desc: descInput.value.trim()
            });
            titleInput.value = '';
            descInput.value = '';
            renderFeatures(type);
        }
    } else {
        const input = document.getElementById('mobile-feature-input');
        if(input.value.trim() !== '') {
            formFeatures.push(input.value.trim());
            input.value = '';
            renderFeatures(type);
        }
    }
}

function removeFeature(idx, type) {
    formFeatures.splice(idx, 1);
    renderFeatures(type);
}

function renderReqs(type) {
    const list = document.getElementById(type + '-req-list-preview');
    if(!list) return;
    list.innerHTML = '';
    formReqs.forEach((r, idx) => {
        list.innerHTML += `<div class="feature-tag" style="padding: 6px 12px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 50px; font-size: 0.85rem; color: #93c5fd; display:flex; align-items:center; gap: 8px;">${r} <i data-lucide="x" onclick="removeReq(${idx}, '${type}')" style="cursor:pointer; width:14px; height:14px; color:var(--danger);"></i></div>`;
    });
    lucide.createIcons();
}

function addReq(type) {
    const input = document.getElementById(type + '-req-input');
    if(!input) return;
    if(input.value.trim() !== '') {
        formReqs.push(input.value.trim());
        input.value = '';
        renderReqs(type);
    }
}

function removeReq(idx, type) {
    formReqs.splice(idx, 1);
    renderReqs(type);
}

function updateLogoPreview(input, type) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(type + '-logo-preview').src = e.target.result;
            document.getElementById(type + '-logo-preview').style.display = 'block';
            document.getElementById(type + '-logo-icon-container').style.display = 'none';
            if(type === 'mobile') updateLivePreview();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function addScreenshots(input, type) {
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            formScreenshots.push({
                url: URL.createObjectURL(file),
                file: file,
                existing: false
            });
        });
        input.value = ''; 
        renderScreenshots(type);
    }
}

function removeScreenshot(idx, type) {
    formScreenshots.splice(idx, 1);
    renderScreenshots(type);
}

function renderScreenshots(type) {
    const previewContainer = document.getElementById(type + '-screenshot-previews');
    if(!previewContainer) return;
    previewContainer.innerHTML = '';
    
    formScreenshots.forEach((s, idx) => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.flexShrink = '0';
        
        const img = document.createElement('img');
        let displayUrl = s.url;
        if (displayUrl && !displayUrl.startsWith('http') && !displayUrl.startsWith('blob:') && !displayUrl.startsWith('/')) {
            displayUrl = '../' + displayUrl;
        }
        img.src = displayUrl;
        img.style.width = '36px';
        img.style.height = '36px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        img.style.border = '1px solid rgba(255,255,255,0.2)';
        
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '<i data-lucide="x" style="width:10px; height:10px; stroke-width: 3px;"></i>';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '-4px';
        closeBtn.style.right = '-4px';
        closeBtn.style.background = 'var(--danger)';
        closeBtn.style.color = 'white';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.width = '16px';
        closeBtn.style.height = '16px';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => removeScreenshot(idx, type);

        wrapper.appendChild(img);
        wrapper.appendChild(closeBtn);
        previewContainer.appendChild(wrapper);
    });
    lucide.createIcons();
}

function updateLivePreview() {
    const previewContainer = document.getElementById('mobile-live-preview-container');
    if(!previewContainer) return;
    
    const title = document.getElementById('mobile-app-title').value || 'App Name';
    const category = document.getElementById('mobile-app-category').value || 'Category';
    const desc = document.getElementById('mobile-app-desc').value || 'Description text here...';
    const note = document.getElementById('mobile-app-note').value;
    const isComingSoon = document.getElementById('mobile-app-coming-soon').checked;
    const logoSrc = document.getElementById('mobile-logo-preview').src || 'https://i.ibb.co/ZR9wZXvC/f3e390d55185.png';

    let featuresHTML = '';
    if(formFeatures.length === 0) {
        featuresHTML = `<div class="app-card-feature"><i data-lucide="check-circle"></i> Feature 1</div><div class="app-card-feature"><i data-lucide="check-circle"></i> Feature 2</div>`;
    } else {
        formFeatures.forEach(f => {
            const fTitle = typeof f === 'object' ? f.title : f;
            const fDesc = typeof f === 'object' && f.desc ? f.desc : '';
            if (fDesc) {
                featuresHTML += `<div class="app-card-feature" style="font-size: 0.8rem; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;"><i data-lucide="${getIconForFeature(fTitle)}" style="width:14px; color: var(--primary);"></i> <span style="font-weight: 600; color: white;">${fTitle}</span></div>
                    <div style="font-size: 0.75rem; color: var(--text-dim); margin-left: 22px; line-height: 1.4; white-space: normal;">${fDesc}</div>
                </div>`;
            } else {
                featuresHTML += `<div class="app-card-feature"><i data-lucide="${getIconForFeature(fTitle)}"></i> ${fTitle}</div>`;
            }
        });
    }

    const btnTitle = title;
    
    previewContainer.innerHTML = `
        <div class="app-card" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <div class="app-card-header" style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 15px;">
                  <img src="${logoSrc}" alt="Logo" class="app-logo" style="width: 80px; height: 80px; border-radius: 16px; object-fit: ${logoSrc.includes('f3e390d55185.png') ? 'contain' : 'cover'}; ${logoSrc.includes('f3e390d55185.png') ? 'background: #0a0a0a; padding: 10px;' : ''} box-shadow: 0 4px 10px rgba(0,0,0,0.3); flex-shrink: 0; ${document.getElementById('mobile-logo-preview').style.display === 'none' ? 'opacity: 0.5;' : ''}">
                  <div class="app-card-info" style="flex: 1; min-width: 0;">
                      <div class="badge" style="background: rgba(255,255,255,0.1); color: #e2e8f0; font-size: 0.65rem; padding: 3px 8px; border-radius: 50px; display: inline-block; margin-bottom: 5px; font-weight: 600;">${category.toUpperCase()}</div>
                      <h2 style="font-size: 1.5rem; margin: 0 0 5px 0; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h2>
                  </div>
            </div>
            <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin: 0 0 25px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${desc}</p>
            ${note ? `<div class="note-card" style="margin-bottom: 25px; padding: 12px; border-radius: 8px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); font-size: 0.85rem; display: flex; gap: 10px; align-items: flex-start;"><i data-lucide="info" style="width: 16px; flex-shrink: 0; color: var(--primary);"></i> <span>${note}</span></div>` : ''}
            
            <div style="border-top: 1px dashed rgba(255,255,255,0.15); margin: 25px 0;"></div>
            
            <div class="app-card-features">
                ${featuresHTML}
            </div>
            
            <div class="app-card-actions" style="display: flex; gap: 10px;">
                ${!isComingSoon 
                    ? `<a href="#" class="btn-primary" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 6px; padding: 12px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; pointer-events: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><i data-lucide="download" style="width: 16px; height: 16px; flex-shrink: 0;"></i> Download ${btnTitle}</a>`
                    : `<button class="btn-primary" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 6px; padding: 12px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; pointer-events: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><i data-lucide="download" style="width: 16px; height: 16px; flex-shrink: 0;"></i> Download ${btnTitle}</button>`}
                <button class="toggle-gallery-btn" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 6px; padding: 12px 10px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; font-size: 0.85rem; font-weight: 600; pointer-events: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><i data-lucide="image" style="width: 16px; height: 16px; flex-shrink: 0;"></i> View Screenshots</button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function openModal(type) {
    document.getElementById(type + '-app-id').value = '';
    
    formFeatures = [];
    formReqs = [];
    formScreenshots = [];
    renderFeatures(type);
    renderReqs(type);
    renderScreenshots(type);
    
    document.getElementById(type + '-logo-preview').src = '';
    document.getElementById(type + '-logo-preview').style.display = 'none';
    document.getElementById(type + '-logo-icon-container').style.display = 'flex';
    document.getElementById(type + '-app-image').value = '';
    document.getElementById(type + '-app-screenshots').value = '';
    
    document.getElementById(type + '-app-title').value = '';
    document.getElementById(type + '-app-category').value = '';
    document.getElementById(type + '-app-desc').value = '';
    document.getElementById(type + '-app-download-link').value = '';
    document.getElementById(type + '-app-coming-soon').checked = false;
    document.getElementById(type + '-app-order').value = '0';
    
    if (type === 'pc') {
        document.getElementById('pc-app-features-subtitle').value = '';
        document.getElementById('pc-app-has-included').checked = false;
        document.getElementById('pc-included-app-fields').style.display = 'none';
        document.getElementById('pc-included-app-title').value = '';
        document.getElementById('pc-included-app-desc').value = '';
        document.getElementById('pc-included-app-features').value = '';
        document.getElementById('pc-included-app-logo').value = '';
        document.getElementById('pc-included-app-logo-name').textContent = 'No file chosen';
    } else {
        document.getElementById('mobile-app-note').value = '';
    }

    const modal = document.getElementById(type + '-app-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
    
    if(type === 'mobile') updateLivePreview();
}

function closeModal() {
    const pcModal = document.getElementById('pc-app-modal');
    const mobileModal = document.getElementById('mobile-app-modal');
    
    if(pcModal.style.display !== 'none') {
        pcModal.style.opacity = '0';
        pcModal.style.pointerEvents = 'none';
        setTimeout(() => { pcModal.style.display = 'none'; }, 400);
    }
    
    if(mobileModal.style.display !== 'none') {
        mobileModal.style.opacity = '0';
        mobileModal.style.pointerEvents = 'none';
        setTimeout(() => { mobileModal.style.display = 'none'; }, 400);
    }
}

async function editApp(id) {
    if (!window.supabaseClient) return;
    const app = currentSoftware.find(s => s.id === id);
    if (!app) return;
    
    const type = (app.type || 'mobile').toLowerCase();
    const parsed = parseDescription(app.description);
    
    document.getElementById(type + '-app-image').value = '';
    document.getElementById(type + '-app-screenshots').value = '';
    
    document.getElementById(type + '-app-id').value = app.id;
    document.getElementById(type + '-app-title').value = app.title;
    document.getElementById(type + '-app-category').value = parsed.category;
    document.getElementById(type + '-app-desc').value = parsed.description;
    
    if (type === 'pc') {
        document.getElementById('pc-app-features-subtitle').value = parsed.features_subtitle;
        if (parsed.included_app) {
            document.getElementById('pc-app-has-included').checked = true;
            document.getElementById('pc-included-app-fields').style.display = 'block';
            document.getElementById('pc-included-app-title').value = parsed.included_app.title || '';
            document.getElementById('pc-included-app-desc').value = parsed.included_app.desc || '';
            document.getElementById('pc-included-app-features').value = parsed.included_app.features ? parsed.included_app.features.join(', ') : '';
            // Don't pre-fill file input, just reset UI text
            document.getElementById('pc-included-app-logo').value = '';
            document.getElementById('pc-included-app-logo-name').textContent = 'No file chosen';
        } else {
            document.getElementById('pc-app-has-included').checked = false;
            document.getElementById('pc-included-app-fields').style.display = 'none';
            document.getElementById('pc-included-app-title').value = '';
            document.getElementById('pc-included-app-desc').value = '';
            document.getElementById('pc-included-app-features').value = '';
            document.getElementById('pc-included-app-logo').value = '';
            document.getElementById('pc-included-app-logo-name').textContent = 'No file chosen';
        }
    } else {
        document.getElementById('mobile-app-note').value = parsed.special_note;
    }
    
    document.getElementById(type + '-app-download-link').value = parsed.download_link;
    document.getElementById(type + '-app-coming-soon').checked = parsed.coming_soon || false;
    document.getElementById(type + '-app-order').value = parsed.order_index || 0;
    
    formFeatures = parsed.features || [];
    renderFeatures(type);
    
    if(type === 'pc') {
        formReqs = parsed.system_requirements || [];
        renderReqs(type);
    }
    
    if (app.image_url) {
        document.getElementById(type + '-logo-preview').src = app.image_url;
        document.getElementById(type + '-logo-preview').style.display = 'block';
        document.getElementById(type + '-logo-icon-container').style.display = 'none';
    } else {
        document.getElementById(type + '-logo-preview').style.display = 'none';
        document.getElementById(type + '-logo-icon-container').style.display = 'flex';
    }

    formScreenshots = [];
    const { data: screens } = await window.supabaseClient.from('screenshots').select('*').eq('software_id', id);
    if(screens && screens.length > 0) {
        screens.forEach(s => {
            formScreenshots.push({ url: s.image_url, existing: true });
        });
    }
    renderScreenshots(type);

    const modal = document.getElementById(type + '-app-modal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
    
    if(type === 'mobile') updateLivePreview();
}

window.window.appToDelete = null;

window.deleteApp = function(id) {
    window.appToDelete = id;
    const modal = document.getElementById('delete-confirm-modal');
    if(modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
        }, 10);
        if(window.lucide) lucide.createIcons();
    } else {
        if(confirm("Are you sure you want to delete this app?")) {
            executeDeleteAction(id);
        }
    }
}

window.closeDeleteConfirm = function() {
    window.appToDelete = null;
    const modal = document.getElementById('delete-confirm-modal');
    if(modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        modal.classList.add('hidden');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    }
}

window.executeDeleteAction = function(id = null) {
    const targetId = id || window.appToDelete;
    if(!targetId) return;
    
    closeDeleteConfirm();
    
    window.supabaseClient.from('software').delete().eq('id', targetId).then(({error}) => {
        if(error) {
            showToast("Error deleting: " + error.message, 'error');
        } else {
            showToast("Application deleted successfully", "success");
            loadSoftware();
        }
    });
}

// Ensure toggleLiveStatus uses correct parsing
async function toggleLiveStatus(id, isLive) {
    const app = currentSoftware.find(s => s.id === id);
    if(!app) return;
    
    const parsed = parseDescription(app.description);
    parsed.is_live = isLive;
    
    const newDesc = JSON.stringify(parsed);
    const { error } = await window.supabaseClient.from('software').update({ description: newDesc }).eq('id', id);
    
    if(error) {
        showToast("Error updating live status: " + error.message, 'error');
        // Revert UI toggle
        loadSoftware();
    } else {
        showToast(isLive ? "App is now LIVE" : "App is now HIDDEN", "success");
        loadSoftware();
    }
}

async function saveApp(type) {
    if (!window.supabaseClient) return;
    
    const title = document.getElementById(type + '-app-title').value;
    if(!title) return showToast("Title is required!", 'error');

    const btn = document.getElementById(type + '-save-btn');
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Saving...';
    lucide.createIcons();
    btn.disabled = true;

    const id = document.getElementById(type + '-app-id').value;
    const category = document.getElementById(type + '-app-category').value;
    const descText = document.getElementById(type + '-app-desc').value;
    const link = document.getElementById(type + '-app-download-link').value;
    const isComingSoon = document.getElementById(type + '-app-coming-soon').checked;
    const orderIndex = parseInt(document.getElementById(type + '-app-order').value) || 0;
    
    let featuresSubtitle = "";
    let specialNote = "";
    let includedApp = null;
    
    if (type === 'pc') {
        featuresSubtitle = document.getElementById('pc-app-features-subtitle').value;
        if (document.getElementById('pc-app-has-included').checked) {
            includedApp = {
                title: document.getElementById('pc-included-app-title').value,
                desc: document.getElementById('pc-included-app-desc').value,
                features: document.getElementById('pc-included-app-features').value.split(',').map(s => s.trim()).filter(s => s)
            };
            // Keep existing logo url if not updated during this save.
            if(id) {
                const existingApp = currentSoftware.find(s => s.id === id);
                if (existingApp) {
                    const parsedEx = parseDescription(existingApp.description);
                    if (parsedEx.included_app && parsedEx.included_app.logo_url) {
                        includedApp.logo_url = parsedEx.included_app.logo_url;
                    }
                }
            }
        }
    } else {
        specialNote = document.getElementById('mobile-app-note').value;
    }
    
    let isLiveState = true;
    if (id) {
        const existingApp = currentSoftware.find(s => s.id === id);
        if (existingApp) {
            isLiveState = parseDescription(existingApp.description).is_live;
        }
    }
    
    const descriptionJson = JSON.stringify({
        description: descText,
        features: formFeatures,
        system_requirements: type === 'pc' ? formReqs : [],
        features_subtitle: featuresSubtitle,
        special_note: specialNote,
        included_app: includedApp,
        download_link: link,
        category: category,
        coming_soon: isComingSoon,
        order_index: orderIndex,
        is_live: isLiveState
    });

    const payload = {
        title: title,
        type: type,
        version: "1.0",
        short_description: "",
        description: descriptionJson
    };

    let savedSoftwareId = id;

    if (id) {
        const { error } = await window.supabaseClient.from('software').update(payload).eq('id', id);
        if (error) {
            btn.innerHTML = '<i data-lucide="save"></i> Save Application';
            btn.disabled = false;
            return showToast("Error updating: " + error.message, 'error');
        }
    } else {
        const { data, error } = await window.supabaseClient.from('software').insert([payload]).select();
        if (error) {
            btn.innerHTML = '<i data-lucide="save"></i> Save Application';
            btn.disabled = false;
            return showToast("Error saving: " + error.message, 'error');
        }
        if(data && data.length > 0) savedSoftwareId = data[0].id;
    }

    // Handle Logo Upload for the App itself
    const logoFile = document.getElementById(type + '-app-image').files[0];
    if (logoFile && savedSoftwareId) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${savedSoftwareId}-logo-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await window.supabaseClient.storage.from('assets').upload(fileName, logoFile);
        if (!uploadError) {
            const { data: publicUrlData } = window.supabaseClient.storage.from('assets').getPublicUrl(fileName);
            await window.supabaseClient.from('software').update({ image_url: publicUrlData.publicUrl }).eq('id', savedSoftwareId);
        } else {
            console.error("Logo upload error:", uploadError);
        }
    }
    
    // Handle Bonus App Logo Upload if type is PC
    if (type === 'pc' && includedApp) {
        const bonusLogoFile = document.getElementById('pc-included-app-logo').files[0];
        if (bonusLogoFile && savedSoftwareId) {
            const bFileExt = bonusLogoFile.name.split('.').pop();
            const bFileName = `${savedSoftwareId}-bonus-logo-${Math.random()}.${bFileExt}`;
            const { error: bUploadError } = await window.supabaseClient.storage.from('assets').upload(bFileName, bonusLogoFile);
            if (!bUploadError) {
                const { data: bPublicUrlData } = window.supabaseClient.storage.from('assets').getPublicUrl(bFileName);
                includedApp.logo_url = bPublicUrlData.publicUrl;
                
                // Re-save the JSON with the new logo URL
                const updatedDescriptionJson = JSON.stringify({
                    description: descText,
                    features: formFeatures,
                    system_requirements: formReqs,
                    features_subtitle: featuresSubtitle,
                    special_note: specialNote,
                    included_app: includedApp,
                    download_link: link,
                    category: category,
                    coming_soon: isComingSoon,
                    order_index: orderIndex,
                    is_live: isLiveState
                });
                await window.supabaseClient.from('software').update({ description: updatedDescriptionJson }).eq('id', savedSoftwareId);
            } else {
                console.error("Bonus Logo upload error:", bUploadError);
            }
        }
    }

    // Handle Screenshots Upload
    if (savedSoftwareId) {
        await window.supabaseClient.from('screenshots').delete().eq('software_id', savedSoftwareId);
        
        for(let i=0; i<formScreenshots.length; i++) {
            const sItem = formScreenshots[i];
            
            if (sItem.file) {
                const sExt = sItem.file.name.split('.').pop();
                const sName = `${savedSoftwareId}-screen-${i}-${Math.random()}.${sExt}`;
                const { error: sUploadError } = await window.supabaseClient.storage.from('assets').upload(sName, sItem.file);
                
                if(!sUploadError) {
                    const { data: sPublicUrlData } = window.supabaseClient.storage.from('assets').getPublicUrl(sName);
                    await window.supabaseClient.from('screenshots').insert([{
                        software_id: savedSoftwareId,
                        image_url: sPublicUrlData.publicUrl
                    }]);
                } else {
                    console.error("Screenshot upload error:", sUploadError);
                }
            } else if (sItem.url && sItem.existing) {
                await window.supabaseClient.from('screenshots').insert([{
                    software_id: savedSoftwareId,
                    image_url: sItem.url
                }]);
            }
        }
    }

    closeModal();
    loadSoftware();
    btn.innerHTML = '<i data-lucide="save"></i> Save Application';
    btn.disabled = false;
    showToast("Application saved successfully!", "success");
}

function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 4000);
}

// Basic gallery modal logic is assumed identical to before
function openAdminGallery(id, title) {
    const app = currentSoftware.find(s => s.id === id);
    if (!app) return;
    
    const modal = document.getElementById('admin-gallery-modal');
    document.getElementById('admin-gallery-title').textContent = title + " Gallery";
    
    const grid = document.getElementById('admin-gallery-grid');
    grid.innerHTML = '';
    
    if (app.screenshots && app.screenshots.length > 0) {
        app.screenshots.forEach(s => {
            const url = s.image_url && !s.image_url.startsWith('http') && !s.image_url.startsWith('/') ? '../' + s.image_url : s.image_url;
            grid.innerHTML += `<div style="border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);"><img src="${url}" style="width: 100%; display: block; object-fit: cover;"></div>`;
        });
    } else {
        grid.innerHTML = '<div style="color: var(--text-dim); text-align: center; grid-column: 1 / -1; padding: 40px;">No screenshots available.</div>';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
}

function closeAdminGallery() {
    const modal = document.getElementById('admin-gallery-modal');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
}

async function loadMessages() {
    if (!window.supabaseClient) return;
    const { data, error } = await window.supabaseClient.from('messages').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);
    
    // Use localStorage for read tracking since the DB schema wasn't updated
    const readMessages = JSON.parse(localStorage.getItem('read_messages') || '[]');
    
    currentMessages = data;
    const list = document.getElementById('messages-list');
    list.innerHTML = '';
    
    data.forEach(msg => {
        const isRead = readMessages.includes(msg.id);
        msg.is_read = isRead;
        
        const date = new Date(msg.created_at).toLocaleDateString();
        const unreadDot = isRead ? '' : '<div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px rgba(239,68,68,0.5);" title="Unread"></div>';
        const rowStyle = isRead ? '' : 'background: rgba(255,255,255,0.03);';
        list.innerHTML += `
            <tr style="${rowStyle}">
                <td style="padding: 15px; white-space: nowrap;">${date}</td>
                <td style="padding: 15px; font-weight: ${isRead ? 'normal' : '600'};">${unreadDot}${msg.name}</td>
                <td style="padding: 15px;">${msg.email}</td>
                <td style="padding: 15px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${isRead ? 'var(--text-dim)' : 'white'};">${msg.message}</td>
                <td style="padding: 15px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-primary" style="padding: 5px 10px;" onclick="viewMessage('${msg.id}')">View</button>
                        <button class="btn-primary" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); padding: 5px 10px;" onclick="deleteMessage('${msg.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

window.viewMessage = async function(id) {
    const msg = currentMessages.find(m => m.id === id);
    if (!msg) return;
    
    document.getElementById('view-message-date').textContent = new Date(msg.created_at).toLocaleString();
    document.getElementById('view-message-name').textContent = msg.name;
    document.getElementById('view-message-email').textContent = msg.email;
    document.getElementById('view-message-content').textContent = msg.message;
    document.getElementById('view-message-reply-btn').href = `mailto:${msg.email}?subject=Reply to your inquiry on NexDV`;
    
    const modal = document.getElementById('view-message-modal');
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
    }, 10);
    
    if (!msg.is_read) {
        msg.is_read = true;
        const readMessages = JSON.parse(localStorage.getItem('read_messages') || '[]');
        if (!readMessages.includes(id)) {
            readMessages.push(id);
            localStorage.setItem('read_messages', JSON.stringify(readMessages));
        }
        loadMessages();
    }
}

window.closeViewMessage = function() {
    const modal = document.getElementById('view-message-modal');
    if(modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        modal.classList.add('hidden');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 400);
    }
}


async function deleteMessage(id) {
    if (!window.supabaseClient) return;
    if(!confirm('Delete this message?')) return;
    await window.supabaseClient.from('messages').delete().eq('id', id);
    loadMessages();
}

// Initial Load
loadSoftware();
loadMessages();

function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + tab).classList.add('active');
    
    const tabs = ['pc', 'mobile', 'messages'];
    tabs.forEach(t => {
        const el = document.getElementById('tab-' + t);
        if (t === tab) {
            el.style.display = 'block';
            el.animate([
                { opacity: 0, transform: 'translateY(15px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], {
                duration: 400,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                fill: 'forwards'
            });
        } else {
            el.style.display = 'none';
        }
    });
}

window.logout = function() {
    const modal = document.getElementById('logout-confirm-modal');
    if(modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
        }, 10);
        if(window.lucide) lucide.createIcons();
    } else {
        if(confirm("Are you sure you want to log out?")) {
            executeLogoutAction();
        }
    }
}

window.closeLogoutConfirm = function() {
    const modal = document.getElementById('logout-confirm-modal');
    if(modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }, 300);
    }
}

window.executeLogoutAction = async function() {
    closeLogoutConfirm();
    try {
        await window.supabaseClient.auth.signOut();
        window.location.href = '../index.html';
    } catch(err) {
        console.error(err);
        showToast("Error logging out", "error");
        window.location.href = '../index.html';
    }
}
