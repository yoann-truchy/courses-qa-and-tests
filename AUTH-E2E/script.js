(function () {
  const form = document.getElementById('signup-form');
  const username = document.getElementById('username');
  const email = document.getElementById('email');
  const password = document.getElementById('password');

  const errUser = document.getElementById('error-username');
  const errEmail = document.getElementById('error-email');
  const errPass = document.getElementById('error-password');
  const success = document.getElementById('success');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(el, msg) {
    el.textContent = msg;
    el.hidden = !msg;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    // reset messages
    setError(errUser, '');
    setError(errEmail, '');
    setError(errPass, '');
    success.hidden = true;
    success.textContent = '';

    let hasError = false;
    const u = String(username.value || '').trim();
    const e = String(email.value || '').trim();
    const p = String(password.value || '');

    if (u.length < 2) {
      setError(errUser, 'Please enter a valid username (min 2 chars).');
      hasError = true;
    }
    if (!emailRegex.test(e)) {
      setError(errEmail, 'Please enter a valid email address.');
      hasError = true;
    }
    if (p.length < 8) {
      setError(errPass, 'Password must be at least 8 characters.');
      hasError = true;
    }

    if (hasError) return;

    // Simulate async creation
    const btn = document.getElementById('submit');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating…';

    await new Promise((res) => setTimeout(res, 150));

    success.textContent = `Account created for ${u}`;
    success.hidden = false;

    btn.disabled = false;
    btn.textContent = originalText;
  });
})();