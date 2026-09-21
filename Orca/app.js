/**
 * Application logic for Jeddah Yacht & Boat Rental (Orca Marine Trips)
 * Handles UI interactions, gallery filtering, dynamic pricing calculator, and WhatsApp booking.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Mobile Navigation Menu Toggle
    // --------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const navOverlay = document.getElementById('navOverlay');

    function closeNav() {
        mainNav.classList.remove('active');
        navOverlay.classList.remove('active');
        mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('active');
            navOverlay.classList.toggle('active', isOpen);
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navOverlay.addEventListener('click', closeNav);

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => link.addEventListener('click', closeNav));
    }

    // ── High-Performance Scroll-Spy (Nav & Categories) without Forced Reflow ──
    const sections = document.querySelectorAll('section');
    const scrollLinks = document.querySelectorAll('.nav-link');
    let isScrollTicking = false;
    let activeNavId = '';
    let activeCatId = '';

    const updateActiveScrollState = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Update main navigation active state
        let currentNav = '';
        sections.forEach(sec => {
            if (scrollY >= sec.offsetTop - 100) {
                currentNav = sec.getAttribute('id');
            }
        });
        if (currentNav && currentNav !== activeNavId) {
            activeNavId = currentNav;
            scrollLinks.forEach(link => {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href === `#${currentNav}` || href.substring(1) === currentNav);
            });
        }

        // Update category tabs active state if present
        const categorySections = document.querySelectorAll('.category-section');
        const tabBtns = document.querySelectorAll('.packages-tabs .tab-btn');
        if (categorySections.length > 0 && tabBtns.length > 0) {
            let currentCat = '';
            categorySections.forEach(sec => {
                if (scrollY >= sec.offsetTop - 120) {
                    currentCat = sec.getAttribute('id');
                }
            });
            if (currentCat && currentCat !== activeCatId) {
                activeCatId = currentCat;
                tabBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('href') === `#${currentCat}`);
                });
            }
        }

        isScrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!isScrollTicking) {
            window.requestAnimationFrame(updateActiveScrollState);
            isScrollTicking = true;
        }
    }, { passive: true });

    // --------------------------------------------------------------------------
    // 1.5. Card Image Slider Controls
    // --------------------------------------------------------------------------
    const sliders = document.querySelectorAll('.package-slider');
    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.slide');
        
        if (slides.length <= 1) {
            // If only 1 image, display counter as "1 / 1"
            const counter = document.createElement('div');
            counter.className = 'slider-counter';
            counter.textContent = '1 / 1';
            slider.appendChild(counter);
            return;
        }

        // Dynamically inject prev/next buttons with accessible names & 48px touch targets
        const isAr = document.documentElement.lang !== 'en';
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'slider-btn prev-btn';
        prevBtn.setAttribute('aria-label', isAr ? 'الصورة السابقة' : 'Previous slide');
        prevBtn.title = isAr ? 'الصورة السابقة' : 'Previous slide';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i><span class="sr-only">' + (isAr ? 'السابق' : 'Previous') + '</span>';
        slider.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'slider-btn next-btn';
        nextBtn.setAttribute('aria-label', isAr ? 'الصورة التالية' : 'Next slide');
        nextBtn.title = isAr ? 'الصورة التالية' : 'Next slide';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span class="sr-only">' + (isAr ? 'التالي' : 'Next') + '</span>';
        slider.appendChild(nextBtn);

        // Dynamically inject image counter
        const counter = document.createElement('div');
        counter.className = 'slider-counter';
        slider.appendChild(counter);
        
        let currentSlide = 0;
        
        function updateSlides() {
            slides.forEach((slide, idx) => {
                if (idx === currentSlide) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
            counter.textContent = `${currentSlide + 1} / ${slides.length}`;
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlides();
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides();
        }
        
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Touch Swipe Support for iOS, Android and iPads
        let touchStartX = 0;
        let touchStartY = 0;
        slider.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                const diffX = e.changedTouches[0].clientX - touchStartX;
                const diffY = e.changedTouches[0].clientY - touchStartY;
                if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) nextSlide();
                    else prevSlide();
                }
            }
        }, { passive: true });

        // Initial setup
        updateSlides();
    });

    // --------------------------------------------------------------------------
    // 2. Interactive Photo Gallery Filtering & Lightbox
    // --------------------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox Modal
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const captionText = document.getElementById('caption');
    const closeModal = document.querySelector('.close-modal');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const overlayTitle = item.querySelector('.gallery-overlay h3');
            const overlayText = item.querySelector('.gallery-overlay p');
            
            if (modal && modalImg && captionText) {
                modal.style.display = 'block';
                modalImg.src = img.src;
                captionText.innerHTML = `<strong>${overlayTitle.textContent}</strong><br>${overlayText.textContent}`;
            }
        });
    });

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // --------------------------------------------------------------------------
    // 2.5. Tab Control for Packages Section
    // --------------------------------------------------------------------------
    // ── Packages Tab Scroll Navigation and Scroll-Spy ──
    const tabBtns = document.querySelectorAll('.packages-tabs .tab-btn');
    const categorySections = document.querySelectorAll('.category-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('href');
            const targetSec = document.querySelector(targetId);
            if (targetSec) {
                const headerOffset = 100;
                const elementPosition = targetSec.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // --------------------------------------------------------------------------
    // 3. Dynamic Pricing Calculator & WhatsApp Booking Link Generator
    // --------------------------------------------------------------------------
    
    // Trip options mapping to vessel types
    const tripOptions = {
        'nardo': [
            { id: 'bayadah-6', name: 'رحلة جزيرة بياضة (6 ساعات - تبدأ من 3,180 ريال)', duration: 6 },
            { id: 'bayadah-9', name: 'رحلة جزيرة بياضة ممددة (9 ساعات - تبدأ من 3,880 ريال)', duration: 9 },
            { id: 'fishing-add', name: 'رحلة صيد ومغامرات (ساعة صيد إضافية +300 ريال على بياضة)', duration: 7 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (الساعة الأولى 680 / الإضافية 580 ريال)', duration: 1 }
        ],
        'tam': [
            { id: 'bayadah-abu-tair-6', name: 'رحلة بياضة أو أبو طير (6 ساعات - تبدأ من 1,580 ريال)', duration: 6 },
            { id: 'bayadah-abu-tair-9', name: 'رحلة بياضة أو أبو طير ممددة (9 ساعات - تبدأ من 2,080 ريال)', duration: 9 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (الساعة الأولى 460 / الإضافية 430 ريال)', duration: 1 }
        ],
        'barbaros': [
            { id: 'bayadah-6', name: 'رحلة البحر المفتوح (بياضة/أبو طير) - 6 ساعات (2,000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 6 },
            { id: 'bayadah-9', name: 'رحلة البحر المفتوح (بياضة/أبو طير) - 9 ساعات (2,500 ريال)', basePriceWeekday: 2500, basePriceWeekend: 2500, duration: 9 },
            { id: 'open-sea-vip-6', name: 'باقة VIP الشاملة بالألعاب المائية والمشويات (5-6 أشخاص - 3,000 ريال)', basePriceWeekday: 3000, basePriceWeekend: 3000, duration: 6 },
            { id: 'open-sea-vip-9', name: 'باقة VIP الشاملة بالألعاب المائية والمشويات (7-9 أشخاص - 3,500 ريال)', basePriceWeekday: 3500, basePriceWeekend: 3500, duration: 6 },
            { id: 'creek', name: 'جولة النزهة / شرم أبحر (460 ريال/ساعة)', duration: 1 }
        ],
        'qimat-al-fawz-pentos': [
            { id: 'bayadah', name: 'رحلة جزيرة بياضة (6 ساعات - 1,480 ريال)', basePriceWeekday: 1480, basePriceWeekend: 1480, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 1,780 ريال)', basePriceWeekday: 1780, basePriceWeekend: 1780, duration: 6 },
            { id: 'fishing-6', name: 'رحلة صيد (6 ساعات - 1,500 ريال)', basePriceWeekday: 1500, basePriceWeekend: 1500, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات - 1,780 ريال)', basePriceWeekday: 1780, basePriceWeekend: 1780, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات - 1,980 ريال)', basePriceWeekday: 1980, basePriceWeekend: 1980, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة - 2,180 ريال)', basePriceWeekday: 2180, basePriceWeekend: 2180, duration: 12 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (0.5 – 2 ساعة)', duration: 1 }
        ],
        'large-yacht': [
            { id: 'bayadah-hourly', name: 'رحلة بياضة (ساعة - بحد أدنى ساعتين)', hourlyPriceWeekday: 2000, hourlyPriceWeekend: 2200 },
            { id: 'abu-tair-hourly', name: 'رحلة جزيرة أبو طير (ساعة - بحد أدنى ساعتين (+300 ريال/رحلة))', hourlyPriceWeekday: 2300, hourlyPriceWeekend: 2500 },
            { id: 'creek-hourly', name: 'رحلة خور (ساعة - بحد أدنى ساعتين)', hourlyPriceWeekday: 2000, hourlyPriceWeekend: 2200 }
        ],
        'baby-yacht-ambassador': [
            { id: 'bayadah', name: 'رحلة بياضة (6 ساعات)', basePriceWeekday: 2000, basePriceWeekend: 2300, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 2,300 ريال)', basePriceWeekday: 2300, basePriceWeekend: 2600, duration: 6 },
            { id: 'trolling', name: 'صيد ترولنق (6 ساعات)', basePriceWeekday: 2200, basePriceWeekend: 2500, duration: 6 },
            { id: 'creek', name: 'جولة الخور (0.5 – 2 ساعة)', duration: 1 }
        ],
        'baby-yacht-orax-40': [
            { id: 'bayadah', name: 'رحلة بياضة (6 ساعات - 3,100 ريال)', basePriceWeekday: 3100, basePriceWeekend: 3100, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 3,400 ريال)', basePriceWeekday: 3400, basePriceWeekend: 3400, duration: 6 },
            { id: 'creek', name: 'جولة الخور (0.5 – 2 ساعة)', duration: 1 }
        ],
        'al-jawhari': [
            { id: 'bayadah', name: 'رحلة جزيرة بياضة (6 ساعات - 1,750 ريال)', basePriceWeekday: 1750, basePriceWeekend: 1750, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 2,000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 6 },
            { id: 'khor-saud', name: 'رحلة خور سعود (6 ساعات - 1,750 ريال)', basePriceWeekday: 1750, basePriceWeekend: 1750, duration: 6 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (460 ريال/ساعة)', duration: 1 }
        ],
        'al-ameed': [
            { id: 'bayadah', name: 'رحلة بياضة (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1500, basePriceWeekend: 1800, duration: 12 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2100, duration: 12 },
            { id: 'mix', name: 'مكس صيد + بياضة (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1950, basePriceWeekend: 2250, duration: 12 },
            { id: 'fishing', name: 'رحلة صيد فقط (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2100, duration: 12 },
            { id: 'creek', name: 'رحلة خور (0.5 – 2 ساعة)', duration: 1 }
        ],
                'seven-boat': [
            { id: 'bayadah', name: 'رحلة جزيرة بياضة (6 ساعات - 1,300 ريال)', basePriceWeekday: 1300, basePriceWeekend: 1300, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 1,600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 6 },
            { id: 'fishing-6', name: 'رحلة صيد (6 ساعات - 1,400 ريال)', basePriceWeekday: 1400, basePriceWeekend: 1400, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات - 1,600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات - 1,800 ريال)', basePriceWeekday: 1800, basePriceWeekend: 1800, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة - 2,000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 12 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (0.5 – 2 ساعة)', duration: 1 }
        ],
        'norseen-large': [
            { id: 'bayadah', name: 'رحلة بياضة (6 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2000, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات)', basePriceWeekday: 2100, basePriceWeekend: 2300, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات)', basePriceWeekday: 2100, basePriceWeekend: 2300, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات)', basePriceWeekday: 2300, basePriceWeekend: 2500, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة)', basePriceWeekday: 2500, basePriceWeekend: 2700, duration: 12 },
            { id: 'creek', name: 'رحلة خور (0.5 – 2 ساعة)', duration: 1 }
        ],
                'qimat-al-fawz': [
            { id: 'bayadah', name: 'رحلة جزيرة بياضة (6 ساعات - 1,300 ريال)', basePriceWeekday: 1300, basePriceWeekend: 1300, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات - 1,600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 6 },
            { id: 'fishing-6', name: 'رحلة صيد (6 ساعات - 1,400 ريال)', basePriceWeekday: 1400, basePriceWeekend: 1400, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات - 1,600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات - 1,800 ريال)', basePriceWeekday: 1800, basePriceWeekend: 1800, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة - 2,000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 12 },
            { id: 'creek', name: 'جولة الخور / شرم أبحر (0.5 – 2 ساعة)', duration: 1 }
        ],
        'boat-51': [
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات)', basePriceWeekday: 1200, basePriceWeekend: 1300, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات)', basePriceWeekday: 1300, basePriceWeekend: 1400, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة)', basePriceWeekday: 1500, basePriceWeekend: 1600, duration: 12 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (8 ساعات - 1,600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 8 }
        ]
    };

    // Creek price lookup based on vessel type and duration
    function getCreekPrice(vessel, hours) {
        if (vessel === 'nardo') {
            if (hours <= 0.5) return 340;
            return 680 + Math.max(0, hours - 1) * 580;
        }
        if (vessel === 'tam') {
            if (hours <= 0.5) return 230;
            return 460 + Math.max(0, hours - 1) * 430;
        }
        if (vessel === 'barbaros') {
            return 460 * Math.max(1, hours); // 460 per hour, minimum 1 full hour
        }
        if (vessel === 'qimat-al-fawz-pentos') {
            if (hours <= 0.5) return 250;
            return 450; // 1 hour full is 450
        }
        if (vessel === 'al-jawhari') {
            if (hours <= 0.5) return 230;
            return 460 * hours; // 460 per hour
        }
        if (vessel === 'baby-yacht-orax-40') {
            if (hours <= 0.5) return 350;
            return 700; // 700 per hour
        }
        if (vessel === 'baby-yacht-ambassador') {
            if (hours <= 0.5) return 300;
            return 600; // 600 per hour
        }
        if (vessel.startsWith('baby-yacht') || vessel === 'large-yacht') {
            if (hours <= 0.5) return 250;
            if (hours <= 1.0) return 500;
            if (hours <= 1.5) return 750;
            return 1000; // 2 hours
        } else {
            // Regular boats: qimat-al-fawz, seven series (1, 2, 3), shaheen, bahr, al-noor-al-azraq, etc.
            if (hours <= 0.5) return 200;
            if (hours <= 1.0) return 350;
            if (hours <= 1.5) return 550;
            return 700; // 2 hours
        }
    }

    // Aliased vessels that share "seven-boat" pricing configuration
    const sevenAliases = ['seven-boat-2', 'seven-boat-3', 'various-boats', 'shaheen', 'bahr', 'al-noor-al-azraq', 'blue-light', 'bahr-boat'];
    sevenAliases.forEach(alias => {
        tripOptions[alias] = JSON.parse(JSON.stringify(tripOptions['seven-boat']));
    });

    // Large Boats aliases that share "al-ameed" pricing configuration
    const largeBoatAliases = [];
    largeBoatAliases.forEach(alias => {
        tripOptions[alias] = JSON.parse(JSON.stringify(tripOptions['al-ameed']));
    });

    // Southern Boats aliases that share "boat-51" pricing configuration
    const southernBoatAliases = ['jaguar', 'ghazal-obhur', 'bin-shuraiq', 'shawq-al-layl'];
    southernBoatAliases.forEach(alias => {
        tripOptions[alias] = JSON.parse(JSON.stringify(tripOptions['boat-51']));
    });

    // Capacities constraints (max guests)
    const capacities = {
        'nardo':                  { max: 14, label: '14 ضيفاً' },
        'tam':                    { max: 11, label: '11 ضيفاً' },
        'barbaros':               { max: 10, label: '10 ضيوف' },
        'al-jawhari':             { max: 10, label: '10 ضيوف' },
        'qimat-al-fawz-pentos':   { max: 12, label: '12 ضيفاً' },
        'large-yacht':            { max: 35, label: '35 شخصاً' },
        'baby-yacht-ambassador':  { max: 11, label: '11 ضيفاً' },
        'al-ameed':               { max: 11, label: '11 ضيفاً' },
        'seven-boat':             { max: 9,  label: '9 ضيوف' },
        'norseen-large':          { max: 19, label: '19 ضيفاً' },
        'boat-51':                { max: 8,  label: '8 ضيوف (يشمل 6 أشخاص)' }
    };
    sevenAliases.forEach(alias => {
        capacities[alias] = { max: 9, label: '9 ضيوف' };
    });
    largeBoatAliases.forEach(alias => {
        capacities[alias] = { max: 11, label: '11 ضيفاً' };
    });
    southernBoatAliases.forEach(alias => {
        capacities[alias] = { max: 8, label: '8 ضيوف (يشمل 6 أشخاص)' };
    });

    // Default deposits
    function calculateDepositAmount(vessel, totalCost, day, tripId) {
        if (tripId === 'creek' || tripId === 'creek-hourly') {
            return totalCost; // 100% deposit for short Creek trips
        }
        if (vessel === 'barbaros' || vessel === 'qimat-al-fawz-pentos' || vessel === 'large-yacht' || vessel === 'al-jawhari' || vessel === 'nardo' || vessel === 'tam') {
            return totalCost * 0.50; // 50% deposit
        }
        if (vessel.startsWith('baby-yacht')) {
            return (day === 'weekend') ? 1000 : 700;
        }
        if (vessel === 'boat-51' || southernBoatAliases.includes(vessel)) {
            if (tripId.includes('8') || tripId.includes('10')) return 300;
            if (tripId.includes('12')) return 400;
            return 300;
        }
        if (vessel === 'al-ameed' || largeBoatAliases.includes(vessel)) {
            return (day === 'weekend') ? 300 : 200;
        }
        // Seven and Norseen boats
        return 300; // Flat deposit for standard boats
    }

    // Calculator DOM Elements
    const bookingModeSelect = document.getElementById('bookingMode');
    const groupBookingForm = document.getElementById('groupBookingForm');
    const individualBookingForm = document.getElementById('individualBookingForm');

    // Group Form elements
    const vesselTypeSelect = document.getElementById('vesselType');
    const tripTypeSelect = document.getElementById('tripType');
    const dayTypeSelect = document.getElementById('dayType');
    const numPeopleInput = document.getElementById('numPeople');
    const maxGuestsText = document.getElementById('maxGuestsText');
    const maxLabel = document.getElementById('maxLabel');
    const peopleValDisplay = document.getElementById('peopleValDisplay');
    const packageTypeSelect = document.getElementById('packageType');
    const packageGroup = document.getElementById('packageGroup');
    const specialRequestsGroup = document.getElementById('specialRequestsGroup');
    const specialRequestsInput = document.getElementById('specialRequests');
    
    // Baby Yacht specific options
    const babyYachtOptions = document.getElementById('babyYachtOptions');
    const addBBQSelect = document.getElementById('addBBQ');
    const creekHoursInput = document.getElementById('creekHours');
    const creekHoursVal = document.getElementById('creekHoursVal');
    const creekHoursGroup = document.getElementById('creekHoursGroup');

    // Yacht hourly duration element
    const yachtHoursGroup = document.getElementById('yachtHoursGroup');
    const yachtHoursInput = document.getElementById('yachtHours');
    const yachtHoursVal = document.getElementById('yachtHoursVal');

    // Southern Marina selector group
    const southernMarinaGroup = document.getElementById('southernMarinaGroup');
    const southernMarinaSelect = document.getElementById('southernMarinaSelect');

    // Individual Form elements
    const indTripType = document.getElementById('indTripType');
    const indDayType = document.getElementById('indDayType');
    const indPackageType = document.getElementById('indPackageType');
    const indPeopleInput = document.getElementById('indPeople');
    const indPeopleVal = document.getElementById('indPeopleVal');

    // Outputs
    const basePriceDisplay = document.getElementById('basePriceDisplay');
    const weekendExtraRow = document.getElementById('weekendExtraRow');
    const weekendPriceDisplay = document.getElementById('weekendPriceDisplay');
    const guestExtraRow = document.getElementById('guestExtraRow');
    const guestPriceDisplay = document.getElementById('guestPriceDisplay');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const depositDisplay = document.getElementById('depositDisplay');
    const depositRow = document.getElementById('depositRow');
    const durationCalc = document.getElementById('durationCalc');
    const whatsappSubmitBtn = document.getElementById('whatsappSubmitBtn');

    // Toggle booking mode (Group vs Individual)
    if (bookingModeSelect) {
        bookingModeSelect.addEventListener('change', () => {
            if (bookingModeSelect.value === 'individual') {
                groupBookingForm.classList.add('hidden');
                individualBookingForm.classList.remove('hidden');
            } else {
                groupBookingForm.classList.remove('hidden');
                individualBookingForm.classList.add('hidden');
            }
            calculatePrice();
        });
    }

    // Toggle Creek duration input
    function toggleCreekHoursSlider() {
        const trip = tripTypeSelect.value;
        if (trip === 'creek') {
            creekHoursGroup.classList.remove('hidden');
        } else {
            creekHoursGroup.classList.add('hidden');
        }
    }

    // Toggle Baby Yacht BBQ option
    function toggleBabyYachtBBQ() {
        const vessel = vesselTypeSelect.value;
        const trip = tripTypeSelect.value;
        if (babyYachtOptions) {
            if (vessel.startsWith('baby-yacht') && trip !== 'creek') {
                babyYachtOptions.classList.remove('hidden');
            } else {
                babyYachtOptions.classList.add('hidden');
            }
        }
    }

    // Populate Group Form Options
    function populateTripTypes() {
        const vessel = vesselTypeSelect.value;
        const trips = tripOptions[vessel];
        
        tripTypeSelect.innerHTML = '';
        trips.forEach(trip => {
            const option = document.createElement('option');
            option.value = trip.id;
            option.textContent = trip.name;
            tripTypeSelect.appendChild(option);
        });

        // Ensure Barbaros creek minimum is 1 hour
        if (creekHoursInput) {
            if (vessel === 'barbaros') {
                creekHoursInput.min = '1';
                if (parseFloat(creekHoursInput.value) < 1) {
                    creekHoursInput.value = '1';
                    if (creekHoursVal) creekHoursVal.textContent = '1';
                }
            } else {
                creekHoursInput.min = '0.5';
            }
        }

        // Toggle UI panels based on yacht / baby-yacht / southern marina properties
        const alJawhariOptions = document.getElementById('alJawhariOptions');
        if (vessel === 'nardo' || vessel === 'tam') {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            if (alJawhariOptions) alJawhariOptions.classList.add('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.remove('hidden');
        } else if (vessel === 'al-jawhari') {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            if (alJawhariOptions) alJawhariOptions.classList.remove('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.remove('hidden');
        } else if (vessel === 'large-yacht') {
            yachtHoursGroup.classList.remove('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            if (alJawhariOptions) alJawhariOptions.classList.add('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.remove('hidden');
        } else if (vessel.startsWith('baby-yacht')) {
            yachtHoursGroup.classList.add('hidden');
            toggleBabyYachtBBQ();
            if (alJawhariOptions) alJawhariOptions.classList.add('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.remove('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.add('hidden');
        } else if (vessel === 'boat-51' || southernBoatAliases.includes(vessel)) {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            if (alJawhariOptions) alJawhariOptions.classList.add('hidden');
            southernMarinaGroup.classList.remove('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.add('hidden');
        } else {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            if (alJawhariOptions) alJawhariOptions.classList.add('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.remove('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.add('hidden');
        }

        // Toggle Creek Slider
        toggleCreekHoursSlider();

        // Update capacity limit dynamically
        updateCapacity();

        calculatePrice();
    }

    // Helper to dynamically update vessel guest limits
    function updateCapacity() {
        const vessel = vesselTypeSelect.value;
        const tripId = tripTypeSelect.value;
        let maxGuests = 9;
        let maxGuestsLabel = '9 ضيوف';

        if (vessel === 'large-yacht') {
            if (tripId === 'creek-hourly') {
                maxGuests = 45;
                maxGuestsLabel = '45 شخصاً (في جولات الخور مسموح بعدد أكبر)';
            } else {
                maxGuests = 35;
                maxGuestsLabel = '35 شخصاً (الحد الأقصى للرحلة)';
            }
        } else {
            const capacityLimit = capacities[vessel];
            if (capacityLimit) {
                maxGuests = capacityLimit.max;
                maxGuestsLabel = capacityLimit.label;
            }
        }

        if (maxGuestsText) maxGuestsText.textContent = maxGuests;
        if (maxLabel) maxLabel.textContent = maxGuestsLabel;
        if (numPeopleInput) {
            numPeopleInput.max = maxGuests;
            if (parseInt(numPeopleInput.value) > maxGuests) {
                numPeopleInput.value = maxGuests;
            }
            if (peopleValDisplay) {
                peopleValDisplay.textContent = `${numPeopleInput.value} أشخاص`;
            }
        }
    }

    // Main calculation logic
    function calculatePrice() {
        const isIndividual = (bookingModeSelect && bookingModeSelect.value === 'individual');

        if (isIndividual) {
            calculateIndividualPrice();
            return;
        }

        updateCapacity();
        toggleCreekHoursSlider();
        toggleBabyYachtBBQ();

        const vessel = vesselTypeSelect.value;
        const tripId = tripTypeSelect.value;
        const day = dayTypeSelect.value;
        const guests = parseInt(numPeopleInput.value);
        const pkg = packageTypeSelect.value;

        let basePrice = 0;
        let weekendExtra = 0;
        let guestExtra = 0;
        let packageExtra = 0;
        let durationText = "";
        let total = 0;

        const currentTripList = tripOptions[vessel];
        const selectedTrip = currentTripList ? currentTripList.find(t => t.id === tripId) : null;
        if (!selectedTrip) return;

        // 1. Base cost & weekend extra calculations
        if (vessel === 'large-yacht') {
            const hrs = parseFloat(yachtHoursInput.value);
            const hourlyPrice = (day === 'weekend') ? selectedTrip.hourlyPriceWeekend : selectedTrip.hourlyPriceWeekday;
            
            basePrice = hourlyPrice * hrs;
            durationText = `${hrs} ساعة`;
        } 
        else if (tripId === 'creek') {
            const creekHrs = parseFloat(creekHoursInput.value);
            durationText = creekHrs === 0.5 ? 'نصف ساعة' : `${creekHrs} ساعة`;

            // Calculate base price dynamically using getCreekPrice helper
            basePrice = getCreekPrice(vessel, creekHrs);

            if (vessel === 'nardo' || vessel === 'tam') {
                // Flat creek tour rate covering full capacity
                guestExtra = 0;
            }
            else if (vessel.startsWith('baby-yacht')) {
                // Extra guests above 6 -> 100 SAR per person
                if (guests > 6) {
                    guestExtra += (guests - 6) * 100;
                }
            } 
            else if (vessel === 'al-ameed' || largeBoatAliases.includes(vessel)) {
                // Extra guests above 6 -> 100 SAR per person
                if (guests > 6) {
                    guestExtra += (guests - 6) * 100;
                }
            }
            else {
                // Seven series & Norseen
                // Extra guests above 7 -> 100 SAR per person
                if (guests > 7) {
                    guestExtra += (guests - 7) * 100;
                }
            }
        }
        else if (vessel === 'nardo') {
            let tierPrice = 3180;
            if (guests >= 7 && guests <= 9) tierPrice = 3680;
            else if (guests > 9) tierPrice = 3980;

            if (tripId === 'bayadah-6') {
                basePrice = tierPrice;
                durationText = '6 ساعات';
            } else if (tripId === 'bayadah-9') {
                basePrice = tierPrice + 700;
                durationText = '9 ساعات';
            } else if (tripId === 'fishing-add') {
                basePrice = tierPrice + 300;
                durationText = '7 ساعات';
            } else {
                basePrice = tierPrice;
                durationText = `${selectedTrip.duration} ساعات`;
            }
        }
        else if (vessel === 'tam') {
            let tierPrice = 1580;
            if (guests >= 7 && guests <= 9) tierPrice = 1880;
            else if (guests > 9) tierPrice = 1980;

            if (tripId === 'bayadah-abu-tair-6') {
                basePrice = tierPrice;
                durationText = '6 ساعات';
            } else if (tripId === 'bayadah-abu-tair-9') {
                basePrice = tierPrice + 500;
                durationText = '9 ساعات';
            } else {
                basePrice = tierPrice;
                durationText = `${selectedTrip.duration} ساعات`;
            }
        }
        else if (vessel === 'al-jawhari') {
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            durationText = `${selectedTrip.duration} ساعات`;

            const addBananaBoatSelect = document.getElementById('addBananaBoat');
            if (addBananaBoatSelect && addBananaBoatSelect.value === 'yes') {
                guestExtra += 250;
            }
        }
        else if (vessel.startsWith('baby-yacht')) {
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            durationText = `${selectedTrip.duration} ساعات`;

            // Extra guests above 6 -> 100 SAR per person
            if (guests > 6) {
                guestExtra += (guests - 6) * 100;
            }

            // BBQ option add-on
            if (addBBQSelect && addBBQSelect.value === 'yes') {
                guestExtra += 600;
            }
        } 
        else if (vessel === 'al-ameed' || largeBoatAliases.includes(vessel)) {
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            const durationHrs = (day === 'weekend') ? 10 : 12;
            durationText = `${durationHrs} ساعة`;

            // Extra guests above 6 -> 100 SAR per person
            if (guests > 6) {
                guestExtra += (guests - 6) * 100;
            }
        }
        else if (vessel === 'boat-51' || southernBoatAliases.includes(vessel)) {
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            durationText = `${selectedTrip.duration} ساعات`;

            // Extra guests above 6 -> 100 SAR per person
            if (guests > 6) {
                guestExtra += (guests - 6) * 100;
            }
        } 
        else {
            // Seven boat series & Regular Boats (Base covers 6 guests, +100 SAR per extra guest)
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            durationText = `${selectedTrip.duration} ساعات`;

            // Extra guests above 6 -> 100 SAR per person
            if (guests > 6) {
                guestExtra += (guests - 6) * 100;
            }
        }

        // 2. VIP & VVIP Package additions (if not large-yacht, not southern boats, not al-jawhari, not nardo, and not tam)
        if (vessel !== 'large-yacht' && vessel !== 'boat-51' && vessel !== 'al-jawhari' && vessel !== 'nardo' && vessel !== 'tam' && !southernBoatAliases.includes(vessel)) {
            if (pkg === 'vip') {
                packageExtra = 300;
            } else if (pkg === 'vvip') {
                packageExtra = 350;
            }
        }

        total = basePrice + weekendExtra + guestExtra + packageExtra;

        // 3. Render output to screen
        basePriceDisplay.textContent = `${basePrice} ريال`;
        
        if (weekendExtra > 0) {
            weekendExtraRow.classList.remove('hidden');
            weekendPriceDisplay.textContent = `+ ${weekendExtra} ريال`;
        } else {
            weekendExtraRow.classList.add('hidden');
        }

        if (guestExtra > 0 || packageExtra > 0) {
            guestExtraRow.classList.remove('hidden');
            let descStr = [];
            if (guestExtra > 0) descStr.push(`رسوم إضافات: ${guestExtra} ريال`);
            if (packageExtra > 0) descStr.push(`ترقية باقة ${pkg.toUpperCase()}: ${packageExtra} ريال`);
            
            guestExtraRow.querySelector('span:first-child').textContent = 'إضافات وباقات';
            guestPriceDisplay.textContent = `+ ${guestExtra + packageExtra} ريال (${descStr.join(' + ')})`;
        } else {
            guestExtraRow.classList.add('hidden');
        }

        totalPriceDisplay.textContent = `${total} ريال`;
        durationCalc.querySelector('span').textContent = durationText;

        // Update deposit display
        const deposit = calculateDepositAmount(vessel, total, day, tripId);
        if (depositDisplay && depositRow) {
            if (deposit) {
                depositDisplay.textContent = `${Math.round(deposit)} ريال`;
                depositRow.classList.remove('hidden');
            } else {
                depositRow.classList.add('hidden');
            }
        }
    }

    // Individual trip calculator logic
    function calculateIndividualPrice() {
        const tripType = indTripType.value;
        const day = indDayType.value;
        const pkg = indPackageType.value;
        const guests = parseInt(indPeopleInput.value);

        // Price per person
        let pricePerPerson = 250; // Economic
        if (pkg === 'vip') pricePerPerson = 300;
        else if (pkg === 'vvip') pricePerPerson = 320;

        const total = pricePerPerson * guests;

        basePriceDisplay.textContent = `${pricePerPerson} ريال / للشخص`;
        weekendExtraRow.classList.add('hidden');
        guestExtraRow.classList.add('hidden');
        totalPriceDisplay.textContent = `${total} ريال`;
        durationCalc.querySelector('span').textContent = 'رحلة جماعية مشتركة';

        // 100% deposit for individual trip booking
        if (depositDisplay && depositRow) {
            depositDisplay.textContent = `${total} ريال`;
            depositRow.classList.remove('hidden');
        }
    }

    // Vessel display names dictionary
    
const vesselDisplayNamesEn = {
    'barbaros': 'Barbaros VIP Boat',
    'qimat-al-fawz-pentos': 'Pentos VIP Yacht',
    'large-yacht': 'Royal Luxury Yacht',
    'baby-yacht-ambassador': 'Baby Yacht Ambassador',
    'baby-yacht-orax-40': 'Baby Yacht Orax 40',
    'al-jawhari': 'Al-Jawhari VIP Yacht',
    'nardo': 'Nardo VIP Yacht',
    'tam': 'Tam VIP Yacht',
    'al-ameed': 'Al-Ameed Boat',
    'norseen-large': 'Norseen Large Boat',
    'seven-boat': 'Seven 1 Boat',
    'seven-boat-2': 'Seven 2 Boat',
    'seven-boat-3': 'Seven 3 Boat',
    'shaheen': 'Shaheen Boat',
    'bahr': 'Bahr Boat',
    'al-noor-al-azraq': 'Al-Noor Al-Azraq Boat',
    'qimat-al-fawz': 'Qimat Al-Fawz Boat',
    'jaguar': 'Jaguar Boat (Southern Marinas)',
    'ghazal-obhur': 'Ghazal Obhur Boat (Southern Marinas)',
    'bin-shuraiq': 'Bin Shuraiq Boat (Southern Marinas)',
    'shawq-al-layl': 'Shawq Al-Layl Boat (Southern Marinas)',
    'individual': 'Shared Individual Seat Trips'
};

const tripNamesEn = {
    'barbaros-6h': 'Open Sea Standard Cruise (6 Hours - 2,000 SAR)',
    'barbaros-9h': 'Open Sea Standard Cruise (9 Hours - 2,500 SAR)',
    'barbaros-vip-6h-small': 'VIP Toys & BBQ (6 Hours / Up to 6 Guests - 3,000 SAR)',
    'barbaros-vip-6h-large': 'VIP Toys & BBQ (6 Hours / Up to 9 Guests - 3,500 SAR)',
    'barbaros-picnic': 'Obhur Creek Tour (460 SAR / hr)',
    'bayadah': 'Bayadah Island Cruise (6 Hours)',
    'abu-tair': 'Abu Tair Island Cruise (6 Hours)',
    'fishing-6': 'Deep-Sea Fishing (6 Hours)',
    'fishing-8': 'Deep-Sea Fishing (8 Hours)',
    'fishing-10': 'Deep-Sea Fishing (10 Hours)',
    'fishing-12': 'Deep-Sea Fishing (12 Hours)',
    'creek': 'Obhur Creek Sightseeing Tour (0.5 – 2 Hours)',
    'mix': 'Fishing & Bayadah Island Mix (10-12 Hours)',
    'fishing': 'Deep-Sea Fishing Trip (10-12 Hours)',
    'trolling': 'Trolling Fishing Cruise (6 Hours)',
    'khor-saud': 'Khor Saud Cruise (6 Hours - 1,750 SAR)',
    'bayadah-hourly': 'Bayadah Island Cruise (Hourly - Min. 2h)',
    'abu-tair-hourly': 'Abu Tair Island Cruise (Hourly - Min. 2h)',
    'creek-hourly': 'Obhur Creek Sightseeing (Hourly - Min. 2h)'
};

const vesselDisplayNames = {
        'nardo': 'يخت ناردو VIP الفاخر (14 شخص)',
        'tam': 'يخت تام الفاخر (11 شخص)',
        'barbaros': 'قارب بارباروسا VIP (نادي الأمانة)',
        'al-jawhari': 'يخت الجوهري',
        'qimat-al-fawz-pentos': 'يخت بينتوس VIP',
        'qimat-al-fawz': 'قارب قمة الفوز (موديل 2025)',
        'baby-yacht-ambassador': 'بيبي يخت امباسادور 36 قدم',
        'baby-yacht-orax-40': 'بيبي يخت اوراكس 40 قدم',
        'large-yacht': 'اليخت الكبير الفاخر (30 شخص)',
        'al-ameed': 'قارب العميد (15 شخص)',
        'norseen-large': 'قارب نورسين الكبير (20 شخص)',
        'seven-boat': 'قارب سيفين 1 (10 متر)',
        'seven-boat-2': 'قارب سيفين 2',
        'seven-boat-3': 'قارب سيفين 3',
        'shaheen': 'قارب شاهين',
        'bahr': 'قارب بحر',
        'al-noor-al-azraq': 'قارب النور الأزرق',
        'jaguar': 'قارب جاكور (جنوب جدة)',
        'ghazal-obhur': 'قارب غزال أبحر (جنوب جدة)',
        'bin-shuraiq': 'قارب بن شريق (جنوب جدة)',
        'shawq-al-layl': 'قارب شوق الليل (جنوب جدة)',
        'individual': 'رحلات المقاعد الفردية المشتركة'
    };

    // Generate WhatsApp Message & Submit
    function sendWhatsAppMessage() {
        const isIndividual = (bookingModeSelect && bookingModeSelect.value === 'individual');
        const phoneNumber = '966568390147';
        const isEn = (document.documentElement.lang === 'en' || document.documentElement.dir === 'ltr');
        let messageText = '';

        if (isIndividual) {
            const tripTypeName = indTripType.options[indTripType.selectedIndex].text;
            const dayName = indDayType.options[indDayType.selectedIndex].text;
            const packageName = indPackageType.options[indPackageType.selectedIndex].text;
            const guests = indPeopleInput.value;
            const total = totalPriceDisplay.textContent;

            if (isEn) {
                messageText = 
                    `Hello ORCA Marine Trips,\n` +
                    `I would like to book *Shared Individual Seats* with the following details:\n\n` +
                    `👥 Number of Seats: *${guests}*\n` +
                    `⚓ Trip Type: *${tripTypeName}*\n` +
                    `📅 Preferred Day: *${dayName}*\n` +
                    `🎁 Selected Package: *${packageName}*\n` +
                    `💵 Total Estimated Cost: *${total}*\n\n` +
                    `Please confirm seat availability and payment instructions. Thank you! 🙏`;
            } else {
                messageText = 
                    `السلام عليكم،\n` +
                    `أود حجز *رحلة فردية* مع *أوركا للرحلات البحرية* بالتفاصيل التالية:\n\n` +
                    `👥 عدد المقاعد: *${guests}*\n` +
                    `⚓ نوع الرحلة: *${tripTypeName}*\n` +
                    `📅 اليوم المفضل: *${dayName}*\n` +
                    `🎁 الباقة المحددة: *${packageName}*\n` +
                    `💵 التكلفة الكلية: *${total}*\n\n` +
                    `يرجى تأكيد المقاعد وطريقة تأكيد العربون. شكراً 🙏`;
            }
        } 
        else {
            const vessel = vesselTypeSelect.value;
            const tripId = tripTypeSelect.value;
            const day = dayTypeSelect.value;
            const guests = numPeopleInput.value;
            const pkg = packageTypeSelect.value;

            let vesselName = vesselDisplayNames[vessel] || (isEn ? 'ORCA Boat' : 'قارب أوركا');
            let tripName = (tripTypeSelect.options && tripTypeSelect.options[tripTypeSelect.selectedIndex]) ? tripTypeSelect.options[tripTypeSelect.selectedIndex].text : '';
            let dayName = dayTypeSelect.options[dayTypeSelect.selectedIndex].text;
            let packageName = packageTypeSelect.options[packageTypeSelect.selectedIndex].text;
            let totalPrice = totalPriceDisplay.textContent;
            let duration = durationCalc.querySelector('span').textContent;
            let depositText = depositDisplay.textContent;

            let customDetails = '';

            // Add marina details
            if (vessel === 'barbaros') {
                customDetails += isEn ? `\n📍 Departure Marina: *Al-Amanah Yacht Club (South Obhur)*` : `\n📍 مرسى الانطلاق: *نادي الأمانة لليخوت (أبحر الجنوبية)*`;
            } else if (vessel === 'boat-51' || southernBoatAliases.includes(vessel)) {
                customDetails += isEn ? `\n📍 Departure Marina: *${southernMarinaSelect.options[southernMarinaSelect.selectedIndex].text}*` : `\n📍 مرسى الانطلاق: *${southernMarinaSelect.options[southernMarinaSelect.selectedIndex].text}*`;
            } else {
                customDetails += isEn ? `\n📍 Departure Marina: *Red Sea Marina*` : `\n📍 مرسى الانطلاق: *مرسى البحر الاحمر*`;
            }

            let packageLine = isEn ? `🎁 Package: *${packageName}*\n` : `🎁 الباقة: *${packageName}*\n`;

            // Yacht hours detail
            if (vessel === 'large-yacht') {
                customDetails += isEn ? `\n⏱ Requested Hours: *${yachtHoursInput.value} Hours*` : `\n⏱ الساعات المطلوبة: *${yachtHoursInput.value} ساعات*`;
                packageLine = '';
                if (specialRequestsInput && specialRequestsInput.value.trim() !== '') {
                    customDetails += isEn ? `\n✨ Special Requests: *${specialRequestsInput.value.trim()}*` : `\n✨ طلبات خاصة: *${specialRequestsInput.value.trim()}*`;
                }
            }

            // Creek hours detail (if selected as trip type)
            if (tripId === 'creek') {
                customDetails += isEn ? `\n⏱ Creek Tour Hours: *${creekHoursInput.value} Hour(s)*` : `\n⏱ ساعات جولة الخور: *${creekHoursInput.value} ساعة*`;
            }

            // Baby Yacht options (only if not creek trip)
            if (vessel.startsWith('baby-yacht') && tripId !== 'creek' && addBBQSelect.value === 'yes') {
                customDetails += isEn ? `\n🥩 Add BBQ Meal: *Yes (+600 SAR)*` : `\n🥩 إضافة وجبة مشويات: *نعم (+600 ريال)*`;
            }

            // Al-Jawhari water toy option
            if (vessel === 'al-jawhari') {
                const addBananaBoatSelect = document.getElementById('addBananaBoat');
                if (addBananaBoatSelect && addBananaBoatSelect.value === 'yes') {
                    customDetails += isEn ? `\n🍌 Banana Boat Water Toy: *Yes (+250 SAR)*` : `\n🍌 لعبة سحب الموزة: *نعم (+250 ريال)*`;
                }
                packageLine = '';
            }

            // Nardo and Tam custom details
            if (vessel === 'nardo' || vessel === 'tam') {
                packageLine = '';
                if (vessel === 'tam') {
                    customDetails += isEn ? `\n❄️ A/C: *Guaranteed with dedicated generator*` : `\n❄️ التكييف: *مضمون مع تشغيل المولد الخاص*`;
                }
                if (specialRequestsInput && specialRequestsInput.value.trim() !== '') {
                    customDetails += isEn ? `\n✨ Special Requests: *${specialRequestsInput.value.trim()}*` : `\n✨ طلبات خاصة: *${specialRequestsInput.value.trim()}*`;
                }
            }

            if (isEn) {
                messageText =
                    `Hello ORCA Marine Trips,\n` +
                    `I would like to inquire about booking a marine trip with the following details:\n\n` +
                    `⛵ Vessel: *${vesselName}*\n` +
                    `⚓ Trip: *${tripName}*\n` +
                    packageLine +
                    `📅 Day: *${dayName}*\n` +
                    `👥 Number of Guests: *${guests} Guests*` +
                    `${customDetails}\n` +
                    `⏱ Duration: *${duration}*\n` +
                    `💵 Total Price: *${totalPrice}*\n` +
                    `💰 Required Deposit: *${depositText}*\n\n` +
                    `Please confirm date availability and booking procedure. Thank you! 🌊`;
            } else {
                messageText =
                    `السلام عليكم،\n` +
                    `أود الاستفسار عن حجز رحلة بحرية مع *أوركا للرحلات البحرية* بالتفاصيل التالية:\n\n` +
                    `⛵ القارب/اليخت: *${vesselName}*\n` +
                    `⚓ الرحلة: *${tripName}*\n` +
                    packageLine +
                    `📅 اليوم: *${dayName}*\n` +
                    `👥 العدد: *${guests} ضيوف*` +
                    `${customDetails}\n` +
                    `⏱ مدة الإبحار: *${duration}*\n` +
                    `💵 السعر الإجمالي: *${totalPrice}*\n` +
                    `💰 العربون المطلوب: *${depositText}*\n\n` +
                    `يرجى تأكيد توافر الموعد. شكراً لك 🌊`;
            }
        }

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Event listeners and setup
    if (tripTypeSelect) {
        tripTypeSelect.addEventListener('change', calculatePrice);
    }
    if (dayTypeSelect) {
        dayTypeSelect.addEventListener('change', calculatePrice);
    }
    if (packageTypeSelect) {
        packageTypeSelect.addEventListener('change', calculatePrice);
    }
    if (numPeopleInput) {
        numPeopleInput.addEventListener('input', () => {
            peopleValDisplay.textContent = `${numPeopleInput.value} أشخاص`;
            calculatePrice();
        });
    }

    // Yacht hours
    if (yachtHoursInput) {
        yachtHoursInput.addEventListener('input', () => {
            if (yachtHoursVal) yachtHoursVal.textContent = yachtHoursInput.value;
            calculatePrice();
        });
    }

    // Creek hours
    if (creekHoursInput) {
        creekHoursInput.addEventListener('input', () => {
            if (creekHoursVal) creekHoursVal.textContent = creekHoursInput.value;
            calculatePrice();
        });
    }

    // Add BBQ
    if (addBBQSelect) {
        addBBQSelect.addEventListener('change', calculatePrice);
    }

    // Add Banana Boat (Al-Jawhari)
    const addBananaBoatSelect = document.getElementById('addBananaBoat');
    if (addBananaBoatSelect) {
        addBananaBoatSelect.addEventListener('change', calculatePrice);
    }

    // Individual listeners
    if (indTripType) indTripType.addEventListener('change', calculatePrice);
    if (indDayType) indDayType.addEventListener('change', calculatePrice);
    if (indPackageType) indPackageType.addEventListener('change', calculatePrice);
    if (indPeopleInput) {
        indPeopleInput.addEventListener('input', () => {
            if (indPeopleVal) indPeopleVal.textContent = indPeopleInput.value;
            calculatePrice();
        });
    }

    if (whatsappSubmitBtn) {
        whatsappSubmitBtn.addEventListener('click', sendWhatsAppMessage);
    }

    // Modal click outside to close
    const calcModal = document.getElementById('calculatorModal');
    if (calcModal) {
        calcModal.addEventListener('click', (e) => {
            if (e.target === calcModal) {
                closeCalculatorModal();
            }
        });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCalculatorModal();
        }
    });

    // Intercept all links targeting #calculator to open modal
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && (href === '#calculator' || href.endsWith('#calculator'))) {
                // If it doesn't already have an onclick handler
                if (!link.getAttribute('onclick')) {
                    e.preventDefault();
                    openCalculatorModal();
                }
            }
        }
    });

    // --------------------------------------------------------------------------
    // Calculator Modal Functions
    // --------------------------------------------------------------------------
    function openCalculatorModal(vesselId, tripId, mode) {
        const modal = document.getElementById('calculatorModal');
        if (!modal) {
            // If on a subpage (e.g. boats/*.html), navigate to index.html with query params
            let targetUrl = '../index.html#calculator';
            if (vesselId) {
                targetUrl = `../index.html?vessel=${encodeURIComponent(vesselId)}#calculator`;
            } else if (mode === 'individual') {
                targetUrl = '../index.html?vessel=individual#calculator';
            }
            window.location.href = targetUrl;
            return;
        }

        const bookingModeInput = document.getElementById('bookingMode');
        const vesselTypeInput = document.getElementById('vesselType');
        const groupBookingForm = document.getElementById('groupBookingForm');
        const individualBookingForm = document.getElementById('individualBookingForm');
        const selectedVesselTitle = document.getElementById('selectedVesselTitle');
        const vesselBannerIcon = document.getElementById('vesselBannerIcon');

        if (mode === 'individual' || vesselId === 'individual') {
            if (bookingModeInput) bookingModeInput.value = 'individual';
            if (groupBookingForm) groupBookingForm.classList.add('hidden');
            if (individualBookingForm) individualBookingForm.classList.remove('hidden');
            if (selectedVesselTitle) selectedVesselTitle.textContent = 'رحلات المقاعد الفردية المشتركة';
            if (vesselBannerIcon) vesselBannerIcon.className = 'fa-solid fa-users';
        } else {
            const activeVessel = vesselId || 'qimat-al-fawz-pentos';
            if (bookingModeInput) bookingModeInput.value = 'group';
            if (vesselTypeInput) vesselTypeInput.value = activeVessel;
            if (groupBookingForm) groupBookingForm.classList.remove('hidden');
            if (individualBookingForm) individualBookingForm.classList.add('hidden');
            const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
            if (selectedVesselTitle) {
                selectedVesselTitle.textContent = isEn
                    ? (vesselDisplayNamesEn[activeVessel] || 'Orca Vessel')
                    : (vesselDisplayNames[activeVessel] || 'قارب أوركا');
            }
            if (vesselBannerIcon) {
                if (activeVessel.includes('yacht')) {
                    vesselBannerIcon.className = 'fa-solid fa-ship';
                } else {
                    vesselBannerIcon.className = 'fa-solid fa-anchor';
                }
            }

            // Populate trip types for active vessel
            populateTripTypes();
        }

        if (tripId) {
            const tripTypeSelect = document.getElementById('tripType');
            if (tripTypeSelect) {
                tripTypeSelect.value = tripId;
            }
        }

        calculatePrice();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCalculatorModal() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    window.openCalculatorModal = openCalculatorModal;
    window.closeCalculatorModal = closeCalculatorModal;

    // Run population & URL param pre-selection on load
    if (vesselTypeSelect) {
        populateTripTypes();
        const urlParams = new URLSearchParams(window.location.search);
        const vesselParam = urlParams.get('vessel');
        const hasCalcHash = window.location.hash === '#calculator';

        if (vesselParam) {
            openCalculatorModal(vesselParam);
        } else if (hasCalcHash) {
            openCalculatorModal();
        }
    }
});

// --------------------------------------------------------------------------
// Share Boat Functions
// --------------------------------------------------------------------------
function shareBoatFromCard(btnElement, relativeUrl) {
    const card = btnElement.closest('.package-card');
    let boatName = 'قارب في أوركا';
    if (card) {
        const titleEl = card.querySelector('.package-name');
        if (titleEl) boatName = titleEl.textContent.trim();
    }
    const fullUrl = new URL(relativeUrl, window.location.href).href;
    doShare(boatName, fullUrl);
}

function shareBoatDetails() {
    let boatName = document.title.split('|')[0].trim() || 'تفاصيل القارب';
    const titleEl = document.querySelector('.detail-title');
    if (titleEl) boatName = titleEl.textContent.trim();
    const fullUrl = window.location.href;
    doShare(boatName, fullUrl);
}

function doShare(title, url) {
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const shareTitle = isEn ? `${title} | Orca Marine Trips Jeddah` : `${title} | أوركا للرحلات البحرية بجدة`;
    const shareText = isEn
        ? `Explore details of ${title} and book your trip at the best rates with Orca Marine Trips in Jeddah!`
        : `استكشف تفاصيل ${title} واحجز رحلتك بأفضل الأسعار مع أوركا للرحلات البحرية بجدة!`;
    const shareData = {
        title: shareTitle,
        text: shareText,
        url: url
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => {
            if (err.name !== 'AbortError') {
                copyUrlToClipboard(url, title);
            }
        });
    } else {
        copyUrlToClipboard(url, title);
    }
}

function copyUrlToClipboard(url, title) {
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            const msg = isEn ? `Link for "${title}" copied successfully!` : `تم نسخ رابط "${title}" بنجاح!`;
            showToast(msg);
        }).catch(() => {
            promptCopy(url);
        });
    } else {
        promptCopy(url);
    }
}

function promptCopy(url) {
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const promptMsg = isEn ? 'Copy boat link to share:' : 'انسخ رابط القارب للمشاركة:';
    window.prompt(promptMsg, url);
}

function showToast(message) {
    let toast = document.getElementById('orca-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'orca-toast';
        toast.className = 'orca-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// --------------------------------------------------------------------------
// Expandable Details / Read More Handler
// --------------------------------------------------------------------------
function toggleExpand(btn) {
    const block = btn.closest('.expandable-block');
    if (!block) return;
    
    const isExpanded = block.classList.toggle('expanded');
    const isAr = document.documentElement.lang !== 'en';
    
    const textSpan = btn.querySelector('.toggle-text');
    if (textSpan) {
        if (isExpanded) {
            textSpan.textContent = isAr ? 'عرض أقل' : 'Show Less';
        } else {
            textSpan.textContent = isAr ? 'عرض المزيد' : 'Show More';
        }
    }
}
window.toggleExpand = toggleExpand;




// ══════════════════════════════════════════════════════════════════════════
// 4. FLEET DETAILS DATA & INTERACTIVE MODAL / BOTTOM SHEET
// ══════════════════════════════════════════════════════════════════════════

const fleetDetailsData = {
    "barbaros": {
        "key": "barbaros",
        "name": "قارب بارباروسا VIP (Barbarossa)",
        "badge": "قارب بارباروسا VIP — خصوصية عائلية وسينما ومكينة سلاش",
        "catTag": "نادي الأمانة لليخوت",
        "capacity": "حتى 10 أشخاص",
        "marina": "نادي الأمانة لليخوت",
        "keyFeature": "سينما وسلاش وألعاب مائية",
        "featureIcon": "fa-solid fa-film",
        "startingPrice": "460",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 2,000 ر.س للبحر المفتوح (6س)",
        "descriptions": [
            "🌟 طاقم احترافي + سينما بروجكتر + مكينة سلاش مثلجة + باقة ألعاب مائية استثنائية!",
            "أرقى قارب عائلي فاخر يوفر خصوصية تامة للعوائل في جزيرة أبو طير، هدايا تذكارية للضيوف، شواء مباشر في القارب، وجولات نزهة وبحر مفتوح متكاملة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-user-shield",
                "text": "طاقم الرحلة: كابتن للرحلات العادية، وكابتن مع عاملة لرحلة 9 ساعات VIP لضمان أعلى درجات الخدمة والخصوصية"
            },
            {
                "icon": "fa-solid fa-water-ladder",
                "text": "ألعاب مائية وسينما وسلاش: زحليقة مائية، سرير تشميس، خيمة مائية، ملعب طائرة، جلسة دائرية، مكينة سلاش، وبروجكتر سينما"
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "مرافق القارب: دورة مياه ومروش مياه عذبة، جلسات مظللة مريحة (لا يتوفر غرف نوم أو صالون مغلق مكيف)"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\" style=\"color: var(--navy); border-bottom: 2px solid var(--gold); padding-bottom: 6px; margin-bottom: 10px;\">\r\n                                    <i class=\"fa-solid fa-compass\" style=\"color: var(--gold);\"></i> 1. رحلات البحر المفتوح (بياضة أو جزيرة أبو طير بخصوصية أكبر — حتى 10 أشخاص)\r\n                                </h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\" style=\"font-weight: 700;\">الباقة الأولى (الأساسية)</span>\r\n                                        <small class=\"weekend-note\">كابتن واحد + ماء وعصيرات ومكينة سلاش + منشفة ونظارات غوص للاستعمال + زحليقة وكرسي وتشميس</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>6س: 2,000 | 9س: 2,500 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\" style=\"font-weight: 700; color: var(--ocean-dark);\">الباقة الثانية VIP (الشاملة الألعاب والمشويات)</span>\r\n                                        <small class=\"weekend-note\">كابتن وعاملة (6س) + مكينة سلاش وهدايا تذكارية للضيوف + برجر مشوي بالقارب (2 للشخص) + اختيار (خيمة/طائرة/الترامبولين مع الجلسة المائية) + سحب مجاني</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>5-6 ضيوف: 3,000 | 7-9 ضيوف: 3,500 ريال</strong></div>\r\n                                </div>\r\n\r\n                                <h4 class=\"box-title\" style=\"color: var(--navy); border-bottom: 2px solid var(--ocean); padding-bottom: 6px; margin: 16px 0 10px 0;\">\r\n                                    <i class=\"fa-solid fa-ship\" style=\"color: var(--ocean);\"></i> 2. رحلات النزهة وجولات الخور (شرم أبحر الجنوبية)\r\n                                </h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\" style=\"font-weight: 700;\">إيجار النزهة الأساسي</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 460 ريال (تشمل قهوة أمريكية وشاي مجاناً)</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>460 ريال/ساعة</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\" style=\"font-weight: 700;\">باقات العشاء والمناسبات الخاصة (1-2 ساعة)</span>\r\n                                        <small class=\"weekend-note\">ساندوتشات أرتشي أو برجر مشوي 60 ريال | سوشي ماكي 120 ريال | كيكة ومناسبات 60 – 200 ريال | سينما مجاناً بعد الغروب</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>حسب الباقة</strong></div>\r\n                                </div>",
        "pdfLinks": [
            {
                "url": "files/barbaros/البحر المفتوح.pdf",
                "filename": "البحر المفتوح.pdf",
                "label": "البحر المفتوح"
            },
            {
                "url": "files/barbaros/رحلات النزهة.pdf",
                "filename": "رحلات النزهة.pdf",
                "label": "رحلات النزهة"
            }
        ],
        "images": [
            {
                "src": "images/بارباروسا/1.webp",
                "alt": "قارب بارباروسا VIP"
            },
            {
                "src": "images/بارباروسا/2.webp",
                "alt": "سهرة السينما والبروجكتر وشاشة العرض"
            },
            {
                "src": "images/بارباروسا/3.webp",
                "alt": "جلسة الاسترخاء بالطابق الثاني"
            },
            {
                "src": "images/بارباروسا/4.webp",
                "alt": "مكينة سلاش لعمل العصائر المثلجة الفاخرة"
            },
            {
                "src": "images/بارباروسا/5.webp",
                "alt": "سرير تشميس عائم على مياه البحر"
            },
            {
                "src": "images/بارباروسا/6.webp",
                "alt": "خيمة مائية عائمة للاسترخاء"
            },
            {
                "src": "images/بارباروسا/7.webp",
                "alt": "ملعب طائرة مائي عائم"
            },
            {
                "src": "images/بارباروسا/8.webp",
                "alt": "جلسة مائية دائرية عائمة"
            },
            {
                "src": "images/بارباروسا/9.webp",
                "alt": "دورة مياه ومروش مياه عذبة"
            },
            {
                "src": "images/بارباروسا/10.webp",
                "alt": "زحليقة مائية عملاقة ممتعة"
            }
        ],
        "detailLink": "boats/barbaros.html",
        "calcVessel": "barbaros",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "pentos": {
        "key": "pentos",
        "name": "يخت بينتوس VIP",
        "badge": "الأفضل قيمة مقابل سعر",
        "catTag": "اليخت الفاخر VIP",
        "capacity": "حتى 12 ضيفاً",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "فخامة وتوثيق احترافي",
        "featureIcon": "fa-solid fa-camera-retro",
        "startingPrice": "450",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,480 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "🌟 لمن يبحث عن الفخامة وتوثيق اللحظات باحترافية بأفضل الأسعار!",
            "الخيار الأول المصمم ليمنحكم تجربة بحرية استثنائية تجمع بين الرفاهية والراحة الكاملة والتصوير الإبداعي."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-camera-retro",
                "text": "توثيق اللحظات باحترافية: تصميم فاخر وزوايا تصوير رائعة لإلتقاط أجمل الذكريات"
            },
            {
                "icon": "fa-solid fa-users",
                "text": "مناسب لكافة الرحلات: مثالي جداً للرحلات العائلية، الجمعات الشبابية، السباحة، والصيد"
            },
            {
                "icon": "fa-solid fa-bed",
                "text": "غرفة نوم متكاملة وجلسات واسعة أمامية وخلفية"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-crown\" style=\"color: var(--gold);\"></i> أسعار وباقات يخت بينتوس VIP (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,480 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,780 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1500 | 8س: 1780 | 10س: 1980 | 12س: 2180 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,500 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 450 ريال | نصف ساعة 250 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>250 – 450 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/Beneteau.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('qimat-al-fawz-pentos')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/Beneteau.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/يخت بينتوس/1.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/2.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/3.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/4.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/5.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/6.webp",
                "alt": "يخت بينتوس VIP"
            }
        ],
        "detailLink": "boats/Beneteau.html",
        "calcVessel": "qimat-al-fawz-pentos",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "qimat-al-fawz": {
        "key": "qimat-al-fawz",
        "name": "قارب قمة الفوز (موديل 2025)",
        "badge": "قمة الفوز 2025",
        "catTag": "موديل 2025 حديث",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "مقاعد جلد ومروش ماء عذب",
        "featureIcon": "fa-solid fa-couch",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "رحلاتنا تنقلك إلى عالم من الرفاهية والخصوصية في قلب البحر مع قارب قمة الفوز المتميز بخصائصه المحدثة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-shower",
                "text": "مروش بماء عذب + ستائر جانبية للخصوصية التامة"
            },
            {
                "icon": "fa-solid fa-music",
                "text": "نظام صوت عالي الجودة وملون للحفلات والمناسبات"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر (جدة)"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/qimat-al-fawz.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('qimat-al-fawz')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/qimat-al-fawz.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/قمة الفوز/1.webp",
                "alt": "قارب قمة الفوز موديل 2025 1"
            },
            {
                "src": "images/قمة الفوز/2.webp",
                "alt": "قارب قمة الفوز موديل 2025 2"
            },
            {
                "src": "images/قمة الفوز/3.webp",
                "alt": "قارب قمة الفوز موديل 2025 3"
            },
            {
                "src": "images/قمة الفوز/4.webp",
                "alt": "قارب قمة الفوز موديل 2025 4"
            },
            {
                "src": "images/قمة الفوز/5.webp",
                "alt": "قارب قمة الفوز موديل 2025 5"
            },
            {
                "src": "images/قمة الفوز/6.webp",
                "alt": "قارب قمة الفوز موديل 2025 6"
            },
            {
                "src": "images/قمة الفوز/7.webp",
                "alt": "قارب قمة الفوز موديل 2025 7"
            }
        ],
        "detailLink": "boats/qimat-al-fawz.html",
        "calcVessel": "qimat-al-fawz",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "nardo": {
        "key": "nardo",
        "name": "يخت ناردو الفاخر (Nardo Yacht)",
        "badge": "يخت VIP فاخر | رمادي",
        "catTag": "يخت فاخر VIP",
        "capacity": "حتى 14 ضيفاً",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "تكييف كامل وصالون فندقي",
        "featureIcon": "fa-solid fa-snowflake",
        "startingPrice": "680",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 3,180 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "يخت سوبر فاخر بلونه الرمادي الانسيابي المميز. رحلات بياضة والخور وتجارب صيد لا تُنسى بأعلى درجات الرفاهية والخصوصية لسعة حتى 14 شخصاً."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية: حتى 14 شخصاً مع جلسات فسيحة"
            },
            {
                "icon": "fa-solid fa-snowflake",
                "text": "صالون داخلي مكيف + جلسة تشميس أمامية ومنصة سباحة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: جدة — مراسي أبحر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> باقات وأسعار رحلات ناردو</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقة جزيرة بياضة (6 ساعات)</span>\r\n                                        <small class=\"weekend-note\">5-6 ضيوف: 3,180 | 7-9 ضيوف: 3,680 | 9-14 ضيف: 3,980 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>3,180 – 3,980 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">خيار التمديد إلى 9 ساعات</span>\r\n                                        <small class=\"weekend-note\">إضافة 3 ساعات إضافية على باقة بياضة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+ 700 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات ومغامرات الصيد</span>\r\n                                        <small class=\"weekend-note\">احتساب ساعة صيد إضافية تُضاف على باقة بياضة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+ 300 ريال / ساعة</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الخور (شرم أبحر)</span>\r\n                                        <small class=\"weekend-note\">الساعة الأولى: 680 ريال | كل ساعة إضافية: 580 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>680 ريال / أول ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/nardo.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('nardo')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/nardo.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/ناردو/1.webp",
                "alt": "يخت ناردو الفاخر بجدة"
            }
        ],
        "detailLink": "boats/nardo.html",
        "calcVessel": "nardo",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "tam": {
        "key": "tam",
        "name": "يخت تام الفاخر (Tam Yacht)",
        "badge": "بيبي يخت أنيق | أبيض",
        "catTag": "يخت فاخر VIP",
        "capacity": "حتى 11 ضيفاً",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "تكييف بمولد خاص وغرفة نوم",
        "featureIcon": "fa-solid fa-bed",
        "startingPrice": "460",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,580 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "يخت كبائن خاص أنيق باللون الأبيض الناصع. خيار مميز يجمع بين القيمة التنافسية والراحة لرحلات بياضة وأبو طير والخور لسعة حتى 11 شخصاً."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية: حتى 11 شخصاً (مثالي للعوائل)"
            },
            {
                "icon": "fa-solid fa-snowflake",
                "text": "تكييف مضمون مع التزام المالك بتشغيل المولد الخاص"
            },
            {
                "icon": "fa-solid fa-compass",
                "text": "الوجهة: جزيرة بياضة أو جزيرة أبو طير"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> باقات وأسعار رحلات تام</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقات بياضة أو أبو طير (6 ساعات)</span>\r\n                                        <small class=\"weekend-note\">5-6 ضيوف: 1,580 | 7-9 ضيوف: 1,880 | 9-11 ضيف: 1,980 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>1,580 – 1,980 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">خيار التمديد إلى 9 ساعات</span>\r\n                                        <small class=\"weekend-note\">إضافة 3 ساعات إضافية على الباقة المختارة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+ 500 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات ومغامرات الصيد</span>\r\n                                        <small class=\"weekend-note\">مخصصة لعدد محدود (2 إلى 4 أشخاص)</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تسعيرة خاصة</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الخور (شرم أبحر)</span>\r\n                                        <small class=\"weekend-note\">الساعة الأولى: 460 ريال | كل ساعة إضافية: 430 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>460 ريال / أول ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/tam.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('tam')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/tam.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/تام/1.webp",
                "alt": "يخت تام الأبيض بجدة"
            }
        ],
        "detailLink": "boats/tam.html",
        "calcVessel": "tam",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "baby-ambassador": {
        "key": "baby-ambassador",
        "name": "بيبي يخت امباسادور 36 قدم اريا",
        "badge": "الأكثر طلباً",
        "catTag": "بيبي يخت فاخر",
        "capacity": "حتى 11 ضيفاً",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "صالون مكيف وغرفة نوم ومطبخ",
        "featureIcon": "fa-solid fa-couch",
        "startingPrice": "600",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 2,000 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "يخت فاخر مجهز بأعلى سبل الراحة والرفاهية، مثالي للمناسبات والرحلات العائلية والشبابية."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 12 شخصاً — الحد الأقصى للضيوف 11 ضيفاً (الكابتن مشمول)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> أسعار الرحلات الحصرية</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>2,000 أسبوع | 2,300 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">صيد ترولنق (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>2,200 أسبوع | 2,500 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الخور (شرم أبحر)</span>\r\n                                        <small class=\"weekend-note\">جولة استمتاع داخل الخور</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>600 ريال/ساعة | 300 لنصف ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/baby-ambassador.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('baby-yacht-ambassador')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/baby-ambassador.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/امباسودر 36 اريا/1.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 1"
            },
            {
                "src": "images/امباسودر 36 اريا/2.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 2"
            },
            {
                "src": "images/امباسودر 36 اريا/3.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 3"
            },
            {
                "src": "images/امباسودر 36 اريا/4.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 4"
            },
            {
                "src": "images/امباسودر 36 اريا/5.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 5"
            },
            {
                "src": "images/امباسودر 36 اريا/6.webp",
                "alt": "بيبي يخت امباسادور 36 اريا 6"
            }
        ],
        "detailLink": "boats/baby-ambassador.html",
        "calcVessel": "baby-yacht-ambassador",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "baby-orax-40": {
        "key": "baby-orax-40",
        "name": "بيبي يخت اوراكس 40 قدم",
        "badge": "جديد | 40 قدم",
        "catTag": "بيبي يخت فاخر",
        "capacity": "حتى 10 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "يخت 40 قدم بتشطيبات راقية",
        "featureIcon": "fa-solid fa-gem",
        "startingPrice": "700",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 3,100 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "يخت فاخر واسع بمساحة 40 قدم مجهز بأعلى وسائل الرفاهية والراحة لرحلات بياضة والخور المميزة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-shower",
                "text": "مروش بماء عذب + جلسات فسيحة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>3,100 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور (شرم أبحر)</span>\r\n                                        <small class=\"weekend-note\">استمتاع في الخور</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>700 ريال/ساعة | 350 لنصف ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/baby-orax-40.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('baby-yacht-orax-40')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/baby-orax-40.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/اوراكس 40 قدم/1.webp",
                "alt": "اوراكس 40 قدم 1"
            },
            {
                "src": "images/اوراكس 40 قدم/2.webp",
                "alt": "اوراكس 40 قدم 2"
            },
            {
                "src": "images/اوراكس 40 قدم/3.webp",
                "alt": "اوراكس 40 قدم 3"
            },
            {
                "src": "images/اوراكس 40 قدم/4.webp",
                "alt": "اوراكس 40 قدم 4"
            },
            {
                "src": "images/اوراكس 40 قدم/5.webp",
                "alt": "اوراكس 40 قدم 5"
            },
            {
                "src": "images/اوراكس 40 قدم/6.webp",
                "alt": "اوراكس 40 قدم 6"
            },
            {
                "src": "images/اوراكس 40 قدم/7.webp",
                "alt": "اوراكس 40 قدم 7"
            },
            {
                "src": "images/اوراكس 40 قدم/8.webp",
                "alt": "اوراكس 40 قدم 8"
            },
            {
                "src": "images/اوراكس 40 قدم/9.webp",
                "alt": "اوراكس 40 قدم 9"
            }
        ],
        "detailLink": "boats/baby-orax-40.html",
        "calcVessel": "baby-yacht-orax-40",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "baby-al-jawhari": {
        "key": "baby-al-jawhari",
        "name": "يخت الجوهري (Al-Jawhari)",
        "badge": "VIP فخامة وألعاب مائية",
        "catTag": "بيبي يخت VIP",
        "capacity": "حتى 10 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "صالون مكيف ولعبة الموزة",
        "featureIcon": "fa-solid fa-water",
        "startingPrice": "460",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,750 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "🌟 فخامة وراحة خاصة مع كابينة مكيفة وجلسة تشميس أمامية وألعاب مائية!",
            "تصميم راقٍ يجمع بين الخصوصية التامة للعائلات والمجموعات، مع ألعاب مائية متنوعة تشمل لعبة سحب الموزة وبورد التجديف وجلسات تيك مظللة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-snowflake",
                "text": "كابينة داخلية مكيفة + غرفة نوم + دورة مياه متكاملة ومطبخ تحضيري"
            },
            {
                "icon": "fa-solid fa-sun",
                "text": "جلسة تشميس أمامية فاخرة (Sunlounger) + أرضيات تيك وسلم سباحة"
            },
            {
                "icon": "fa-solid fa-person-swimming",
                "text": "بورد تجديف (SUP) وفرشة عائمة + تتوفر لعبة سحب الموزة المائية"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-tags\" style=\"color: var(--gold);\"></i> باقات وأسعار يخت الجوهري</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span>\r\n                                        <small class=\"weekend-note\">سباحة واستجمام في المالديف + أنشطة بحرية</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>1,750 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span>\r\n                                        <small class=\"weekend-note\">مياه نقية وطبيعة بحرية ساحرة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>2,000 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلة خور سعود (6 ساعات)</span>\r\n                                        <small class=\"weekend-note\">هدوء وأجواء خلابة في خور سعود</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>1,750 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور (شرم أبحر)</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 460 ريال | نصف ساعة 230 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>230 – 460 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\" style=\"background: rgba(201,162,39,0.06); margin: 6px -12px -12px -12px; padding: 10px 12px; border-radius: 0 0 var(--radius-md) var(--radius-md);\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\" style=\"color: var(--navy); font-weight: 700;\"><i class=\"fa-solid fa-bolt\" style=\"color: var(--gold);\"></i> إضافة لعبة سحب الموزة (Banana Boat)</span>\r\n                                        <small class=\"weekend-note\">لعبة سحب مائية ممتعة للمجموعة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+ 250 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/al-jawhari.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('al-jawhari')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/al-jawhari.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/الجوهري/1.webp",
                "alt": "يخت الجوهري VIP بجدة"
            },
            {
                "src": "images/الجوهري/2.webp",
                "alt": "جلسة التشميس الأمامية في يخت الجوهري"
            },
            {
                "src": "images/الجوهري/3.webp",
                "alt": "المكائن المزدوجة وسلم السباحة"
            },
            {
                "src": "images/الجوهري/4.webp",
                "alt": "مقدمة اليخت وجلسات الاسترخاء"
            },
            {
                "src": "images/الجوهري/5.webp",
                "alt": "الكابينة الداخلية المكيفة مع غرفة النوم والمطبخ"
            },
            {
                "src": "images/الجوهري/6.webp",
                "alt": "مقصورة القيادة وأجهزة الملاحة"
            },
            {
                "src": "images/الجوهري/7.webp",
                "alt": "الجلسات المظللة بأرضيات التيك"
            },
            {
                "src": "images/الجوهري/8.webp",
                "alt": "الأنشطة البحرية وبورد التجديف في بياضة"
            },
            {
                "src": "images/الجوهري/9.webp",
                "alt": "لعبة سحب الموزة المائية الحماسية"
            }
        ],
        "detailLink": "boats/al-jawhari.html",
        "calcVessel": "al-jawhari",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "al-ameed": {
        "key": "al-ameed",
        "name": "قارب العميد",
        "badge": "الأفضل قيمة ومساحة",
        "catTag": "قارب كبير للمجموعات",
        "capacity": "حتى 11 ضيفاً (15 كحد أقصى)",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "رحلات صيد 12 ساعة ومكس بياضة",
        "featureIcon": "fa-solid fa-fish-fins",
        "startingPrice": "1,500",
        "priceUnit": "ر.س (12 ساعة)",
        "priceSubtext": "أو 350 ر.س / ساعة جولات الخور",
        "descriptions": [
            "قارب واسع ومريح ومثالي للعوائل الكبيرة والرحلات الطويلة والمميزة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 12 شخصاً — الحد الأقصى للضيوف 11 ضيفاً (الكابتن مشمول)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر الأساسي يشمل 6 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات الأساسية (الاقتصادية)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة بياضة (12/10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,500 أسبوع | 1,800 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد فقط (12/10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,800 أسبوع | 2,100 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة مكس (بياضة + صيد)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,950 أسبوع | 2,250 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقة المميز VIP (+300 ريال)</span>\r\n                                        <small class=\"weekend-note\">تشمل ألعاب سحب بياضة وطعم صيد طبيعي</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقة مميز بلس VVIP (+350 ريال)</span>\r\n                                        <small class=\"weekend-note\">VIP + مشروبات باردة ومأكولات خفيفة وعدة صيد وتصوير GoPro</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+350 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلة الخور المنفصلة (للساعة)</span>\r\n                                        <small class=\"weekend-note\">رحلة مستقلة تبدأ من 0.5 إلى 2 ساعة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>400 ريال/ساعة | 250 لنصف ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/al-ameed.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('al-ameed')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/al-ameed.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/العميد/1.webp",
                "alt": "قارب العميد 1"
            },
            {
                "src": "images/العميد/2.webp",
                "alt": "قارب العميد 2"
            },
            {
                "src": "images/العميد/3.webp",
                "alt": "قارب العميد 3"
            }
        ],
        "detailLink": "boats/al-ameed.html",
        "calcVessel": "al-ameed",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 200 ريال لوسط الأسبوع و 300 ريال للويكند (لرحلات 12 / 10 ساعات)، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "norseen-large": {
        "key": "norseen-large",
        "name": "قارب نورسين الكبير",
        "badge": "سعة ضخمة وقوة",
        "catTag": "قارب كبير",
        "capacity": "حتى 19 ضيفاً",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "سعة واسعة جداً للعوائل والمجموعات",
        "featureIcon": "fa-solid fa-users",
        "startingPrice": "1,800",
        "priceUnit": "ر.س (6 ساعات)",
        "priceSubtext": "أو 500 ر.س / ساعة جولات الخور",
        "descriptions": [
            "قارب واسع ومثالي للمجموعات الكبيرة التي تعشق الصيد أو السباحة في بياضة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 20 شخصاً — الحد الأقصى للضيوف 19 ضيفاً (الكابتن مشمول)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر الأساسي يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات الأساسية (الاقتصادية)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,800 أسبوع | 2,000 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (8 / 10 / 12 ساعة)</span></div>\r\n                                    <div class=\"trip-price\">\r\n                                        <small class=\"weekend-note\">8ساعات: 2100 أسبوع / 2300 ويكند</small><br>\r\n                                        <small class=\"weekend-note\">10ساعات: 2300 أسبوع / 2500 ويكند</small><br>\r\n                                        <small class=\"weekend-note\">12ساعة: 2500 أسبوع / 2700 ويكند</small>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقة المميز VIP (+300 ريال)</span>\r\n                                        <small class=\"weekend-note\">تشمل ألعاب سحب بياضة وطعم صيد طبيعي</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">باقة مميز بلس VVIP (+350 ريال)</span>\r\n                                        <small class=\"weekend-note\">VIP + مشروبات باردة ومأكولات خفيفة وعدة صيد وتصوير GoPro</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>+350 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلة الخور المنفصلة (للساعة)</span>\r\n                                        <small class=\"weekend-note\">رحلة مستقلة تبدأ من 0.5 إلى 2 ساعة</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>400 ريال/ساعة | 250 لنصف ساعة</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/norseen-large.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('norseen-large')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/norseen-large.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/قارب نورسين الكبير/1.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قارب نورسين الكبير/2.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قارب نورسين الكبير/3.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قارب نورسين الكبير/4.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قارب نورسين الكبير/5.webp",
                "alt": "قارب نورسين الكبير"
            }
        ],
        "detailLink": "boats/norseen-large.html",
        "calcVessel": "norseen-large",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 300 ريال لتثبيت الموعد مع الكابتن، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "large-yacht": {
        "key": "large-yacht",
        "name": "اليخت الكبير الفاخر",
        "badge": "فخامة ملكية",
        "catTag": "اليخوت الكبيرة VIP",
        "capacity": "حتى 35 شخصاً (45 بالخور)",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "فخامة استثنائية للحفلات والمناسبات",
        "featureIcon": "fa-solid fa-champagne-glasses",
        "startingPrice": "2,000",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أقل مدة حجز ساعتان",
        "descriptions": [
            "يخت ملكي مجهز بالكامل للمناسبات الكبيرة والاحتفالات العائلية والخاصة الفخمة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 35 شخصاً (ويمكن زيادة العدد حتى 45 في رحلات الخور)"
            },
            {
                "icon": "fa-solid fa-compass",
                "text": "مناسب لرحلات بياضة أو الخور (لا توجد رحلات صيد)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الحجز والطلبات الخاصة</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">السعر الأساسي للساعة</span></div>\r\n                                    <div class=\"trip-price\"><strong>2,000 أسبوع | 2,200 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">الطلبات الخاصة (تزيين، كيك، بوفيه...)</span></div>\r\n                                    <div class=\"trip-price\"><small class=\"weekend-note\">متاحة عند الطلب (يرجى تحديد طلبك في حاسبة الأسعار بالأسفل)</small></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/large-yacht.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('large-yacht')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/large-yacht.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/اليخت الفاخر/Main Yakht.webp",
                "alt": "اليخت الكبير الفاخر"
            },
            {
                "src": "images/اليخت الفاخر/111111111111.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/2.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/3.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/333333333333.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/4.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/5.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/6.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/7.webp",
                "alt": "اليخت الكبير"
            },
            {
                "src": "images/اليخت الفاخر/8.webp",
                "alt": "اليخت الكبير"
            }
        ],
        "detailLink": "boats/large-yacht.html",
        "calcVessel": "large-yacht",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 50% من إجمالي قيمة الرحلة، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "seven-1": {
        "key": "seven-1",
        "name": "قارب سيفين 1 (10 متر)",
        "badge": "سيفين 1",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "مظلة كاملة ومروش وساوند سيستم",
        "featureIcon": "fa-solid fa-music",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة مجهز بالكامل للسباحة، كاياك وفرش ألعاب بياضة وصيد ممتع."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/seven-1.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('seven-boat')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/seven-1.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين/1.webp",
                "alt": "قارب سيفين 1"
            }
        ],
        "detailLink": "boats/seven-1.html",
        "calcVessel": "seven-boat",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "seven-2": {
        "key": "seven-2",
        "name": "قارب سيفين 2",
        "badge": "سيفين 2",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "جلسة مريحة ومعدات سباحة",
        "featureIcon": "fa-solid fa-life-ring",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة رائع يتميز بالقوة والسرعة ومثالي للسباحة والصيد العائلي."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/seven-2.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('seven-boat-2')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/seven-2.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين 2/1.webp",
                "alt": "قارب سيفين 2"
            },
            {
                "src": "images/سيفين 2/WhatsApp Image 2026-07-11 at 8.42.01 PM.webp",
                "alt": "قارب سيفين 2"
            },
            {
                "src": "images/سيفين 2/بيس.webp",
                "alt": "قارب سيفين 2"
            }
        ],
        "detailLink": "boats/seven-2.html",
        "calcVessel": "seven-boat-2",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "seven-3": {
        "key": "seven-3",
        "name": "قارب سيفين 3",
        "badge": "سيفين 3",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "رحلات سباحة وبياضة وصيد",
        "featureIcon": "fa-solid fa-water",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة سريع ومريح مع كابتن خبير بأماكن الصيد الوفير وبياضة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/seven-3.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('seven-boat-3')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/seven-3.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين 3/1.webp",
                "alt": "قارب سيفين 3 1"
            },
            {
                "src": "images/سيفين 3/WhatsApp Image 2026-07-11 at 8.42.13 PM.webp",
                "alt": "قارب سيفين 3 2"
            }
        ],
        "detailLink": "boats/seven-3.html",
        "calcVessel": "seven-boat-3",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "shaheen": {
        "key": "shaheen",
        "name": "قارب شاهين",
        "badge": "قارب شاهين",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "سرعة وثبات ومعدات سباحة",
        "featureIcon": "fa-solid fa-gauge-high",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة مجهز ومميز للسباحة في بياضة والصيد وقضاء أجمل الأوقات."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/shaheen.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('shaheen')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/shaheen.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/شاهين/1.webp",
                "alt": "قارب شاهين 1"
            },
            {
                "src": "images/شاهين/2.webp",
                "alt": "قارب شاهين 2"
            },
            {
                "src": "images/شاهين/3.webp",
                "alt": "قارب شاهين 3"
            },
            {
                "src": "images/شاهين/4.webp",
                "alt": "قارب شاهين 4"
            }
        ],
        "detailLink": "boats/shaheen.html",
        "calcVessel": "shaheen",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "bahr": {
        "key": "bahr",
        "name": "قارب بحر",
        "badge": "قارب بحر",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "خصوصية عائلية ومروش ماء عذب",
        "featureIcon": "fa-solid fa-shower",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة واسع ومريح للسباحة في جزيرة بياضة والصيد العائلي الممتع."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/bahr.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('bahr')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/bahr.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/بحر/1.webp",
                "alt": "قارب بحر 1"
            },
            {
                "src": "images/بحر/2.webp",
                "alt": "قارب بحر 2"
            },
            {
                "src": "images/بحر/3.webp",
                "alt": "قارب بحر 3"
            },
            {
                "src": "images/بحر/4.webp",
                "alt": "قارب بحر 4"
            },
            {
                "src": "images/بحر/5.webp",
                "alt": "قارب بحر 5"
            },
            {
                "src": "images/بحر/6.webp",
                "alt": "قارب بحر 6"
            },
            {
                "src": "images/بحر/7.webp",
                "alt": "قارب بحر 7"
            }
        ],
        "detailLink": "boats/bahr.html",
        "calcVessel": "bahr",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "al-noor-al-azraq": {
        "key": "al-noor-al-azraq",
        "name": "قارب النور الأزرق",
        "badge": "قارب النور الأزرق",
        "catTag": "قارب نزهة وصيد",
        "capacity": "حتى 9 ضيوف",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "إضاءة ليلية وجولات بحرية ساحرة",
        "featureIcon": "fa-solid fa-moon",
        "startingPrice": "350",
        "priceUnit": "ر.س / ساعة",
        "priceSubtext": "أو 1,300 ر.س لجزيرة بياضة (6س)",
        "descriptions": [
            "قارب صيد ونزهة أنيق ومريح مجهز بالكامل لرحلات بياضة والسباحة والصيد في جدة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعة الكلية 10 أشخاص (الحد الأقصى للضيوف 9 ضيوف)"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "السعر يشمل 7 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار (شاملة 6 أشخاص)</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة بياضة (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة جزيرة أبو طير (6 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,600 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">رحلات الصيد (6 / 8 / 10 / 12 ساعة)</span>\r\n                                        <small class=\"weekend-note\">6س: 1400 | 8س: 1600 | 10س: 1800 | 12س: 2000 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>تبدأ من 1,400 ريال</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item border-top-dash\">\r\n                                    <div class=\"trip-info\">\r\n                                        <span class=\"trip-name\">جولات الخور / شرم أبحر</span>\r\n                                        <small class=\"weekend-note\">ساعة كاملة 350 ريال | نصف ساعة 200 ريال</small>\r\n                                    </div>\r\n                                    <div class=\"trip-price\"><strong>200 – 350 ريال</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/al-noor-al-azraq.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('al-noor-al-azraq')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/al-noor-al-azraq.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/النور الازرق/1.webp",
                "alt": "قارب النور الازرق 1"
            },
            {
                "src": "images/النور الازرق/2.webp",
                "alt": "قارب النور الازرق 2"
            }
        ],
        "detailLink": "boats/al-noor-al-azraq.html",
        "calcVessel": "al-noor-al-azraq",
        "depositPolicy": "العربون المطلوب لتأكيد وتثبيت الحجز: 300 ريال، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "jaguar": {
        "key": "jaguar",
        "name": "قارب جاكور",
        "badge": "جنوب جدة | قارب جاكور",
        "catTag": "قوارب الجنوب",
        "capacity": "حتى 8 ضيوف",
        "marina": "مراسي الجنوب (قاطوف / الأندلس)",
        "keyFeature": "رحلات صيد متخصصة وجزر الجنوب",
        "featureIcon": "fa-solid fa-fish",
        "startingPrice": "1,200",
        "priceUnit": "ر.س (8 ساعات صيد)",
        "priceSubtext": "تشمل المحيا وأدوات الصيد",
        "descriptions": [
            "قارب مميز ومجهز لرحلات الصيد الممتعة في جنوب جدة — كابتن خبير وأحدث تجهيزات الصيد والسلامة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعر يشمل من شخصين إلى 6 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "مجهز بدورة مياه كاملة ونظيفة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "قوارب الجنوب (مراسي: البضيع، السروم، الشعيبة، الطفية) — صيد وفير"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار الاقتصادية</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (8 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,200 أسبوع | 1,300 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 أسبوع | 1,400 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (12 ساعة)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,500 أسبوع | 1,600 ويكند</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/jaguar.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('jaguar')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/jaguar.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/جاكور/1.webp",
                "alt": "قارب جاكور 1"
            },
            {
                "src": "images/جاكور/2.webp",
                "alt": "قارب جاكور 2"
            }
        ],
        "detailLink": "boats/jaguar.html",
        "calcVessel": "jaguar",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 300 ريال (لرحلات 8 و 10 ساعات) أو 400 ريال (لرحلات 12 ساعة)، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "ghazal-obhur": {
        "key": "ghazal-obhur",
        "name": "قارب غزال أبحر",
        "badge": "جنوب جدة | قارب غزال أبحر",
        "catTag": "قوارب الجنوب",
        "capacity": "حتى 8 ضيوف",
        "marina": "مراسي الجنوب",
        "keyFeature": "رحلات صيد أعماق ومغامرات بحرية",
        "featureIcon": "fa-solid fa-anchor",
        "startingPrice": "1,200",
        "priceUnit": "ر.س (8 ساعات صيد)",
        "priceSubtext": "تشمل المحيا وأدوات الصيد",
        "descriptions": [
            "قارب صيد مميز وسريع لانطلاق رائع في أفضل مناطق ومطارح الصيد بجنوب جدة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعر يشمل من شخصين إلى 6 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "مجهز بدورة مياه كاملة ونظيفة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "قوارب الجنوب (مراسي: البضيع، السروم، الشعيبة، الطفية) — صيد وفير"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار الاقتصادية</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (8 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,200 أسبوع | 1,300 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 أسبوع | 1,400 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (12 ساعة)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,500 أسبوع | 1,600 ويكند</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/ghazal-obhur.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('ghazal-obhur')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/ghazal-obhur.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/غزال ابحر/1.webp",
                "alt": "قارب غزال ابحر 1"
            },
            {
                "src": "images/غزال ابحر/2.webp",
                "alt": "قارب غزال ابحر 2"
            }
        ],
        "detailLink": "boats/ghazal-obhur.html",
        "calcVessel": "ghazal-obhur",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 300 ريال (لرحلات 8 و 10 ساعات) أو 400 ريال (لرحلات 12 ساعة)، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "bin-shuraiq": {
        "key": "bin-shuraiq",
        "name": "قارب بن شريق",
        "badge": "جنوب جدة | قارب بن شريق",
        "catTag": "قوارب الجنوب",
        "capacity": "حتى 8 ضيوف",
        "marina": "مراسي الجنوب",
        "keyFeature": "كابتن متمرس بأفضل مواقع الصيد",
        "featureIcon": "fa-solid fa-compass",
        "startingPrice": "1,200",
        "priceUnit": "ر.س (8 ساعات صيد)",
        "priceSubtext": "تشمل المحيا وأدوات الصيد",
        "descriptions": [
            "قارب صيد ونزهة مجهز بأعلى التجهيزات للرحلات البحرية وصيد الأسماك الوفير من جنوب جدة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعر يشمل من شخصين إلى 6 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "مجهز بدورة مياه كاملة ونظيفة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "قوارب الجنوب (مراسي: البضيع، السروم، الشعيبة، الطفية) — صيد وفير"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار الاقتصادية</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (8 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,200 أسبوع | 1,300 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 أسبوع | 1,400 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (12 ساعة)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,500 أسبوع | 1,600 ويكند</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/bin-shuraiq.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('bin-shuraiq')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/bin-shuraiq.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/بن شريق/1.webp",
                "alt": "قارب بن شريق 1"
            },
            {
                "src": "images/بن شريق/2.webp",
                "alt": "قارب بن شريق 2"
            }
        ],
        "detailLink": "boats/bin-shuraiq.html",
        "calcVessel": "bin-shuraiq",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 300 ريال (لرحلات 8 و 10 ساعات) أو 400 ريال (لرحلات 12 ساعة)، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "shawq-al-layl": {
        "key": "shawq-al-layl",
        "name": "قارب شوق الليل",
        "badge": "جنوب جدة | قارب شوق الليل",
        "catTag": "قوارب الجنوب",
        "capacity": "حتى 8 ضيوف",
        "marina": "مراسي الجنوب",
        "keyFeature": "رحلات صيد ليلية وجزر ساحرة",
        "featureIcon": "fa-solid fa-cloud-moon",
        "startingPrice": "1,200",
        "priceUnit": "ر.س (8 ساعات صيد)",
        "priceSubtext": "تشمل المحيا وأدوات الصيد",
        "descriptions": [
            "قارب صيد ونزهة عائلي مميز بأجواء راقية وسرعة وأمان لرحلات الصيد الممتعة في جنوب جدة."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "السعر يشمل من شخصين إلى 6 أشخاص (كل شخص إضافي 100 ريال)"
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "مجهز بدورة مياه كاملة ونظيفة"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "قوارب الجنوب (مراسي: البضيع، السروم، الشعيبة، الطفية) — صيد وفير"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gift\"></i> خيارات الرحلات والأسعار الاقتصادية</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (8 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,200 أسبوع | 1,300 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (10 ساعات)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,300 أسبوع | 1,400 ويكند</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">رحلة صيد (12 ساعة)</span></div>\r\n                                    <div class=\"trip-price\"><strong>1,500 أسبوع | 1,600 ويكند</strong></div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/shawq-al-layl.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal('shawq-al-layl')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/shawq-al-layl.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/شوق الليل/1.webp",
                "alt": "قارب شوق الليل 1"
            },
            {
                "src": "images/شوق الليل/2.webp",
                "alt": "قارب شوق الليل 2"
            }
        ],
        "detailLink": "boats/shawq-al-layl.html",
        "calcVessel": "shawq-al-layl",
        "depositPolicy": "العربون المطلوب لتأكيد الحجز: 300 ريال (لرحلات 8 و 10 ساعات) أو 400 ريال (لرحلات 12 ساعة)، والمتبقي يُسدد عند الصعود يوم الرحلة."
    },
    "individual": {
        "key": "individual",
        "name": "رحلات المقاعد الفردية المشتركة",
        "badge": "حجز مقاعد فردية",
        "catTag": "رحلات جماعية مشتركة",
        "capacity": "مقاعد فردية (عائلات وشباب)",
        "marina": "مرسى البحر الأحمر",
        "keyFeature": "مسبح بحري ودي جي وسناكات وضيافة",
        "featureIcon": "fa-solid fa-person-swimming",
        "startingPrice": "250",
        "priceUnit": "ر.س / للشخص",
        "priceSubtext": "باقات اقتصادية و VIP و VVIP",
        "descriptions": [
            "رحلات صيد أو بياضة جماعية مميزة، احجز مقعدك الفردي وتعرف على أصدقاء جدد في البحر الأحمر."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "مناسبة للأفراد والقروبات الصغيرة الراغبة في توفير التكاليف"
            },
            {
                "icon": "fa-solid fa-circle-check",
                "text": "تشمل الباقة الاقتصادية أدوات الصيد الأساسية والثلج والوقود"
            },
            {
                "icon": "fa-solid fa-map-location-dot",
                "text": "مرسى الانطلاق: مرسى البحر الأحمر"
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-tag\"></i> أسعار الباقات للشخص</h4>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">الباقة الاقتصادية</span></div>\r\n                                    <div class=\"trip-price\"><strong>250 ريال / للشخص</strong></div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">الباقة المميزة VIP</span></div>\r\n                                    <div class=\"trip-price\">\r\n                                        <strong>300 ريال / للشخص</strong>\r\n                                        <small class=\"weekend-note\">(تشمل ألعاب بياضة + الطعم الطبيعي للصيد)</small>\r\n                                    </div>\r\n                                </div>\r\n                                <div class=\"trip-price-item\">\r\n                                    <div class=\"trip-info\"><span class=\"trip-name\">الباقة الفاخرة VVIP</span></div>\r\n                                    <div class=\"trip-price\">\r\n                                        <strong>320 ريال / للشخص</strong>\r\n                                        <small class=\"weekend-note\">(VIP + مشروبات باردة ومأكولات خفيفة وعدة صيد احترافية وتصوير GoPro)</small>\r\n                                    </div>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"package-actions\">\r\n                                <a href=\"boats/individual-trips.html\" class=\"btn btn-outline\"><i class=\"fa-solid fa-circle-info\"></i> التفاصيل</a>\r\n                                <button type=\"button\" class=\"btn btn-dark\" onclick=\"openCalculatorModal(null, null, 'individual')\"><i class=\"fa-solid fa-calculator\"></i> احسب واحجز</button>\r\n                                <button type=\"button\" class=\"btn btn-share\" onclick=\"shareBoatFromCard(this, 'boats/individual-trips.html')\" title=\"مشاركة رابط القارب\"><i class=\"fa-solid fa-share-nodes\"></i> مشاركة</button>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            </div>\r\n        </div>\r\n    </section>\r\n\r\n    <!-- Features Section -->\r\n    <section id=\"features\" class=\"features-section\">\r\n        <div class=\"container\">\r\n            <div class=\"section-title\">\r\n                <span class=\"sub-title\">تجهيزاتنا ومميزاتنا</span>\r\n                <h2>تجربة بحرية استثنائية</h2>\r\n                <div class=\"title-underline\"></div>\r\n            </div>\r\n            <div class=\"features-grid\">\r\n                <div class=\"feature-card\">\r\n                    <div class=\"feature-icon\"><i class=\"fa-solid fa-shield-heart\"></i></div>\r\n                    <h3>صيد ونزهة آمنة</h3>\r\n                    <p>كباتن ذوي خبرة ومعدات سلامة وأمان كاملة لضمان رحلة ممتعة خالية من المتاعب للعوائل والأفراد.</p>\r\n                </div>\r\n                <div class=\"feature-card\">\r\n                    <div class=\"feature-icon\"><i class=\"fa-solid fa-water\"></i></div>\r\n                    <h3>بياضة الساحرة</h3>\r\n                    <p>رحلات إلى أجمل جزر جدة المرجانية حيث المياه الفيروزية الضحلة والرمال البيضاء — تجربة لا تُنسى كالمالديف السعودية.</p>\r\n                </div>\r\n                <div class=\"feature-card\">\r\n                    <div class=\"feature-icon\"><i class=\"fa-solid fa-route\"></i></div>\r\n                    <h3>خيار المرسى بيدك</h3>\r\n                    <p>انطلق من مرسى البحر الأحمر بالشمال لتجربة راقية، أو اختر مراسي الجنوب للصيد الوفير وأجواء المغامرة البحرية.</p>\r\n                </div>\r\n                <div class=\"feature-card\">\r\n                    <div class=\"feature-icon\"><i class=\"fa-solid fa-restroom\"></i></div>\r\n                    <h3>راحة تامة على المتن</h3>\r\n                    <p>اليخوت والقوارب مجهزة بأعلى سبل الراحة ومراحيض مجهزة لضمان متعة لا تنقطع طوال فترة إبحارك.</p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </section>\r\n\r\n    <!-- Calculator Popup Modal -->\r\n    <div class=\"calc-modal-backdrop\" id=\"calculatorModal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"calcModalTitle\">\r\n        <div class=\"calc-modal-dialog\">\r\n            <div class=\"calc-modal-header\">\r\n                <div class=\"calc-modal-header-info\">\r\n                    <div class=\"calc-modal-header-icon\">\r\n                        <i class=\"fa-solid fa-calculator\"></i>\r\n                    </div>\r\n                    <div class=\"calc-modal-header-text\">\r\n                        <h3 id=\"calcModalTitle\">حاسبة تكلفة الرحلات البحرية</h3>\r\n                        <p>احسب تكلفة رحلتك بدقة واحجز فوراً بأفضل الأسعار</p>\r\n                    </div>\r\n                </div>\r\n                <button type=\"button\" class=\"calc-modal-close-btn\" onclick=\"closeCalculatorModal()\" aria-label=\"إغلاق النافذة\">\r\n                    <i class=\"fa-solid fa-xmark\"></i>\r\n                </button>\r\n            </div>\r\n            <div class=\"calc-modal-body\">\r\n                <!-- Selected Boat Info Banner (Dedicated per boat) -->\r\n                <div class=\"selected-vessel-banner\" id=\"selectedVesselBanner\">\r\n                    <div class=\"vessel-banner-icon\">\r\n                        <i class=\"fa-solid fa-ship\" id=\"vesselBannerIcon\"></i>\r\n                    </div>\r\n                    <div class=\"vessel-banner-info\">\r\n                        <span class=\"vessel-banner-label\">القارب المختار للحجز:</span>\r\n                        <h4 class=\"vessel-banner-title\" id=\"selectedVesselTitle\">يخت بينتوس VIP</h4>\r\n                    </div>\r\n                </div>\r\n\r\n                <form id=\"calcForm\" onsubmit=\"event.preventDefault();\">\r\n                    <input type=\"hidden\" id=\"bookingMode\" value=\"group\">\r\n                    <input type=\"hidden\" id=\"vesselType\" value=\"qimat-al-fawz-pentos\">\r\n\r\n                    <!-- ══ Group Booking Fields ══ -->\r\n                    <div id=\"groupBookingForm\">\r\n                        <div class=\"form-group\" id=\"tripTypeGroup\">\r\n                            <label for=\"tripType\"><i class=\"fa-solid fa-anchor\"></i> نوع الرحلة</label>\r\n                            <select id=\"tripType\" required aria-label=\"نوع الرحلة البحرية\"></select>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/boat51.webp",
                "alt": "رحلات المقاعد الفردية المشتركة"
            },
            {
                "src": "images/boat52.webp",
                "alt": "رحلات المقاعد الفردية المشتركة"
            },
            {
                "src": "images/بارباروسا/1.webp",
                "alt": "قارب بارباروسا VIP"
            },
            {
                "src": "images/بارباروسا/5.webp",
                "alt": "قارب بارباروسا VIP - زحليقة مائية"
            },
            {
                "src": "images/بارباروسا/8.webp",
                "alt": "قارب بارباروسا VIP - سينما بروجكتر"
            },
            {
                "src": "images/يخت بينتوس/1.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/يخت بينتوس/2.webp",
                "alt": "يخت بينتوس VIP"
            },
            {
                "src": "images/اليخت الفاخر/Main Yakht.webp",
                "alt": "اليخت الكبير الفاخر"
            },
            {
                "src": "images/اليخت الفاخر/2.webp",
                "alt": "اليخت الكبير الفاخر"
            },
            {
                "src": "images/امباسودر 36 اريا/1.webp",
                "alt": "بيبي يخت امباسادور"
            },
            {
                "src": "images/اوراكس 40 قدم/1.webp",
                "alt": "بيبي يخت اوراكس 40"
            },
            {
                "src": "images/الجوهري/1.webp",
                "alt": "يخت الجوهري VIP"
            },
            {
                "src": "images/الجوهري/8.webp",
                "alt": "يخت الجوهري - أنشطة بحرية وألعاب مائية"
            },
            {
                "src": "images/العميد/1.webp",
                "alt": "قارب العميد"
            },
            {
                "src": "images/العميد/2.webp",
                "alt": "قارب العميد"
            },
            {
                "src": "images/قارب نورسين الكبير/1.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قارب نورسين الكبير/2.webp",
                "alt": "قارب نورسين الكبير"
            },
            {
                "src": "images/قمة الفوز/1.webp",
                "alt": "قارب قمة الفوز 2025"
            },
            {
                "src": "images/سيفين/1.webp",
                "alt": "قارب سيفين 1"
            },
            {
                "src": "images/سيفين 2/1.webp",
                "alt": "قارب سيفين 2"
            },
            {
                "src": "images/سيفين 3/1.webp",
                "alt": "قارب سيفين 3"
            },
            {
                "src": "images/شاهين/1.webp",
                "alt": "قارب شاهين"
            },
            {
                "src": "images/بحر/1.webp",
                "alt": "قارب بحر"
            },
            {
                "src": "images/النور الازرق/1.webp",
                "alt": "قارب النور الأزرق"
            },
            {
                "src": "images/جاكور/1.webp",
                "alt": "قارب جاكور"
            },
            {
                "src": "images/غزال ابحر/1.webp",
                "alt": "قارب غزال أبحر"
            },
            {
                "src": "images/بن شريق/1.webp",
                "alt": "قارب بن شريق"
            },
            {
                "src": "images/شوق الليل/1.webp",
                "alt": "قارب شوق الليل"
            },
            {
                "src": "images/boat51.webp",
                "alt": "رحلات المقاعد الفردية"
            },
            {
                "src": "images/boat52.webp",
                "alt": "رحلات المقاعد الفردية"
            },
            {
                "src": "images/logo.webp",
                "alt": "شعار أوركا للرحلات البحرية"
            }
        ],
        "detailLink": "boats/individual-trips.html",
        "calcVessel": "individual",
        "depositPolicy": "يتم سداد كامل قيمة التذكرة لتأكيد حجز المقعد الفردي المختار مسبقاً."
    }
};


const fleetDetailsDataEn = {
    "barbaros": {
        "key": "barbaros",
        "name": "Barbaros VIP Boat (Barbarossa)",
        "catTag": "Al-Amanah Yacht Club",
        "badge": "Most Popular — VIP Choice",
        "capacity": "Up to 10 Guests",
        "marina": "Al-Amanah Yacht Club (South Obhur)",
        "keyFeature": "Cinema, Slush & Water Park",
        "featureIcon": "fa-solid fa-film",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "460 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Open Sea (6h)",
                "val": "2,000 SAR",
                "icon": "fa-solid fa-compass"
            },
            {
                "label": "Open Sea (9h)",
                "val": "2,500 SAR",
                "icon": "fa-solid fa-water"
            }
        ],
        "descriptions": [
            "🌟 Professional Crew + Cinema Projector + Slush Machine + Full Water Park!",
            "Top-rated double-decker pontoon boat offering enhanced family privacy at Abu Tair Island, souvenir gifts, on-board BBQ, and all-inclusive marine cruises."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-user-shield",
                "text": "Professional Crew: 1 Captain for standard cruises, Captain + female attendant for 6h VIP cruise."
            },
            {
                "icon": "fa-solid fa-water-ladder",
                "text": "Water Toys, Cinema & Slush: Giant water slide, floating sunbed, water tent, volleyball, circular lounge, slush smoothies & cinema projector."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Boat Facilities: Marine restroom & freshwater shower, shaded open lounges across two decks."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\" style=\"color: var(--navy); border-bottom: 2px solid var(--gold); padding-bottom: 6px; margin-bottom: 10px;\">\n            <i class=\"fa-solid fa-compass\" style=\"color: var(--gold);\"></i> 1. Open Sea Cruises (Bayadah / Abu Tair Privacy — Up to 10 Guests)\n        </h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"font-weight: 700;\">Package 1 (Standard Cruise)</span>\n                <small class=\"weekend-note\">1 Captain + Slush smoothies & cold drinks + towels & snorkel gear for use + water slide, sunbed & hammock</small>\n            </div>\n            <div class=\"trip-price\"><strong>6h: 2,000 | 9h: 2,500 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"font-weight: 700; color: var(--ocean-dark);\">Package 2: VIP Water Toys & On-Board BBQ</span>\n                <small class=\"weekend-note\">Captain & female assistant (6h) + Slush + souvenir gifts + grilled burgers (2/guest) + choice of (tent/volleyball/trampoline with circular lounge)</small>\n            </div>\n            <div class=\"trip-price\"><strong>5-6 guests: 3,000 | 7-9 guests: 3,500 SAR</strong></div>\n        </div>\n        <h4 class=\"box-title\" style=\"color: var(--navy); border-bottom: 2px solid var(--ocean); padding-bottom: 6px; margin: 16px 0 10px 0;\">\n            <i class=\"fa-solid fa-ship\" style=\"color: var(--ocean);\"></i> 2. Picnic & Creek Sightseeing Tours (South Obhur)\n        </h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"font-weight: 700;\">Standard Sightseeing Cruise</span>\n                <small class=\"weekend-note\">1 Full Hour 460 SAR (includes complimentary American coffee & tea)</small>\n            </div>\n            <div class=\"trip-price\"><strong>460 SAR / hr</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"font-weight: 700;\">Dinner & Special Occasion Packages (1-2 Hours)</span>\n                <small class=\"weekend-note\">Sandwiches or BBQ burgers 60 SAR | Maki Sushi 120 SAR | Cake & Occasions 60 – 200 SAR | Free Cinema after sunset</small>\n            </div>\n            <div class=\"trip-price\"><strong>Per Package</strong></div>\n        </div>",
        "pdfLinks": [
            {
                "url": "files/barbaros/البحر المفتوح.pdf",
                "filename": "Barbaros_Open_Sea_Trips.pdf",
                "label": "Open Sea Trips (PDF)"
            },
            {
                "url": "files/barbaros/رحلات النزهة.pdf",
                "filename": "Barbaros_Picnic_Trips.pdf",
                "label": "Picnic Cruises (PDF)"
            }
        ],
        "images": [
            {
                "src": "images/بارباروسا/1.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 1"
            },
            {
                "src": "images/بارباروسا/2.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 2"
            },
            {
                "src": "images/بارباروسا/3.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 3"
            },
            {
                "src": "images/بارباروسا/4.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 4"
            },
            {
                "src": "images/بارباروسا/5.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 5"
            },
            {
                "src": "images/بارباروسا/6.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 6"
            },
            {
                "src": "images/بارباروسا/7.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 7"
            },
            {
                "src": "images/بارباروسا/8.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 8"
            },
            {
                "src": "images/بارباروسا/9.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 9"
            },
            {
                "src": "images/بارباروسا/10.webp",
                "alt": "Barbaros VIP Boat (Barbarossa) - Photo 10"
            }
        ],
        "detailLink": "boats/barbaros.html",
        "calcVessel": "barbaros",
        "depositPolicy": "Deposit required to confirm booking: 50% of total cruise cost, with the remaining balance paid upon boarding on the day of the trip."
    },
    "pentos": {
        "key": "pentos",
        "name": "Pentos VIP Yacht",
        "catTag": "VIP Luxury Yacht",
        "badge": "Best Value & Luxury",
        "capacity": "Up to 12 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Luxury Yacht & Pro Photos",
        "featureIcon": "fa-solid fa-camera-retro",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "450 SAR / hr (250 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,480 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,780 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "🌟 Designed for luxury seekers and professional memory capturing at unbeatable value!",
            "Premier luxury yacht combining modern sophistication, full comfort, bedroom, spacious viewing decks, and exceptional photo opportunities."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-camera-retro",
                "text": "Professional Photography: Luxury interior design with panoramic angles for unforgettable memories."
            },
            {
                "icon": "fa-solid fa-users",
                "text": "Suitable for All Occasions: Ideal for family cruises, youth gatherings, swimming, and fishing."
            },
            {
                "icon": "fa-solid fa-bed",
                "text": "Cabin Amenities: Master bedroom, private restroom, and wide bow and aft seating areas."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-crown\" style=\"color: var(--gold);\"></i> Pentos VIP Yacht Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,480 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,780 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,500 | 8h: 1,780 | 10h: 1,980 | 12h: 2,180 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,500 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour (0.5 – 2 Hours)</span>\n                <small class=\"weekend-note\">Half hour 250 SAR | Full hour 450 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>450 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/يخت بينتوس/1.webp",
                "alt": "Pentos VIP Yacht - Photo 1"
            },
            {
                "src": "images/يخت بينتوس/2.webp",
                "alt": "Pentos VIP Yacht - Photo 2"
            },
            {
                "src": "images/يخت بينتوس/3.webp",
                "alt": "Pentos VIP Yacht - Photo 3"
            },
            {
                "src": "images/يخت بينتوس/4.webp",
                "alt": "Pentos VIP Yacht - Photo 4"
            },
            {
                "src": "images/يخت بينتوس/5.webp",
                "alt": "Pentos VIP Yacht - Photo 5"
            },
            {
                "src": "images/يخت بينتوس/6.webp",
                "alt": "Pentos VIP Yacht - Photo 6"
            }
        ],
        "detailLink": "boats/Beneteau.html",
        "calcVessel": "qimat-al-fawz-pentos",
        "depositPolicy": "Deposit required to confirm booking: 50% of total cruise cost, with the remaining balance paid upon boarding."
    },
    "qimat-al-fawz": {
        "key": "qimat-al-fawz",
        "name": "Qimat Al-Fawz Boat (2025 Model)",
        "catTag": "Modern 2025 Model",
        "badge": "Brand New 2025",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Leather Seats & Fresh Water",
        "featureIcon": "fa-solid fa-couch",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "🌟 Modern 2025 boat combining speed, luxury seating, and high stability for Bayadah and Creek tours.",
            "Equipped with plush leather seating, marine restroom, fresh water shower, Bluetooth sound system, and snorkeling gear."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-couch",
                "text": "Plush Seating: Modern 2025 design with comfortable seating for up to 9 guests."
            },
            {
                "icon": "fa-solid fa-shower",
                "text": "Restroom & Shower: On-board marine toilet and fresh water shower."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Sound System: Premium Bluetooth audio system and full sun canopy."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--gold);\"></i> Qimat Al-Fawz Cruise Packages (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/قمة الفوز/1.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 1"
            },
            {
                "src": "images/قمة الفوز/2.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 2"
            },
            {
                "src": "images/قمة الفوز/3.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 3"
            },
            {
                "src": "images/قمة الفوز/4.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 4"
            },
            {
                "src": "images/قمة الفوز/5.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 5"
            },
            {
                "src": "images/قمة الفوز/6.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 6"
            },
            {
                "src": "images/قمة الفوز/7.webp",
                "alt": "Qimat Al-Fawz Boat (2025 Model) - Photo 7"
            }
        ],
        "detailLink": "boats/qimat-al-fawz.html",
        "calcVessel": "qimat-al-fawz",
        "depositPolicy": "Fixed booking deposit: 300 SAR to secure the captain schedule, remaining balance paid upon boarding."
    },
    "nardo": {
        "key": "nardo",
        "name": "Nardo Luxury Yacht (Nardo Yacht)",
        "catTag": "VIP Luxury Yacht",
        "badge": "VIP Luxury Yacht",
        "capacity": "Up to 14 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Full A/C & Hotel Salon",
        "featureIcon": "fa-solid fa-snowflake",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "680 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "From 3,180 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Extended Cruise (9h)",
                "val": "From 3,880 SAR",
                "icon": "fa-solid fa-clock"
            }
        ],
        "descriptions": [
            "🌟 The ultimate in private luxury cruising in Jeddah with a hotel-grade salon and full air conditioning.",
            "Spacious yacht featuring master bedroom, equipped kitchen, bathroom, plush indoor living room, and wide sunbeds on the deck."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-snowflake",
                "text": "Central Air Conditioning: Continuous chilled air throughout the salon and bedroom."
            },
            {
                "icon": "fa-solid fa-bed",
                "text": "Private Stateroom: Master bedroom with luxury fittings and guest restroom."
            },
            {
                "icon": "fa-solid fa-utensils",
                "text": "Equipped Galley: Refrigerator, microwave, and hospitality preparation station."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-crown\" style=\"color: var(--gold);\"></i> Nardo VIP Yacht Packages & Rates</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span>\n                <small class=\"weekend-note\">Up to 6 guests: 3,180 SAR | 7-9 guests: 3,680 SAR | 10+ guests: 3,980 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 3,180 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Extended Bayadah Cruise (9 Hours)</span>\n                <small class=\"weekend-note\">Extended cruise for maximum relaxation (+700 SAR)</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 3,880 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Fishing Adventure Add-on</span>\n                <small class=\"weekend-note\">1 Extra Fishing Hour added to Bayadah Cruise (+300 SAR)</small>\n            </div>\n            <div class=\"trip-price\"><strong>+300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">First hour 680 SAR | Additional hours 580 SAR | Half hour 340 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>680 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/ناردو/1.webp",
                "alt": "Nardo Luxury Yacht (Nardo Yacht) - Photo 1"
            }
        ],
        "detailLink": "boats/nardo.html",
        "calcVessel": "nardo",
        "depositPolicy": "Deposit required to confirm booking: 50% of total cruise cost, remaining balance paid upon boarding."
    },
    "tam": {
        "key": "tam",
        "name": "Tam Luxury Yacht (Tam Yacht)",
        "catTag": "VIP Luxury Yacht",
        "badge": "VIP Luxury Yacht",
        "capacity": "Up to 11 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Dedicated Generator A/C & Bedroom",
        "featureIcon": "fa-solid fa-bed",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "460 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah / Abu Tair (6h)",
                "val": "From 1,580 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Extended Cruise (9h)",
                "val": "From 2,080 SAR",
                "icon": "fa-solid fa-clock"
            }
        ],
        "descriptions": [
            "🌟 Guaranteed continuous air conditioning with an independent generator, bedroom, and panoramic viewing deck.",
            "Perfect private yacht for families seeking privacy and upscale comfort on Bayadah or Abu Tair island excursions."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-snowflake",
                "text": "Heavy-Duty A/C: Powered by a dedicated on-board generator."
            },
            {
                "icon": "fa-solid fa-bed",
                "text": "Comfortable Bedroom: Quiet private room for relaxation."
            },
            {
                "icon": "fa-solid fa-shield-heart",
                "text": "Full Safety: Complete life jackets and navigation instruments."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-crown\" style=\"color: var(--gold);\"></i> Tam VIP Yacht Packages & Rates</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Bayadah or Abu Tair Cruise (6 Hours)</span>\n                <small class=\"weekend-note\">Up to 6 guests: 1,580 SAR | 7-9 guests: 1,880 SAR | 10-11 guests: 1,980 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,580 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Extended Island Cruise (9 Hours)</span>\n                <small class=\"weekend-note\">Extended cruise for maximum relaxation (+500 SAR)</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 2,080 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">First hour 460 SAR | Additional hours 430 SAR | Half hour 230 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>460 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/تام/1.webp",
                "alt": "Tam Luxury Yacht (Tam Yacht) - Photo 1"
            }
        ],
        "detailLink": "boats/tam.html",
        "calcVessel": "tam",
        "depositPolicy": "Deposit required to confirm booking: 50% of total cruise cost, remaining balance paid upon boarding."
    },
    "baby-ambassador": {
        "key": "baby-ambassador",
        "name": "Baby Yacht Ambassador (36 FT Aria)",
        "catTag": "Luxury Baby Yacht",
        "badge": "Luxury Baby Yacht",
        "capacity": "Up to 11 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "A/C Salon, Bedroom & Kitchen",
        "featureIcon": "fa-solid fa-couch",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "600 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "2,000 Wkday | 2,300 Wkend",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Trolling Fishing (6h)",
                "val": "2,200 Wkday | 2,500 Wkend",
                "icon": "fa-solid fa-fish"
            }
        ],
        "descriptions": [
            "Sleek 36-foot luxury yacht with air-conditioned indoor salon, comfortable bedroom, kitchen, and optional live BBQ meal."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-snowflake",
                "text": "Air-Conditioned Salon & Bedroom."
            },
            {
                "icon": "fa-solid fa-drumstick-bite",
                "text": "Optional Fresh On-Board BBQ Meal (+600 SAR)."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-ship\" style=\"color: var(--gold);\"></i> Ambassador 36 FT Packages & Rates</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,000 Wkday | 2,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,300 Wkday | 2,600 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Trolling Fishing Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,200 Wkday | 2,500 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Obhur Creek Sightseeing Tour</span></div>\n            <div class=\"trip-price\"><strong>600 SAR / hr (300 half hr)</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Optional Fresh BBQ Meal Add-on</span></div>\n            <div class=\"trip-price\"><strong>+600 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/امباسودر 36 اريا/1.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 1"
            },
            {
                "src": "images/امباسودر 36 اريا/2.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 2"
            },
            {
                "src": "images/امباسودر 36 اريا/3.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 3"
            },
            {
                "src": "images/امباسودر 36 اريا/4.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 4"
            },
            {
                "src": "images/امباسودر 36 اريا/5.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 5"
            },
            {
                "src": "images/امباسودر 36 اريا/6.webp",
                "alt": "Baby Yacht Ambassador (36 FT Aria) - Photo 6"
            }
        ],
        "detailLink": "boats/baby-ambassador.html",
        "calcVessel": "baby-yacht-ambassador",
        "depositPolicy": "Deposit: 700 SAR weekday / 1,000 SAR weekend, remaining balance paid upon boarding."
    },
    "baby-orax-40": {
        "key": "baby-orax-40",
        "name": "Baby Yacht Orax (40 FT)",
        "catTag": "Luxury Baby Yacht",
        "badge": "Brand New 40 FT",
        "capacity": "Up to 10 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Ultra-Luxury 40 FT Yacht",
        "featureIcon": "fa-solid fa-gem",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "700 SAR / hr (350 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "3,100 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "3,400 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Spacious and ultra-modern 40-foot luxury yacht equipped with premium amenities, air conditioning, and top-tier luxury."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-gem",
                "text": "Luxury 40-Foot Layout with Full A/C."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Private Restroom and Fresh Water Shower."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-gem\" style=\"color: var(--gold);\"></i> Orax 40 FT Packages & Rates</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>3,100 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>3,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Obhur Creek Sightseeing Tour</span></div>\n            <div class=\"trip-price\"><strong>700 SAR / hr (350 half hr)</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/اوراكس 40 قدم/1.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 1"
            },
            {
                "src": "images/اوراكس 40 قدم/2.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 2"
            },
            {
                "src": "images/اوراكس 40 قدم/3.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 3"
            },
            {
                "src": "images/اوراكس 40 قدم/4.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 4"
            },
            {
                "src": "images/اوراكس 40 قدم/5.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 5"
            },
            {
                "src": "images/اوراكس 40 قدم/6.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 6"
            },
            {
                "src": "images/اوراكس 40 قدم/7.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 7"
            },
            {
                "src": "images/اوراكس 40 قدم/8.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 8"
            },
            {
                "src": "images/اوراكس 40 قدم/9.webp",
                "alt": "Baby Yacht Orax (40 FT) - Photo 9"
            }
        ],
        "detailLink": "boats/baby-orax-40.html",
        "calcVessel": "baby-yacht-orax-40",
        "depositPolicy": "Deposit: 700 SAR weekday / 1,000 SAR weekend, remaining balance paid upon boarding."
    },
    "baby-al-jawhari": {
        "key": "baby-al-jawhari",
        "name": "Al-Jawhari VIP Yacht",
        "catTag": "VIP Baby Yacht",
        "badge": "VIP Luxury & Banana Boat",
        "capacity": "Up to 10 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "A/C Salon & Banana Boat Toy",
        "featureIcon": "fa-solid fa-water",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "460 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,750 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "2,000 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "🌟 Private luxury cruising with an air-conditioned cabin, bow sunbed, and exciting towable banana boat water toy."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-snowflake",
                "text": "Air-Conditioned Salon and Bedroom."
            },
            {
                "icon": "fa-solid fa-water",
                "text": "Towable Banana Boat Water Toy (+250 SAR)."
            },
            {
                "icon": "fa-solid fa-shower",
                "text": "Restroom and Fresh Water Shower."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-crown\" style=\"color: var(--gold);\"></i> Al-Jawhari VIP Yacht Packages & Rates</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,750 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,000 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Khor Saud Scenic Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,750 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Obhur Creek Sightseeing Tour</span></div>\n            <div class=\"trip-price\"><strong>460 SAR / hr (230 half hr)</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Towable Banana Boat Water Toy</span></div>\n            <div class=\"trip-price\"><strong>+250 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/الجوهري/1.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 1"
            },
            {
                "src": "images/الجوهري/2.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 2"
            },
            {
                "src": "images/الجوهري/3.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 3"
            },
            {
                "src": "images/الجوهري/4.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 4"
            },
            {
                "src": "images/الجوهري/5.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 5"
            },
            {
                "src": "images/الجوهري/6.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 6"
            },
            {
                "src": "images/الجوهري/7.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 7"
            },
            {
                "src": "images/الجوهري/8.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 8"
            },
            {
                "src": "images/الجوهري/9.webp",
                "alt": "Al-Jawhari VIP Yacht - Photo 9"
            }
        ],
        "detailLink": "boats/al-jawhari.html",
        "calcVessel": "al-jawhari",
        "depositPolicy": "Deposit required: 50% of total cruise cost, remaining balance paid upon boarding."
    },
    "al-ameed": {
        "key": "al-ameed",
        "name": "Al-Ameed Large Boat",
        "catTag": "Large Group Boat",
        "badge": "Best Space & Group Value",
        "capacity": "Up to 11 Guests (Max 15)",
        "marina": "Red Sea Marina",
        "keyFeature": "12-Hour Fishing & Bayadah Mix",
        "featureIcon": "fa-solid fa-fish-fins",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah (12h/10h)",
                "val": "1,500 Wkday | 1,800 Wkend",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Fishing or Abu Tair",
                "val": "1,800 Wkday | 2,100 Wkend",
                "icon": "fa-solid fa-fish"
            }
        ],
        "descriptions": [
            "Spacious heavy-duty boat ideal for large families and extended 12-hour deep-sea fishing or Bayadah trips."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-clock",
                "text": "Extended 12-Hour Cruise Duration."
            },
            {
                "icon": "fa-solid fa-fish",
                "text": "Equipped with Deep-Sea Fishing Gear."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Onboard Restroom & Shaded Seating."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-users\" style=\"color: var(--navy);\"></i> Al-Ameed Group Boat Packages (12h Weekday / 10h Weekend)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise</span></div>\n            <div class=\"trip-price\"><strong>1,500 Wkday | 1,800 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise</span></div>\n            <div class=\"trip-price\"><strong>1,800 Wkday | 2,100 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Fishing & Bayadah Combo</span></div>\n            <div class=\"trip-price\"><strong>1,950 Wkday | 2,250 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Only</span></div>\n            <div class=\"trip-price\"><strong>1,800 Wkday | 2,100 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Obhur Creek Sightseeing Tour</span></div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/العميد/1.webp",
                "alt": "Al-Ameed Large Boat - Photo 1"
            },
            {
                "src": "images/العميد/2.webp",
                "alt": "Al-Ameed Large Boat - Photo 2"
            },
            {
                "src": "images/العميد/3.webp",
                "alt": "Al-Ameed Large Boat - Photo 3"
            }
        ],
        "detailLink": "boats/al-ameed.html",
        "calcVessel": "al-ameed",
        "depositPolicy": "Deposit: 200 SAR weekday / 300 SAR weekend, remaining balance paid upon boarding."
    },
    "norseen-large": {
        "key": "norseen-large",
        "name": "Norseen Large Boat",
        "catTag": "Large Cruiser",
        "badge": "Huge Capacity & Power",
        "capacity": "Up to 19 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Extra-Large Capacity for Families",
        "featureIcon": "fa-solid fa-users",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "500 SAR / hr",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,800 Wkday | 2,000 Wkend",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair or Fishing",
                "val": "2,100 Wkday | 2,300 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Extra-large vessel designed for corporate events, big family gatherings, and large group swimming trips."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-users",
                "text": "Huge Capacity: Accommodates up to 19 passengers comfortably."
            },
            {
                "icon": "fa-solid fa-shield-halved",
                "text": "Comprehensive safety gear and life jackets for all."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "High-power Bluetooth sound system."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-users\" style=\"color: var(--navy);\"></i> Norseen Large Boat Packages & Rates (Up to 19 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,800 Wkday | 2,000 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,100 Wkday | 2,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>2,100 Wkday | 2,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing (10 / 12 Hours)</span></div>\n            <div class=\"trip-price\"><strong>10h: 2,300/2,500 | 12h: 2,500/2,700 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Obhur Creek Sightseeing Tour</span></div>\n            <div class=\"trip-price\"><strong>500 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/قارب نورسين الكبير/1.webp",
                "alt": "Norseen Large Boat - Photo 1"
            },
            {
                "src": "images/قارب نورسين الكبير/2.webp",
                "alt": "Norseen Large Boat - Photo 2"
            },
            {
                "src": "images/قارب نورسين الكبير/3.webp",
                "alt": "Norseen Large Boat - Photo 3"
            },
            {
                "src": "images/قارب نورسين الكبير/4.webp",
                "alt": "Norseen Large Boat - Photo 4"
            },
            {
                "src": "images/قارب نورسين الكبير/5.webp",
                "alt": "Norseen Large Boat - Photo 5"
            }
        ],
        "detailLink": "boats/norseen-large.html",
        "calcVessel": "norseen-large",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "large-yacht": {
        "key": "large-yacht",
        "name": "Royal Large Yacht",
        "catTag": "Grand VIP Yacht",
        "badge": "Royal Luxury",
        "capacity": "Up to 35 Guests (45 in Creek)",
        "marina": "Red Sea Marina",
        "keyFeature": "Royal Luxury for Events & Parties",
        "featureIcon": "fa-solid fa-champagne-glasses",
        "pricingRows": [
            {
                "label": "Creek Cruise (Hourly)",
                "val": "2,000 Wkday | 2,200 Wkend",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (Hourly)",
                "val": "2,000 Wkday | 2,200 Wkend",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (Hourly)",
                "val": "2,300 Wkday | 2,500 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Grand royal yacht fully outfitted for weddings, birthdays, corporate celebrations, and luxury VIP island cruises."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-crown",
                "text": "Royal Elegance: Multi-deck luxury layout with grand salon."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Event audio-visual system and party lighting."
            },
            {
                "icon": "fa-solid fa-clock",
                "text": "Minimum booking duration: 2 hours."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-champagne-glasses\" style=\"color: var(--gold);\"></i> Royal Large Yacht Hourly Rates (Min 2 Hours Booking)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Grand Cruise</span>\n                <small class=\"weekend-note\">Up to 45 guests permitted in Creek tours</small>\n            </div>\n            <div class=\"trip-price\"><strong>2,000 Wkday | 2,200 Wkend (Hourly)</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Bayadah Island Grand Cruise</span>\n                <small class=\"weekend-note\">Up to 35 guests permitted for island cruise</small>\n            </div>\n            <div class=\"trip-price\"><strong>2,000 Wkday | 2,200 Wkend (Hourly)</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Abu Tair Island Grand Cruise</span>\n                <small class=\"weekend-note\">+300 SAR flat fuel surcharge per trip</small>\n            </div>\n            <div class=\"trip-price\"><strong>2,300 Wkday | 2,500 Wkend (Hourly)</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/اليخت الفاخر/Main Yakht.webp",
                "alt": "Royal Large Yacht - Photo 1"
            },
            {
                "src": "images/اليخت الفاخر/111111111111.webp",
                "alt": "Royal Large Yacht - Photo 2"
            },
            {
                "src": "images/اليخت الفاخر/2.webp",
                "alt": "Royal Large Yacht - Photo 3"
            },
            {
                "src": "images/اليخت الفاخر/3.webp",
                "alt": "Royal Large Yacht - Photo 4"
            },
            {
                "src": "images/اليخت الفاخر/333333333333.webp",
                "alt": "Royal Large Yacht - Photo 5"
            },
            {
                "src": "images/اليخت الفاخر/4.webp",
                "alt": "Royal Large Yacht - Photo 6"
            },
            {
                "src": "images/اليخت الفاخر/5.webp",
                "alt": "Royal Large Yacht - Photo 7"
            },
            {
                "src": "images/اليخت الفاخر/6.webp",
                "alt": "Royal Large Yacht - Photo 8"
            },
            {
                "src": "images/اليخت الفاخر/7.webp",
                "alt": "Royal Large Yacht - Photo 9"
            },
            {
                "src": "images/اليخت الفاخر/8.webp",
                "alt": "Royal Large Yacht - Photo 10"
            }
        ],
        "detailLink": "boats/large-yacht.html",
        "calcVessel": "large-yacht",
        "depositPolicy": "Deposit required: 50% of total cruise cost, remaining balance paid upon boarding."
    },
    "seven-1": {
        "key": "seven-1",
        "name": "Seven 1 Boat (10 Meters)",
        "catTag": "Cruising & Fishing",
        "badge": "Seven 1",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Full Canopy, Shower & Sound System",
        "featureIcon": "fa-solid fa-music",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Comfortable cruising and fishing boat equipped with marine restroom, fresh water shower, sound system, and swim gear."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-restroom",
                "text": "Marine restroom and fresh water shower."
            },
            {
                "icon": "fa-solid fa-umbrella",
                "text": "Full sun shade canopy and comfortable seating."
            },
            {
                "icon": "fa-solid fa-life-ring",
                "text": "Full snorkeling goggles and life jackets."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين/1.webp",
                "alt": "Seven 1 Boat (10 Meters) - Photo 1"
            }
        ],
        "detailLink": "boats/seven-1.html",
        "calcVessel": "seven-boat",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "seven-2": {
        "key": "seven-2",
        "name": "Seven 2 Boat",
        "catTag": "Cruising & Fishing",
        "badge": "Seven 2",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Comfortable Seating & Swim Gear",
        "featureIcon": "fa-solid fa-life-ring",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Reliable, fast, and comfortable boat perfect for family swimming trips in Bayadah or relaxing tours in Obhur Creek."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-couch",
                "text": "Comfortable family seating with full shade."
            },
            {
                "icon": "fa-solid fa-shower",
                "text": "Restroom and fresh water shower."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Bluetooth sound system."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين 2/1.webp",
                "alt": "Seven 2 Boat - Photo 1"
            },
            {
                "src": "images/سيفين 2/WhatsApp Image 2026-07-11 at 8.42.01 PM.webp",
                "alt": "Seven 2 Boat - Photo 2"
            },
            {
                "src": "images/سيفين 2/بيس.webp",
                "alt": "Seven 2 Boat - Photo 3"
            }
        ],
        "detailLink": "boats/seven-2.html",
        "calcVessel": "seven-boat-2",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "seven-3": {
        "key": "seven-3",
        "name": "Seven 3 Boat",
        "catTag": "Cruising & Fishing",
        "badge": "Seven 3",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Swimming, Bayadah & Fishing Trips",
        "featureIcon": "fa-solid fa-water",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "High-performance boat piloted by an experienced captain, providing enjoyable swimming, fishing, and sightseeing trips."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-fish",
                "text": "Equipped for fishing and Bayadah swimming."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Marine restroom & freshwater shower."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Bluetooth stereo."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/سيفين 3/1.webp",
                "alt": "Seven 3 Boat - Photo 1"
            },
            {
                "src": "images/سيفين 3/WhatsApp Image 2026-07-11 at 8.42.13 PM.webp",
                "alt": "Seven 3 Boat - Photo 2"
            }
        ],
        "detailLink": "boats/seven-3.html",
        "calcVessel": "seven-boat-3",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "shaheen": {
        "key": "shaheen",
        "name": "Shaheen Boat",
        "catTag": "Cruising & Fishing",
        "badge": "Shaheen",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Fast, Stable & Full Safety Equipment",
        "featureIcon": "fa-solid fa-gauge-high",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Fast and stable boat with full sun canopy, high safety standards, and excellent maneuverability in open waters."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-gauge-high",
                "text": "High speed and stability."
            },
            {
                "icon": "fa-solid fa-shower",
                "text": "Restroom and fresh water shower."
            },
            {
                "icon": "fa-solid fa-life-ring",
                "text": "Full safety equipment."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/شاهين/1.webp",
                "alt": "Shaheen Boat - Photo 1"
            },
            {
                "src": "images/شاهين/2.webp",
                "alt": "Shaheen Boat - Photo 2"
            },
            {
                "src": "images/شاهين/3.webp",
                "alt": "Shaheen Boat - Photo 3"
            },
            {
                "src": "images/شاهين/4.webp",
                "alt": "Shaheen Boat - Photo 4"
            }
        ],
        "detailLink": "boats/shaheen.html",
        "calcVessel": "shaheen",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "bahr": {
        "key": "bahr",
        "name": "Bahr Boat",
        "catTag": "Cruising & Fishing",
        "badge": "Bahr",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Family Privacy & Fresh Water Shower",
        "featureIcon": "fa-solid fa-shower",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Spacious and cozy family boat offering shaded lounges, onboard restroom, freshwater shower, and snorkeling equipment."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-shower",
                "text": "Fresh water shower & restroom."
            },
            {
                "icon": "fa-solid fa-umbrella",
                "text": "Full shade canopy."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Bluetooth music system."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/بحر/1.webp",
                "alt": "Bahr Boat - Photo 1"
            },
            {
                "src": "images/بحر/2.webp",
                "alt": "Bahr Boat - Photo 2"
            },
            {
                "src": "images/بحر/3.webp",
                "alt": "Bahr Boat - Photo 3"
            },
            {
                "src": "images/بحر/4.webp",
                "alt": "Bahr Boat - Photo 4"
            },
            {
                "src": "images/بحر/5.webp",
                "alt": "Bahr Boat - Photo 5"
            },
            {
                "src": "images/بحر/6.webp",
                "alt": "Bahr Boat - Photo 6"
            },
            {
                "src": "images/بحر/7.webp",
                "alt": "Bahr Boat - Photo 7"
            }
        ],
        "detailLink": "boats/bahr.html",
        "calcVessel": "bahr",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "al-noor-al-azraq": {
        "key": "al-noor-al-azraq",
        "name": "Al-Noor Al-Azraq Boat",
        "catTag": "Cruising & Fishing",
        "badge": "Blue Light",
        "capacity": "Up to 9 Guests",
        "marina": "Red Sea Marina",
        "keyFeature": "Night Illumination & Creek Tours",
        "featureIcon": "fa-solid fa-moon",
        "pricingRows": [
            {
                "label": "Creek Cruise",
                "val": "350 SAR / hr (200 half hr)",
                "icon": "fa-solid fa-ship"
            },
            {
                "label": "Bayadah Island (6h)",
                "val": "1,300 SAR",
                "icon": "fa-solid fa-umbrella-beach"
            },
            {
                "label": "Abu Tair Island (6h)",
                "val": "1,600 SAR",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Charming boat with atmospheric nighttime lighting, sound system, and comfortable seating for scenic Obhur evening cruises."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-moon",
                "text": "Special night illumination."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "Bluetooth sound system."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Restroom and shower."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-anchor\" style=\"color: var(--ocean);\"></i> Cruise Packages & Rates (Covers up to 6 Guests)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Bayadah Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (6 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Deep-Sea Fishing Trips (6 / 8 / 10 / 12 Hours)</span>\n                <small class=\"weekend-note\">6h: 1,400 | 8h: 1,600 | 10h: 1,800 | 12h: 2,000 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>Starts from 1,400 SAR</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Obhur Creek Sightseeing Tour</span>\n                <small class=\"weekend-note\">Half hour 200 SAR | Full hour 350 SAR</small>\n            </div>\n            <div class=\"trip-price\"><strong>350 SAR / hr</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/النور الازرق/1.webp",
                "alt": "Al-Noor Al-Azraq Boat - Photo 1"
            },
            {
                "src": "images/النور الازرق/2.webp",
                "alt": "Al-Noor Al-Azraq Boat - Photo 2"
            }
        ],
        "detailLink": "boats/al-noor-al-azraq.html",
        "calcVessel": "al-noor-al-azraq",
        "depositPolicy": "Fixed deposit: 300 SAR to confirm booking, remaining balance paid upon boarding."
    },
    "jaguar": {
        "key": "jaguar",
        "name": "Jaguar Boat (South Jeddah)",
        "catTag": "Southern Marinas",
        "badge": "South Jeddah | Jaguar",
        "capacity": "Up to 8 Guests",
        "marina": "Southern Marinas (Qatouf / Al-Andalus)",
        "keyFeature": "Specialized Deep-Sea Fishing",
        "featureIcon": "fa-solid fa-fish",
        "pricingRows": [
            {
                "label": "Fishing Trip (8h)",
                "val": "1,200 Wkday | 1,300 Wkend",
                "icon": "fa-solid fa-fish"
            },
            {
                "label": "Fishing Trip (10h)",
                "val": "1,300 Wkday | 1,400 Wkend",
                "icon": "fa-solid fa-fish-fins"
            },
            {
                "label": "Fishing Trip (12h)",
                "val": "1,500 Wkday | 1,600 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Equipped deep-sea fishing vessel in South Jeddah with live bait tank, advanced fishfinder GPS, and tackle."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-fish",
                "text": "Live bait tank and fishing tackle included."
            },
            {
                "icon": "fa-solid fa-compass",
                "text": "GPS fishfinder and veteran captain."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Restroom and shaded deck."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-fish\" style=\"color: var(--gold);\"></i> Southern Deep-Sea Fishing Rates (Includes Bait & Tackle)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,200 Wkday | 1,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (10 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 Wkday | 1,400 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (12 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,500 Wkday | 1,600 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/جاكور/1.webp",
                "alt": "Jaguar Boat (South Jeddah) - Photo 1"
            },
            {
                "src": "images/جاكور/2.webp",
                "alt": "Jaguar Boat (South Jeddah) - Photo 2"
            }
        ],
        "detailLink": "boats/jaguar.html",
        "calcVessel": "jaguar",
        "depositPolicy": "Deposit: 300 SAR (8h/10h) or 400 SAR (12h), remaining balance paid upon boarding."
    },
    "ghazal-obhur": {
        "key": "ghazal-obhur",
        "name": "Ghazal Obhur Boat (South Jeddah)",
        "catTag": "Southern Marinas",
        "badge": "South Jeddah | Ghazal",
        "capacity": "Up to 8 Guests",
        "marina": "Southern Marinas",
        "keyFeature": "Proven Deep Coral Fishing Spots",
        "featureIcon": "fa-solid fa-anchor",
        "pricingRows": [
            {
                "label": "Fishing Trip (8h)",
                "val": "1,200 Wkday | 1,300 Wkend",
                "icon": "fa-solid fa-fish"
            },
            {
                "label": "Fishing Trip (10h)",
                "val": "1,300 Wkday | 1,400 Wkend",
                "icon": "fa-solid fa-fish-fins"
            },
            {
                "label": "Fishing Trip (12h)",
                "val": "1,500 Wkday | 1,600 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Fast fishing boat departing from southern marinas to premier fishing grounds and coral reefs in the Red Sea."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-fish",
                "text": "Tackle and live bait provided."
            },
            {
                "icon": "fa-solid fa-anchor",
                "text": "Visits to prime deep coral reef spots."
            },
            {
                "icon": "fa-solid fa-life-ring",
                "text": "Full safety gear."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-fish\" style=\"color: var(--gold);\"></i> Southern Deep-Sea Fishing Rates (Includes Bait & Tackle)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,200 Wkday | 1,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (10 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 Wkday | 1,400 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (12 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,500 Wkday | 1,600 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/غزال ابحر/1.webp",
                "alt": "Ghazal Obhur Boat (South Jeddah) - Photo 1"
            },
            {
                "src": "images/غزال ابحر/2.webp",
                "alt": "Ghazal Obhur Boat (South Jeddah) - Photo 2"
            }
        ],
        "detailLink": "boats/ghazal-obhur.html",
        "calcVessel": "ghazal-obhur",
        "depositPolicy": "Deposit: 300 SAR (8h/10h) or 400 SAR (12h), remaining balance paid upon boarding."
    },
    "bin-shuraiq": {
        "key": "bin-shuraiq",
        "name": "Bin Shuraiq Boat (South Jeddah)",
        "catTag": "Southern Marinas",
        "badge": "South Jeddah | Bin Shuraiq",
        "capacity": "Up to 8 Guests",
        "marina": "Southern Marinas",
        "keyFeature": "Veteran Captain in Deep Waters",
        "featureIcon": "fa-solid fa-compass",
        "pricingRows": [
            {
                "label": "Fishing Trip (8h)",
                "val": "1,200 Wkday | 1,300 Wkend",
                "icon": "fa-solid fa-fish"
            },
            {
                "label": "Fishing Trip (10h)",
                "val": "1,300 Wkday | 1,400 Wkend",
                "icon": "fa-solid fa-fish-fins"
            },
            {
                "label": "Fishing Trip (12h)",
                "val": "1,500 Wkday | 1,600 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Top-equipped vessel for plentiful catches and island visits with an experienced local captain who knows the sea intimately."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-fish",
                "text": "Fishing gear and live bait tank."
            },
            {
                "icon": "fa-solid fa-compass",
                "text": "Expert local captain."
            },
            {
                "icon": "fa-solid fa-restroom",
                "text": "Marine toilet on board."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-fish\" style=\"color: var(--gold);\"></i> Southern Deep-Sea Fishing Rates (Includes Bait & Tackle)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,200 Wkday | 1,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (10 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 Wkday | 1,400 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (12 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,500 Wkday | 1,600 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/بن شريق/1.webp",
                "alt": "Bin Shuraiq Boat (South Jeddah) - Photo 1"
            },
            {
                "src": "images/بن شريق/2.webp",
                "alt": "Bin Shuraiq Boat (South Jeddah) - Photo 2"
            }
        ],
        "detailLink": "boats/bin-shuraiq.html",
        "calcVessel": "bin-shuraiq",
        "depositPolicy": "Deposit: 300 SAR (8h/10h) or 400 SAR (12h), remaining balance paid upon boarding."
    },
    "shawq-al-layl": {
        "key": "shawq-al-layl",
        "name": "Shawq Al-Layl Boat (South Jeddah)",
        "catTag": "Southern Marinas",
        "badge": "South Jeddah | Shawq Al-Layl",
        "capacity": "Up to 8 Guests",
        "marina": "Southern Marinas",
        "keyFeature": "Night Fishing & Island Adventures",
        "featureIcon": "fa-solid fa-cloud-moon",
        "pricingRows": [
            {
                "label": "Fishing Trip (8h)",
                "val": "1,200 Wkday | 1,300 Wkend",
                "icon": "fa-solid fa-fish"
            },
            {
                "label": "Fishing Trip (10h)",
                "val": "1,300 Wkday | 1,400 Wkend",
                "icon": "fa-solid fa-fish-fins"
            },
            {
                "label": "Fishing Trip (12h)",
                "val": "1,500 Wkday | 1,600 Wkend",
                "icon": "fa-solid fa-compass"
            }
        ],
        "descriptions": [
            "Specialized in night fishing adventures and southern island excursions with modern safety equipment and full gear."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-moon",
                "text": "Night fishing lighting and tackle."
            },
            {
                "icon": "fa-solid fa-fish",
                "text": "Live bait tank."
            },
            {
                "icon": "fa-solid fa-shield-halved",
                "text": "Complete safety gear."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-fish\" style=\"color: var(--gold);\"></i> Southern Deep-Sea Fishing Rates (Includes Bait & Tackle)</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,200 Wkday | 1,300 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (10 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,300 Wkday | 1,400 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Deep-Sea Fishing Trip (12 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,500 Wkday | 1,600 Wkend</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\"><span class=\"trip-name\">Abu Tair Island Cruise (8 Hours)</span></div>\n            <div class=\"trip-price\"><strong>1,600 SAR</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/شوق الليل/1.webp",
                "alt": "Shawq Al-Layl Boat (South Jeddah) - Photo 1"
            },
            {
                "src": "images/شوق الليل/2.webp",
                "alt": "Shawq Al-Layl Boat (South Jeddah) - Photo 2"
            }
        ],
        "detailLink": "boats/shawq-al-layl.html",
        "calcVessel": "shawq-al-layl",
        "depositPolicy": "Deposit: 300 SAR (8h/10h) or 400 SAR (12h), remaining balance paid upon boarding."
    },
    "individual": {
        "key": "individual",
        "name": "Shared Individual Seat Trips",
        "catTag": "Group Sharing",
        "badge": "Single Seat Bookings",
        "capacity": "Single Seats (Families & Singles)",
        "marina": "Red Sea Marina",
        "keyFeature": "Sea Pool, DJ, Snacks & Hospitality",
        "featureIcon": "fa-solid fa-person-swimming",
        "pricingRows": [
            {
                "label": "Economy Seat",
                "val": "250 SAR / person",
                "icon": "fa-solid fa-ticket"
            },
            {
                "label": "VIP Seat",
                "val": "300 SAR / person",
                "icon": "fa-solid fa-crown"
            },
            {
                "label": "VVIP Luxury Seat",
                "val": "320 SAR / person",
                "icon": "fa-solid fa-gem"
            }
        ],
        "descriptions": [
            "Join exciting group trips to Bayadah or deep-sea fishing. Book your individual seat and meet new sea lovers with full hospitality and DJ music."
        ],
        "specs": [
            {
                "icon": "fa-solid fa-person-swimming",
                "text": "Floating ocean swimming pool."
            },
            {
                "icon": "fa-solid fa-music",
                "text": "DJ music and entertainment."
            },
            {
                "icon": "fa-solid fa-cookie-bite",
                "text": "Complimentary snacks and drinks."
            }
        ],
        "packagesHtml": "<h4 class=\"box-title\"><i class=\"fa-solid fa-ticket\" style=\"color: var(--ocean);\"></i> Shared Individual Seat Packages</h4>\n        <div class=\"trip-price-item\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\">Economy Package (Single Seat)</span>\n                <small class=\"weekend-note\">Shared swimming or fishing trip, life jacket, and soft drinks</small>\n            </div>\n            <div class=\"trip-price\"><strong>250 SAR / person</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"color: var(--gold-dark, #b8860b);\">VIP Package (Single Seat)</span>\n                <small class=\"weekend-note\">Bayadah swimming, snacks, water games, and DJ entertainment</small>\n            </div>\n            <div class=\"trip-price\"><strong>300 SAR / person</strong></div>\n        </div>\n        <div class=\"trip-price-item border-top-dash\">\n            <div class=\"trip-info\">\n                <span class=\"trip-name\" style=\"color: var(--ocean-dark);\">VVIP Luxury Package (Single Seat)</span>\n                <small class=\"weekend-note\">Premium seating, floating ocean pool, photography, and luxury hospitality</small>\n            </div>\n            <div class=\"trip-price\"><strong>320 SAR / person</strong></div>\n        </div>",
        "pdfLinks": [],
        "images": [
            {
                "src": "images/boat51.webp",
                "alt": "Shared Individual Seat Trips - Photo 1"
            },
            {
                "src": "images/boat52.webp",
                "alt": "Shared Individual Seat Trips - Photo 2"
            },
            {
                "src": "images/بارباروسا/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 3"
            },
            {
                "src": "images/بارباروسا/5.webp",
                "alt": "Shared Individual Seat Trips - Photo 4"
            },
            {
                "src": "images/بارباروسا/8.webp",
                "alt": "Shared Individual Seat Trips - Photo 5"
            },
            {
                "src": "images/يخت بينتوس/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 6"
            },
            {
                "src": "images/يخت بينتوس/2.webp",
                "alt": "Shared Individual Seat Trips - Photo 7"
            },
            {
                "src": "images/اليخت الفاخر/Main Yakht.webp",
                "alt": "Shared Individual Seat Trips - Photo 8"
            },
            {
                "src": "images/اليخت الفاخر/2.webp",
                "alt": "Shared Individual Seat Trips - Photo 9"
            },
            {
                "src": "images/امباسودر 36 اريا/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 10"
            },
            {
                "src": "images/اوراكس 40 قدم/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 11"
            },
            {
                "src": "images/الجوهري/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 12"
            },
            {
                "src": "images/الجوهري/8.webp",
                "alt": "Shared Individual Seat Trips - Photo 13"
            },
            {
                "src": "images/العميد/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 14"
            },
            {
                "src": "images/العميد/2.webp",
                "alt": "Shared Individual Seat Trips - Photo 15"
            },
            {
                "src": "images/قارب نورسين الكبير/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 16"
            },
            {
                "src": "images/قارب نورسين الكبير/2.webp",
                "alt": "Shared Individual Seat Trips - Photo 17"
            },
            {
                "src": "images/قمة الفوز/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 18"
            },
            {
                "src": "images/سيفين/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 19"
            },
            {
                "src": "images/سيفين 2/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 20"
            },
            {
                "src": "images/سيفين 3/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 21"
            },
            {
                "src": "images/شاهين/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 22"
            },
            {
                "src": "images/بحر/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 23"
            },
            {
                "src": "images/النور الازرق/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 24"
            },
            {
                "src": "images/جاكور/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 25"
            },
            {
                "src": "images/غزال ابحر/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 26"
            },
            {
                "src": "images/بن شريق/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 27"
            },
            {
                "src": "images/شوق الليل/1.webp",
                "alt": "Shared Individual Seat Trips - Photo 28"
            },
            {
                "src": "images/boat51.webp",
                "alt": "Shared Individual Seat Trips - Photo 29"
            },
            {
                "src": "images/boat52.webp",
                "alt": "Shared Individual Seat Trips - Photo 30"
            },
            {
                "src": "images/logo.webp",
                "alt": "Shared Individual Seat Trips - Photo 31"
            }
        ],
        "detailLink": "boats/individual-trips.html",
        "calcVessel": "individual",
        "depositPolicy": "Full ticket price paid upon booking to secure your reserved individual seat."
    }
};

let currentModalBoatKey = null;
let currentModalSlideIdx = 0;
let modalSlideCount = 0;

function openBoatDetailsModal(boatKey) {
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const dataSet = isEn ? fleetDetailsDataEn : fleetDetailsData;
    const boat = dataSet[boatKey] || fleetDetailsData[boatKey];
    if (!boat) {
        console.warn('Boat data not found for:', boatKey);
        return;
    }

    currentModalBoatKey = boatKey;
    const modal = document.getElementById('boatDetailsModal');
    if (!modal) return;

    // 1. Header elements
    const titleEl = document.getElementById('modalBoatTitle');
    const catEl = document.getElementById('modalBoatCat');
    const capEl = document.getElementById('modalBoatCapacity');
    const marinaEl = document.getElementById('modalBoatMarina');

    if (titleEl) titleEl.textContent = boat.name;
    if (catEl) catEl.textContent = boat.catTag;
    if (capEl) capEl.innerHTML = '<i class="fa-solid fa-users"></i> <span>' + boat.capacity + '</span>';
    if (marinaEl) marinaEl.innerHTML = '<i class="fa-solid fa-location-dot"></i> <span>' + boat.marina + '</span>';

    // 2. Images Gallery Slider & Thumbnails
    const slidesContainer = document.getElementById('modalSlidesContainer');
    const thumbStrip = document.getElementById('modalThumbnailsStrip');
    if (slidesContainer) {
        slidesContainer.innerHTML = '';
        currentModalSlideIdx = 0;
        modalSlideCount = boat.images.length;

        boat.images.forEach((img, idx) => {
            const imgEl = document.createElement('img');
            imgEl.className = 'slide' + (idx === 0 ? ' active' : '');
            let imgSrc = img.src;
            if (isEn && !imgSrc.startsWith('../') && !imgSrc.startsWith('http')) {
                imgSrc = '../' + imgSrc;
            }
            imgEl.src = imgSrc;
            imgEl.alt = img.alt || boat.name;
            imgEl.decoding = 'async';
            imgEl.width = 600;
            imgEl.height = 375;
            if (idx === 0) {
                imgEl.setAttribute('fetchpriority', 'high');
            } else {
                imgEl.loading = 'lazy';
            }
            slidesContainer.appendChild(imgEl);
        });

        // Setup Prev/Next buttons and Counter in modalSlider
        const modalSlider = document.getElementById('modalSlider');
        if (modalSlider) {
            modalSlider.querySelectorAll('.slider-btn, .slider-counter').forEach(el => el.remove());

            if (modalSlideCount > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.type = 'button';
                prevBtn.className = 'slider-btn prev-btn';
                prevBtn.setAttribute('aria-label', isEn ? 'Previous Image' : 'الصورة السابقة');
                prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
                prevBtn.onclick = (e) => { e.stopPropagation(); switchModalSlide((currentModalSlideIdx - 1 + modalSlideCount) % modalSlideCount); };
                modalSlider.appendChild(prevBtn);

                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.className = 'slider-btn next-btn';
                nextBtn.setAttribute('aria-label', isEn ? 'Next Image' : 'الصورة التالية');
                nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
                nextBtn.onclick = (e) => { e.stopPropagation(); switchModalSlide((currentModalSlideIdx + 1) % modalSlideCount); };
                modalSlider.appendChild(nextBtn);

                const counter = document.createElement('div');
                counter.className = 'slider-counter';
                counter.id = 'modalSliderCounter';
                counter.textContent = '1 / ' + modalSlideCount;
                modalSlider.appendChild(counter);

                // Touch Swipe Support on Modal Slider
                let modalTouchStartX = 0;
                let modalTouchStartY = 0;
                modalSlider.ontouchstart = (e) => {
                    if (e.touches && e.touches.length > 0) {
                        modalTouchStartX = e.touches[0].clientX;
                        modalTouchStartY = e.touches[0].clientY;
                    }
                };
                modalSlider.ontouchend = (e) => {
                    if (e.changedTouches && e.changedTouches.length > 0) {
                        const diffX = e.changedTouches[0].clientX - modalTouchStartX;
                        const diffY = e.changedTouches[0].clientY - modalTouchStartY;
                        if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
                            if (diffX < 0) {
                                switchModalSlide((currentModalSlideIdx + 1) % modalSlideCount);
                            } else {
                                switchModalSlide((currentModalSlideIdx - 1 + modalSlideCount) % modalSlideCount);
                            }
                        }
                    }
                };
            }
        }
    }

    if (thumbStrip) {
        thumbStrip.innerHTML = '';
        if (boat.images.length > 1) {
            thumbStrip.style.display = 'flex';
            boat.images.forEach((img, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'modal-thumb' + (idx === 0 ? ' active' : '');
                let thumbSrc = img.src;
                if (isEn && !thumbSrc.startsWith('../') && !thumbSrc.startsWith('http')) {
                    thumbSrc = '../' + thumbSrc;
                }
                thumb.innerHTML = '<img src="' + thumbSrc + '" alt="" loading="lazy">';
                thumb.onclick = () => switchModalSlide(idx);
                thumbStrip.appendChild(thumb);
            });
        } else {
            thumbStrip.style.display = 'none';
        }
    }

    // 3. Descriptions
    const descEl = document.getElementById('modalDescriptions');
    if (descEl) {
        if (boat.descriptions && boat.descriptions.length > 0) {
            descEl.innerHTML = boat.descriptions.map(d => '<p>' + d + '</p>').join('');
        } else {
            descEl.innerHTML = isEn
                ? '<p>' + boat.name + ' — Top-rated marine cruise experience in Jeddah with professional crew and 5-star service.</p>'
                : '<p>' + boat.name + ' — أفضل تجربة إبحار متكاملة بجدة مع طاقم محترف وخدمة 5 نجوم.</p>';
        }
    }

    // 4. Packages & Pricing
    const pkgEl = document.getElementById('modalPackagesWrapper');
    if (pkgEl) {
        pkgEl.innerHTML = boat.packagesHtml || (isEn ? '<p class="no-packages">Please contact us for customized cruise packages.</p>' : '<p class="no-packages">يرجى التواصل لتحديد الباقة المناسبة.</p>');
    }

    // 5. Specs & Amenities
    const specsEl = document.getElementById('modalSpecsGrid');
    if (specsEl) {
        if (boat.specs && boat.specs.length > 0) {
            specsEl.innerHTML = boat.specs.map(s => '<li><i class="' + s.icon + '"></i><span>' + s.text + '</span></li>').join('');
        } else {
            specsEl.innerHTML = isEn
                ? '<li><i class="fa-solid fa-circle-check"></i><span>Full safety gear and life jackets available onboard</span></li>'
                : '<li><i class="fa-solid fa-circle-check"></i><span>معدات السلامة وسترات النجاة متوفرة بالكامل</span></li>';
        }
    }

    // 6. PDF Downloads
    const pdfCard = document.getElementById('modalPdfCard');
    const pdfActions = document.getElementById('modalPdfActions');
    if (pdfCard && pdfActions) {
        if (boat.pdfLinks && boat.pdfLinks.length > 0) {
            pdfCard.style.display = 'block';
            pdfActions.innerHTML = boat.pdfLinks.map(pdf => {
                let pdfUrl = pdf.url;
                if (isEn && !pdfUrl.startsWith('../') && !pdfUrl.startsWith('http')) {
                    pdfUrl = '../' + pdfUrl;
                }
                return '<a href="' + pdfUrl + '" target="_blank" download="' + (pdf.filename || '') + '" class="modal-pdf-btn"><i class="fa-solid fa-file-pdf"></i> <span>' + pdf.label + '</span></a>';
            }).join('');
        } else {
            pdfCard.style.display = 'none';
            pdfActions.innerHTML = '';
        }
    }

    // 7. Deposit Policy
    const depositEl = document.getElementById('modalDepositPolicy');
    if (depositEl) {
        depositEl.textContent = boat.depositPolicy;
    }

    // 8. Sticky Action Buttons
    const calcBtn = document.getElementById('modalCalcActionBtn');
    if (calcBtn) {
        calcBtn.innerHTML = isEn
            ? '<i class="fa-solid fa-calculator"></i> <span>Calculate & Book</span>'
            : '<i class="fa-solid fa-calculator"></i> <span>احسب واحجز بالحاسبة</span>';
    }

    const waBtn = document.getElementById('modalWhatsAppActionBtn');
    if (waBtn) {
        waBtn.innerHTML = isEn
            ? '<i class="fa-brands fa-whatsapp"></i> <span>Instant WhatsApp Booking</span>'
            : '<i class="fa-brands fa-whatsapp"></i> <span>حجز فوري عبر واتساب</span>';
        const phone = '966568390147';
        const msg = isEn
            ? 'Hello, I would like to inquire and book ' + boat.name + ' with Orca Marine Trips.'
            : 'السلام عليكم، أود الاستفسار وحجز ' + boat.name + ' مع أوركا للرحلات البحرية.';
        waBtn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg);
    }

    const shareBtn = document.getElementById('modalShareActionBtn');
    if (shareBtn) {
        shareBtn.title = isEn ? 'Share Boat Link' : 'مشاركة رابط القارب';
        shareBtn.setAttribute('aria-label', isEn ? 'Share Boat Link' : 'مشاركة رابط القارب');
    }

    // Update Direct Boat Page Link
    const boatPageMap = {
        'barbaros': 'barbaros.html',
        'pentos': 'Beneteau.html',
        'qimat-al-fawz': 'qimat-al-fawz.html',
        'nardo': 'nardo.html',
        'tam': 'tam.html',
        'baby-ambassador': 'baby-ambassador.html',
        'baby-orax-40': 'baby-orax-40.html',
        'baby-al-jawhari': 'al-jawhari.html',
        'al-ameed': 'al-ameed.html',
        'norseen-large': 'norseen-large.html',
        'large-yacht': 'large-yacht.html',
        'seven-1': 'seven-1.html',
        'seven-2': 'seven-2.html',
        'seven-3': 'seven-3.html',
        'shaheen': 'shaheen.html',
        'bahr': 'bahr.html',
        'al-noor-al-azraq': 'al-noor-al-azraq.html',
        'jaguar': 'jaguar.html',
        'ghazal-obhur': 'ghazal-obhur.html',
        'bin-shuraiq': 'bin-shuraiq.html',
        'shawq-al-layl': 'shawq-al-layl.html',
        'individual': 'individual-trips.html'
    };
    const targetFile = boatPageMap[boatKey] || (boatKey + '.html');
    const targetUrl = 'boats/' + targetFile;
    const directPageBtn = document.getElementById('modalDirectBoatPageBtn');
    if (directPageBtn) {
        directPageBtn.href = targetUrl;
        directPageBtn.title = isEn ? 'Open dedicated boat page' : 'الانتقال إلى صفحة القارب المستقلة';
    }
    const stickyPageBtn = document.getElementById('modalStickyBoatPageBtn');
    if (stickyPageBtn) {
        stickyPageBtn.href = targetUrl;
        stickyPageBtn.title = isEn ? 'Open dedicated boat page' : 'الانتقال إلى صفحة القارب المستقلة';
    }

    // Show modal & disable background scroll
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset scroll of modal body
    const bodyEl = document.getElementById('modalSheetBody');
    if (bodyEl) bodyEl.scrollTop = 0;
}

function switchModalSlide(idx) {
    currentModalSlideIdx = idx;
    const slides = document.querySelectorAll('#modalSlidesContainer .slide');
    const thumbs = document.querySelectorAll('#modalThumbnailsStrip .modal-thumb');
    const counter = document.getElementById('modalSliderCounter');

    slides.forEach((s, i) => {
        if (i === idx) s.classList.add('active');
        else s.classList.remove('active');
    });

    thumbs.forEach((t, i) => {
        if (i === idx) {
            t.classList.add('active');
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            t.classList.remove('active');
        }
    });

    if (counter) {
        counter.textContent = (idx + 1) + ' / ' + modalSlideCount;
    }
}

function closeBoatDetailsModal() {
    const modal = document.getElementById('boatDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    // Only reset overflow if calculator modal is not active
    const calcModal = document.getElementById('calculatorModal');
    if (!calcModal || !calcModal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
    currentModalBoatKey = null;
}

function onModalBookCalc() {
    if (!currentModalBoatKey) return;
    const boat = fleetDetailsData[currentModalBoatKey];
    closeBoatDetailsModal();
    if (window.openCalculatorModal) {
        if (boat && boat.calcVessel) {
            window.openCalculatorModal(boat.calcVessel);
        } else if (currentModalBoatKey === 'individual') {
            window.openCalculatorModal(null, null, 'individual');
        } else {
            window.openCalculatorModal();
        }
    }
}

function onModalShare() {
    if (!currentModalBoatKey) return;
    const boat = fleetDetailsData[currentModalBoatKey];
    if (boat) {
        shareBoatDirect(boat.key, boat.detailLink);
    }
}

function shareBoatDirect(boatKey, detailLink) {
    const isEn = document.documentElement.lang === 'en' || window.location.pathname.includes('/en/');
    const dataSet = isEn ? fleetDetailsDataEn : fleetDetailsData;
    const boat = dataSet[boatKey] || fleetDetailsData[boatKey];
    const defaultName = isEn ? 'Orca Marine Boat' : 'قارب أوركا للرحلات البحرية';
    const name = boat ? boat.name : defaultName;
    const relativeUrl = detailLink || ('index.html#package-' + boatKey);
    const fullUrl = new URL(relativeUrl, window.location.href).href;
    doShare(name, fullUrl);
}

// Global modal bindings
window.openBoatDetailsModal = openBoatDetailsModal;
window.closeBoatDetailsModal = closeBoatDetailsModal;
window.switchModalSlide = switchModalSlide;
window.onModalBookCalc = onModalBookCalc;
window.onModalShare = onModalShare;
window.shareBoatDirect = shareBoatDirect;

// Close on backdrop click & Escape key
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('boatDetailsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBoatDetailsModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('boatDetailsModal');
            if (modal && modal.classList.contains('active')) {
                closeBoatDetailsModal();
            }
        }
    });
});
