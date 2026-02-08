/**
 * ShapeX Dashboard JavaScript
 */

// Trigger scan
async function triggerScan() {
    const button = event.target;
    button.disabled = true;
    button.textContent = 'Scanning...';

    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Scan started! Check the Scans page for progress.', 'success');

            // Reload page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } else {
            showNotification('Failed to start scan. Please try again.', 'error');
            button.disabled = false;
            button.textContent = 'Run Scan Now';
        }
    } catch (error) {
        console.error('Error triggering scan:', error);
        showNotification('Error starting scan. Check console for details.', 'error');
        button.disabled = false;
        button.textContent = 'Run Scan Now';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Auto-refresh stats every 30 seconds
setInterval(async () => {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Update stats on page (if elements exist)
        const totalIdeasEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (totalIdeasEl) {
            totalIdeasEl.textContent = stats.ideas.total;
        }
    } catch (error) {
        console.error('Error refreshing stats:', error);
    }
}, 30000);
