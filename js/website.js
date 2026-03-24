//hamburger menu
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector("nav");

document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
        menuToggle.checked = false;
    }
});


//overlays
const openGolfElements = document.getElementsByClassName('openGolf');
const openEvent = document.getElementById('openEvent');
const openQuiz = document.getElementById('openQuiz');
const openCategory = document.getElementById('openCategory');

const golfOverlay = document.getElementById('golfOverlay');
const eventOverlay = document.getElementById('eventOverlay');
const quizOverlay = document.getElementById('quizOverlay');
const categoryOverlay = document.getElementById('categoryOverlay');

const closeButtons = document.querySelectorAll(".x");
const closeMenu = document.querySelectorAll(".close");

for (const golfElement of openGolfElements) {
    golfElement.addEventListener('click', (e) => {
        e.stopPropagation();
        golfOverlay.showModal();
    });
}

if (openCategory && categoryOverlay) {
openCategory.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryOverlay.showModal();
});
}

if (openEvent && eventOverlay) {
openEvent.addEventListener('click', (e) => {
    e.stopPropagation();
    eventOverlay.showModal();
});
}

if (openQuiz && quizOverlay) {
openQuiz.addEventListener('click', (e) => {
    e.stopPropagation();
    quizOverlay.showModal();
});
}

closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.closest("dialog").close();
    });
});

closeMenu.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.closest("dialog").close();
    });
});

[golfOverlay, eventOverlay, quizOverlay, categoryOverlay]
.filter(Boolean)
.forEach(dialog => {
    dialog.addEventListener("click", (e) => {
        const rect = dialog.getBoundingClientRect();
        const clickedOutside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;

        if (clickedOutside) dialog.close();
    });
});

//scroll to top button on menu page
const scrollTopBtn = document.getElementById("scrollTop");

if (scrollTopBtn) {
scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
}

//youtube video feed 
const apiKey = "AIzaSyAXiloI8979-xpUrS94lTTMdTH34oNqroY";
const channelId = "UCpeMUgtblac1z3KU8wCIOtA";
const container = document.getElementById("videoFeedContainer");

async function getUploadsPlaylistId() {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const response = await fetch(channelUrl);
    const data = await response.json();

    return data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function displayChannelFeed() {
    const uploadsPlaylistId = await getUploadsPlaylistId();
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`;
    const response = await fetch(playlistUrl);
    const data = await response.json();

    container.innerHTML = "";

    if (!data.items || data.items.length === 0) {
        console.warn("No videos returned from API");
        return;
    }

    data.items.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const publishedAt = new Date(item.snippet.publishedAt).toLocaleDateString();
        const thumbnailUrl = item.snippet.thumbnails.medium.url;
        const channelTitle = item.snippet.channelTitle;

        const videoWrapper = document.createElement("div");
        videoWrapper.classList.add("video-item");

        videoWrapper.innerHTML = `
            <div class="video-thumbnail">
                <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-details">
                <h4 class="video-title">${title}</h4>
                <p class="video-description">${description}</p>
            </div>
        `;

        container.appendChild(videoWrapper);
    });
}

if (container) {
    displayChannelFeed();
}
