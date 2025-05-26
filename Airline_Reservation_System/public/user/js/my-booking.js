document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.booking-tabs button');
    const tabContents = document.querySelectorAll('.booking-tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Payment and cancellation buttons (bổ sung cập nhật trạng thái)
    function updateBookingStatus(bookingCode, newStatus) {
        let bookings = JSON.parse(localStorage.getItem('userBookings') || sessionStorage.getItem('userBookings')) || [];
        bookings = bookings.map(b => {
            if (b.code === bookingCode) {
                if (newStatus === 'completed') {
                    b.status = 'completed';
                    b.statusText = 'Đã hoàn thành';
                } else if (newStatus === 'cancelled') {
                    b.status = 'cancelled';
                    b.statusText = 'Đã hủy';
                }
            }
            return b;
        });
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        sessionStorage.setItem('userBookings', JSON.stringify(bookings));
        loadBookings();
    }

    // Gắn lại sự kiện cho các nút sau khi render
    function attachActionEvents() {
        document.querySelectorAll('.btn-pay').forEach(button => {
            button.addEventListener('click', function() {
                const bookingCard = this.closest('.booking-card');
                const bookingCode = bookingCard.querySelector('.booking-code').textContent.replace('Mã đặt chỗ: ', '');
                // Cập nhật trạng thái sang completed
                alert(`Thanh toán thành công cho đặt chỗ ${bookingCode}`);
                updateBookingStatus(bookingCode, 'completed');
            });
        });
        document.querySelectorAll('.btn-cancel').forEach(button => {
            button.addEventListener('click', function() {
                const bookingCard = this.closest('.booking-card');
                const bookingCode = bookingCard.querySelector('.booking-code').textContent.replace('Mã đặt chỗ: ', '');
                if (confirm(`Bạn có chắc chắn muốn hủy đặt chỗ ${bookingCode}?`)) {
                    updateBookingStatus(bookingCode, 'cancelled');
                }
            });
        });
    }

    // Load bookings from localStorage or API và render ra giao diện
    function loadBookings() {
        // Lấy danh sách đặt chỗ từ localStorage hoặc sessionStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || sessionStorage.getItem('userBookings')) || [];
        // Phân loại theo trạng thái
        const upcoming = bookings.filter(b => b.status === 'upcoming');
        const completed = bookings.filter(b => b.status === 'completed');
        const cancelled = bookings.filter(b => b.status === 'cancelled');
        // Hàm render card
        function renderCards(list, containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            if (list.length === 0) {
                container.innerHTML = '<p class="no-bookings">Bạn chưa có đặt chỗ nào trong mục này.</p>';
                return;
            }
            container.innerHTML = list.map(booking => `
                <div class="booking-card">
                    <div class="booking-header">
                        <span class="booking-code">Mã đặt chỗ: ${booking.code}</span>
                        <span class="booking-status ${booking.status}">${booking.statusText}</span>
                    </div>
                    <div class="booking-details">
                        <div class="flight-info">
                            <div class="flight-segment">
                                <div class="flight-time">
                                    <span class="time">${booking.departureTime}</span>
                                    <span class="date">${booking.departureDate}</span>
                                </div>
                                <div class="flight-route">
                                    <span class="airport">${booking.from}</span>
                                    <div class="flight-duration">
                                        <i class="fas fa-plane"></i>
                                        <span>${booking.duration}</span>
                                    </div>
                                    <span class="airport">${booking.to}</span>
                                </div>
                                <div class="flight-time">
                                    <span class="time">${booking.arrivalTime}</span>
                                    <span class="date">${booking.arrivalDate}</span>
                                </div>
                            </div>
                        </div>
                        <div class="passenger-info">
                            <h3>Hành khách</h3>
                            <div class="passenger-list">
                                ${booking.passengers.map(p => `<div class="passenger"><span class="name">${p.lastName} ${p.firstName}</span><span class="type">${p.type}</span></div>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="booking-actions">
                        ${booking.status === 'upcoming' ? '<button class="btn-pay">Thanh toán ngay</button>' : ''}
                        ${booking.status === 'upcoming' ? '<button class="btn-cancel">Hủy đặt chỗ</button>' : ''}
                    </div>
                </div>
            `).join('');
        }
        renderCards(upcoming, 'upcoming');
        renderCards(completed, 'completed');
        renderCards(cancelled, 'cancelled');
        attachActionEvents();
    }
    loadBookings();
    
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