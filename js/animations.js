const AnimationUtils = {
    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    init() {
        this.observeElements();

        document.querySelectorAll('.collection-card, .product-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const title = heroSection.querySelector('h1');
            const subtitle = heroSection.querySelector('.lead');
            const buttons = heroSection.querySelectorAll('.btn');

            if (title) {
                title.style.opacity = '0';
                title.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    title.style.transition = 'all 0.8s ease-out';
                    title.style.opacity = '1';
                    title.style.transform = 'translateY(0)';
                }, 200);
            }

            if (subtitle) {
                subtitle.style.opacity = '0';
                subtitle.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    subtitle.style.transition = 'all 0.8s ease-out';
                    subtitle.style.opacity = '1';
                    subtitle.style.transform = 'translateY(0)';
                }, 400);
            }

            buttons.forEach((btn, index) => {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    btn.style.transition = 'all 0.8s ease-out';
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                }, 600 + (index * 150));
            });
        }

        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s ease-out';
                ripple.style.pointerEvents = 'none';

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }

            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimationUtils.init());
} else {
    AnimationUtils.init();
}
