document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authForm');
    const toggleLink = document.getElementById('toggle-link');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    let isLogin = true;  // Toggle between login and signup

    // Toggle between login and signup
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        if (isLogin) {
            formTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            toggleLink.textContent = 'Sign up';
        } else {
            formTitle.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
            toggleLink.textContent = 'Login';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const endpoint = isLogin ? '/login' : '/signup'; // Set the appropriate endpoint

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.style.color = 'green';
                messageDiv.textContent = data.message;

                if (data.token) {
                    localStorage.setItem('token', data.token); // Store JWT token for future requests
                    window.location.href = '/'; // Redirect to protected route
                }
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.error || 'An error occurred';
            }
        } catch (error) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'An error occurred';
        }
    });

    // Function to make a request to the /vehicles route
    const loadVehicles = async () => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage

        if (!token) {
            messageDiv.textContent = 'No token found, please log in.';
            return;
        }

        try {
            const response = await fetch('/vehicles', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Ensure the Bearer prefix and token
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Vehicles:', data); // Handle successful response (e.g., display vehicles)
            } else {
                messageDiv.style.color = 'red';
                messageDiv.textContent = data.error || 'An error occurred';
            }
        } catch (error) {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'An error occurred while fetching vehicles';
        }
    };

    // Call the function to load vehicles on page load (if needed)
    if (window.location.pathname === '/') {
        loadVehicles(); // Load vehicles if on the vehicles page
    }
});
