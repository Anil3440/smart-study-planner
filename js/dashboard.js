function renderDashboard() {
    const container = document.getElementById('dashboardContent');
    const subjects = getSubjects();
    const tasks = getTasks();
    const schedules = getSchedules();
    const today = getCurrentDay();

    const totalSubjects = subjects.length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const todaySchedules = schedules.filter(s => s.day === today);
    const upcomingTasks = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    container.innerHTML = `
        <div class="grid-stats mb-xl">
            <div class="card card-stat-primary">
                <p class="stat-label">Total Subjects</p>
                <h3 class="stat-number">${totalSubjects}</h3>
            </div>
            
            <div class="card card-stat-warning">
                <p class="stat-label">Pending Tasks</p>
                <h3 class="stat-number">${pendingTasks}</h3>
            </div>
            
            <div class="card card-stat-info">
                <p class="stat-label">Today's Classes</p>
                <h3 class="stat-number">${todaySchedules.length}</h3>
            </div>
        </div>
        
        <div class="grid-2-col">
            <div class="card">
                <h3 class="mb-lg">Today's Schedule</h3>
                ${todaySchedules.length > 0 ? renderTodaySchedule(todaySchedules) : '<p class="empty-state-text text-center">No classes today</p>'}
            </div>
            
            <div class="card">
                <h3 class="mb-lg">Upcoming Deadlines</h3>
                ${upcomingTasks.length > 0 ? renderUpcomingDeadlines(upcomingTasks) : '<p class="empty-state-text text-center">No upcoming tasks</p>'}
            </div>
        </div>
    `;
}

function renderTodaySchedule(schedules) {
    return schedules.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        .map(schedule => {
            const subject = getSubjectById(schedule.subjectId);
            if (!subject) return '';

            return `
                <div class="schedule-item" style="color: ${subject.color}">
                    <div class="schedule-header">
                        <h4>${sanitizeHTML(subject.name)}</h4>
                        <span class="schedule-time">${formatTime(schedule.startTime)}</span>
                    </div>
                    <p class="schedule-location">${sanitizeHTML(schedule.location)}</p>
                </div>
            `;
        }).join('');
}

function renderUpcomingDeadlines(tasks) {
    return tasks.map(task => {
        const subject = getSubjectById(task.subjectId);
        if (!subject) return '';

        const daysUntil = getDaysUntil(task.deadline);
        const isUrgent = daysUntil <= 2;

        return `
            <div class="schedule-item" style="color: ${isUrgent ? 'var(--danger)' : subject.color}">
                <h4>${sanitizeHTML(task.title)}</h4>
                <p class="task-subject">${sanitizeHTML(subject.name)}</p>
                <p class="${isUrgent ? 'text-overdue' : 'text-tertiary'}" style="font-size: 0.85rem;">
                    ${formatDate(task.deadline)} ${daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil} days)`}
                </p>
            </div>
        `;
    }).join('');
}
