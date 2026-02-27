// Mobile Menu Toggle با انیمیشن ضربدر
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    // تغییر کلاس active برای دکمه
    mobileMenuBtn.classList.toggle('active');
    
    // تغییر کلاس active برای منو
    navLinks.classList.toggle('active');
    
    // جلوگیری از اسکرول هنگام باز بودن منو
    if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }
});

// بستن منو هنگام کلیک روی لینک
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    });
});

// بستن منو هنگام کلیک خارج از آن
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && 
        !mobileMenuBtn.contains(e.target) && 
        navLinks.classList.contains('active')) {
        
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }
});

// بستن منو هنگام اسکرول
window.addEventListener('scroll', () => {
    if (navLinks.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }
});

// بستن منو هنگام تغییر سایز پنجره
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinksItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


// ====== Intersection Observer برای انیمیشن اسکرول ======
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// فقط برای پروژه‌ها انیمیشن اعمال شود
document.querySelectorAll('#projects .feature-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});


// برای ویژگی‌ها انیمیشن اعمال نشود
document.querySelectorAll('#features .feature-card').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.transition = 'none';
    // observer.observe(el); // کامنت شده - انیمیشن ندارد
});


// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', () => {
    console.log('Elementary OS website loaded successfully!');
    
});


// دکمه برو به بالا
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});



// ====== تنظیمات دکمه برو به بالا هماهنگ با منو همبرگری ======
document.addEventListener('DOMContentLoaded', function() {
    // صبر کن تا همه المنت‌ها لود شوند
    setTimeout(function() {
        const backToTop = document.querySelector('.back-to-top');
        const navLinks = document.querySelector('.nav-links');
        
        if (!backToTop || !navLinks) {
            console.log('المنت‌های لازم پیدا نشدند');
            return;
        }
        
        console.log('دکمه برو به بالا پیدا شد');
        
        // تابع ساده برای به‌روزرسانی وضعیت دکمه
        function updateBackToTopButton() {
            const isMobile = window.innerWidth <= 768;
            const isMenuOpen = navLinks.classList.contains('active');
            const isScrolled = window.pageYOffset > 300;
            
            console.log('وضعیت:', {
                isMobile,
                isMenuOpen,
                isScrolled,
                shouldShow: isScrolled && !(isMobile && isMenuOpen)
            });
            
            // اگر اسکرول کردیم و (در موبایل نیستیم یا منو بسته است)
            if (isScrolled && !(isMobile && isMenuOpen)) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
        
        // رویداد اسکرول
        window.addEventListener('scroll', updateBackToTopButton);
        
        // رویداد تغییر سایز
        window.addEventListener('resize', updateBackToTopButton);
        
        // گوش دادن به تغییرات منوی موبایل
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    updateBackToTopButton();
                }
            });
        });
        
        observer.observe(navLinks, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // کلیک روی دکمه
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // بررسی اولیه
        updateBackToTopButton();
        
    }, 500); // تاخیر 500ms برای اطمینان از لود کامل
});


