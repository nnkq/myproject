document.addEventListener('DOMContentLoaded', function() {
    // Load selected flight details from sessionStorage
    const selectedFlight = JSON.parse(sessionStorage.getItem('selectedFlight'));
    console.log('[booking.js] Script loaded. selectedFlight:', selectedFlight);
    
    if (selectedFlight) {
        // Hiển thị thông tin chuyến bay đã chọn lên giao diện
        const summaryCard = document.querySelector('.summary-card');
        console.log('[booking.js] summaryCard:', summaryCard);
        if (summaryCard) {
            summaryCard.innerHTML = `
                <div class="flight-header">
                    <div class="airline">
                        <img src="/user/images/airline-logos/${getAirlineLogo(selectedFlight.airline)}" alt="${selectedFlight.airline}">
                        <span>${selectedFlight.airline}</span>
                    </div>
                    <div class="flight-class">Phổ thông</div>
                </div>
                <div class="flight-details">
                    <div class="departure">
                        <time>${selectedFlight.departure}</time>
                        <span></span>
                        <span>Sân bay ${selectedFlight.from}</span>
                    </div>
                    <div class="duration">
                        <span></span>
                        <div class="flight-path">
                            <div class="line"></div>
                            <div class="plane"><i class="fas fa-plane"></i></div>
                        </div>
                        <span>Bay thẳng</span>
                    </div>
                    <div class="arrival">
                        <time>${selectedFlight.arrival}</time>
                        <span></span>
                        <span>Sân bay ${selectedFlight.to}</span>
                    </div>
                </div>
                <div class="price-summary">
                    <div class="price">
                        <span>Tổng cộng:</span>
                        <span class="amount">${selectedFlight.price.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div class="passengers">
                        <span>1 Người lớn</span>
                    </div>
                </div>
            `;
        } else {
            alert('Không tìm thấy phần hiển thị thông tin chuyến bay (summary-card)!');
        }
    } else {
        alert('Không có dữ liệu chuyến bay đã chọn!');
    }
    
    // Form submission
    const passengerForm = document.getElementById('passengerForm');
    passengerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Validate form
        const contactName = document.getElementById('contactName').value;
        const contactEmail = document.getElementById('contactEmail').value;
        const contactPhone = document.getElementById('contactPhone').value;
        if (!contactName || !contactEmail || !contactPhone) {
            alert('Vui lòng điền đầy đủ thông tin liên hệ');
            return;
        }
        // Lấy thông tin hành khách động
        const dynamicPassengerForms = document.getElementById('dynamicPassengerForms');
        const passengerBlocks = dynamicPassengerForms.querySelectorAll('.passenger-form-block');
        const passengers = [];
        let valid = true;
        passengerBlocks.forEach((block, i) => {
            const title = block.querySelector('select[name^="title_"]').value;
            const firstName = block.querySelector('input[name^="firstName_"]').value;
            const lastName = block.querySelector('input[name^="lastName_"]').value;
            const dob = block.querySelector('input[name^="dob_"]').value;
            const nationality = block.querySelector('select[name^="nationality_"]').value;
            if (!firstName || !lastName || !dob) valid = false;
            passengers.push({ title, firstName, lastName, dob, nationality });
        });
        if (!valid || passengers.length === 0) {
            alert('Vui lòng nhập đầy đủ thông tin cho tất cả hành khách');
            return;
        }
        // Lưu vào localStorage/sessionStorage
        const bookingInfo = {
            contact: { name: contactName, email: contactEmail, phone: contactPhone },
            passengers
        };
        sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo));
        window.location.href = 'payment.html';
    });
    
    // Back button
    const btnBack = document.querySelector('.btn-back');
    btnBack.addEventListener('click', function() {
        window.location.href = '/user/flights.html';
    });

    // Dynamic passenger form logic
    const numAdults = document.getElementById('numAdults');
    const numChildren = document.getElementById('numChildren');
    const numInfants = document.getElementById('numInfants');
    const dynamicPassengerForms = document.getElementById('dynamicPassengerForms');

    function renderPassengerForms() {
        const adults = parseInt(numAdults.value) || 0;
        const children = parseInt(numChildren.value) || 0;
        const infants = parseInt(numInfants.value) || 0;
        let html = '';
        let idx = 1;
        // Người lớn
        for (let i = 0; i < adults; i++, idx++) {
            html += `<div class="passenger-form-block"><div class="passenger-header"><h4>Hành khách ${idx} (Người lớn)</h4></div><div class="form-row"><div class="form-group"><label>Danh xưng</label><select name="title_${idx}"><option value="mr">Ông</option><option value="mrs">Bà</option><option value="ms">Cô</option></select></div><div class="form-group"><label>Họ</label><input type="text" name="firstName_${idx}" required placeholder="Nhập họ"></div><div class="form-group"><label>Tên</label><input type="text" name="lastName_${idx}" required placeholder="Nhập tên"></div></div><div class="form-row"><div class="form-group"><label>Ngày sinh</label><input type="date" name="dob_${idx}" required></div><div class="form-group"><label>Quốc tịch</label><select name="nationality_${idx}" required><option value="vietnam">Việt Nam</option><option value="usa">Hoa Kỳ</option><option value="uk">Anh</option></select></div></div></div>`;
        }
        // Trẻ em
        for (let i = 0; i < children; i++, idx++) {
            html += `<div class="passenger-form-block"><div class="passenger-header"><h4>Hành khách ${idx} (Trẻ em)</h4></div><div class="form-row"><div class="form-group"><label>Danh xưng</label><select name="title_${idx}"><option value="be">Bé trai</option><option value="ga">Bé gái</option></select></div><div class="form-group"><label>Họ</label><input type="text" name="firstName_${idx}" required placeholder="Nhập họ"></div><div class="form-group"><label>Tên</label><input type="text" name="lastName_${idx}" required placeholder="Nhập tên"></div></div><div class="form-row"><div class="form-group"><label>Ngày sinh</label><input type="date" name="dob_${idx}" required></div><div class="form-group"><label>Quốc tịch</label><select name="nationality_${idx}" required><option value="vietnam">Việt Nam</option><option value="usa">Hoa Kỳ</option><option value="uk">Anh</option></select></div></div></div>`;
        }
        // Em bé
        for (let i = 0; i < infants; i++, idx++) {
            html += `<div class="passenger-form-block"><div class="passenger-header"><h4>Hành khách ${idx} (Em bé)</h4></div><div class="form-row"><div class="form-group"><label>Danh xưng</label><select name="title_${idx}"><option value="be">Bé trai</option><option value="ga">Bé gái</option></select></div><div class="form-group"><label>Họ</label><input type="text" name="firstName_${idx}" required placeholder="Nhập họ"></div><div class="form-group"><label>Tên</label><input type="text" name="lastName_${idx}" required placeholder="Nhập tên"></div></div><div class="form-row"><div class="form-group"><label>Ngày sinh</label><input type="date" name="dob_${idx}" required></div><div class="form-group"><label>Quốc tịch</label><select name="nationality_${idx}" required><option value="vietnam">Việt Nam</option><option value="usa">Hoa Kỳ</option><option value="uk">Anh</option></select></div></div></div>`;
        }
        dynamicPassengerForms.innerHTML = html;
    }

    numAdults.addEventListener('change', renderPassengerForms);
    numChildren.addEventListener('change', renderPassengerForms);
    numInfants.addEventListener('change', renderPassengerForms);
    renderPassengerForms();

    // Hàm lấy tên file logo dựa vào tên hãng
    function getAirlineLogo(airline) {
        if (!airline) return 'default.png';
        const map = {
            'Vietnam Airlines': 'vietnam.png',
            'Vietravel Airlines': 'vietravel.png',
            'Bamboo Airways': 'bamboo.png',
            'Pacific Airlines': 'pacific.png'
        };
        return map[airline] || 'default.png';
    }

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