// payment.js
document.addEventListener('DOMContentLoaded', function() {
    // Payment method switching
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentMethods.forEach(method => {
        const input = method.querySelector('input');
        
        input.addEventListener('change', function() {
            paymentMethods.forEach(m => {
                m.classList.remove('active');
                m.querySelector('.payment-details').style.display = 'none';
            });
            
            method.classList.add('active');
            method.querySelector('.payment-details').style.display = 'block';
        });
    });
    
    // Promo code application
    const applyPromoBtn = document.getElementById('apply-promo');
    const promoMessage = document.getElementById('promo-message');
    const promoItem = document.querySelector('.promo-item');
    
    applyPromoBtn.addEventListener('click', function() {
        const promoCode = document.getElementById('promo-code').value.trim();
        
        if (!promoCode) {
            promoMessage.textContent = 'Vui lòng nhập mã khuyến mãi';
            promoMessage.className = 'error';
            promoMessage.classList.remove('hidden');
            return;
        }
        
        // In a real app, you would validate the promo code with the server
        // This is just a simulation
        const validPromoCodes = {
            'SKYWING10': 10,
            'SUMMER2025': 15,
            'TRAVELNOW': 20
        };
        
        if (validPromoCodes[promoCode]) {
            const discountPercent = validPromoCodes[promoCode];
            const discountAmount = 1500000 * (discountPercent / 100);
            const totalAmount = 1700000 - discountAmount;
            
            promoMessage.textContent = `Áp dụng thành công mã giảm ${discountPercent}%`;
            promoMessage.className = 'success';
            promoMessage.classList.remove('hidden');
            
            // Update summary
            document.querySelector('.promo-item span:last-child').textContent = `-${discountAmount.toLocaleString('vi-VN')} VND`;
            promoItem.classList.remove('hidden');
            
            document.querySelector('.summary-total span:last-child').textContent = `${totalAmount.toLocaleString('vi-VN')} VND`;
        } else {
            promoMessage.textContent = 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn';
            promoMessage.className = 'error';
            promoMessage.classList.remove('hidden');
            promoItem.classList.add('hidden');
            
            // Reset total
            document.querySelector('.summary-total span:last-child').textContent = '1,700,000 VND';
        }
    });
    
    // Credit card formatting
    const cardNumber = document.getElementById('card-number');
    const cardExpiry = document.getElementById('card-expiry');
    const cardCvv = document.getElementById('card-cvv');
    
    cardNumber.addEventListener('input', function(e) {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += value[i];
        }
        
        this.value = formatted;
    });
    
    cardExpiry.addEventListener('input', function(e) {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        this.value = value;
    });
    
    cardCvv.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/gi, '');
    });
    
    // Form submission
    const paymentForm = document.querySelector('.payment-form');
    const completePaymentBtn = document.getElementById('complete-payment');
    
    completePaymentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!document.getElementById('agree-terms').checked) {
            alert('Vui lòng đồng ý với Điều khoản và Điều kiện của chúng tôi');
            return;
        }
        
        // Validate payment method
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        
        if (!selectedMethod) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }
        
        if (selectedMethod.id === 'credit-card') {
            // Validate credit card
            if (!cardNumber.value || cardNumber.value.replace(/\s+/g, '').length !== 16) {
                alert('Vui lòng nhập số thẻ hợp lệ (16 chữ số)');
                return;
            }
            
            if (!cardName.value) {
                alert('Vui lòng nhập tên in trên thẻ');
                return;
            }
            
            if (!cardExpiry.value || cardExpiry.value.length !== 5) {
                alert('Vui lòng nhập ngày hết hạn hợp lệ (MM/YY)');
                return;
            }
            
            if (!cardCvv.value || cardCvv.value.length !== 3) {
                alert('Vui lòng nhập CVV hợp lệ (3 chữ số)');
                return;
            }
        }
        
        // In a real app, you would process the payment here
        // alert('Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ của SkyWing.');
        // Hiển thị modal thành công
        showSuccessModal();
        // Lưu đặt chỗ vào localStorage
        try {
            const selectedFlight = JSON.parse(sessionStorage.getItem('selectedFlight'));
            const bookingInfo = JSON.parse(sessionStorage.getItem('bookingInfo'));
            function generateBookingCode() {
                return 'SKW' + Math.floor(100000 + Math.random() * 900000);
            }
            if (selectedFlight && bookingInfo) {
                const newBooking = {
                    code: generateBookingCode(),
                    status: 'upcoming',
                    statusText: 'Đang chờ thanh toán',
                    departureTime: selectedFlight.departure,
                    departureDate: selectedFlight.date,
                    from: selectedFlight.from,
                    to: selectedFlight.to,
                    duration: selectedFlight.duration || '',
                    arrivalTime: selectedFlight.arrival,
                    arrivalDate: selectedFlight.date,
                    passengers: bookingInfo.passengers.map(p => ({
                        lastName: p.lastName,
                        firstName: p.firstName,
                        type: p.title === 'mr' ? 'Người lớn' : (p.title === 'ms' || p.title === 'mrs' ? 'Người lớn' : 'Trẻ em')
                    }))
                };
                let bookings = JSON.parse(localStorage.getItem('userBookings')) || [];
                bookings.push(newBooking);
                localStorage.setItem('userBookings', JSON.stringify(bookings));
            }
        } catch (e) { /* ignore */ }
        // Redirect sau 2.5s
        setTimeout(function() {
            window.location.href = 'my-bookings.html';
        }, 2500);
    });

    // Thêm hàm hiển thị modal thành công
    function showSuccessModal() {
        let modal = document.getElementById('success-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'success-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-icon"><i class='fas fa-check-circle'></i></div>
                    <div class="modal-title">Thanh toán thành công!</div>
                    <div class="modal-desc">Cảm ơn bạn đã sử dụng dịch vụ của SkyWing.</div>
                </div>
            `;
            document.body.appendChild(modal);
            // CSS cho modal
            const style = document.createElement('style');
            style.innerHTML = `
                #success-modal { position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
                #success-modal .modal-overlay { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(25,55,109,0.18); }
                #success-modal .modal-content { position: relative; background: #fff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 8px 32px rgba(25,55,109,0.18); text-align: center; min-width: 320px; z-index: 2; }
                #success-modal .modal-icon { font-size: 48px; color: #1abc9c; margin-bottom: 12px; }
                #success-modal .modal-title { font-size: 22px; font-weight: 600; color: #19376D; margin-bottom: 8px; }
                #success-modal .modal-desc { color: #333; font-size: 16px; }
            `;
            document.head.appendChild(style);
        } else {
            modal.style.display = 'flex';
        }
    }

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

    // Hiển thị thông tin chuyến bay, hành khách, tổng tiền từ sessionStorage
    function renderBookingInfo() {
        // Lấy thông tin chuyến bay
        const selectedFlight = JSON.parse(sessionStorage.getItem('selectedFlight'));
        // Lấy thông tin hành khách
        const bookingInfo = JSON.parse(sessionStorage.getItem('bookingInfo'));

        // Hiển thị chi tiết chuyến bay
        if (selectedFlight) {
            // Airline, flight number
            const airlineEl = document.querySelector('.booking-details-sidebar .airline');
            const flightNumberEl = document.querySelector('.booking-details-sidebar .flight-number');
            if (airlineEl) airlineEl.textContent = selectedFlight.airline || '';
            if (flightNumberEl) flightNumberEl.textContent = selectedFlight.flightNumber || '';
            // Thời gian, ngày, sân bay đi/đến
            const times = document.querySelectorAll('.booking-details-sidebar .flight-time');
            if (times.length >= 2) {
                // Đi
                times[0].querySelector('.time').textContent = selectedFlight.departure || '';
                times[0].querySelector('.date').textContent = selectedFlight.date || '';
                times[0].querySelector('.airport').textContent = selectedFlight.from || '';
                // Đến
                times[1].querySelector('.time').textContent = selectedFlight.arrival || '';
                times[1].querySelector('.date').textContent = selectedFlight.date || '';
                times[1].querySelector('.airport').textContent = selectedFlight.to || '';
            }
            // Thời lượng
            const durationEl = document.querySelector('.booking-details-sidebar .flight-duration span');
            if (durationEl) durationEl.textContent = selectedFlight.duration || '';
        }
        // Hiển thị hành khách
        if (bookingInfo && bookingInfo.passengers && bookingInfo.passengers.length > 0) {
            const passengerList = document.querySelector('.passenger-details');
            if (passengerList) {
                passengerList.innerHTML = '<h3>Hành khách</h3>' + bookingInfo.passengers.map(p =>
                    `<div class="passenger"><span class="name">${p.lastName} ${p.firstName}</span><span class="type">${p.title === 'mr' ? 'Người lớn' : (p.title === 'ms' || p.title === 'mrs' ? 'Người lớn' : 'Trẻ em')}</span></div>`
                ).join('');
            }
        }
        // Hiển thị tổng tiền
        if (selectedFlight && selectedFlight.price) {
            // Vé máy bay
            const priceEl = document.querySelector('.payment-summary .summary-item span:last-child');
            if (priceEl) priceEl.textContent = `${selectedFlight.price.toLocaleString('vi-VN')} VND`;
            // Tổng cộng
            const totalEl = document.querySelector('.payment-summary .summary-total span:last-child');
            if (totalEl) totalEl.textContent = `${selectedFlight.price.toLocaleString('vi-VN')} VND`;
        }
    }
    renderBookingInfo();
});