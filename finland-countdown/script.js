
// Audio Context
let audioCtx;
let audioEnabled = false;

const enableBtn = document.getElementById('enable-audio');
const statusText = document.getElementById('status');

// Audio Synthesis
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    audioEnabled = true;
    statusText.textContent = "Audio Enabled - Waiting for countdown...";
    enableBtn.textContent = "Test Gong Sound";
}

function playDong() {
    if (!audioEnabled || !audioCtx) return;

    const t = audioCtx.currentTime;

    // Fundamental
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, t); // 200Hz fundamental

    // Overtone 1 (Harmonic)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(400, t); // Octave

    // Overtone 2 (Inharmonic/Metal)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(523, t); // Another tone

    // Deep hum
    const osc4 = audioCtx.createOscillator();
    const gain4 = audioCtx.createGain();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(100, t); // Sub

    // Envelope
    const attack = 0.01;
    const release = 3.5;

    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.6, t + attack);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + release);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.3, t + attack);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + release * 0.7);

    gain3.gain.setValueAtTime(0, t);
    gain3.gain.linearRampToValueAtTime(0.2, t + attack);
    gain3.gain.exponentialRampToValueAtTime(0.001, t + release * 0.5);

    gain4.gain.setValueAtTime(0, t);
    gain4.gain.linearRampToValueAtTime(0.3, t + attack);
    gain4.gain.exponentialRampToValueAtTime(0.001, t + release * 1.2);

    osc1.connect(gain1).connect(audioCtx.destination);
    osc2.connect(gain2).connect(audioCtx.destination);
    osc3.connect(gain3).connect(audioCtx.destination);
    osc4.connect(gain4).connect(audioCtx.destination);

    [osc1, osc2, osc3, osc4].forEach(osc => {
        osc.start(t);
        osc.stop(t + release + 0.1);
    });
}

enableBtn.addEventListener('click', () => {
    initAudio();
    playDong();
});

// Time & Countdown Logic
const finlandTimeEl = document.getElementById('finland-time');
const countdownEl = document.getElementById('countdown');

// Trigger points: 12 times every 4 seconds ending at 0.
const triggerPoints = [44, 40, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0];
const triggersFired = new Set();

function update() {
    // Current time in Helsinki
    // We create a date string for Helsinki
    const now = new Date();
    const options = { timeZone: 'Europe/Helsinki', hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    // Parse parts manually to avoid locale string parsing issues
    const p = {};
    parts.forEach(({ type, value }) => p[type] = value);

    // Construct a Date object that represents "Current Helsinki Time" as if it were local UTC
    // This is a trick to do math easily. 
    // Actually, safer: Get 'now' timestamp. Find next midnight relative to Helsinki.

    // Let's rely on string parsing for typical "12/31/2025, 23:40:07" format from en-US
    const helsinkiDateString = now.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' });
    const helsinkiDate = new Date(helsinkiDateString);

    finlandTimeEl.textContent = helsinkiDate.toLocaleTimeString('en-US', { hour12: false });

    // Target: Next Midnight for Helsinki
    const midnight = new Date(helsinkiDate);
    midnight.setHours(24, 0, 0, 0); // Sets to next midnight effectively

    const diff = midnight - helsinkiDate; // ms

    // Format Countdown
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const ms = diff % 1000;

    const pad = (n) => n.toString().padStart(2, '0');
    countdownEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    // Sound Triggers
    // We have milliseconds exact precision.
    const totalSecondsRemaining = Math.floor(diff / 1000); // 44, 43...

    // Check if we are exactly on a second boundary roughly
    // We check if (diff < (point * 1000) + 100 && diff > (point * 1000) - 100)
    // But better: use a state map "triggersFired".
    // We identify "current second block"

    // If we are within the target window (e.g. 44s remaining means [44.0, 44.99] or [43.01, 44.00]?)
    // Usually "44 seconds remaining" means 44.XYZ

    if (triggerPoints.includes(totalSecondsRemaining)) {
        // We only fire once per second-integer
        // Create a unique key for this specific midnight instance + second
        const key = `${midnight.getTime()}-${totalSecondsRemaining}`;
        if (!triggersFired.has(key)) {
            // FIRE!
            // Only fire if ms is small (just passed the second mark) so it feels sync
            // OR fire immediately if we just entered this second
            playDong();
            triggersFired.add(key);

            // Visual flair
            countdownEl.style.color = "#fff";
            setTimeout(() => countdownEl.style.color = "", 200);
        }
    }

    // Clean up old keys (optional, but good for long running)
    if (triggersFired.size > 50) triggersFired.clear();

    requestAnimationFrame(update);
}

update();
