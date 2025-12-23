// فایل JavaScript مشترک برای هر دو صفحه
// =====================================

// تنظیمات و ثابت‌ها
const STORAGE_KEY = 'gps_locations_v2';
let map = null;
let markers = [];

// دریافت و ذخیره‌سازی خودکار موقعیت (برای پنل مدیریت)
function getAndSaveLocation() {
    if (!navigator.geolocation) {
        document.getElementById('last-error').textContent = 'مرورگر از GPS پشتیبانی نمی‌کند';
        return;
    }
    
    const options = {
        enableHighAccuracy: document.getElementById('high-accuracy')?.checked || true,
        timeout: 10000,
        maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
        // موفقیت
        function(position) {
            const locationData = {
                id: Date.now(),
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: Math.round(position.coords.accuracy),
                altitude: position.coords.altitude ? Math.round(position.coords.altitude) : null,
                heading: position.coords.heading,
                speed: position.coords.speed ? Math.round(position.coords.speed * 3.6) : null, // km/h
                timestamp: new Date().toLocaleString('fa-IR'),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('fa-IR')
            };
            
            // ذخیره در localStorage
            saveLocation(locationData);
            
            // به‌روزرسانی نمایش
            updateLastLocationDisplay(locationData);
            refreshLocations();
            
            // پاک کردن خطا
            document.getElementById('last-error').textContent = 'هیچ';
            
            console.log('موقعیت ذخیره شد:', locationData.id);
        },
        // خطا
        function(error) {
            let errorMessage = 'خطا در دریافت موقعیت: ';
            switch(error.code) {
                case 1: errorMessage += 'دسترسی رد شد'; break;
                case 2: errorMessage += 'موقعیت در دسترس نیست'; break;
                case 3: errorMessage += 'زمان درخواست پایان یافت'; break;
            }
            
            document.getElementById('last-error').textContent = errorMessage;
            document.getElementById('gps-status').textContent = 'خطا';
            
            console.error('خطای GPS:', errorMessage);
        },
        options
    );
}

// ذخیره موقعیت در localStorage
function saveLocation(locationData) {
    let locations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // محدودیت تعداد رکوردها (1000 مورد)
    if (locations.length >= 1000) {
        locations = locations.slice(0, 999);
    }
    
    // اضافه کردن موقعیت جدید به ابتدای آرایه
    locations.unshift(locationData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    
    return locationData.id;
}

// بارگذاری موقعیت‌ها از localStorage
function loadLocations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// به‌روزرسانی نمایش آخرین موقعیت
function updateLastLocationDisplay(location) {
    const updateBox = document.getElementById('last-update-box');
    if (updateBox) {
        updateBox.innerHTML = `
            <strong>📡 آخرین به‌روزرسانی:</strong> ${location.time}
            <br>موقعیت: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            <br>دقت: ${location.accuracy} متر ${location.speed ? ' | سرعت: ' + location.speed + ' کیلومتر/ساعت' : ''}
        `;
    }
    
    // به‌روزرسانی زمان آخرین دریافت
    const lastTimeElement = document.getElementById('last-time');
    if (lastTimeElement) {
        lastTimeElement.textContent = location.time.split(' ')[0];
    }
}

// به‌روزرسانی جدول موقعیت‌ها
function updateLocationsTable(locations) {
    const tableBody = document.getElementById('locations-table-body');
    if (!tableBody) return;
    
    if (locations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    هنوز موقعیتی ذخیره نشده است
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    locations.forEach((loc, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${loc.timestamp}</td>
                <td>${loc.latitude.toFixed(6)}</td>
                <td>${loc.longitude.toFixed(6)}</td>
                <td>${loc.accuracy} متر</td>
                <td class="actions">
                    <button class="action-btn view-btn" onclick="viewOnMap(${loc.latitude}, ${loc.longitude}, ${loc.id})">مشاهده</button>
                    <button class="action-btn delete-btn" onclick="deleteLocation(${loc.id})">حذف</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// به‌روزرسانی آمار
function updateStats(locations) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = locations.filter(loc => loc.date === today).length;
    
    const totalCountElement = document.getElementById('total-count');
    const todayCountElement = document.getElementById('today-count');
    
    if (totalCountElement) totalCountElement.textContent = locations.length;
    if (todayCountElement) todayCountElement.textContent = todayCount;
}

// حذف یک موقعیت
function deleteLocation(id) {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این موقعیت را حذف کنید؟')) {
        return;
    }
    
    let locations = loadLocations();
    locations = locations.filter(loc => loc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    
    refreshLocations();
}

// حذف همه موقعیت‌ها
function clearAllLocations() {
    if (!confirm('آیا مطمئن هستید که می‌خواهید تمام موقعیت‌ها را حذف کنید؟')) {
        return;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    refreshLocations();
    showNotification('تمام موقعیت‌ها حذف شدند', 'info');
}

// مشاهده موقعیت روی نقشه
function viewOnMap(lat, lng, id = null) {
    if (!map) return;
    
    map.setView([lat, lng], 15);
    
    // حذف مارکرهای قبلی
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // اضافه کردن مارکر جدید
    const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(id ? `موقعیت #${id}<br>عرض: ${lat.toFixed(6)}<br>طول: ${lng.toFixed(6)}` : `موقعیت انتخاب شده`)
        .openPopup();
    
    markers.push(marker);
}

// ایجاد نقشه
function initMap() {
    if (!map && document.getElementById('map')) {
        map = L.map('map').setView([35.6892, 51.3890], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
    }
    
    updateMapMarkers();
}

// به‌روزرسانی مارکرهای روی نقشه
function updateMapMarkers() {
    if (!map) return;
    
    const locations = loadLocations();
    
    // حذف مارکرهای قبلی
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // اضافه کردن مارکرهای جدید
    locations.forEach(loc => {
        const marker = L.marker([loc.latitude, loc.longitude])
            .addTo(map)
            .bindPopup(`
                <strong>موقعیت #${loc.id}</strong><br>
                زمان: ${loc.timestamp}<br>
                دقت: ${loc.accuracy} متر<br>
                ${loc.speed ? 'سرعت: ' + loc.speed + ' کیلومتر/ساعت<br>' : ''}
                <button onclick="viewOnMap(${loc.latitude}, ${loc.longitude}, ${loc.id})" 
                        style="margin-top: 5px; padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    بزرگنمایی
                </button>
            `);
        markers.push(marker);
    });
    
    // تنظیم زوم برای نمایش همه مارکرها
    if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// به‌روزرسانی کامل
function refreshLocations() {
    const locations = loadLocations();
    updateLocationsTable(locations);
    updateStats(locations);
    updateMapMarkers();
}

// اکسپورت موقعیت‌ها به فایل JSON
function exportLocations() {
    const locations = loadLocations();
    const dataStr = JSON.stringify(locations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gps_locations_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// ایمپورت موقعیت‌ها از فایل JSON
function importLocations(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData)) {
                throw new Error('فرمت فایل نامعتبر است');
            }
            
            // ذخیره داده‌های وارد شده
            localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData));
            
            // به‌روزرسانی نمایش
            refreshLocations();
            showNotification(`${importedData.length} موقعیت با موفقیت وارد شد`, 'success');
            
        } catch (error) {
            showNotification('خطا در وارد کردن فایل: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// =====================================
// بارگذاری اولیه
if (typeof window !== 'undefined') {
    window.onload = function() {
        // اگر در صفحه پنل مدیریت هستیم
        if (document.getElementById('map')) {
            setTimeout(initMap, 500);
            refreshLocations();
        }
    };
}