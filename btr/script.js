const catId = '1208324820891340821';

const actIcons = {
    'minecraft': 'gamepad-2',
    'blockbench': 'box',
    'youtube': 'youtube',
    'modrinth': 'box-select',
    'spotify': 'music',
    'visual studio code': 'code-2'
};

const playlist = [
    { title: 'Bipolar', artist: 'wifiskeleton', src: '../songs/bipolar.mp3', art: 'https://i1.sndcdn.com/artworks-x91kfz1SpA6O-0-t500x500.png' },
    { title: 'Clouds As Witnesses', artist: '$uicideboy$', src: '../songs/clouds as witnesses.mp3', art: 'https://i1.sndcdn.com/artworks-000108740198-s36wwr-t1080x1080.jpg' },
    { title: 'Reherh', artist: 'wifiskeleton', src: '../songs/reherh.mp3', art: 'https://images.genius.com/82f82867e894fa0839ee97a8f00e0aac.300x300x1.jpg' },
    { title: 'Take Me Away', artist: 'somber', src: '../songs/take me away.mp3', art: 'https://i.scdn.co/image/ab67616d0000b273b43077433dca1753c4cfdf9c' }
];
let currentSongIndex = 0;

const get = id => document.getElementById(id);

const animateTitle = title => {
    let i = 0;
    const loop = setInterval(() => {
        document.title = title.substring(0, i + 1);
        i++;
        if (i >= title.length) {
            clearInterval(loop);
            setTimeout(() => animateTitle(title), 2000);
        }
    }, 150);
};

async function meowxd() {
    const apiUrl = `https://api.lanyard.rest/v1/users/${catId}`;
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`http error: ${res.status}`);
        
        const { data } = await res.json();
        const user = data.discord_user;

        get('discord-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        get('discord-username').textContent = user.username;
        get('discord-status-text').textContent = data.discord_status.replace('_', ' ');
        get('status-indicator').className = `status-indicator ${data.discord_status}`;

        const discordLink = get('discord-link');
        const discordLinkUsername = get('discord-link-username');

        if (discordLink && discordLinkUsername) {
            discordLink.href = `discord://-/users/${user.id}`;
            discordLinkUsername.textContent = `@${user.username}`;
        }
        const acts = get('activities-section');
        const actDivider = get('activity-divider');
        const hasActs = data.activities && data.activities.length > 0;
        const isOnline = data.discord_status !== 'offline';

        if (isOnline && hasActs) {
            acts.classList.remove('hidden');
            actDivider.classList.remove('hidden');
            acts.innerHTML = '';
            
            data.activities.forEach(act => {
                const iconName = actIcons[act.name.toLowerCase()] || 'gamepad-2';
                const actEl = document.createElement('div');
                actEl.className = 'activity-item';
                
                let html = `<h4>${act.name}</h4>`;
                if (act.details) html += `<p>${act.details}</p>`;
                if (act.state) html += `<p>${act.state}</p>`;
                
                actEl.innerHTML = `
                    <div class="activity-icon"><i data-lucide="${iconName}" style="width:20px; height:20px;"></i></div>
                    <div class="activity-details">${html}</div>
                `;
                acts.appendChild(actEl);
            });
            lucide.createIcons();
        } else {
            acts.classList.add('hidden');
            actDivider.classList.add('hidden');
        }

    } catch (err) {
        console.error(err);
        get('discord-username').textContent = 'error';
        get('discord-status-text').textContent = 'couldnt fetch';
    }
}


const fmtTime = s => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const dragSlider = (slider, onDrag) => {
    let dragging = false;
    const update = e => {
        const rect = slider.getBoundingClientRect();
        let val = (e.clientX - rect.left) / rect.width;
        onDrag(Math.max(0, Math.min(1, val)));
    };
    slider.addEventListener('mousedown', e => { dragging = true; update(e); });
    window.addEventListener('mousemove', e => { if (dragging) update(e); });
    window.addEventListener('mouseup', () => { dragging = false; });
}

document.addEventListener('DOMContentLoaded', () => {
    const entry = get('entry-layer');
    const player = get('audio-player');
    const playBtn = get('play-pause-btn');
    const ffBtn = get('skip-forward-btn');
    const rwBtn = get('skip-backward-btn');
    const progBar = get('progress-bar');
    const progFill = get('progress-bar-fill');
    const timeNow = get('current-time');
    const timeTotal = get('total-time');
    const volBar = get('volume-bar');
    const volFill = get('volume-bar-fill');
    const volPercent = get('volume-percentage');
    const volIcon = get('volume-icon');
    const copyBtn = get('copy-username-btn');
    const usernameEl = get('discord-username');
    const rblxBtn = get('roblox-btn');
    const canvas = get('background-canvas');
    const ctx = canvas.getContext('2d');
    const songTitleEl = document.querySelector('.song-details h3');
    const songArtistEl = document.querySelector('.song-details p');
    const albumArtEl = document.querySelector('.album-art');

    const loadSong = (index) => {
        const song = playlist[index];
        player.src = song.src;
        songTitleEl.textContent = song.title;
        songArtistEl.textContent = song.artist;
        albumArtEl.src = song.art;
        player.load();
    };

    const nextSong = () => {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(currentSongIndex);
        player.play().catch(e => console.error("play fail", e));
    };

    const prevSong = () => {
        if (player.currentTime > 3) {
            player.currentTime = 0;
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentSongIndex);
            player.play().catch(e => console.error("play fail", e));
        }
    };
    
    if (entry) {
        entry.addEventListener('click', () => {
            if (player.paused) player.play().catch(err => console.error("audio fail:", err));
            entry.style.opacity = '0';
            setTimeout(() => { entry.style.display = 'none'; }, 500);
        });
    }

    lucide.createIcons();
    animateTitle("sadist.lol/versatile");
    loadSong(currentSongIndex);

    playBtn.addEventListener('click', () => player.paused ? player.play() : player.pause());
    ffBtn.addEventListener('click', nextSong);
    rwBtn.addEventListener('click', prevSong);
    player.addEventListener('ended', nextSong);

    player.addEventListener('play', () => { playBtn.innerHTML = '<i data-lucide="pause" style="width:16px; height:16px;"></i>'; lucide.createIcons(); });
    player.addEventListener('pause', () => { playBtn.innerHTML = '<i data-lucide="play" style="width:16px; height:16px;"></i>'; lucide.createIcons(); });
    player.addEventListener('timeupdate', () => {
        if (player.duration) progFill.style.width = `${(player.currentTime / player.duration) * 100}%`;
        timeNow.textContent = fmtTime(player.currentTime);
    });
    player.addEventListener('loadedmetadata', () => timeTotal.textContent = fmtTime(player.duration));

    dragSlider(progBar, val => player.currentTime = val * player.duration);
    dragSlider(volBar, val => player.volume = val);

    player.addEventListener('volumechange', () => {
        const vol = player.volume;
        volFill.style.width = `${vol * 100}%`;
        volPercent.textContent = `${Math.round(vol * 100)}%`;
        let icon = 'volume-2';
        if (vol == 0) icon = 'volume-x';
        else if (vol < 0.5) icon = 'volume-1';
        volIcon.setAttribute('data-lucide', icon);
        lucide.createIcons();
    });

    rblxBtn.addEventListener('click', () => window.open('https://www.roblox.com/users/4797272273/profile', '_blank'));

    copyBtn.addEventListener('click', () => {
        const notif = get('copy-notification');
        navigator.clipboard.writeText(usernameEl.textContent).then(() => {
            if (notif) {
                notif.textContent = 'username copied!';
                notif.classList.add('show');
                setTimeout(() => notif.classList.remove('show'), 2000);
            }
        }).catch(err => {
            if (notif) {
                notif.textContent = 'failed to copy!';
                notif.classList.add('show');
                setTimeout(() => notif.classList.remove('show'), 2000);
            }
            console.error('failed to copy text: ', err);
        });
    });

    player.volume = 0.5;
    meowxd();

    let cw = canvas.width = window.innerWidth;
    let ch = canvas.height = window.innerHeight;
    let mouse = { x: null, y: null };
    window.addEventListener('resize', () => { cw = canvas.width = window.innerWidth; ch = canvas.height = window.innerHeight; });
    document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Star {
        constructor() { this.x = Math.random() * cw; this.y = Math.random() * ch; this.size = Math.random() * 1.5 + 0.5; this.speedX = Math.random() * 0.2 - 0.1; this.speedY = Math.random() * 0.2 - 0.1; this.color = `rgba(177, 153, 255, ${Math.random() * 0.5 + 0.2})`; }
        update() { this.x += this.speedX; this.y += this.speedY; if (this.x < 0) this.x = cw; if (this.x > cw) this.x = 0; if (this.y < 0) this.y = ch; if (this.y > ch) this.y = 0; }
        draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }

    let stars = Array.from({ length: 150 }, () => new Star());

    function animate() {
        ctx.clearRect(0, 0, cw, ch);
        if (mouse.x && mouse.y) {
            const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
            glow.addColorStop(0, 'rgba(159, 92, 255, 0.1)');
            glow.addColorStop(1, 'rgba(159, 92, 255, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, cw, ch);
        }
        stars.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
});
