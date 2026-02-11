// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date as "Jan 15, 2026"
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date for input field (YYYY-MM-DD)
function formatDateInput(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Convert 24-hour time to 12-hour format (9:00 AM)
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get current day number (0=Sunday, 1=Monday, etc.)
function getCurrentDay() {
    return new Date().getDay();
}

// Check if date is overdue
function isOverdue(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

// Get number of days until date
function getDaysUntil(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = d - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Convert time string to minutes (9:30 -> 570)
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Check if two schedules conflict
function hasTimeConflict(schedules, newSchedule, excludeId = null) {
    return schedules.some(schedule => {
        if (schedule.id === excludeId) return false;
        if (schedule.day !== newSchedule.day) return false;

        const start1 = timeToMinutes(schedule.startTime);
        const end1 = timeToMinutes(schedule.endTime);
        const start2 = timeToMinutes(newSchedule.startTime);
        const end2 = timeToMinutes(newSchedule.endTime);

        return (start1 < end2 && end1 > start2);
    });
}

// Show notification message
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Update message
    toastMessage.textContent = message;

    // Update color based on type
    if (type === 'success') {
        toast.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 z-50 translate-y-0 opacity-100';
    } else {
        toast.className = 'fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 z-50 translate-y-0 opacity-100';
    }

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3000);
}

// Prevent XSS attacks by escaping HTML
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Create priority badge HTML
function getPriorityBadge(priority) {
    const classes = {
        high: 'px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        medium: 'px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        low: 'px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    const text = priority.charAt(0).toUpperCase() + priority.slice(1);
    return `<span class="${classes[priority]}">${text}</span>`;
}

// Create status badge HTML
function getStatusBadge(completed) {
    const className = completed
        ? 'px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : 'px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    const text = completed ? 'Completed' : 'Pending';
    return `<span class="${className}">${text}</span>`;
}

// Group array items by a key
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

// Sort array by date
function sortByDate(array, key, ascending = true) {
    return array.sort((a, b) => {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}
