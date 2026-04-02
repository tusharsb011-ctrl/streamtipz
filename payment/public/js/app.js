// ── Landing Page Logic ────────────────────────────────────────────────
(function () {
  const createBtn = document.getElementById('create-btn');
  const nameInput = document.getElementById('streamer-name');
  const createSection = document.getElementById('create-section');
  const qrSection = document.getElementById('qr-section');
  const qrImage = document.getElementById('qr-image');
  const tipUrlInput = document.getElementById('tip-url');
  const copyBtn = document.getElementById('copy-btn');
  const dashboardLink = document.getElementById('dashboard-link');

  // Create tipping session
  createBtn.addEventListener('click', async () => {
    const streamerName = nameInput.value.trim() || 'Streamer';
    createBtn.disabled = true;
    createBtn.textContent = '⏳ Creating...';

    try {
      // Step 1: Create session
      const sessionRes = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamerName })
      });
      const { sessionId } = await sessionRes.json();

      // Step 2: Get QR code
      const qrRes = await fetch(`/api/qr/${sessionId}`);
      const { qrDataUrl, tipUrl } = await qrRes.json();

      // Step 3: Display results
      qrImage.src = qrDataUrl;
      tipUrlInput.value = tipUrl;
      dashboardLink.href = `dashboard.html?session=${sessionId}`;

      // Store session ID for convenience
      localStorage.setItem('streamtip_session', sessionId);

      // Show QR section
      qrSection.classList.remove('hidden');
      qrSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      showToast(`Session created! ID: ${sessionId}`);
    } catch (err) {
      showToast('Failed to create session. Please try again.');
      console.error(err);
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = '🚀 Create Tipping Session';
    }
  });

  // Copy tip link
  copyBtn.addEventListener('click', () => {
    tipUrlInput.select();
    navigator.clipboard.writeText(tipUrlInput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  // Allow pressing Enter in the name field
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createBtn.click();
  });

  // Toast helper
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
})();
