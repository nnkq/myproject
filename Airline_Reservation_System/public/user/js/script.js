document.addEventListener('DOMContentLoaded', function() {
    // Passenger selector functionality
    const passengerDisplay = document.getElementById('passenger-display');
    const passengerDropdown = document.querySelector('.passenger-dropdown');
    const passengerSelector = document.querySelector('.passenger-selector');
    const closeDropdownBtn = document.querySelector('.close-dropdown');
    
    passengerSelector.addEventListener('click', function(e) {
        e.stopPropagation();
        if (passengerDropdown.style.display === 'block') {
            passengerDropdown.style.display = 'none';
        } else {
            passengerDropdown.style.display = 'block';
        }
    });
    
    passengerDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    document.addEventListener('click', function() {
        passengerDropdown.style.display = 'none';
    });
    
    // Counter functionality
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const decreaseBtn = counter.querySelector('.decrease');
        const increaseBtn = counter.querySelector('.increase');
        const countElement = counter.querySelector('.count');
        
        decreaseBtn.addEventListener('click', function() {
            let count = parseInt(countElement.textContent);
            if (count > 0) {
                count--;
                countElement.textContent = count;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let count = parseInt(countElement.textContent);
            count++;
            countElement.textContent = count;
        });
    });
    
    function updatePassengerDisplay() {
        const adultCount = parseInt(document.querySelectorAll('.counter')[0].querySelector('.count').textContent);
        const childCount = parseInt(document.querySelectorAll('.counter')[1].querySelector('.count').textContent);
        const infantCount = parseInt(document.querySelectorAll('.counter')[2].querySelector('.count').textContent);
        const total = adultCount + childCount + infantCount;
        if (total === 0) {
            passengerDisplay.textContent = 'Chọn số lượng hành khách';
            passengerDisplay.style.color = '#888';
        } else {
            passengerDisplay.textContent = `${adultCount} Người lớn, ${childCount} Trẻ em, ${infantCount} Em bé`;
            passengerDisplay.style.color = '';
        }
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tabs button');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Hide/show return date based on tab
            const returnDateGroup = document.querySelector('#return-date').parentElement;
            if (this.textContent === 'Một chiều') {
                returnDateGroup.style.display = 'none';
            } else {
                returnDateGroup.style.display = 'block';
            }
        });
    });
    
    // Initialize date inputs
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    document.getElementById('departure-date').valueAsDate = today;
    document.getElementById('return-date').valueAsDate = tomorrow;
    
    // Form submission
    const flightSearchForm = document.getElementById('flight-search');
    
    flightSearchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const departure = document.getElementById('departure').value;
        const arrival = document.getElementById('arrival').value;
        const departureDate = document.getElementById('departure-date').value;
        const returnDate = document.getElementById('return-date').value;
        const passengerCount = passengerDisplay.textContent;
        const flightClass = document.getElementById('class').value;
        
        // Kiểm tra thông tin bắt buộc
        if (!departure || !arrival || !departureDate) {
            alert('Vui lòng nhập đầy đủ thông tin tìm kiếm');
            return;
        }
        // Chuyển sang trang flights.html và truyền dữ liệu qua URL
        window.location.href = `flights.html?from=${encodeURIComponent(departure)}&to=${encodeURIComponent(arrival)}&departure=${encodeURIComponent(departureDate)}&return=${encodeURIComponent(returnDate)}&passengers=${encodeURIComponent(passengerCount)}&class=${encodeURIComponent(flightClass)}`;
    });
    
    // Auto-complete for departure and arrival
    const airports = [
        "Hà Nội (HAN)",
        "TP HCM (SGN)",
        "Đà Nẵng (DAD)",
        "Phú Quốc (PQC)",
        "Nha Trang (CXR)",
        "Huế (HUI)",
        "Hải Phòng (HPH)",
        "Đà Lạt (DLI)",
        "Buôn Ma Thuột (BMV)",
        "Chu Lai (VCL)",
        "Bangkok (BKK)",
        "Singapore (SIN)",
        "Kuala Lumpur (KUL)",
        "Tokyo (NRT)",
        "Seoul (ICN)",
        "Taipei (TPE)",
        "Hong Kong (HKG)",
        "Shanghai (PVG)",
        "Sydney (SYD)",
        "Melbourne (MEL)"
    ];
    
    const departureInput = document.getElementById('departure');
    const arrivalInput = document.getElementById('arrival');
    
    [departureInput, arrivalInput].forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const suggestions = airports.filter(airport => 
                airport.toLowerCase().includes(value)
            );
            
            // In a real app, you would show these suggestions in a dropdown
            console.log('Suggestions:', suggestions);
        });
    });
    
    // Gọi updatePassengerDisplay() khi load trang để đồng bộ giao diện
    updatePassengerDisplay();
    
    // Hiển thị thông tin user trên header nếu đã đăng nhập
    function renderUserHeader() {
        const userActions = document.querySelector('.user-actions');
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