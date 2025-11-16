// Binary background effect
document.addEventListener('DOMContentLoaded', function() {
    // Create background container
    const bgContainer = document.createElement('div');
    bgContainer.id = 'binary-background';
    document.body.insertBefore(bgContainer, document.body.firstChild);
    
    const digits = [];
    const spacing = 40;
    const cols = Math.ceil(window.innerWidth / spacing);
    const rows = Math.ceil(window.innerHeight / spacing);
    
    // Create grid of 0s
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const digit = document.createElement('span');
            digit.className = 'binary-digit';
            digit.textContent = '0';
            digit.style.left = (col * spacing + Math.random() * 10) + 'px';
            digit.style.top = (row * spacing + Math.random() * 10) + 'px';
            digit.dataset.originalValue = '0';
            
            bgContainer.appendChild(digit);
            digits.push(digit);
        }
    }
    
    // Mouse move handler
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;
    
    function updateDigits() {
        const radius = 100; // Radius of effect around mouse
        
        digits.forEach(digit => {
            const rect = digit.getBoundingClientRect();
            const digitX = rect.left + rect.width / 2;
            const digitY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(digitX - mouseX, 2) + 
                Math.pow(digitY - mouseY, 2)
            );
            
            if (distance < radius && digit.textContent === '0') {
                // Transform to 1
                digit.textContent = '1';
                digit.classList.add('active');
                
                // Return to 0 after delay
                setTimeout(() => {
                    digit.textContent = '0';
                    digit.classList.remove('active');
                }, 3000 + Math.random() * 1000);
            }
        });
        
        rafId = null;
    }
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!rafId) {
            rafId = requestAnimationFrame(updateDigits);
        }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recreate grid on resize
            bgContainer.innerHTML = '';
            digits.length = 0;
            
            const newCols = Math.ceil(window.innerWidth / spacing);
            const newRows = Math.ceil(window.innerHeight / spacing);
            
            for (let row = 0; row < newRows; row++) {
                for (let col = 0; col < newCols; col++) {
                    const digit = document.createElement('span');
                    digit.className = 'binary-digit';
                    digit.textContent = '0';
                    digit.style.left = (col * spacing + Math.random() * 10) + 'px';
                    digit.style.top = (row * spacing + Math.random() * 10) + 'px';
                    
                    bgContainer.appendChild(digit);
                    digits.push(digit);
                }
            }
        }, 250);
    });
});
