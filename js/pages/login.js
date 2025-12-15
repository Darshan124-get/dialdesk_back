import { setToken, apiBase } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 relative overflow-hidden">
      <!-- Neural Network Background Canvas -->
      <canvas id="neuralNetwork" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo & Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4 transform transition-transform hover:scale-110 hover:rotate-3 overflow-hidden" id="logoContainer">
            <img src="./assets/logo.png" alt="DialDesk Logo" class="w-full h-full object-contain p-2" id="loginLogo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <svg class="w-10 h-10 text-white hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="loginLogoSvg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2 transform transition-transform hover:scale-105" id="titleText">DialDesk Admin</h1>
          <p class="text-gray-600">Sign in to your admin account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform transition-all hover:shadow-2xl hover:scale-[1.02]" id="loginCard">
          <form id="loginForm" class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" placeholder="admin@example.com" id="emailInput" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-400" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input type="password" name="password" id="loginPassword" placeholder="Enter your password" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-400" required />
                <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors" onclick="togglePasswordVisibility('loginPassword', this)">
                  <svg id="loginPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" id="submitBtn" class="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg py-3 font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Sign In
            </button>
            <p id="loginError" class="text-red-600 text-sm text-center"></p>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-sm mt-6">© 2025 DialDesk. All rights reserved.</p>
      </div>
    </div>
  `;

  // Initialize Neural Network Animation
  initNeuralNetwork();
  
  // Initialize Mouse Event Interactions
  initMouseInteractions();

  const form = document.getElementById('loginForm');
  const errorElement = document.getElementById('loginError');
  const submitButton = form.querySelector('button[type="submit"]') || form.querySelector('button');
  
  if (!submitButton) {
    console.error('Submit button not found in login form');
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorElement.textContent = '';
    
    // Disable button during request
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Signing in...
      `;
    }
    
    const formData = new FormData(form);
    const data = {
      email: formData.get('email')?.trim(),
      password: formData.get('password')
    };
    
    // Client-side validation
    if (!data.email || !data.email.includes('@')) {
      errorElement.textContent = 'Please enter a valid email address';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
      return;
    }
    
    if (!data.password || data.password.length < 6) {
      errorElement.textContent = 'Password must be at least 6 characters';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
      }
      return;
    }
    
    try {
      console.log('Attempting login to:', `${apiBase}/admin/login`);
      
      const res = await fetch(`${apiBase}/admin/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      console.log('Response status:', res.status);
      
      let json;
      try {
        json = await res.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server. Please check if the server is running.');
      }
      
      console.log('Response data:', json);
      
      if (!res.ok) {
        // Handle validation errors
        if (json.errors && Array.isArray(json.errors)) {
          const errorMessages = json.errors.map(err => err.msg || err.message || 'Validation error').join(', ');
          throw new Error(errorMessages);
        }
        // Handle standard error messages
        throw new Error(json.message || `Login failed: ${res.status} ${res.statusText}`);
      }
      
      if (!json.token) {
        throw new Error('No token received from server');
      }
      
      // Success - save token and admin info
      setToken(json.token);
      if (json.admin) {
        localStorage.setItem('admin_name', json.admin.name || '');
        localStorage.setItem('admin_email', json.admin.email || '');
        if (json.admin.profile_image_url) {
          localStorage.setItem('admin_profile_image', json.admin.profile_image_url);
        }
      }
      errorElement.textContent = '';
      errorElement.className = 'text-green-600 text-sm';
      errorElement.textContent = 'Login successful! Redirecting...';
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('#/dashboard');
      }, 500);
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = err.message || 'Login failed. Please try again.';
      
      // Handle network errors
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError') || err.message.includes('fetch')) {
        errorMessage = `Cannot connect to server at ${apiBase}. Please ensure the backend server is running on port 4000.`;
      }
      
      errorElement.textContent = errorMessage;
      errorElement.className = 'text-red-600 text-sm';
    } finally {
      // Re-enable button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          Sign In
        `;
      }
    }
  });
  
  // Password visibility toggle function
  window.togglePasswordVisibility = function(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('svg');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
      `;
    } else {
      input.type = 'password';
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      `;
    }
  };

  // Neural Network Animation with Mouse Attraction
  function initNeuralNetwork() {
    const canvas = document.getElementById('neuralNetwork');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Mouse position tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    // Node class with mouse attraction
    class Node {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 3 + 1.5;
        this.baseRadius = this.radius;
        this.originalX = x;
        this.originalY = y;
        this.attractionStrength = Math.random() * 0.02 + 0.01;
      }
      
      update() {
        // Calculate distance to mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse attraction effect
        if (distance < 200) {
          const attraction = (200 - distance) / 200;
          const force = attraction * this.attractionStrength;
          this.vx += (dx / distance) * force * 2;
          this.vy += (dy / distance) * force * 2;
          
          // Increase radius when near mouse
          this.radius = this.baseRadius + (attraction * 3);
        } else {
          // Return to base radius
          this.radius = this.baseRadius;
        }
        
        // Apply velocity with damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary bounce
        if (this.x < 0 || this.x > canvas.width) {
          this.vx *= -0.8;
          this.x = Math.max(0, Math.min(canvas.width, this.x));
        }
        if (this.y < 0 || this.y > canvas.height) {
          this.vy *= -0.8;
          this.y = Math.max(0, Math.min(canvas.height, this.y));
        }
      }
      
      draw() {
        // Calculate distance to mouse for glow effect
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Glow effect when near mouse
        if (distance < 150) {
          const glow = (150 - distance) / 150;
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
          gradient.addColorStop(0, `rgba(139, 92, 246, ${0.8 + glow * 0.2})`);
          gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.4 + glow * 0.2})`);
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = distance < 150 ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.6)';
        ctx.fill();
        
        // Add highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }
    }
    
    // Create more nodes for increased capacity
    const nodeCount = 80; // Increased from 30 to 80
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ));
    }
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.update();
        node.draw();
      });
      
      // Draw connections with mouse influence
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Increased connection distance
          const maxDistance = 200;
          if (distance < maxDistance) {
            // Calculate mouse influence on connection
            const midX = (nodes[i].x + nodes[j].x) / 2;
            const midY = (nodes[i].y + nodes[j].y) / 2;
            const mouseDx = mouseX - midX;
            const mouseDy = mouseY - midY;
            const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            
            // Enhanced connection when near mouse
            let opacity = 0.2 * (1 - distance / maxDistance);
            let lineWidth = 0.5;
            
            if (mouseDistance < 150) {
              opacity += (150 - mouseDistance) / 150 * 0.3;
              lineWidth += (150 - mouseDistance) / 150 * 0.5;
            }
            
            // Draw connection
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            // Gradient for connections near mouse
            if (mouseDistance < 100) {
              const gradient = ctx.createLinearGradient(
                nodes[i].x, nodes[i].y,
                nodes[j].x, nodes[j].y
              );
              gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`);
              gradient.addColorStop(0.5, `rgba(167, 139, 250, ${opacity * 1.5})`);
              gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity})`);
              ctx.strokeStyle = gradient;
            } else {
              ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            }
            
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }
      }
      
      // Draw mouse interaction area (subtle)
      const mouseGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150);
      mouseGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      mouseGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(mouseX - 150, mouseY - 150, 300, 300);
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  // Mouse Event Interactions
  function initMouseInteractions() {
    const loginCard = document.getElementById('loginCard');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('submitBtn');
    const logoContainer = document.getElementById('logoContainer');
    const titleText = document.getElementById('titleText');
    
    let mouseX = 0;
    let mouseY = 0;
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Parallax effect on login card
      if (loginCard) {
        const rect = loginCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        
        const deltaX = (mouseX - cardCenterX) / 20;
        const deltaY = (mouseY - cardCenterY) / 20;
        
        loginCard.style.transform = `perspective(1000px) rotateY(${deltaX * 0.05}deg) rotateX(${-deltaY * 0.05}deg) scale(1)`;
      }
      
      // Logo follows mouse slightly
      if (logoContainer) {
        const rect = logoContainer.getBoundingClientRect();
        const logoCenterX = rect.left + rect.width / 2;
        const logoCenterY = rect.top + rect.height / 2;
        
        const deltaX = (mouseX - logoCenterX) / 30;
        const deltaY = (mouseY - logoCenterY) / 30;
        
        logoContainer.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg) scale(1)`;
      }
    });
    
    // Input focus effects
    if (emailInput) {
      emailInput.addEventListener('focus', () => {
        emailInput.style.transform = 'scale(1.02)';
        emailInput.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
      });
      
      emailInput.addEventListener('blur', () => {
        emailInput.style.transform = 'scale(1)';
        emailInput.style.boxShadow = 'none';
      });
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('focus', () => {
        passwordInput.style.transform = 'scale(1.02)';
        passwordInput.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
      });
      
      passwordInput.addEventListener('blur', () => {
        passwordInput.style.transform = 'scale(1)';
        passwordInput.style.boxShadow = 'none';
      });
    }
    
    // Button hover ripple effect
    if (submitBtn) {
      submitBtn.addEventListener('mouseenter', (e) => {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.left = (e.offsetX - 10) + 'px';
        ripple.style.top = (e.offsetY - 10) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        
        submitBtn.style.position = 'relative';
        submitBtn.style.overflow = 'hidden';
        submitBtn.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    }
    
    // Add ripple animation CSS
    if (!document.getElementById('loginAnimations')) {
      const style = document.createElement('style');
      style.id = 'loginAnimations';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Title text glow effect on hover
    if (titleText) {
      titleText.addEventListener('mouseenter', () => {
        titleText.style.textShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
      });
      
      titleText.addEventListener('mouseleave', () => {
        titleText.style.textShadow = 'none';
      });
    }
  }
}


