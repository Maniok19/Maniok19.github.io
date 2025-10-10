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