document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileDropdown = document.getElementById('mobile-dropdown');

    // Toggle dropdown when hamburger is clicked
    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        mobileDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking on a link
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileDropdown.classList.remove('show');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !mobileDropdown.contains(event.target)) {
            mobileDropdown.classList.remove('show');
        }
    });
});