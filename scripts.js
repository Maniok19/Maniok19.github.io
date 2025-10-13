// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Shooting stars animation
    createShootingStars();
    
    // Parallax effect for solar system
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const solarSystem = document.querySelector('.solar-system-container');
        
        if (solarSystem) {
            const rotation = scrollY * 0.03;
            solarSystem.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        }
    });

    // Add hover effect to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Dynamic typing effect for subtitle
    const subtitle = document.querySelector('.subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    
    let charIndex = 0;
    const typingInterval = setInterval(() => {
        if (charIndex < originalText.length) {
            subtitle.textContent += originalText.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(typingInterval);
        }
    }, 100);
});

// Create shooting stars
function createShootingStars() {
    setInterval(() => {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 0 10px white, 0 0 20px white;
            z-index: 5;
            pointer-events: none;
            top: ${Math.random() * 50}%;
            left: ${Math.random() * 100}%;
            animation: shootingStar ${2 + Math.random() * 2}s linear;
        `;
        
        document.body.appendChild(star);
        
        setTimeout(() => {
            star.remove();
        }, 4000);
    }, 4000);
}

// Add shooting star animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shootingStar {
        0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateX(300px) translateY(300px);
            opacity: 0;
        }
    }
    
    .timeline-item {
        transition: transform 0.3s ease;
    }
    
    @keyframes float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    .cert-card {
        animation: float 8s ease-in-out infinite;
    }
    
    .cert-card:nth-child(2) {
        animation-delay: 2.5s;
    }
    
    .cert-card:nth-child(3) {
        animation-delay: 5s;
    }
`;
document.head.appendChild(style);

// Add subtle nebula effect on mouse move (reduced frequency)
let lastNebulaTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastNebulaTime < 200) return; // Throttle to every 200ms
    lastNebulaTime = now;
    
    const nebula = document.createElement('div');
    nebula.style.cssText = `
        position: fixed;
        width: 60px;
        height: 60px;
        background: radial-gradient(circle, rgba(0, 217, 255, 0.05) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
        left: ${e.clientX - 30}px;
        top: ${e.clientY - 30}px;
        animation: fadeOut 3s forwards;
    `;
    
    document.body.appendChild(nebula);
    
    setTimeout(() => {
        nebula.remove();
    }, 3000);
});

const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(1.5);
        }
    }
`;
document.head.appendChild(fadeOutStyle);

// Smooth scroll for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// GitHub Integration
const GITHUB_USERNAME = 'Maniok19'; // Change this to your GitHub username
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

async function fetchGitHubData() {
    try {
        // Fetch user data
        const userResponse = await fetch(GITHUB_API_URL);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();

        // Fetch repositories
        const reposResponse = await fetch(GITHUB_REPOS_URL);
        if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
        const reposData = await reposResponse.json();

        // Update stats
        updateGitHubStats(userData, reposData);
        
        // Display repositories
        displayRepositories(reposData);
    } catch (error) {
        console.error('GitHub API Error:', error);
        displayError();
    }
}

function updateGitHubStats(userData, reposData) {
    // Calculate total stars and forks
    const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = reposData.reduce((sum, repo) => sum + repo.forks_count, 0);

    // Animate counting up
    animateValue('total-repos', 0, userData.public_repos, 1000);
    animateValue('total-stars', 0, totalStars, 1000);
    animateValue('total-forks', 0, totalForks, 1000);
    animateValue('followers', 0, userData.followers, 1000);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function displayRepositories(repos) {
    const container = document.getElementById('github-repos');
    
    if (repos.length === 0) {
        container.innerHTML = '<p class="error-message">No repositories found.</p>';
        return;
    }

    container.innerHTML = repos.map(repo => {
        const language = repo.language || 'N/A';
        const description = repo.description || 'No description available';
        const topics = repo.topics || [];
        
        return `
            <div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
                <div class="repo-header">
                    <span class="repo-icon">📁</span>
                    <h3 class="repo-name">${repo.name}</h3>
                </div>
                <p class="repo-description">${description}</p>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <span class="repo-stat-icon">⭐</span>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="repo-stat">
                        <span class="repo-stat-icon">🔱</span>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="repo-stat">
                        <span class="repo-stat-icon">👁️</span>
                        <span>${repo.watchers_count}</span>
                    </div>
                </div>
                ${language !== 'N/A' ? `<span class="repo-language">${language}</span>` : ''}
                ${topics.length > 0 ? `
                    <div class="repo-topics">
                        ${topics.slice(0, 3).map(topic => `<span class="repo-topic">${topic}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function displayError() {
    const container = document.getElementById('github-repos');
    container.innerHTML = `
        <p class="error-message">
            Unable to load GitHub repositories. Please try again later.
        </p>
    `;
    
    // Set stats to error state
    ['total-repos', 'total-stars', 'total-forks', 'followers'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '--';
    });
}

// Initialize GitHub data when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Fetch GitHub data
    fetchGitHubData();
});