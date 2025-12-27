// menu.js - برای منوی تمام‌صفحه
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    // نیازی به overlay نیست چون منو تمام صفحه است
    
    // جلوگیری از اسکرول بدن
    function preventBodyScroll(prevent) {
        if (prevent) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }
    
    // باز کردن منو (تمام صفحه)
    function openMenu() {
        navMenu.classList.add('show-menu');
        hamburger.classList.add('active');
        preventBodyScroll(true);
        
        // ویبره خفیف برای موبایل
        if ('vibrate' in navigator && window.innerWidth < 769) {
            navigator.vibrate(20);
        }
        
        // مخفی کردن هدر هنگام باز شدن منو
        document.querySelector('.l-header').style.zIndex = '1001';
    }
    
    // بستن منو
    function closeMenu() {
        navMenu.classList.remove('show-menu');
        hamburger.classList.remove('active');
        preventBodyScroll(false);
        
        // بازگرداندن z-index هدر
        document.querySelector('.l-header').style.zIndex = 'var(--z-fixed)';
    }
    
    // رویداد کلیک روی دکمه همبرگر
    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (navMenu.classList.contains('show-menu')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }
    
    // بستن منو با کلیک روی لینک‌ها (در موبایل)
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth < 769) {
                // تاخیر برای دیدن انیمیشن
                setTimeout(closeMenu, 400);
            }
        });
    });
    
    // بستن منو با کلید ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            closeMenu();
        }
    });
    
    // بستن خودکار منو هنگام تغییر به دسکتاپ
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 769 && navMenu.classList.contains('show-menu')) {
                closeMenu();
            }
        }, 250);
    });
    
    // بستن منو با کلیک روی فضای خالی (اختیاری)
    if (window.innerWidth < 769) {
        navMenu.addEventListener('click', function(e) {
            if (e.target === navMenu) {
                closeMenu();
            }
        });
    }
});