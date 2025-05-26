document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            // Enhanced validation
            if (!email || !password) {
                alert('Vui lòng điền đầy đủ thông tin');
                return;
            }

            // Email/phone validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9]{10,12}$/;
            
            if (!emailRegex.test(email) && !phoneRegex.test(email)) {
                alert('Vui lòng nhập email hoặc số điện thoại hợp lệ');
                return;
            }

            // Password validation
            if (password.length < 6) {
                alert('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            
            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            submitButton.disabled = true;
            
            // Simulate API call (replace with actual API call in production)
            setTimeout(() => {
                // Store login info
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                // Nếu đăng nhập đúng với email/phone đã đăng ký thì lưu họ tên
                const regEmail = localStorage.getItem('registeredEmail');
                const regPhone = localStorage.getItem('registeredPhone');
                const regFullname = localStorage.getItem('registeredFullname');
                let userInfo = {};
                if ((email === regEmail || email === regPhone) && regFullname) {
                    localStorage.setItem('userFullname', regFullname);
                    userInfo = { name: regFullname, email };
                } else {
                    localStorage.removeItem('userFullname');
                    userInfo = { name: email, email };
                }
                // Lưu userInfo cho các trang khác nhận diện
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                // Show success message
                alert('Đăng nhập thành công!');
                // Redirect to homepage
                window.location.href = 'index.html';
            }, 1000);
        });
    }
    
    // Check if user is logged in
    function checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userActions = document.querySelector('.user-actions');
        
        if (isLoggedIn === 'true' && userActions) {
            const userEmail = localStorage.getItem('userEmail');
            const userFullname = localStorage.getItem('userFullname');
            userActions.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-menu">
                        <i class="fas fa-user-circle"></i> ${userFullname ? userFullname : userEmail}
                    </button>
                    <div class="dropdown-content">
                        <a href="my-bookings.html"><i class="fas fa-suitcase"></i> Đặt chỗ của tôi</a>
                        <a href="#" id="logout"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                    </div>
                </div>
            `;
            // Add logout functionality
            document.getElementById('logout')?.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userFullname');
                // Hiện lại hai nút đăng nhập/đăng ký sau khi đăng xuất
                userActions.innerHTML = `
                    <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Đăng nhập</a>
                    <a href="register.html" class="btn-register">Đăng ký</a>
                `;
            });
        } else if (userActions) {
            // Nếu chưa đăng nhập, luôn hiện hai nút
            userActions.innerHTML = `
                <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Đăng nhập</a>
                <a href="register.html" class="btn-register">Đăng ký</a>
            `;
        }
    }
    
    // Initialize auth status check
    checkAuthStatus();

    // Dropdown user menu: click để mở/đóng, click ngoài để đóng
    document.addEventListener('click', function(e) {
        const dropdown = document.querySelector('.user-dropdown');
        if (!dropdown) return;
        const menuBtn = dropdown.querySelector('.user-menu');
        const dropdownContent = dropdown.querySelector('.dropdown-content');
        if (menuBtn && menuBtn.contains(e.target)) {
            dropdown.classList.toggle('open');
        } else if (dropdownContent && dropdownContent.contains(e.target)) {
            // Click vào bên trong menu thì không đóng
            return;
        } else {
            dropdown.classList.remove('open');
        }
    });

    // Register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullname = document.getElementById('register-fullname').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            // Simple validation
            if (!fullname || !email || !phone || !password || !confirmPassword) {
                alert('Vui lòng điền đầy đủ thông tin');
                return;
            }
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp');
                return;
            }
            // Lưu họ tên và email vào localStorage (giả lập)
            localStorage.setItem('registeredFullname', fullname);
            localStorage.setItem('registeredEmail', email);
            localStorage.setItem('registeredPhone', phone);
            localStorage.setItem('registeredPassword', password);
            alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
            window.location.href = 'login.html';
        });
    }
});