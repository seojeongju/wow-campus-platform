// Statistics loader for home page
async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const result = await response.json();

        console.log('Statistics response:', result);

        if (result.success && result.data) {
            const { jobs, jobseekers, reviews, resumes } = result.data;

            // Update statistics counts with animation
            animateCount('[data-stat="jobs"]', jobs);
            animateCount('[data-stat="jobseekers"]', jobseekers);
            animateCount('[data-stat="reviews"]', reviews);
            animateCount('[data-stat="resumes"]', resumes);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function animateCount(selector, targetValue) {
    const element = document.querySelector(selector);
    if (!element) return;

    const startValue = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentValue = Math.floor(progress * targetValue);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = targetValue;
        }
    }

    requestAnimationFrame(update);
}

// Auto-load on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStatistics);
} else {
    loadStatistics();
}
