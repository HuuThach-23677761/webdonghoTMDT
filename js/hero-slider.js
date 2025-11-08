class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isTransitioning = false;

        if (this.slides.length > 0) {
            this.init();
        }
    }

    init() {
        this.showSlide(0);
        this.startAutoPlay();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });

        this.addKeyboardControls();
    }

    showSlide(index) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;

        this.slides.forEach((slide, i) => {
            slide.classList.remove('active');
        });

        this.indicators.forEach((indicator, i) => {
            indicator.classList.remove('active');
        });

        if (index >= this.slides.length) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.slides.length - 1;
        } else {
            this.currentSlide = index;
        }

        this.slides[this.currentSlide].classList.add('active');
        this.indicators[this.currentSlide].classList.add('active');

        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }

    next() {
        this.stopAutoPlay();
        this.showSlide(this.currentSlide + 1);
        this.startAutoPlay();
    }

    prev() {
        this.stopAutoPlay();
        this.showSlide(this.currentSlide - 1);
        this.startAutoPlay();
    }

    goTo(index) {
        this.stopAutoPlay();
        this.showSlide(index);
        this.startAutoPlay();
    }

    startAutoPlay() {
        this.slideInterval = setInterval(() => {
            this.showSlide(this.currentSlide + 1);
        }, 5000);
    }

    stopAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }

    addKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'ArrowRight') {
                this.next();
            }
        });
    }
}

const heroSlider = new HeroSlider();

let startX = 0;
let endX = 0;

const heroSliderElement = document.querySelector('.hero-slider');
if (heroSliderElement) {
    heroSliderElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    heroSliderElement.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
    });

    heroSliderElement.addEventListener('touchend', () => {
        if (startX - endX > 50) {
            heroSlider.next();
        } else if (endX - startX > 50) {
            heroSlider.prev();
        }
    });

    heroSliderElement.addEventListener('mouseenter', () => {
        heroSlider.stopAutoPlay();
    });

    heroSliderElement.addEventListener('mouseleave', () => {
        heroSlider.startAutoPlay();
    });
}
