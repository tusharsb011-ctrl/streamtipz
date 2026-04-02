// ── Status Page Logic — Razorpay Integration ──────────────────────────
(function () {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment');
  const sessionId = params.get('session');

  const statusIcon = document.getElementById('status-icon');
  const statusText = document.getElementById('status-text');
  const statusSubtext = document.getElementById('status-subtext');

  if (!paymentId) {
    statusText.textContent = 'No Payment Found';
    statusSubtext.textContent = 'Please go back and try again.';
    return;
  }

  let pollInterval = null;

  async function checkStatus() {
    try {
      const res = await fetch(`/api/payment/${paymentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.status === 'verified') {
        clearInterval(pollInterval);
        pollInterval = null;

        // Update icon
        statusIcon.className = 'status-icon verified';
        statusIcon.innerHTML = '✅';

        // Update text
        statusText.textContent = 'Payment Verified!';
        statusText.style.color = '#34d399';
        statusSubtext.innerHTML = `
          <strong>₹${data.amount.toFixed(2)}</strong> from <strong>${data.name}</strong> was confirmed.
          <br><br>
          <div class="status-split-info">
            <div class="split-row">
              <span>Creator receives:</span>
              <strong class="split-creator">₹${data.creatorEarnings.toFixed(2)}</strong>
            </div>
            <div class="split-row">
              <span>Platform fee:</span>
              <strong class="split-fee">₹${data.commission.toFixed(2)}</strong>
            </div>
          </div>
          <br>
          <a href="tip.html?session=${sessionId}" class="btn btn-secondary" style="display:inline-flex; margin-top:12px;">
            💜 Send Another Tip
          </a>
        `;
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  }

  // Start polling
  checkStatus();
  pollInterval = setInterval(checkStatus, 1500);

  // Safety: stop polling after 60 seconds
  setTimeout(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      statusText.textContent = 'Verification Timeout';
      statusSubtext.textContent = 'Please contact support if your payment was charged.';
      statusIcon.className = 'status-icon pending';
      statusIcon.innerHTML = '⚠️';
    }
  }, 60000);
})();
