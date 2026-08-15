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

    // Scroll active link behavior
    const sections = document.querySelectorAll('section');
    const scrollLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        scrollLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

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

        // Dynamically inject prev/next buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn prev-btn';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        slider.appendChild(prevBtn);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn next-btn';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
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

    window.addEventListener('scroll', () => {
        let currentSecId = '';
        categorySections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            if (window.pageYOffset >= secTop) {
                currentSecId = sec.getAttribute('id');
            }
        });

        if (currentSecId) {
            tabBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('href') === `#${currentSecId}`) {
                    btn.classList.add('active');
                }
            });
        }
    });

    // --------------------------------------------------------------------------
    // 3. Dynamic Pricing Calculator & WhatsApp Booking Link Generator
    // --------------------------------------------------------------------------
    
    // Trip options mapping to vessel types
    const tripOptions = {
        'qimat-al-fawz-pentos': [
            { id: 'bayadah-normal', name: 'رحلة بياضة - الباقة العادية (1480 ريال)', basePriceWeekday: 1480, basePriceWeekend: 1480, duration: 6 },
            { id: 'bayadah-silver', name: 'رحلة بياضة - الباقة الفضية شاملة الدونات (1680 ريال)', basePriceWeekday: 1680, basePriceWeekend: 1680, duration: 6 },
            { id: 'bayadah-gold', name: 'رحلة بياضة - الباقة الذهبية شاملة فواكه وموهيتو (1980 ريال)', basePriceWeekday: 1980, basePriceWeekend: 1980, duration: 6 },
            { id: 'bayadah-special', name: 'رحلة بياضة - باقة الاسبيشل VIP شاملة فطائر (2180 ريال)', basePriceWeekday: 2180, basePriceWeekend: 2180, duration: 6 },
            { id: 'abu-tair-normal', name: 'رحلة جزيرة أبو طير - الباقة العادية (1780 ريال)', basePriceWeekday: 1780, basePriceWeekend: 1780, duration: 6 },
            { id: 'abu-tair-silver', name: 'رحلة جزيرة أبو طير - الباقة الفضية شاملة الدونات (1980 ريال)', basePriceWeekday: 1980, basePriceWeekend: 1980, duration: 6 },
            { id: 'abu-tair-gold', name: 'رحلة جزيرة أبو طير - الباقة الذهبية شاملة فواكه وموهيتو (2280 ريال)', basePriceWeekday: 2280, basePriceWeekend: 2280, duration: 6 },
            { id: 'abu-tair-special', name: 'رحلة جزيرة أبو طير - باقة الاسبيشل VIP شاملة فطائر (2480 ريال)', basePriceWeekday: 2480, basePriceWeekend: 2480, duration: 6 },
            { id: 'fishing-6', name: 'رحلة صيد (6 ساعات)', basePriceWeekday: 1580, basePriceWeekend: 1580, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات)', basePriceWeekday: 1780, basePriceWeekend: 1780, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات)', basePriceWeekday: 1980, basePriceWeekend: 1980, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة)', basePriceWeekday: 2180, basePriceWeekend: 2180, duration: 12 },
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
        'al-ameed': [
            { id: 'bayadah', name: 'رحلة بياضة (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1500, basePriceWeekend: 1800, duration: 12 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2100, duration: 12 },
            { id: 'mix', name: 'مكس صيد + بياضة (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1950, basePriceWeekend: 2250, duration: 12 },
            { id: 'fishing', name: 'رحلة صيد فقط (وسط الأسبوع 12 ساعة / الويكند 10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2100, duration: 12 },
            { id: 'creek', name: 'رحلة خور (0.5 – 2 ساعة)', duration: 1 }
        ],
        'seven-boat': [
            { id: 'bayadah', name: 'رحلة بياضة (6 ساعات)', basePriceWeekday: 1300, basePriceWeekend: 1500, duration: 6 },
            { id: 'abu-tair', name: 'رحلة جزيرة أبو طير (6 ساعات)', basePriceWeekday: 1600, basePriceWeekend: 1800, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات)', basePriceWeekday: 1600, basePriceWeekend: 1800, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 2000, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة)', basePriceWeekday: 2000, basePriceWeekend: 2200, duration: 12 },
            { id: 'creek', name: 'رحلة خور (0.5 – 2 ساعة)', duration: 1 }
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
            { id: 'bayadah-normal', name: 'رحلة بياضة - الباقة العادية (1300 ريال)', basePriceWeekday: 1300, basePriceWeekend: 1300, duration: 6 },
            { id: 'bayadah-silver', name: 'رحلة بياضة - الباقة الفضية شاملة الدونات (1500 ريال)', basePriceWeekday: 1500, basePriceWeekend: 1500, duration: 6 },
            { id: 'bayadah-gold', name: 'رحلة بياضة - الباقة الذهبية شاملة فواكه وموهيتو (1700 ريال)', basePriceWeekday: 1700, basePriceWeekend: 1700, duration: 6 },
            { id: 'bayadah-special', name: 'رحلة بياضة - باقة الاسبيشل VIP شاملة فطائر (2000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 6 },
            { id: 'abu-tair-normal', name: 'رحلة جزيرة أبو طير - الباقة العادية (1600 ريال)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 6 },
            { id: 'abu-tair-silver', name: 'رحلة جزيرة أبو طير - الباقة الفضية شاملة الدونات (1800 ريال)', basePriceWeekday: 1800, basePriceWeekend: 1800, duration: 6 },
            { id: 'abu-tair-gold', name: 'رحلة جزيرة أبو طير - الباقة الذهبية شاملة فواكه وموهيتو (2000 ريال)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 6 },
            { id: 'abu-tair-special', name: 'رحلة جزيرة أبو طير - باقة الاسبيشل VIP شاملة فطائر (2300 ريال)', basePriceWeekday: 2300, basePriceWeekend: 2300, duration: 6 },
            { id: 'fishing-6', name: 'رحلة صيد (6 ساعات)', basePriceWeekday: 1400, basePriceWeekend: 1400, duration: 6 },
            { id: 'fishing-8', name: 'رحلة صيد (8 ساعات)', basePriceWeekday: 1600, basePriceWeekend: 1600, duration: 8 },
            { id: 'fishing-10', name: 'رحلة صيد (10 ساعات)', basePriceWeekday: 1800, basePriceWeekend: 1800, duration: 10 },
            { id: 'fishing-12', name: 'رحلة صيد (12 ساعة)', basePriceWeekday: 2000, basePriceWeekend: 2000, duration: 12 },
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
        if (vessel === 'qimat-al-fawz-pentos') {
            if (hours <= 0.5) return 250;
            return 450; // 1 hour full is 450
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
        if (vessel === 'qimat-al-fawz-pentos' || vessel === 'large-yacht') {
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

        // Toggle UI panels based on yacht / baby-yacht / southern marina properties
        if (vessel === 'large-yacht') {
            yachtHoursGroup.classList.remove('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.remove('hidden');
        } else if (vessel.startsWith('baby-yacht')) {
            yachtHoursGroup.classList.add('hidden');
            toggleBabyYachtBBQ();
            southernMarinaGroup.classList.add('hidden');
            if (packageGroup) packageGroup.classList.remove('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.add('hidden');
        } else if (vessel === 'boat-51' || southernBoatAliases.includes(vessel)) {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
            southernMarinaGroup.classList.remove('hidden');
            if (packageGroup) packageGroup.classList.add('hidden');
            if (specialRequestsGroup) specialRequestsGroup.classList.add('hidden');
        } else {
            yachtHoursGroup.classList.add('hidden');
            if (babyYachtOptions) babyYachtOptions.classList.add('hidden');
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

            if (vessel.startsWith('baby-yacht')) {
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
            // Seven boat series & Norseen Large Boat
            basePrice = (day === 'weekend') ? selectedTrip.basePriceWeekend : selectedTrip.basePriceWeekday;
            durationText = `${selectedTrip.duration} ساعات`;

            // Extra guests above 7 -> 100 SAR per person
            if (guests > 7) {
                guestExtra += (guests - 7) * 100;
            }
        }

        // 2. VIP & VVIP Package additions (if not large-yacht and not southern boats)
        if (vessel !== 'large-yacht' && vessel !== 'boat-51' && !southernBoatAliases.includes(vessel)) {
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

    // Generate WhatsApp Message & Submit
    function sendWhatsAppMessage() {
        const isIndividual = (bookingModeSelect && bookingModeSelect.value === 'individual');
        const phoneNumber = '966568390147';
        let messageText = '';

        if (isIndividual) {
            const tripTypeName = indTripType.options[indTripType.selectedIndex].text;
            const dayName = indDayType.options[indDayType.selectedIndex].text;
            const packageName = indPackageType.options[indPackageType.selectedIndex].text;
            const guests = indPeopleInput.value;
            const total = totalPriceDisplay.textContent;

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
        else {
            const vessel = vesselTypeSelect.value;
            const tripId = tripTypeSelect.value;
            const day = dayTypeSelect.value;
            const guests = numPeopleInput.value;
            const pkg = packageTypeSelect.value;

            let vesselName = vesselTypeSelect.options[vesselTypeSelect.selectedIndex].text;
            let tripName = tripTypeSelect.options[tripTypeSelect.selectedIndex].text;
            let dayName = dayTypeSelect.options[dayTypeSelect.selectedIndex].text;
            let packageName = packageTypeSelect.options[packageTypeSelect.selectedIndex].text;
            let totalPrice = totalPriceDisplay.textContent;
            let duration = durationCalc.querySelector('span').textContent;
            let depositText = depositDisplay.textContent;

            let customDetails = '';

            // Add southern marina detail if selected
            if (vessel === 'boat-51') {
                customDetails += `\n📍 مرسى الانطلاق: *${southernMarinaSelect.options[southernMarinaSelect.selectedIndex].text}*`;
            } else {
                customDetails += `\n📍 مرسى الانطلاق: *مرسى البحر الاحمر*`;
            }

            let packageLine = `🎁 الباقة: *${packageName}*\n`;

            // Yacht hours detail
            if (vessel === 'large-yacht') {
                customDetails += `\n⏱ الساعات المطلوبة: *${yachtHoursInput.value} ساعات*`;
                packageLine = '';
                if (specialRequestsInput && specialRequestsInput.value.trim() !== '') {
                    customDetails += `\n✨ طلبات خاصة: *${specialRequestsInput.value.trim()}*`;
                }
            }

            // Creek hours detail (if selected as trip type)
            if (tripId === 'creek') {
                customDetails += `\n⏱ ساعات جولة الخور: *${creekHoursInput.value} ساعة*`;
            }

            // Baby Yacht options (only if not creek trip)
            if (vessel.startsWith('baby-yacht') && tripId !== 'creek' && addBBQSelect.value === 'yes') {
                customDetails += `\n🥩 إضافة وجبة مشويات: *نعم (+600 ريال)*`;
            }

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

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');
    }

    // Event listeners and setup
    if (vesselTypeSelect) {
        vesselTypeSelect.addEventListener('change', populateTripTypes);
    }
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

    // Run population & URL param pre-selection on load
    if (vesselTypeSelect) {
        populateTripTypes();
        const urlParams = new URLSearchParams(window.location.search);
        const vesselParam = urlParams.get('vessel');
        if (vesselParam) {
            if (vesselParam === 'individual') {
                const bookingModeSelect = document.getElementById('bookingMode');
                if (bookingModeSelect) {
                    bookingModeSelect.value = 'individual';
                    bookingModeSelect.dispatchEvent(new Event('change'));
                }
            } else {
                vesselTypeSelect.value = vesselParam;
                vesselTypeSelect.dispatchEvent(new Event('change'));
            }
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
    const shareData = {
        title: title + ' | أوركا للرحلات البحرية بجدة',
        text: `استكشف تفاصيل ${title} واحجز رحلتك بأفضل الأسعار مع أوركا للرحلات البحرية بجدة!`,
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast(`تم نسخ رابط "${title}" بنجاح!`);
        }).catch(() => {
            promptCopy(url);
        });
    } else {
        promptCopy(url);
    }
}

function promptCopy(url) {
    window.prompt('انسخ رابط القارب للمشاركة:', url);
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

