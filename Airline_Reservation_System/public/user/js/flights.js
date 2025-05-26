// flights.js
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số từ URL
    function getQueryParams() {
        const params = {};
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        });
        return params;
    }
    // Hiển thị thông tin tìm kiếm
    const params = getQueryParams();
    const infoDiv = document.getElementById('search-info');
    infoDiv.innerHTML = `<b>Từ:</b> ${params.from || ''} <b>Đến:</b> ${params.to || ''} <b>Ngày đi:</b> ${params.departure || ''} <b>Ngày về:</b> ${params.return || ''} <b>Hành khách:</b> ${params.passengers || ''} <b>Hạng ghế:</b> ${params.class || ''}`;
    
    // Giá vé động
    const priceRange = document.getElementById('price-range');
    const priceMax = document.getElementById('price-max');
    priceRange.addEventListener('input', function() {
        priceMax.textContent = parseInt(this.value).toLocaleString('vi-VN') + ' VND';
        renderFlights();
    });
    
    // Danh sách chuyến bay mẫu
    const flights = [
        {
            airline: 'Vietnam Airlines',
            flightNumber: 'VN123',
            from: 'Hà Nội',
            to: 'TP HCM',
            departure: '08:00',
            arrival: '10:00',
            price: 1500000
        },
        {
            airline: 'Vietravel Airlines',
            flightNumber: 'VU456',
            from: 'Hà Nội',
            to: 'Đà Nẵng',
            departure: '09:30',
            arrival: '11:00',
            price: 1200000
        },
        {
            airline: 'Bamboo Airways',
            flightNumber: 'QH789',
            from: 'TP HCM',
            to: 'Đà Nẵng',
            departure: '14:00',
            arrival: '15:30',
            price: 1100000
        },
        {
            airline: 'Pacific Airlines',
            flightNumber: 'BL321',
            from: 'Hà Nội',
            to: 'TP HCM',
            departure: '19:00',
            arrival: '21:00',
            price: 900000
        }
    ];
    
    function getSelectedAirlines() {
        return Array.from(document.querySelectorAll('input[name="airline"]:checked')).map(el => el.parentElement.textContent.trim());
    }
    function getSelectedTimeSlot() {
        const btn = document.querySelector('.time-slots button.active');
        return btn ? btn.dataset.time : null;
    }
    function getTimeSlotRange(slot) {
        switch(slot) {
            case 'morning': return [5, 12];
            case 'afternoon': return [12, 18];
            case 'evening': return [18, 24];
            case 'night': return [0, 5];
            default: return null;
        }
    }
    function renderFlights() {
        const listings = document.getElementById('flight-listings');
        listings.innerHTML = document.getElementById('search-info').outerHTML;
        const maxPrice = parseInt(priceRange.value);
        const selectedAirlines = getSelectedAirlines();
        const selectedTimeSlot = getSelectedTimeSlot();
        let filtered = flights.filter(f => f.price <= maxPrice);
        if (selectedAirlines.length > 0) {
            filtered = filtered.filter(f => selectedAirlines.includes(f.airline));
        }
        if (selectedTimeSlot) {
            const [start, end] = getTimeSlotRange(selectedTimeSlot);
            filtered = filtered.filter(f => {
                const hour = parseInt(f.departure.split(':')[0]);
                if (start < end) return hour >= start && hour < end;
                return hour >= start || hour < end;
            });
        }
        if (filtered.length === 0) {
            listings.innerHTML += '<p>Không tìm thấy chuyến bay phù hợp.</p>';
        } else {
            filtered.forEach((flight, idx) => {
                const div = document.createElement('div');
                div.className = 'flight-card';
                div.innerHTML = `
                    <div class="flight-info">
                        <div><b>Hãng:</b> ${flight.airline}</div>
                        <div><b>Mã chuyến:</b> ${flight.flightNumber}</div>
                        <div><b>Hành trình:</b> ${flight.from} → ${flight.to}</div>
                        <div><b>Giờ đi:</b> ${flight.departure} - <b>Giờ đến:</b> ${flight.arrival}</div>
                        <div><b>Giá:</b> ${flight.price.toLocaleString('vi-VN')} VND</div>
                    </div>
                    <button class="btn-select" data-idx="${idx}">Chọn chuyến bay</button>
                `;
                listings.appendChild(div);
            });
            // Gán sự kiện cho nút chọn chuyến bay
            const selectBtns = document.querySelectorAll('.btn-select');
            selectBtns.forEach((btn, i) => {
                btn.addEventListener('click', function() {
                    // Lưu thông tin chuyến bay đã chọn vào sessionStorage
                    const selectedFlight = filtered[i];
                    console.log('[flights.js] Chọn chuyến bay:', selectedFlight);
                    sessionStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
                    // Chuyển sang trang booking.html
                    window.location.href = 'booking.html';
                });
            });
        }
    }
    Array.from(document.querySelectorAll('input[name="airline"]')).forEach(cb => {
        cb.addEventListener('change', renderFlights);
    });
    Array.from(document.querySelectorAll('.time-slots button')).forEach(btn => {
        btn.addEventListener('click', function() {
            Array.from(document.querySelectorAll('.time-slots button')).forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderFlights();
        });
    });
    renderFlights();

    // Hiển thị thông tin user trên header nếu đã đăng nhập
    function renderUserHeader() {
        const userActions = document.querySelector('.user-actions');
        // Giả sử thông tin user lưu ở localStorage/sessionStorage với key 'userInfo'
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo'));
        if (userInfo && userInfo.name) {
            userActions.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-menu"><i class="fas fa-user"></i> ${userInfo.name} <i class="fas fa-caret-down"></i></button>
                    <div class="dropdown-content">
                        <a href="my-bookings.html"><i class="fas fa-ticket-alt"></i> Đặt chỗ của tôi</a>
                        <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                    </div>
                </div>
            `;
            // Đăng xuất
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('userInfo');
                    sessionStorage.removeItem('userInfo');
                    window.location.reload();
                });
            }
        }
    }
    renderUserHeader();
});