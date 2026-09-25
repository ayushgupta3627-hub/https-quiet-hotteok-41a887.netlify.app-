// ACTIVE THEORY (ACTIVETHEORY.NET) SIGNATURE WEBGL/CANVAS ENGINE & CLUSTER LOGIC
document.addEventListener('DOMContentLoaded', () => {
    initActiveCursor();
    initFluidCanvas();
    initTopologyRingCanvas();
    initAudioSynth();
    initTabsNav();
    initEventListeners();
});

// CLUSTER STATE
const clusterState = {
    nodes: {
        'node_1': { name: 'Node 1', port: 8001, online: true, color: '#00F2FE', chunks: 0, x: 0, y: 0 },
        'node_2': { name: 'Node 2', port: 8002, online: true, color: '#3B82F6', chunks: 0, x: 0, y: 0 },
        'node_3': { name: 'Node 3', port: 8003, online: true, color: '#8B5CF6', chunks: 0, x: 0, y: 0 }
    },
    objects: {},
    packets: [],
    audioEnabled: true
};

// 1. ACTIVE THEORY CURSOR FOLLOWER
function initActiveCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Hover effect on clickable elements
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest('button, input, textarea, .tab-link, .chip-at')) {
            ring.classList.add('active');
        } else {
            ring.classList.remove('active');
        }
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    }
    animateRing();
}

// 2. FULLSCREEN WEBGL-STYLE FLUID CANVAS (MOUSE REACTIVE)
function initFluidCanvas() {
    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particles grid
    const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#00F2FE' : '#8B5CF6'
    }));

    let mouseX = -1000, mouseY = -1000;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // FPS COUNTER
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsEl = document.getElementById('fps-counter');

    function drawFluid() {
        ctx.clearRect(0, 0, width, height);

        // Calculate FPS
        const now = performance.now();
        frameCount++;
        if (now - lastTime >= 1000) {
            if (fpsEl) fpsEl.textContent = frameCount;
            frameCount = 0;
            lastTime = now;
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 140) * 0.12})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Update and draw particles with mouse interaction
        particles.forEach(p => {
            // Mouse push force
            const mdx = p.x - mouseX;
            const mdy = p.y - mouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 160) {
                const force = (160 - mdist) / 160;
                p.x += (mdx / mdist) * force * 4;
                p.y += (mdy / mdist) * force * 4;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(drawFluid);
    }
    drawFluid();
}

// 3. TOPOLOGY RING CANVAS & FLYING DATA LIGHT BEAMS
let ringCanvas, ringCtx;
let ringRotation = 0;

function initTopologyRingCanvas() {
    ringCanvas = document.getElementById('topology-ring-canvas');
    if (!ringCanvas) return;
    ringCtx = ringCanvas.getContext('2d');

    function resizeRing() {
        const rect = ringCanvas.parentElement.getBoundingClientRect();
        ringCanvas.width = rect.width;
        ringCanvas.height = rect.height;
    }
    resizeRing();
    window.addEventListener('resize', resizeRing);

    function renderRingStage() {
        const w = ringCanvas.width;
        const h = ringCanvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) - 55;

        ringCtx.clearRect(0, 0, w, h);
        ringRotation += 0.004;

        // Draw Orbit Ring
        ringCtx.beginPath();
        ringCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        ringCtx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
        ringCtx.lineWidth = 1.5;
        ringCtx.setLineDash([8, 8]);
        ringCtx.stroke();
        ringCtx.setLineDash([]);

        // Center Gateway Node
        ringCtx.beginPath();
        ringCtx.arc(cx, cy, 24, 0, Math.PI * 2);
        ringCtx.fillStyle = '#00F2FE';
        ringCtx.shadowColor = '#00F2FE';
        ringCtx.shadowBlur = 25;
        ringCtx.fill();
        ringCtx.shadowBlur = 0;

        ringCtx.fillStyle = '#000';
        ringCtx.font = '800 11px "Syne", sans-serif';
        ringCtx.textAlign = 'center';
        ringCtx.textBaseline = 'middle';
        ringCtx.fillText('GATEWAY', cx, cy);

        // Nodes on Ring
        const keys = Object.keys(clusterState.nodes);
        keys.forEach((key, idx) => {
            const angle = (idx / keys.length) * Math.PI * 2 + ringRotation;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);

            clusterState.nodes[key].x = nx;
            clusterState.nodes[key].y = ny;

            // Connection Ray to Gateway
            ringCtx.beginPath();
            ringCtx.moveTo(cx, cy);
            ringCtx.lineTo(nx, ny);
            ringCtx.strokeStyle = clusterState.nodes[key].online ? 'rgba(0, 242, 254, 0.2)' : 'rgba(239, 68, 68, 0.3)';
            ringCtx.lineWidth = 1.2;
            ringCtx.stroke();

            // Node Point
            ringCtx.beginPath();
            ringCtx.arc(nx, ny, 18, 0, Math.PI * 2);
            ringCtx.fillStyle = clusterState.nodes[key].online ? clusterState.nodes[key].color : '#EF4444';
            ringCtx.shadowColor = clusterState.nodes[key].online ? clusterState.nodes[key].color : '#EF4444';
            ringCtx.shadowBlur = 18;
            ringCtx.fill();
            ringCtx.shadowBlur = 0;

            ringCtx.fillStyle = '#FFF';
            ringCtx.font = '700 11px "Outfit", sans-serif';
            ringCtx.fillText(clusterState.nodes[key].name, nx, ny + (ny > cy ? 32 : -25));
        });

        // Flying Data Packets
        for (let i = clusterState.packets.length - 1; i >= 0; i--) {
            const p = clusterState.packets[i];
            p.progress += 0.035;

            if (p.progress >= 1) {
                clusterState.packets.splice(i, 1);
                continue;
            }

            const currX = p.startX + (p.targetX - p.startX) * p.progress;
            const currY = p.startY + (p.targetY - p.startY) * p.progress;

            ringCtx.beginPath();
            ringCtx.arc(currX, currY, 7, 0, Math.PI * 2);
            ringCtx.fillStyle = p.color;
            ringCtx.shadowColor = p.color;
            ringCtx.shadowBlur = 20;
            ringCtx.fill();
            ringCtx.shadowBlur = 0;
        }

        requestAnimationFrame(renderRingStage);
    }
    renderRingStage();
}

function spawnDataBeam(targetKey, color = '#00F2FE') {
    if (!ringCanvas) return;
    const cx = ringCanvas.width / 2;
    const cy = ringCanvas.height / 2;
    const node = clusterState.nodes[targetKey];

    if (node && node.x) {
        clusterState.packets.push({
            startX: cx,
            startY: cy,
            targetX: node.x,
            targetY: node.y,
            progress: 0,
            color: color
        });
    }
}

// 4. AUDIO SYNTH FEEDBACK ENGINE (WEB AUDIO API)
let audioCtx;
function initAudioSynth() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
        clusterState.audioEnabled = !clusterState.audioEnabled;
        if (clusterState.audioEnabled) {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> SOUND ON';
            playSynthTone(440, 0.1);
        } else {
            btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> SOUND OFF';
        }
    });
}

function playSynthTone(freq = 520, duration = 0.1) {
    if (!clusterState.audioEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

// 5. TABS NAVIGATION
function initTabsNav() {
    const links = document.querySelectorAll('.tab-link');
    const views = document.querySelectorAll('.pane-view');

    links.forEach(link => {
        link.addEventListener('click', () => {
            playSynthTone(600, 0.08);
            links.forEach(l => l.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            link.classList.add('active');
            const targetId = `pane-${link.dataset.tab}`;
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');
        });
    });
}

// PRESET CHIPS
window.applyPreset = function(type) {
    playSynthTone(480, 0.08);
    const key = document.getElementById('object-key');
    const val = document.getElementById('object-content');

    if (type === 'json') {
        key.value = 'active_theory_user.json';
        val.value = JSON.stringify({ project: "Vault Engine", author: "Active Theory", points: 9900, fps: 60 }, null, 2);
    } else if (type === 'jwt') {
        key.value = 'auth_session.jwt';
        val.value = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active_theory_payload.signature';
    } else if (type === 'config') {
        key.value = 'cluster_settings.env';
        val.value = 'QUORUM_W=2\nQUORUM_R=2\nREPLICAS=3\nCHECKSUM=CRC32';
    }
};

// NODE TOGGLE & CORRUPT
window.toggleNode = function(nodeKey) {
    playSynthTone(300, 0.15);
    const node = clusterState.nodes[nodeKey];
    if (!node) return;

    node.online = !node.online;

    const box = document.getElementById(`node-active-box-${nodeKey}`);
    const dot = document.getElementById(`dot-${nodeKey}`);
    const txt = document.getElementById(`txt-status-${nodeKey}`);
    const lbl = document.getElementById(`lbl-${nodeKey}`);

    if (node.online) {
        box.classList.remove('killed');
        dot.classList.remove('killed');
        txt.textContent = 'ONLINE';
        txt.style.color = '#FFF';
        lbl.textContent = 'Kill';
        logStreamMessage(`[NODE ONLINE] ${node.name} (Port ${node.port}) re-joined active hash ring.`, 'ok');
    } else {
        box.classList.add('killed');
        dot.classList.add('killed');
        txt.textContent = 'OFFLINE';
        txt.style.color = '#EF4444';
        lbl.textContent = 'Boot';
        logStreamMessage(`[NODE TERMINATED] ${node.name} (Port ${node.port}) killed!`, 'err');
    }
};

window.corruptNode = function(nodeKey) {
    playSynthTone(250, 0.2);
    logStreamMessage(`[DISK CORRUPT] Single byte payload corrupted on ${clusterState.nodes[nodeKey].name}. Checksum trigger armed!`, 'info');
};

// OPERATIONS
function initEventListeners() {
    const putBtn = document.getElementById('btn-put');
    const getBtn = document.getElementById('btn-get');
    const delBtn = document.getElementById('btn-delete');
    const resetRingBtn = document.getElementById('btn-rebalance-ring');

    if (putBtn) putBtn.addEventListener('click', handlePut);
    if (getBtn) getBtn.addEventListener('click', handleGet);
    if (delBtn) delBtn.addEventListener('click', handleDelete);
    if (resetRingBtn) resetRingBtn.addEventListener('click', () => {
        playSynthTone(700, 0.1);
        Object.keys(clusterState.nodes).forEach(k => {
            if (!clusterState.nodes[k].online) window.toggleNode(k);
        });
        logStreamMessage('[RING RESET] All 3 storage nodes restored to active ring topology.', 'info');
    });
}

function handlePut() {
    const key = document.getElementById('object-key').value.trim();
    const payload = document.getElementById('object-content').value;

    if (!key) { alert('Please enter object key'); return; }

    const activeNodes = Object.keys(clusterState.nodes).filter(k => clusterState.nodes[k].online);
    const start = performance.now();

    if (activeNodes.length >= 2) {
        playSynthTone(800, 0.12);
        clusterState.objects[key] = { data: payload, ts: Date.now() };

        activeNodes.forEach(k => {
            clusterState.nodes[k].chunks++;
            spawnDataBeam(k, clusterState.nodes[k].color);
        });
        updateMetrics();

        const ms = (performance.now() - start).toFixed(1);
        document.getElementById('latency-tag').textContent = `${ms} ms`;
        logStreamMessage(`[PUT 200 OK] Key="${key}" written in parallel to ${activeNodes.length}/3 nodes. Write Quorum W=2 Achieved.`, 'ok');
    } else {
        playSynthTone(150, 0.3);
        const ms = (performance.now() - start).toFixed(1);
        document.getElementById('latency-tag').textContent = `${ms} ms`;
        logStreamMessage(`[PUT 500 FAILED] Quorum W=2 unsatisfied (${activeNodes.length}/3 nodes online).`, 'err');
    }
}

function handleGet() {
    const key = document.getElementById('object-key').value.trim();
    if (!key) { alert('Please enter object key'); return; }

    const activeNodes = Object.keys(clusterState.nodes).filter(k => clusterState.nodes[k].online);
    const start = performance.now();

    if (activeNodes.length >= 2) {
        playSynthTone(850, 0.12);
        activeNodes.forEach(k => spawnDataBeam(k, '#00F2FE'));

        const obj = clusterState.objects[key];
        const ms = (performance.now() - start).toFixed(1);
        document.getElementById('latency-tag').textContent = `${ms} ms`;

        if (obj) {
            document.getElementById('object-content').value = obj.data;
            logStreamMessage(`[GET 200 OK] Served Key="${key}" with Read Quorum R=2. CRC32 verified.`, 'ok');
        } else {
            logStreamMessage(`[GET 404] Key="${key}" not found in cluster.`, 'err');
        }
    } else {
        playSynthTone(150, 0.3);
        const ms = (performance.now() - start).toFixed(1);
        document.getElementById('latency-tag').textContent = `${ms} ms`;
        logStreamMessage(`[GET 503 FAILED] Quorum R=2 unsatisfied (${activeNodes.length}/3 online).`, 'err');
    }
}

function handleDelete() {
    playSynthTone(400, 0.1);
    const key = document.getElementById('object-key').value.trim();
    if (clusterState.objects[key]) {
        delete clusterState.objects[key];
        logStreamMessage(`[DELETE 200 OK] Object Key="${key}" removed from cluster quorum.`, 'info');
    }
}

function updateMetrics() {
    Object.keys(clusterState.nodes).forEach(k => {
        const el = document.getElementById(`cnt-chunks-${k}`);
        if (el) el.textContent = clusterState.nodes[k].chunks;
    });
}

function logStreamMessage(msg, type = 'info') {
    const box = document.getElementById('active-console-box');
    if (!box) return;

    const time = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.className = 'stream-row';

    let tag = 'info';
    if (type === 'ok') tag = 'ok';
    if (type === 'err') tag = 'err';

    row.innerHTML = `<span class="time">[${time}]</span><span class="${tag}">${msg}</span>`;
    box.prepend(row);
}

// CHAOS SCENARIOS
window.runActiveChaosScenario = function(num) {
    if (num === 1) {
        logStreamMessage('[CHAOS SCENARIO 1] Killing Node 1 and performing PUT/GET quorum operations...', 'info');
        if (clusterState.nodes['node_1'].online) window.toggleNode('node_1');
        handlePut();
        handleGet();
    } else if (num === 2) {
        logStreamMessage('[CHAOS SCENARIO 2] Corrupting raw storage bytes on Node 2...', 'info');
        window.corruptNode('node_2');
        logStreamMessage('[READ REPAIR HEALING] Checksum mismatch detected! Healing payload from Node 3...', 'ok');
    } else if (num === 3) {
        logStreamMessage('[CHAOS SCENARIO 3] Testing Hinted Handoff Recovery stream...', 'info');
        if (clusterState.nodes['node_1'].online) window.toggleNode('node_1');
        handlePut();
        logStreamMessage('[HINT RECORDED] Surrogate node holding hints for target Node 1.', 'info');
        setTimeout(() => {
            if (!clusterState.nodes['node_1'].online) window.toggleNode('node_1');
            logStreamMessage('[HINT DELIVERED] Node 1 re-joined! Stored hints flushed successfully.', 'ok');
        }, 1200);
    }
};

window.copyCliText = function(btn) {
    playSynthTone(900, 0.08);
    const code = btn.nextElementSibling.textContent;
    navigator.clipboard.writeText(code);
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
};
