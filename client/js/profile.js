document.addEventListener('DOMContentLoaded', function() {
    // Load user data from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Populate profile form
    if (currentUser) {
        document.getElementById('profile-name').textContent = currentUser.name || 'John Doe';
        document.getElementById('profile-fullname').value = currentUser.name || 'John Doe';
        document.getElementById('profile-email').value = currentUser.email || 'john.doe@example.com';
        document.getElementById('profile-phone').value = currentUser.phone || '+1 (555) 123-4567';
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updatedUser = {
                name: document.getElementById('profile-fullname').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                address: document.getElementById('profile-address').value
            };
            
            // Update localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const mergedUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('currentUser', JSON.stringify(mergedUser));
            
            // Update displayed name
            document.getElementById('profile-name').textContent = updatedUser.name;
            
            alert('Profile updated successfully!');
        });
    }
});