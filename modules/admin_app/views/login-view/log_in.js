//login knapp - admin: user august.gloop@sukkergris.no/ passord: laffylaffy
//denne siden skal blokke deg tilgang om brukernavn/passord er feil.
//Skal ta videre til admin oversikt
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission and page reload

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Basic client-side validation (e.g., check for empty fields)
    if (!username || !password) {
        alert('Please enter both username and password.');
        return; // Stop the function if validation fails
    }

    // In a real application, you would send these credentials to a server
    // for authentication (e.g., using fetch() or XMLHttpRequest).
    // For this example, we'll use a simple hardcoded check.
    const validUsername = 'augustus.gloop@sukkergris.no';
    const validPassword = 'laffytaffy';

    if (username === validUsername && password === validPassword) {
        // Dispatch event to notify admin_main.js
        document.dispatchEvent(new CustomEvent('admin-login-success', {
            bubbles: true,
            composed: true
        }));
    } else {
        alert('Invalid username or password.');
    }
});