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
    const validUsername = 'august.gloop@sukkergris.no';
    const validPassword = 'laffylaffy';

    if (username === validUsername && password === validPassword) {
        alert('Login successful!');
        // Redirect to a dashboard or another protected page
    } else {
        alert('Invalid username or password.');
    }
});