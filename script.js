// --- Scroll Animations & Navbar ---
document.addEventListener('DOMContentLoaded', () => {
    // Navbar effect on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Fade-in elements on scroll
    const faders = document.querySelectorAll('.fade-in-on-scroll');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });
});

// --- Dynamic 3D Background with Three.js ---
// Creates an interactive particle field that reacts to mouse movement
const initThreeJSBackground = () => {
    const container = document.getElementById('canvas-container');
    
    // Scene Setup
    const scene = new THREE.Scene();
    
    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Particles creation
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const androidGreen = new THREE.Color('#3DDC84');
    const accentTeal = new THREE.Color('#64ffda');

    for(let i = 0; i < particlesCount * 3; i+=3) {
        // Spread particles
        posArray[i] = (Math.random() - 0.5) * 100;     // x
        posArray[i+1] = (Math.random() - 0.5) * 100;   // y
        posArray[i+2] = (Math.random() - 0.5) * 50;    // z

        // Mix colors between Android green and our teal accent
        const mixedColor = Math.random() > 0.5 ? androidGreen : accentTeal;
        colorsArray[i] = mixedColor.r;
        colorsArray[i+1] = mixedColor.g;
        colorsArray[i+2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    // Particle Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    // Create Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Rotate particles slowly
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Interaction rotation based on mouse
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        renderer.render(scene, camera);
    };

    animate();
};

// Initialize 3D Background if Three.js is loaded
if (typeof THREE !== 'undefined') {
    initThreeJSBackground();
} else {
    console.log("Three.js not loaded properly.");
}

// --- GitHub Repositories Fetch ---
const fetchGitHubRepos = async (username) => {
    const container = document.getElementById('github-repos-container');
    if (!container) return;
    
    // If you haven't provided a username yet
    if (username === 'YOUR_GITHUB_USERNAME_HERE') {
        return; // Leave placeholders as is
    }

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        if (!response.ok) throw new Error('Network response was not ok');
        const repos = await response.json();
        
        // Filter out the portfolio repository itself
        const filteredRepos = repos
            .filter(repo => repo.name.toLowerCase() !== 'portfolio')
            .slice(0, 6);
        
        container.innerHTML = ''; // Clear placeholders
        
        filteredRepos.forEach(repo => {
            const tech = repo.language ? `<span>${repo.language}</span>` : '';
            const stars = repo.stargazers_count > 0 ? `<span><i class="fas fa-star" style="color:var(--primary-color)"></i> ${repo.stargazers_count}</span>` : '';
            
            const card = document.createElement('div');
            card.className = 'project-card glass-card fade-in-on-scroll appear';
            card.innerHTML = `
                <div class="project-content">
                    <div class="project-icons">
                        <i class="fas fa-folder project-folder"></i>
                        <a href="${repo.html_url}" target="_blank" class="github-link"><i class="fab fa-github"></i></a>
                    </div>
                    <a href="${repo.html_url}" target="_blank" style="text-decoration:none;">
                        <h3 class="project-title">${repo.name}</h3>
                    </a>
                    <p class="project-desc">${repo.description || 'No description available for this repository.'}</p>
                    <div class="project-tech">
                        ${tech}
                        ${stars}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Update profile link
        const profileLink = document.getElementById('github-profile-link');
        if(profileLink) {
            profileLink.href = `https://github.com/${username}`;
        }

    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
    }
};

// Call the function with your username
// Replace 'YOUR_GITHUB_USERNAME_HERE' with your actual username when ready
fetchGitHubRepos('Sholin-88');
