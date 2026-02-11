let currentView = 'daily';

function renderSchedule() {
    currentView === 'daily' ? renderDailySchedule() : renderWeeklySchedule();
}

function renderDailySchedule() {
    const container = document.getElementById('scheduleContent');
    const today = getCurrentDay();
    const schedules = getSchedulesByDay(today);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">${days[today]}</h3>
            ${schedules.length === 0 ?
            `<div class="text-center py-12">
                    <p class="text-gray-500 dark:text-gray-400">No classes today</p>
                </div>` :
            renderTimeSlots(schedules)
        }
        </div>
    `;
}

function renderTimeSlots(schedules) {
    return '<div class="space-y-4">' + schedules
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        .map(schedule => {
            const subject = getSubjectById(schedule.subjectId);
            if (!subject) return '';

            return `
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4" style="border-color: ${subject.color}">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${sanitizeHTML(subject.name)}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${sanitizeHTML(schedule.type)} • ${sanitizeHTML(schedule.location)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-gray-900 dark:text-white">${formatTime(schedule.startTime)}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">to ${formatTime(schedule.endTime)}</p>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" onclick="editSchedule('${schedule.id}')">Edit</button>
                        <button class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onclick="deleteScheduleConfirm('${schedule.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('') + '</div>';
}

function renderWeeklySchedule() {
    const container = document.getElementById('scheduleContent');
    const schedules = getSchedules();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 overflow-x-auto">
            <div class="grid grid-cols-7 gap-2 min-w-[800px]">
                ${days.map((day, index) => renderDayColumn(day, index, schedules)).join('')}
            </div>
        </div>
    `;
}

function renderDayColumn(day, dayIndex, schedules) {
    const daySchedules = schedules.filter(s => s.day === dayIndex)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    return `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center">${day}</h4>
            <div class="space-y-2">
                ${daySchedules.length === 0
            ? '<p class="text-xs text-gray-400 dark:text-gray-500 text-center">No classes</p>'
            : daySchedules.map(s => renderWeeklyScheduleItem(s)).join('')
        }
            </div>
        </div>
    `;
}

function renderWeeklyScheduleItem(schedule) {
    const subject = getSubjectById(schedule.subjectId);
    if (!subject) return '';

    return `
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded p-2 border-l-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
             style="border-color: ${subject.color}"
             onclick="editSchedule('${schedule.id}')">
            <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">${sanitizeHTML(subject.name)}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">${formatTime(schedule.startTime)}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${sanitizeHTML(schedule.location)}</p>
        </div>
    `;
}

function openScheduleModal(scheduleId = null) {
    const schedule = scheduleId ? getSchedules().find(s => s.id === scheduleId) : null;
    const isEdit = !!schedule;
    const subjects = getSubjects();

    if (subjects.length === 0) {
        showToast('Please add subjects first!', 'error');
        return;
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Class' : 'Add New Class';

    modalBody.innerHTML = `
        <form id="scheduleForm" onsubmit="saveSchedule(event, ${isEdit ? `'${scheduleId}'` : 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                <select id="scheduleSubject" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                    <option value="">Select a subject</option>
                    ${subjects.map(s => `
                        <option value="${s.id}" ${isEdit && schedule.subjectId === s.id ? 'selected' : ''}>
                            ${sanitizeHTML(s.name)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day *</label>
                    <select id="scheduleDay" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                        ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => `
                            <option value="${i}" ${isEdit && schedule.day === i ? 'selected' : ''}>${day}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                    <select id="scheduleType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                        <option value="Lecture" ${isEdit && schedule.type === 'Lecture' ? 'selected' : ''}>Lecture</option>
                        <option value="Lab" ${isEdit && schedule.type === 'Lab' ? 'selected' : ''}>Lab</option>
                        <option value="Tutorial" ${isEdit && schedule.type === 'Tutorial' ? 'selected' : ''}>Tutorial</option>
                    </select>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                    <input type="time" id="scheduleStartTime" 
                           value="${isEdit ? schedule.startTime : '09:00'}" 
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                           required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time *</label>
                    <input type="time" id="scheduleEndTime" 
                           value="${isEdit ? schedule.endTime : '10:00'}" 
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                           required>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input type="text" id="scheduleLocation" 
                       value="${isEdit ? sanitizeHTML(schedule.location) : ''}" 
                       placeholder="e.g., Room 101, Building A"
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                       required>
            </div>
            
            <div class="flex gap-3 pt-4">
                <button type="button" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onclick="closeModal()">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">${isEdit ? 'Save Changes' : 'Add Class'}</button>
            </div>
        </form>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function saveSchedule(event, scheduleId) {
    event.preventDefault();

    const data = {
        subjectId: document.getElementById('scheduleSubject').value,
        day: parseInt(document.getElementById('scheduleDay').value),
        type: document.getElementById('scheduleType').value,
        startTime: document.getElementById('scheduleStartTime').value,
        endTime: document.getElementById('scheduleEndTime').value,
        location: document.getElementById('scheduleLocation').value.trim()
    };

    if (hasTimeConflict(getSchedules(), data, scheduleId)) {
        showToast('Time conflict with existing schedule!', 'error');
        return;
    }

    if (scheduleId) {
        updateSchedule(scheduleId, data);
        showToast('Class updated successfully!');
    } else {
        addSchedule(data);
        showToast('Class added successfully!');
    }

    closeModal();
    renderSchedule();

    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
}

function editSchedule(scheduleId) {
    openScheduleModal(scheduleId);
}

function deleteScheduleConfirm(scheduleId) {
    if (confirm('Are you sure you want to delete this class?')) {
        deleteSchedule(scheduleId);
        showToast('Class deleted successfully!');
        renderSchedule();

        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
    }
}

function toggleView(view) {
    currentView = view;

    const dailyBtn = document.getElementById('dailyViewBtn');
    const weeklyBtn = document.getElementById('weeklyViewBtn');

    if (view === 'daily') {
        dailyBtn.classList.add('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        dailyBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        weeklyBtn.classList.remove('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        weeklyBtn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    } else {
        weeklyBtn.classList.add('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        weeklyBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        dailyBtn.classList.remove('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        dailyBtn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
    }

    renderSchedule();
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addScheduleBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openScheduleModal());
    }

    const dailyBtn = document.getElementById('dailyViewBtn');
    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => toggleView('daily'));
    }

    const weeklyBtn = document.getElementById('weeklyViewBtn');
    if (weeklyBtn) {
        weeklyBtn.addEventListener('click', () => toggleView('weekly'));
    }
});
