document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabs = document.querySelectorAll('.tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Enable/disable return date based on tab
            const returnDate = document.getElementById('return');
            if (this.textContent === 'Một chiều') {
                returnDate.disabled = true;
            } else {
                returnDate.disabled = false;
            }
        });
    });
    
    // Passenger dropdown
    const passengersInput = document.getElementById('passengers');
    const passengerDropdown = document.querySelector('.passenger-dropdown');
    
    passengersInput.addEventListener('click', function(e) {
        e.stopPropagation();
        passengerDropdown.style.display = passengerDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        passengerDropdown.style.display = 'none';
    });
    
    // Passenger counter
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const decrement = counter.querySelector('.decrement');
        const increment = counter.querySelector('.increment');
        const count = counter.querySelector('span');
        
        decrement.addEventListener('click', function() {
            let value = parseInt(count.textContent);
            if (value > 0) {
                count.textContent = value - 1;
                updatePassengerSummary();
            }
        });
        
        increment.addEventListener('click', function() {
            let value = parseInt(count.textContent);
            count.textContent = value + 1;
            updatePassengerSummary();
        });
    });
    
    function updatePassengerSummary() {
        const adults = parseInt(document.querySelectorAll('.counter span')[0].textContent);
        const children = parseInt(document.querySelectorAll('.counter span')[1].textContent);
        const infants = parseInt(document.querySelectorAll('.counter span')[2].textContent);
        
        let summary = '';
        if (adults > 0) summary += `${adults} Người lớn`;
        if (children > 0) summary += `, ${children} Trẻ em`;
        if (infants > 0) summary += `, ${infants} Em bé`;
        
        passengersInput.value = summary || '1 Người lớn';
    }
    
    // Search form submission
    const searchForm = document.querySelector('.search-form');
    const btnSearch = document.querySelector('.btn-search');
    
    btnSearch.addEventListener('click', function() {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const departure = document.getElementById('departure').value;
        const returnDate = document.getElementById('return').value;
        const passengers = passengersInput.value;
        const flightClass = document.getElementById('class').value;
        
        if (!from || !to || !departure) {
            alert('Vui lòng nhập đầy đủ thông tin tìm kiếm');
            return;
        }
        
        // In a real app, this would redirect to search results page with parameters
        window.location.href = `/user/flights.html?from=${from}&to=${to}&departure=${departure}&return=${returnDate}&passengers=${passengers}&class=${flightClass}`;
    });
    
    // Initialize date inputs
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    document.getElementById('departure').valueAsDate = today;
    document.getElementById('return').valueAsDate = tomorrow;
});