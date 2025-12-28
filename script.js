// Bean counter functionality
let beanCount = 0;
const beanButton = document.getElementById('beanButton');
const beanCountDisplay = document.getElementById('beanCount');

// Button click handler
beanButton.addEventListener('click', function() {
    beanCount++;
    beanCountDisplay.textContent = beanCount;
    
    // Create floating bean animation
    createFloatingBean();
    
    // Add button animation
    this.classList.add('bean-explode');
    setTimeout(() => {
        this.classList.remove('bean-explode');
    }, 600);
    
    // Playful messages
    if (beanCount === 1) {
        showMessage("First bean! 🎉");
    } else if (beanCount === 10) {
        showMessage("10 beans! You're on a roll! 🎊");
    } else if (beanCount === 25) {
        showMessage("25 beans! Bean master! 👑");
    } else if (beanCount === 50) {
        showMessage("50 beans! Legendary! 🌟");
    } else if (beanCount === 100) {
        showMessage("100 BEANS! You're a bean god! 🫘👑");
    }
});

// Create floating bean on click
function createFloatingBean() {
    const bean = document.createElement('div');
    bean.textContent = '🫘';
    bean.style.position = 'fixed';
    bean.style.fontSize = '2rem';
    bean.style.pointerEvents = 'none';
    bean.style.zIndex = '9999';
    
    // Random starting position near button
    const buttonRect = beanButton.getBoundingClientRect();
    bean.style.left = (buttonRect.left + buttonRect.width / 2) + 'px';
    bean.style.top = (buttonRect.top + buttonRect.height / 2) + 'px';
    
    document.body.appendChild(bean);
    
    // Random animation
    const randomX = (Math.random() - 0.5) * 400;
    const randomY = -Math.random() * 300 - 100;
    const randomRotate = Math.random() * 720;
    
    bean.style.transition = 'all 1s ease-out';
    bean.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(0)`;
    bean.style.opacity = '0';
    
    setTimeout(() => {
        bean.remove();
    }, 1000);
}

// Show temporary message
function showMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.background = 'linear-gradient(135deg, #8B4513, #D2691E)';
    message.style.color = 'white';
    message.style.padding = '1rem 2rem';
    message.style.borderRadius = '50px';
    message.style.fontFamily = "'Fredoka', sans-serif";
    message.style.fontSize = '1.2rem';
    message.style.fontWeight = '600';
    message.style.zIndex = '10000';
    message.style.boxShadow = '0 10px 30px rgba(139, 69, 19, 0.4)';
    message.style.animation = 'messageSlideIn 0.5s ease-out';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'messageSlideOut 0.5s ease-out forwards';
        setTimeout(() => {
            message.remove();
        }, 500);
    }, 3000);
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes messageSlideOut {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

// Interactive letter hover effects
document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Add parallax effect to floating beans on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const beans = document.querySelectorAll('.bean');
    beans.forEach((bean, index) => {
        const speed = 0.5 + (index % 3) * 0.2;
        bean.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Easter egg: Konami code for extra beans
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        beanCount += 30;
        beanCountDisplay.textContent = beanCount;
        showMessage("KONAMI CODE! +30 BEANS! 🎮🫘");
        for (let i = 0; i < 10; i++) {
            setTimeout(() => createFloatingBean(), i * 100);
        }
        konamiCode = [];
    }
});

// Add sparkle effect on page load
window.addEventListener('load', () => {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createFloatingBean();
        }, i * 100);
    }
});


