import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://kqajmbuuwtjqmtrrlzcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWptYnV1d3RqcW10cnJsemN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzQwMDIsImV4cCI6MjA5MDAxMDAwMn0.erbeDo2f0jghyU68dJeTXf9ZttcTYxhANBw3EkoZBm4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
let currentEditPodcastId = null;
let currentEditCategoryId = null;
let currentEditItemId = null;

const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');

// Podcast Elements
const addPodcastForm = document.getElementById('addPodcastForm');
const podcastLink = document.getElementById('podcastLink');
const podcastDesc = document.getElementById('podcastDesc');
const podcastList = document.getElementById('podcastList');

// Category Elements
const addCategoryForm = document.getElementById('addCategoryForm');
const categoryName = document.getElementById('categoryName');
const categoryOrder = document.getElementById('categoryOrder');
const categoryList = document.getElementById('categoryList');
const itemCategorySelect = document.getElementById('itemCategory');

// Menu Item Elements
const addItemForm = document.getElementById('addItemForm');
const itemTitle = document.getElementById('itemTitle');
const itemPrice = document.getElementById('itemPrice');
const itemDesc = document.getElementById('itemDesc');
const itemList = document.getElementById('itemList');

// Utility function to extract video ID from various YouTube URLs
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Authentication Flow
async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showDashboard();
    } else {
        showAuth();
    }
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadData();
}

function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    
    // Check if the user exists, if not, sign them up on first try (simple for this scenario)
    // Wait, let's just use standard sign in. The owner will need to be signed up first.
    // For simplicity, we'll try to sign in. If invalid credentials, we show error.
    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        authError.textContent = error.message;
    } else {
        showDashboard();
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showAuth();
});

// Load Data
async function loadData() {
    loadPodcasts();
    loadCategories();
    loadMenuItems();
}

// ============================================
// PODCASTS
// ============================================
async function loadPodcasts() {
    const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
    if (error) return console.error(error);

    podcastList.innerHTML = '';
    data.forEach(podcast => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <h4><a href="https://youtube.com/watch?v=${podcast.video_id}" target="_blank">View Video</a></h4>
                <p>${podcast.description || 'No description'}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                <button class="btn-edit" style="background:var(--primary); color:white; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer;" onclick="editPodcast('${podcast.id}', '${podcast.video_id}', '${(podcast.description || '').replace(/'/g, "\\'")}')">✎</button>
                <button class="btn-delete" onclick="deletePodcast('${podcast.id}')">-</button>
            </div>
        `;
        podcastList.appendChild(div);
    });
}

window.editPodcast = (id, videoId, desc) => {
    currentEditPodcastId = id;
    podcastLink.value = "https://youtube.com/watch?v=" + videoId;
    podcastDesc.value = desc;
    addPodcastForm.querySelector('button[type="submit"]').textContent = 'Update Podcast';
};

addPodcastForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoId = extractVideoID(podcastLink.value);
    
    if (!videoId) {
        alert("Invalid YouTube Link");
        return;
    }

    let error;
    if (currentEditPodcastId) {
        const res = await supabase.from('podcasts').update({ video_id: videoId, description: podcastDesc.value }).eq('id', currentEditPodcastId);
        error = res.error;
    } else {
        const res = await supabase.from('podcasts').insert([
            { video_id: videoId, description: podcastDesc.value }
        ]);
        error = res.error;
    }
    
    if (error) alert(error.message);
    else {
        currentEditPodcastId = null;
        addPodcastForm.querySelector('button[type="submit"]').textContent = 'Add Podcast';
        podcastLink.value = '';
        podcastDesc.value = '';
        loadPodcasts();
    }
});

window.deletePodcast = async (id) => {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (!error) loadPodcasts();
};

// ============================================
// MENU CATEGORIES
// ============================================
async function loadCategories() {
    const { data, error } = await supabase.from('menu_categories').select('*').order('display_order', { ascending: true });
    if (error) return console.error(error);

    categoryList.innerHTML = '';
    itemCategorySelect.innerHTML = '<option value="">Select Category...</option>';
    
    data.forEach(category => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <h4>${category.name}</h4>
                <p>Order: ${category.display_order}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                <button class="btn-edit" style="background:var(--primary); color:white; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer;" onclick="editCategory('${category.id}', '${category.name.replace(/'/g, "\\'")}', '${category.display_order}')">✎</button>
                <button class="btn-delete" onclick="deleteCategory('${category.id}')">-</button>
            </div>
        `;
        categoryList.appendChild(div);

        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        itemCategorySelect.appendChild(option);
    });
}

window.editCategory = (id, name, order) => {
    currentEditCategoryId = id;
    categoryName.value = name;
    categoryOrder.value = order;
    addCategoryForm.querySelector('button[type="submit"]').textContent = 'Update Category';
};

addCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let error;
    if (currentEditCategoryId) {
        const res = await supabase.from('menu_categories').update({ name: categoryName.value, display_order: parseInt(categoryOrder.value) || 0 }).eq('id', currentEditCategoryId);
        error = res.error;
    } else {
        const res = await supabase.from('menu_categories').insert([
            { name: categoryName.value, display_order: parseInt(categoryOrder.value) || 0 }
        ]);
        error = res.error;
    }
    
    if (error) alert(error.message);
    else {
        currentEditCategoryId = null;
        addCategoryForm.querySelector('button[type="submit"]').textContent = 'Add Category';
        categoryName.value = '';
        categoryOrder.value = '';
        loadCategories();
        loadMenuItems();
    }
});

window.deleteCategory = async (id) => {
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (!error) {
        loadCategories();
        loadMenuItems();
    }
};

// ============================================
// MENU ITEMS
// ============================================
async function loadMenuItems() {
    const { data, error } = await supabase.from('menu_items').select('*, menu_categories(name)').order('created_at', { ascending: false });
    if (error) return console.error(error);

    itemList.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <h4>${item.title} (${item.price || ''})</h4>
                <p>Category: ${item.menu_categories?.name || 'Unknown'}</p>
                <p>${item.description || ''}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                <button class="btn-edit" style="background:var(--primary); color:white; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer;" onclick="editItem('${item.id}', '${item.category_id}', '${item.title.replace(/'/g, "\\'")}', '${(item.price || '').replace(/'/g, "\\'")}', '${(item.description || '').replace(/'/g, "\\'")}')">✎</button>
                <button class="btn-delete" onclick="deleteItem('${item.id}')">-</button>
            </div>
        `;
        itemList.appendChild(div);
    });
}

window.editItem = (id, categoryId, title, price, desc) => {
    currentEditItemId = id;
    itemCategorySelect.value = categoryId;
    itemTitle.value = title;
    itemPrice.value = price;
    itemDesc.value = desc;
    addItemForm.querySelector('button[type="submit"]').textContent = 'Update Item';
};

addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let error;
    if (currentEditItemId) {
        const res = await supabase.from('menu_items').update({ 
            category_id: itemCategorySelect.value, 
            title: itemTitle.value, 
            price: itemPrice.value,
            description: itemDesc.value 
        }).eq('id', currentEditItemId);
        error = res.error;
    } else {
        const res = await supabase.from('menu_items').insert([
            { 
                category_id: itemCategorySelect.value, 
                title: itemTitle.value, 
                price: itemPrice.value,
                description: itemDesc.value 
            }
        ]);
        error = res.error;
    }
    
    if (error) alert(error.message);
    else {
        currentEditItemId = null;
        addItemForm.querySelector('button[type="submit"]').textContent = 'Add Item';
        itemTitle.value = '';
        itemPrice.value = '';
        itemDesc.value = '';
        loadMenuItems();
    }
});

window.deleteItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) loadMenuItems();
};

// Start
checkUser();
