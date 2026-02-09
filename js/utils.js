function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

function formatDateInput(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
}

function getCurrentDay() {
    return new Date().getDay();
}

function isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
}

function isOverdue(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
}

function getDaysUntil(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = d - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon');

    toastMessage.textContent = message;

    const iconPath = type === 'success'
        ? 'M20 6L9 17L4 12'
        : 'M12 8V12M12 16H12.01';
    toastIcon.querySelector('path').setAttribute('d', iconPath);

    const color = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toastIcon.style.color = color;

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function getPriorityBadge(priority) {
    const colors = {
        high: 'var(--danger)',
        medium: 'var(--warning)',
        low: 'var(--info)'
    };

    return `<span class="badge" style="background: ${colors[priority]}20; color: ${colors[priority]}; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 500;">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>`;
}

function getStatusBadge(completed) {
    const color = completed ? 'var(--success)' : 'var(--text-tertiary)';
    const text = completed ? 'Completed' : 'Pending';

    return `<span class="badge" style="background: ${color}20; color: ${color}; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 500;">${text}</span>`;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getWeekDates(startDay = 0) {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay - startDay;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        weekDates.push(date);
    }

    return weekDates;
}

function calculateCompletionRate(tasks) {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

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

function sortByDate(array, key, ascending = true) {
    return array.sort((a, b) => {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}
