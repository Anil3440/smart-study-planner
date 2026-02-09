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
        <div class="card">
            <h3>${days[today]}</h3>
            ${schedules.length === 0 ?
            `<div style="text-align: center; padding: var(--spacing-2xl);">
                    <p style="color: var(--text-secondary);">No classes today</p>
                </div>` :
            renderTimeSlots(schedules)
        }
        </div>
    `;
}

function renderTimeSlots(schedules) {
    return schedules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        .map(schedule => {
            const subject = getSubjectById(schedule.subjectId);
            if (!subject) return '';

            return `
                <div class="card" style="margin-bottom: var(--spacing-md); border-left: 4px solid ${subject.color};">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                        <div>
                            <h4>${sanitizeHTML(subject.name)}</h4>
                            <p style="color: var(--text-secondary);">${sanitizeHTML(schedule.type)} • ${sanitizeHTML(schedule.location)}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: var(--primary); font-weight: 600;">${formatTime(schedule.startTime)}</p>
                            <p style="color: var(--text-tertiary); font-size: 0.85rem;">to ${formatTime(schedule.endTime)}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="editSchedule('${schedule.id}')">Edit</button>
                        <button class="btn btn-secondary" style="color: var(--danger);" onclick="deleteScheduleConfirm('${schedule.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
}

function renderWeeklySchedule() {
    const container = document.getElementById('scheduleContent');
    const schedules = getSchedules();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    container.innerHTML = `
        <div class="card" style="overflow-x: auto;">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--spacing-md); min-width: 800px;">
                ${days.map((day, index) => `
                    <div>
                        <h4 style="text-align: center; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm);">${day}</h4>
                        <div style="min-height: 300px;">
                            ${renderDaySchedules(schedules.filter(s => s.day === index))}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderDaySchedules(schedules) {
    if (schedules.length === 0) {
        return '<p style="color: var(--text-tertiary); font-size: 0.85rem; text-align: center;">-</p>';
    }

    return schedules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        .map(schedule => {
            const subject = getSubjectById(schedule.subjectId);
            if (!subject) return '';

            return `
                <div style="padding: var(--spacing-sm); background: var(--bg-secondary); border-left: 3px solid ${subject.color}; border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm); cursor: pointer;" onclick="editSchedule('${schedule.id}')">
                    <p style="font-weight: 600; font-size: 0.85rem;">${sanitizeHTML(subject.name)}</p>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">${formatTime(schedule.startTime)}</p>
                </div>
            `;
        }).join('');
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

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    modalBody.innerHTML = `
        <form id="scheduleForm" onsubmit="saveSchedule(event, ${isEdit ? `'${scheduleId}'` : 'null'})">
            <div class="form-group">
                <label class="form-label">Subject *</label>
                <select class="form-select" id="scheduleSubject" required>
                    <option value="">Select a subject</option>
                    ${subjects.map(s => `
                        <option value="${s.id}" ${isEdit && schedule.subjectId === s.id ? 'selected' : ''}>
                            ${sanitizeHTML(s.name)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Day *</label>
                <select class="form-select" id="scheduleDay" required>
                    ${days.map((day, index) => `
                        <option value="${index}" ${isEdit && schedule.day === index ? 'selected' : ''}>${day}</option>
                    `).join('')}
                </select>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                <div class="form-group">
                    <label class="form-label">Start Time *</label>
                    <input type="time" class="form-input" id="scheduleStartTime" value="${isEdit ? schedule.startTime : '09:00'}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">End Time *</label>
                    <input type="time" class="form-input" id="scheduleEndTime" value="${isEdit ? schedule.endTime : '10:30'}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" id="scheduleLocation" value="${isEdit ? sanitizeHTML(schedule.location || '') : ''}" placeholder="e.g., Room 101">
            </div>
            
            <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" id="scheduleType">
                    <option value="Lecture" ${isEdit && schedule.type === 'Lecture' ? 'selected' : ''}>Lecture</option>
                    <option value="Lab" ${isEdit && schedule.type === 'Lab' ? 'selected' : ''}>Lab</option>
                    <option value="Tutorial" ${isEdit && schedule.type === 'Tutorial' ? 'selected' : ''}>Tutorial</option>
                </select>
            </div>
            
            <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-lg);">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Add'}</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

function saveSchedule(event, scheduleId) {
    event.preventDefault();

    const data = {
        subjectId: document.getElementById('scheduleSubject').value,
        day: parseInt(document.getElementById('scheduleDay').value),
        startTime: document.getElementById('scheduleStartTime').value,
        endTime: document.getElementById('scheduleEndTime').value,
        location: document.getElementById('scheduleLocation').value.trim(),
        type: document.getElementById('scheduleType').value
    };

    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
        showToast('End time must be after start time!', 'error');
        return;
    }

    const allSchedules = getSchedules();
    if (hasTimeConflict(allSchedules, data, scheduleId)) {
        showToast('Time conflict detected!', 'error');
        return;
    }

    if (scheduleId) {
        updateSchedule(scheduleId, data);
        showToast('Class updated!');
    } else {
        addSchedule(data);
        showToast('Class added!');
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
    if (confirm('Delete this class?')) {
        deleteSchedule(scheduleId);
        showToast('Class deleted!');
        renderSchedule();

        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addScheduleBtn');
    if (addBtn) addBtn.addEventListener('click', () => openScheduleModal());

    const dailyBtn = document.getElementById('dailyViewBtn');
    const weeklyBtn = document.getElementById('weeklyViewBtn');

    if (dailyBtn) {
        dailyBtn.addEventListener('click', () => {
            currentView = 'daily';
            dailyBtn.classList.add('active');
            weeklyBtn.classList.remove('active');
            renderSchedule();
        });
    }

    if (weeklyBtn) {
        weeklyBtn.addEventListener('click', () => {
            currentView = 'weekly';
            weeklyBtn.classList.add('active');
            dailyBtn.classList.remove('active');
            renderSchedule();
        });
    }
});
