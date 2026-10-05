/* ════════════════════════════════════════════════════════════════════
   PARTICLES — global canvas particle system (off by default)
   Exposes window.__setParticleConfig / __setParticleMode / __stopParticleAnimation
   ════════════════════════════════════════════════════════════════════ */

export function initParticleSystem() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let currentMode = 'default';
  let animationId = null;
  let isRunning = false;

  const config = {
    defaultCount: 120,
    maintenanceCount: 150,
    defaultSizeMin: 2,
    defaultSizeMax: 5,
    maintenanceSizeMin: 1.5,
    maintenanceSizeMax: 4,
    defaultSpeed: 0.6,
    maintenanceSpeed: 1.2,
    connectionDistance: 120,
  };

  window.__setParticleConfig = function (newConfig) {
    let changed = false;
    for (const key in newConfig) {
      if (newConfig[key] !== undefined && config[key] !== newConfig[key]) {
        config[key] = newConfig[key];
        changed = true;
      }
    }
    if (changed) {
      initParticles(currentMode);
    }
  };

  function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor(mode) {
      this.reset(mode);
    }
    reset(mode) {
      const isMaintenance = mode === 'maintenance';
      const sizeMin = isMaintenance ? config.maintenanceSizeMin : config.defaultSizeMin;
      const sizeMax = isMaintenance ? config.maintenanceSizeMax : config.defaultSizeMax;
      const speed = isMaintenance ? config.maintenanceSpeed : config.defaultSpeed;

      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * (sizeMax - sizeMin) + sizeMin;
      this.dx = (Math.random() - 0.5) * speed * 2;
      this.dy = (Math.random() - 0.5) * speed * 2;
      this.opacity = isMaintenance ? Math.random() * 0.4 + 0.3 : Math.random() * 0.3 + 0.25;
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 148, 58, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles(mode) {
    particles = [];
    const count = mode === 'maintenance' ? config.maintenanceCount : config.defaultCount;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(mode));
    }
  }

  function drawLines() {
    const dist = config.connectionDistance;
    const distSq = dist * dist;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dSq = dx * dx + dy * dy;
        if (dSq < distSq) {
          const opacity = 1 - Math.sqrt(dSq) / dist;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201, 148, 58, ${opacity * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.update();
      p.draw();
    }
    if (currentMode === 'maintenance') {
      drawLines();
    }
    animationId = requestAnimationFrame(animate);
  }

  function setMode(mode) {
    if (currentMode === mode && particles.length > 0) return;
    currentMode = mode;
    initParticles(mode);
    if (!isRunning) {
      isRunning = true;
      animate();
    }
  }

  function stopAnimation() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function handleResize() {
    initCanvas();
    for (const p of particles) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
    }
  }

  window.__setParticleMode = setMode;
  window.__stopParticleAnimation = stopAnimation;

  initCanvas();
  initParticles('default');
  isRunning = true;
  animate();

  window.addEventListener('resize', handleResize);

  console.log('✨ Global particle system initialized (off by default)');
}
