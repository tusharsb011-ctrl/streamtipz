// ── Dashboard Logic — Razorpay Integration ────────────────────────────
(function () {
  const params = new URLSearchParams(window.location.search);
  let sessionId = params.get('session');

  const sessionInputCard = document.getElementById('session-input-card');
  const statsSection = document.getElementById('stats-section');
  const feedSection = document.getElementById('feed-section');
  const sessionIdInput = document.getElementById('session-id-input');
  const loadBtn = document.getElementById('load-dashboard-btn');
  const dashboardSubtitle = document.getElementById('dashboard-subtitle');

  const statTotal = document.getElementById('stat-total');
  const statCreator = document.getElementById('stat-creator');
  const statCommission = document.getElementById('stat-commission');
  const statCount = document.getElementById('stat-count');
  const statAvg = document.getElementById('stat-avg');
  const tipFeed = document.getElementById('tip-feed');

  let pollInterval = null;
  let previousTipCount = 0;

  // If session ID is in URL, auto-load
  if (sessionId) {
    sessionIdInput.value = sessionId;
    startDashboard(sessionId);
  }

  // Also check localStorage
  if (!sessionId) {
    const saved = localStorage.getItem('streamtip_session');
    if (saved) {
      sessionIdInput.value = saved;
    }
  }

  // Load button
  loadBtn.addEventListener('click', () => {
    const id = sessionIdInput.value.trim();
    if (!id) return;
    startDashboard(id);
  });

  sessionIdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadBtn.click();
  });

  function startDashboard(id) {
    sessionId = id;
    sessionInputCard.classList.add('hidden');
    statsSection.classList.remove('hidden');
    feedSection.classList.remove('hidden');

    // Start polling
    fetchTips();
    pollInterval = setInterval(fetchTips, 2000);
  }

  async function fetchTips() {
    try {
      const res = await fetch(`/api/tips/${sessionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      dashboardSubtitle.textContent = `Live tips for ${data.streamerName}`;

      // Update stats
      const verifiedTips = data.tips.filter(t => t.status === 'verified');
      const total = data.total;
      const count = verifiedTips.length;
      const avg = count > 0 ? total / count : 0;

      statTotal.textContent = `₹${total.toFixed(2)}`;
      statCreator.textContent = `₹${data.totalCreatorEarnings.toFixed(2)}`;
      statCommission.textContent = `₹${data.totalCommission.toFixed(2)}`;
      statCount.textContent = count;
      statAvg.textContent = `₹${avg.toFixed(2)}`;

      // Update tip feed
      if (data.tips.length === 0) {
        tipFeed.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🎧</div>
            <p>No tips yet — share your QR code to get started!</p>
          </div>
        `;
      } else {
        // Only re-render if tip count changed
        if (data.tips.length !== previousTipCount) {
          previousTipCount = data.tips.length;
          tipFeed.innerHTML = data.tips.map(tip => `
            <div class="tip-card">
              <div class="tip-avatar">${getInitial(tip.name)}</div>
              <div class="tip-info">
                <div class="tip-name">
                  ${escapeHtml(tip.name)}
                  <span class="badge ${tip.status === 'verified' ? 'badge-verified' : 'badge-pending'}">
                    ${tip.status}
                  </span>
                </div>
                ${tip.message ? `<div class="tip-message">${escapeHtml(tip.message)}</div>` : ''}
                <div class="tip-split">
                  <span class="split-creator">Creator: ₹${tip.creatorEarnings.toFixed(2)}</span>
                  <span class="split-fee">Fee: ₹${tip.commission.toFixed(2)}</span>
                </div>
                <div class="tip-time">${formatTime(tip.createdAt)}</div>
              </div>
              <div class="tip-amount">₹${tip.amount.toFixed(2)}</div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Error fetching tips:', err);
    }
  }

  function getInitial(name) {
    return (name || 'A').charAt(0).toUpperCase();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
})();
