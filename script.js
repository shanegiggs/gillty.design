/**
 * GILLTY DESIGN STUDIO - INTERACTIVITY
 * Handles Scroll Reveals, Parallax, Nav Blend, and Before/After Slider
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================================
       0. LENIS SMOOTH SCROLLING
       ========================================================================= */
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Sync Lenis with GSAP ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    /* =========================================================================
       1. NAV BLEND MODE & SCROLL LOGIC & MOBILE MENU
       ========================================================================= */
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navLinksContainer.classList.toggle('active');
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            if (menuToggle && menuToggle.classList.contains('is-active')) {
                menuToggle.classList.remove('is-active');
                navLinksContainer.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                if (typeof lenis !== 'undefined' && lenis) {
                    lenis.scrollTo(target);
                } else {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    /* =========================================================================
       2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
       ========================================================================= */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-block');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealOnScroll.observe(element);
    });

    /* =========================================================================
       3. PARALLAX EFFECT ON IMAGES
       ========================================================================= */
    const parallaxImages = document.querySelectorAll('.parallax-img');
    const heroBg = document.querySelector('.hero-bg-parallax');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;

        // Hero Parallax (GSAP takes over if present)
        if (heroBg && !document.querySelector('.hero-grid-wrapper')) {
            const speed = heroBg.getAttribute('data-speed') || 0.5;
            heroBg.style.transform = `translateY(${scrollPosition * speed}px)`;
        }

        // Project Images Parallax
        parallaxImages.forEach(img => {
            const container = img.closest('.project-visual');
            if (!container) return;

            // Check if element is in viewport to optimize performance
            const rect = container.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                const limit = container.offsetHeight * 0.2; // Max movement
                const distance = (window.innerHeight - rect.top) * 0.15;
                const containerSpeed = container.getAttribute('data-speed') || 0.5;

                // Capped parallax movement
                let yPos = distance * containerSpeed;
                if (yPos > limit) yPos = limit;
                if (yPos < -limit) yPos = -limit;

                img.style.transform = `translateY(${yPos}px)`;
            }
        });
    });

    /* =========================================================================
       3.5. GSAP FULL-SCREEN VIDEO SCROLL
       ========================================================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const videoWrapper = document.querySelector('.video-showcase-wrapper.scroll-scale');

        if (videoWrapper) {
            gsap.to(videoWrapper, {
                width: () => Math.min(1200, window.innerWidth * 0.9) + "px", // Dynamic pixel calculation
                height: "70vh", // Keeping a nice cinematic aspect ratio
                borderRadius: "16px",
                ease: "none",
                scrollTrigger: {
                    trigger: ".video-scroll-section",
                    start: "top top",
                    end: "+=150%", // Sped up the effect by reducing scroll distance
                    scrub: true,
                    pin: true, // Pin the section while it scales down
                    invalidateOnRefresh: true // Ensure values recalculate on window resize
                }
            });
        }
    }
    /* =========================================================================
       4. INTERACTIVE BEFORE/AFTER SLIDER
       ========================================================================= */
    initBeforeAfterSlider();

    function initBeforeAfterSlider() {
        const wrapper = document.querySelector('.image-comparison');
        if (!wrapper) return;

        const beforeImage = wrapper.querySelector('.before-image');
        const sliderHandle = wrapper.querySelector('.slider-handle');
        let isSliding = false;

        // Mouse Events
        wrapper.addEventListener('mousedown', startSliding);
        window.addEventListener('mouseup', stopSliding);
        window.addEventListener('mousemove', slide);

        // Touch Events
        wrapper.addEventListener('touchstart', startSliding, { passive: false });
        window.addEventListener('touchend', stopSliding);
        window.addEventListener('touchmove', slide, { passive: false });

        function startSliding(e) {
            isSliding = true;
        }

        function stopSliding() {
            isSliding = false;
        }

        function slide(e) {
            if (!isSliding) return;

            // Prevent default scrolling on touch devices while sliding
            if (e.type === 'touchmove') {
                // e.preventDefault(); // Sometimes this causes issues, use with caution
            }

            let posX = getCursorPos(e);
            let width = wrapper.offsetWidth;

            // Constrain handle to bounds
            if (posX < 0) posX = 0;
            if (posX > width) posX = width;

            // Calculate percentage
            let percentage = (posX / width) * 100;

            // Apply new width/position
            beforeImage.style.width = percentage + "%";
            sliderHandle.style.left = percentage + "%";
            sliderHandle.style.transform = `translateX(-50%)`;
        }

        function getCursorPos(e) {
            let a = wrapper.getBoundingClientRect();
            let x = 0;
            // Handle touch vs mouse
            if (e.type.includes('touch')) {
                x = e.touches[0].clientX - a.left;
            } else {
                x = e.pageX - a.left - window.pageXOffset;
            }
            return x;
        }
    }

    /* =========================================================================
       4.5 WORKFLOW TIMELINE ANIMATION
       ========================================================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const timelineProgress = document.querySelector('.timeline-progress');
        const processSteps = gsap.utils.toArray('.process-step');

        if (timelineProgress && processSteps.length > 0) {
            // Animate the main line growing
            gsap.to(timelineProgress, {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: ".process-timeline",
                    start: "top center",
                    end: "bottom center",
                    scrub: true
                }
            });

            // Toggle active class on each step as they cross the center of the screen
            processSteps.forEach((step, i) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top center+=100", // slightly below center
                    end: "bottom center-=100", // slightly above center
                    toggleClass: { targets: step, className: "timeline-active" }
                });
            });
        }
    }

    /* =========================================================================
       4.75. PRICING CALCULATOR LOGIC
       ========================================================================= */
    const wizard = document.querySelector('.calculator-wizard');
    if (wizard) {
        const nextBtns = wizard.querySelectorAll('.btn-calc-next');
        const prevBtns = wizard.querySelectorAll('.btn-calc-prev');
        const steps = wizard.querySelectorAll('.calc-step');

        // Form Inputs
        const brandUrlInput = document.getElementById('brand-url');
        const tierRadios = document.querySelectorAll('input[name="web_tier"]');
        const visualCountInput = document.getElementById('visual-count');
        const visualHint = document.getElementById('visual-tier-hint');
        const addonLoops = document.getElementById('addon-loops');
        const addonMaster = document.getElementById('addon-master');

        // Output Elements
        const sumWeb = document.getElementById('sum-web');
        const sumVisuals = document.getElementById('sum-visuals');
        const sumAddonsContainer = document.getElementById('sum-addons-container');
        const sumAddons = document.getElementById('sum-addons');
        const sumTotal = document.getElementById('sum-total');
        const sumUrlDisplay = document.getElementById('sum-url-display');
        const highEndMessage = document.getElementById('high-end-message');

        // Prices
        const VISUAL_PRICE = 100;
        const ADDON_LOOP_PRICE = 250;
        const ADDON_MASTER_PRICE = 500;
        const HIGH_END_TRIGGER = 10000;

        // Step Navigation
        function showStep(stepId) {
            steps.forEach(s => s.classList.remove('active'));
            document.getElementById(stepId).classList.add('active');
            if (stepId === 'step-4') calculateTotal();
        }

        nextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showStep(btn.getAttribute('data-next'));
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showStep(btn.getAttribute('data-prev'));
            });
        });

        // Dynamic Hinting
        visualCountInput.addEventListener('input', () => {
            const count = parseInt(visualCountInput.value) || 0;
            if (count > 0) {
                visualHint.textContent = `€${(count * VISUAL_PRICE).toLocaleString()} applied.`;
            } else {
                visualHint.textContent = "€100 per visual.";
            }
        });

        // Calculation Logic
        function calculateTotal() {
            let total = 0;
            let isCustomQuote = false;

            // 1. Get Brand Setup
            const brandUrl = brandUrlInput.value.trim() || "your brand";

            // 2. Get Web Tier
            const selectedTier = document.querySelector('input[name="web_tier"]:checked');
            const tierName = selectedTier.value;
            const tierDataPrice = selectedTier.getAttribute('data-price');

            if (tierDataPrice === "custom") {
                isCustomQuote = true;
            } else {
                total += parseInt(tierDataPrice);
            }

            // 3. Get Visuals
            const count = parseInt(visualCountInput.value) || 0;
            let visualTierName = "Still Visuals";
            if (count > 0) {
                total += count * VISUAL_PRICE;
            }

            // 4. Get Add-ons
            let activeAddons = [];
            if (addonLoops.checked && count > 0) {
                const loopsCost = count * ADDON_LOOP_PRICE;
                total += loopsCost;
                activeAddons.push(`Cinematic Loops (€${loopsCost.toLocaleString()})`);
            }
            if (addonMaster.checked) {
                total += ADDON_MASTER_PRICE;
                activeAddons.push("Master Video");
            }

            // 5. Build Output
            sumUrlDisplay.textContent = brandUrl;
            sumUrlDisplay.href = brandUrl !== "your brand" ? (brandUrl.startsWith('http') ? brandUrl : `https://${brandUrl}`) : "#";
            sumWeb.textContent = tierName;
            sumVisuals.textContent = count > 0 ? `${count} ${count === 1 ? 'Visual' : 'Visuals'} (${visualTierName})` : "0";

            if (activeAddons.length > 0) {
                sumAddonsContainer.style.display = 'flex';
                sumAddons.textContent = activeAddons.join(', ');
            } else {
                sumAddonsContainer.style.display = 'none';
            }

            // 6. Handle High-End / Custom Rules
            if (isCustomQuote || total > HIGH_END_TRIGGER) {
                sumTotal.textContent = "Custom Quote";
                sumTotal.style.fontSize = "2.5rem"; // slightly smaller for text
                highEndMessage.innerHTML = "Bespoke builds and high-fidelity environments require precise creative alignment. <strong>Secure a strategy session to refine your roadmap and ensure a perfect stylistic match.</strong>";
            } else {
                sumTotal.textContent = `€${total.toLocaleString()}`;
                sumTotal.style.fontSize = "4rem";
                highEndMessage.innerHTML = "We carefully engineer all deliverables to enhance your brand. Secure a strategy session to lock in this projection.";
            }
        }
    }

    /* =========================================================================
       5. FAQ ACCORDION
       ========================================================================= */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('is-open');
            });

            // Open the clicked one if it wasn't already open
            // If it was already open, it just gets closed
            if (!isOpen) {
                item.classList.add('is-open');
            }
        });
    });
});
