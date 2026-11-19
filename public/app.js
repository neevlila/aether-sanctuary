/**
 * ============================================================================
 * AETHER // SUPER-INTELLIGENCE CLIENT ARCHITECTURE
 * Procedural Audio Synthesis, Generative Canvas, & Java REST Synchronization
 * ============================================================================
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. GENERATIVE BACKGROUND CANVAS (Celestial Constellation System)
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const PARTICLE_COUNT = 55;
    const CONNECT_DISTANCE = 130;
    const mouse = { x: -1000, y: -1000, radius: 140 };

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.radius = Math.random() * 1.8 + 0.8;
            this.alpha = Math.random() * 0.5 + 0.2;
            this.hue = Math.random() > 0.5 ? 168 : 272; // Cyan or Violet
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse proximity interaction
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= Math.cos(angle) * force * 1.8;
                this.y -= Math.sin(angle) * force * 1.8;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${this.alpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `hsla(${this.hue}, 90%, 65%, 0.8)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function renderCanvas() {
        ctx.clearRect(0, 0, width, height);

        // Draw connecting neural filaments
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECT_DISTANCE) {
                    const alpha = (1 - dist / CONNECT_DISTANCE) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (let p of particles) {
            p.update();
            p.draw();
        }

        requestAnimationFrame(renderCanvas);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    resizeCanvas();
    initParticles();
    renderCanvas();


    // -------------------------------------------------------------------------
    // 2. PROCEDURAL WEB AUDIO SYNTHESIZER (Pure Mathematical Synthesis)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let masterGain = null;
    let analyser = null;
    let activeNodes = [];
    let isAudioPlaying = false;
    let currentMode = 'harmonic';
    let currentFreq = 432;
    let masterVolume = 0.35;

    const audioStateTag = document.getElementById('audioStateTag');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volPct = document.getElementById('volPct');
    const soundChips = document.querySelectorAll('.sound-chip');
    const vizCanvas = document.getElementById('audio-viz');
    const vizCtx = vizCanvas.getContext('2d');

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(masterVolume, audioCtx.currentTime);

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            masterGain.connect(analyser);
            analyser.connect(audioCtx.destination);
            renderAudioVisualizer();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function stopActiveSound() {
        if (!audioCtx) return;
        activeNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (ignored) {}
        });
        activeNodes = [];
    }

    function startActiveSound() {
        initAudioContext();
        stopActiveSound();

        const now = audioCtx.currentTime;

        if (currentMode === 'noise') {
            // Procedural Cosmic Pink Noise Generator
            const bufferSize = audioCtx.sampleRate * 2;
            const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
                b6 = white * 0.115926;
            }

            const whiteNoiseSource = audioCtx.createBufferSource();
            whiteNoiseSource.buffer = noiseBuffer;
            whiteNoiseSource.loop = true;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, now);

            whiteNoiseSource.connect(filter);
            filter.connect(masterGain);
            whiteNoiseSource.start(now);
            activeNodes.push(whiteNoiseSource, filter);

        } else if (currentMode === 'gamma') {
            // 40Hz Binaural Entrainment carrier (200Hz + 240Hz detuned pair)
            const oscL = audioCtx.createOscillator();
            const oscR = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscL.type = 'sine';
            oscR.type = 'sine';
            oscL.frequency.setValueAtTime(180, now);
            oscR.frequency.setValueAtTime(220, now); // 40Hz difference

            gainNode.gain.setValueAtTime(0.4, now);
            oscL.connect(gainNode);
            oscR.connect(gainNode);
            gainNode.connect(masterGain);

            oscL.start(now);
            oscR.start(now);
            activeNodes.push(oscL, oscR, gainNode);

        } else {
            // Harmonic or Cellular Clarity Pure Sine with Ethereal Sub-Harmonic
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const toneGain = audioCtx.createGain();

            osc1.type = currentMode === 'clarity' ? 'triangle' : 'sine';
            osc2.type = 'sine';

            osc1.frequency.setValueAtTime(currentFreq, now);
            osc2.frequency.setValueAtTime(currentFreq / 2, now); // Sub-octave warmth

            toneGain.gain.setValueAtTime(0.35, now);
            osc1.connect(toneGain);
            osc2.connect(toneGain);
            toneGain.connect(masterGain);

            osc1.start(now);
            osc2.start(now);
            activeNodes.push(osc1, osc2, toneGain);
        }

        isAudioPlaying = true;
        updateAudioUI(true);
    }

    function toggleAudio() {
        if (isAudioPlaying) {
            stopActiveSound();
            isAudioPlaying = false;
            updateAudioUI(false);
        } else {
            startActiveSound();
        }
    }

    function updateAudioUI(playing) {
        if (playing) {
            audioStateTag.textContent = 'TRANSMITTING';
            audioStateTag.classList.add('playing');
            soundToggleBtn.classList.add('active');
        } else {
            audioStateTag.textContent = 'STANDBY';
            audioStateTag.classList.remove('playing');
            soundToggleBtn.classList.remove('active');
        }
    }

    // Audio Visualizer Rendering
    function renderAudioVisualizer() {
        if (!analyser) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            const vW = vizCanvas.width = vizCanvas.clientWidth;
            const vH = vizCanvas.height = vizCanvas.clientHeight;
            vizCtx.clearRect(0, 0, vW, vH);

            const barWidth = (vW / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * vH;
                vizCtx.fillStyle = `rgba(0, 245, 212, ${0.15 + (dataArray[i] / 255) * 0.7})`;
                vizCtx.fillRect(x, vH - barHeight, barWidth - 1, barHeight);
                x += barWidth;
            }
        }
        draw();
    }

    soundToggleBtn.addEventListener('click', toggleAudio);

    volumeSlider.addEventListener('input', (e) => {
        masterVolume = parseFloat(e.target.value);
        volPct.textContent = `${Math.round(masterVolume * 100)}%`;
        if (masterGain && audioCtx) {
            masterGain.gain.setTargetAtTime(masterVolume, audioCtx.currentTime, 0.05);
        }
    });

    soundChips.forEach(chip => {
        chip.addEventListener('click', () => {
            soundChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            currentMode = chip.dataset.mode;
            currentFreq = chip.dataset.freq ? parseFloat(chip.dataset.freq) : 432;

            if (isAudioPlaying) {
                startActiveSound();
            }
        });
    });


    // -------------------------------------------------------------------------
    // 3. TEMPORAL FLOW TIMER
    // -------------------------------------------------------------------------
    let totalSeconds = 1500;
    let remainingSeconds = 1500;
    let timerInterval = null;
    let isTimerRunning = false;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 135; // ~848.23

    const timerDisplay = document.getElementById('timerDisplay');
    const timerProgress = document.getElementById('timerProgress');
    const timerModeLabel = document.getElementById('timerModeLabel');
    const timerStatusLabel = document.getElementById('timerStatusLabel');
    const startBtn = document.getElementById('startBtn');
    const startBtnText = document.getElementById('startBtnText');
    const resetBtn = document.getElementById('resetBtn');
    const modeChips = document.querySelectorAll('#modeChips .chip');

    timerProgress.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    timerProgress.style.strokeDashoffset = '0';

    function formatTime(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(remainingSeconds);
        const fraction = remainingSeconds / totalSeconds;
        const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
        timerProgress.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        startBtnText.textContent = 'SUSPEND FLOW';
        timerStatusLabel.textContent = 'IMMERSION ACTIVE';
        timerStatusLabel.style.color = 'var(--accent-cyan)';

        timerInterval = setInterval(() => {
            remainingSeconds--;
            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                pauseTimer();
                timerStatusLabel.textContent = 'SESSION TRANSCENDED';
                triggerSessionCompleteSound();
            }
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
        startBtnText.textContent = 'RESUME FLOW';
        timerStatusLabel.textContent = 'FLOW SUSPENDED';
        timerStatusLabel.style.color = 'var(--text-muted)';
    }

    function resetTimer() {
        pauseTimer();
        remainingSeconds = totalSeconds;
        startBtnText.textContent = 'INITIATE FLOW';
        timerStatusLabel.textContent = 'AWAITING INTENTION';
        updateTimerDisplay();
    }

    function triggerSessionCompleteSound() {
        initAudioContext();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.frequency.setValueAtTime(528, now);
        osc.frequency.exponentialRampToValueAtTime(1056, now + 0.8);
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
    }

    startBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    resetBtn.addEventListener('click', resetTimer);

    modeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            modeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            totalSeconds = parseInt(chip.dataset.time, 10);
            timerModeLabel.textContent = chip.dataset.label;
            resetTimer();
        });
    });


    // -------------------------------------------------------------------------
    // 4. THOUGHT FORGE (Cognitive Stream REST API)
    // -------------------------------------------------------------------------
    const thoughtForm = document.getElementById('thoughtForm');
    const thoughtInput = document.getElementById('thoughtInput');
    const tagChips = document.querySelectorAll('#tagSelector .tag-chip');
    const thoughtsFeed = document.getElementById('thoughtsFeed');
    const clearThoughtsBtn = document.getElementById('clearThoughtsBtn');
    let selectedTag = 'CLARITY';

    tagChips.forEach(chip => {
        chip.addEventListener('click', () => {
            tagChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedTag = chip.dataset.tag;
        });
    });

    async function loadThoughts() {
        try {
            const res = await fetch('/api/thoughts');
            if (!res.ok) return;
            const list = await res.json();
            renderThoughts(list);
        } catch (e) {
            console.log('[AETHER] Offline or standalone mode for thoughts.');
        }
    }

    function renderThoughts(list) {
        if (!list || list.length === 0) {
            thoughtsFeed.innerHTML = `
                <div class="empty-feed-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    <p>No cognitive streams recorded yet. Distill your first intention above.</p>
                </div>
            `;
            return;
        }

        thoughtsFeed.innerHTML = list.map(item => `
            <div class="thought-item">
                <div class="thought-main">
                    <span class="thought-badge">#${escapeHtml(item.tag)}</span>
                    <span class="thought-text">${escapeHtml(item.text)}</span>
                </div>
                <span class="thought-time">${escapeHtml(item.time)}</span>
            </div>
        `).join('');
    }

    thoughtForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = thoughtInput.value.trim();
        if (!text) return;

        thoughtInput.value = '';

        try {
            const res = await fetch('/api/thoughts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, tag: selectedTag })
            });

            if (res.ok) {
                loadThoughts();
                fetchTelemetry();
            }
        } catch (err) {
            // Client-side local fallback
            console.warn('[AETHER] REST POST fallback');
        }
    });

    clearThoughtsBtn.addEventListener('click', async () => {
        if (!confirm('Purge all cognitive streams for this session?')) return;
        try {
            await fetch('/api/thoughts', { method: 'DELETE' });
            loadThoughts();
            fetchTelemetry();
        } catch (ignored) {}
    });

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m]);
    }


    // -------------------------------------------------------------------------
    // 5. SUPER-INTELLIGENCE AXIOM ORACLE
    // -------------------------------------------------------------------------
    const axiomQuote = document.getElementById('axiomQuote');
    const axiomId = document.getElementById('axiomId');
    const refreshInsightBtn = document.getElementById('refreshInsightBtn');

    async function fetchAxiom() {
        try {
            const res = await fetch('/api/insight');
            if (res.ok) {
                const data = await res.json();
                axiomQuote.textContent = `“${data.quote}”`;
                axiomId.textContent = `AXIOM #${String(data.index + 1).padStart(2, '0')}`;
            }
        } catch (ignored) {}
    }

    refreshInsightBtn.addEventListener('click', () => {
        axiomQuote.style.opacity = '0.3';
        setTimeout(() => {
            fetchAxiom();
            axiomQuote.style.opacity = '1';
        }, 150);
    });


    // -------------------------------------------------------------------------
    // 6. BACKEND TELEMETRY & SYSTEM HEALTH
    // -------------------------------------------------------------------------
    const telemetryText = document.getElementById('telemetryText');
    const specRuntime = document.getElementById('specRuntime');
    const specPing = document.getElementById('specPing');

    async function fetchTelemetry() {
        const start = performance.now();
        try {
            const res = await fetch('/api/status');
            const latency = Math.round(performance.now() - start);
            if (res.ok) {
                const data = await res.json();
                telemetryText.textContent = `JAVA ONLINE • ${data.memoryUsedMb}MB RAM • ${latency}ms`;
                specRuntime.textContent = `JAVA ${data.javaVersion || '11+'}`;
                specPing.textContent = `${latency} ms`;
            }
        } catch (e) {
            telemetryText.textContent = `JAVA CORE: STANDALONE`;
            specPing.textContent = `LOCAL`;
        }
    }

    // -------------------------------------------------------------------------
    // 7. KEYBOARD SHORTCUTS & FULLSCREEN
    // -------------------------------------------------------------------------
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    window.addEventListener('keydown', (e) => {
        // Do not intercept if user is typing in the thought input
        if (document.activeElement === thoughtInput) return;

        if (e.code === 'Space') {
            e.preventDefault();
            toggleAudio();
        } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            fullscreenBtn.click();
        }
    });

    // Boot sequence
    fetchTelemetry();
    fetchAxiom();
    loadThoughts();
    setInterval(fetchTelemetry, 6000);

})();
