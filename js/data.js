import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://kqajmbuuwtjqmtrrlzcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWptYnV1d3RqcW10cnJsemN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzQwMDIsImV4cCI6MjA5MDAxMDAwMn0.erbeDo2f0jghyU68dJeTXf9ZttcTYxhANBw3EkoZBm4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// PODCASTS
// ============================================
const videoFeedContainer = document.getElementById('videoFeedContainer');

if (videoFeedContainer) {
    async function loadPodcasts() {
        const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Error loading podcasts:", error);
            return;
        }

        videoFeedContainer.innerHTML = '';
        
        if (!data || data.length === 0) {
            videoFeedContainer.innerHTML = '<p>No podcasts available.</p>';
            return;
        }

        data.forEach(item => {
            const videoWrapper = document.createElement("div");
            videoWrapper.classList.add("video-item");

            videoWrapper.innerHTML = `
                <div class="video-thumbnail">
                    <iframe src="https://www.youtube.com/embed/${item.video_id}" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="video-details">
                    <p class="video-description">${item.description || ''}</p>
                </div>
            `;

            videoFeedContainer.appendChild(videoWrapper);
        });
    }
    loadPodcasts();
}

// ============================================
// MENU
// ============================================
const menuContainer = document.getElementById('menu');

if (menuContainer) {
    async function loadMenu() {
        // Fetch categories and items
        const { data: categories, error: catError } = await supabase.from('menu_categories').select('*').order('display_order', { ascending: true });
        const { data: items, error: itemError } = await supabase.from('menu_items').select('*').order('created_at', { ascending: true });
        
        if (catError || itemError) {
            console.error("Error loading menu:", catError || itemError);
            return;
        }

        menuContainer.innerHTML = '';

        categories.forEach((category, index) => {
            const categoryItems = items.filter(i => i.category_id === category.id);
            if (categoryItems.length === 0) return; // Skip empty categories

            const secDiv = document.createElement('div');
            secDiv.className = 'menuSec';
            if (index === categories.length - 1) secDiv.classList.add('finalMenu');
            secDiv.id = `category-${category.id}`;

            let html = `
                <h2>${category.name}</h2>
                <hr>
                <div class="menuItems">
            `;

            categoryItems.forEach(item => {
                let badgeHtml = '';
                let titleStr = item.title ? item.title.toLowerCase() : '';
                let descStr = item.description ? item.description.toLowerCase() : '';

                // Auto-generate badges based on keywords
                if (titleStr.includes('chef') || descStr.includes('chef')) {
                    badgeHtml += `<span class="menu-badge badge-chef">👨‍🍳 Chef's Choice</span>`;
                }
                if (titleStr.includes('popular') || descStr.includes('popular') || descStr.includes('favorite')) {
                    badgeHtml += `<span class="menu-badge badge-fav">⭐ Popular</span>`;
                }
                if (titleStr.includes('veg') || descStr.includes('veg')) {
                    badgeHtml += `<span class="menu-badge badge-veg">🥬 Vegetarian</span>`;
                }
                if (titleStr.includes('gluten') || descStr.includes('gluten') || descStr.includes('gf')) {
                    badgeHtml += `<span class="menu-badge badge-gf">🌾 Gluten-Free</span>`;
                }

                html += `
                    <div class="menuItem">
                        <h3>${item.title} ${badgeHtml}</h3>
                        ${item.price ? `<p class="euro">${item.price}</p>` : ''}
                        ${item.description ? `<p>${item.description}</p>` : ''}
                    </div>
                `;
            });

            html += `</div>`;
            secDiv.innerHTML = html;
            menuContainer.appendChild(secDiv);
        });
    }
    loadMenu();
}
