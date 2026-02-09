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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
            <div class="card" style="background: var(--primary); color: white;">
                <p style="opacity: 0.9; margin-bottom: var(--spacing-xs);">Total Subjects</p>
                <h3 style="font-size: 2.5rem; font-weight: 700;">${totalSubjects}</h3>
            </div>
            
            <div class="card" style="background: var(--warning); color: white;">
                <p style="opacity: 0.9; margin-bottom: var(--spacing-xs);">Pending Tasks</p>
                <h3 style="font-size: 2.5rem; font-weight: 700;">${pendingTasks}</h3>
            </div>
            
            <div class="card" style="background: var(--info); color: white;">
                <p style="opacity: 0.9; margin-bottom: var(--spacing-xs);">Today's Classes</p>
                <h3 style="font-size: 2.5rem; font-weight: 700;">${todaySchedules.length}</h3>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl);">
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-lg);">Today's Schedule</h3>
                ${todaySchedules.length > 0 ? renderTodaySchedule(todaySchedules) : '<p style="color: var(--text-tertiary); text-align: center; padding: var(--spacing-xl);">No classes today</p>'}
            </div>
            
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-lg);">Upcoming Deadlines</h3>
                ${upcomingTasks.length > 0 ? renderUpcomingDeadlines(upcomingTasks) : '<p style="color: var(--text-tertiary); text-align: center; padding: var(--spacing-xl);">No upcoming tasks</p>'}
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
                <div style="padding: var(--spacing-md); border-left: 4px solid ${subject.color}; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                        <h4>${sanitizeHTML(subject.name)}</h4>
                        <span style="color: var(--text-tertiary); font-size: 0.9rem;">${formatTime(schedule.startTime)}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${sanitizeHTML(schedule.location)}</p>
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
            <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm); border-left: 4px solid ${isUrgent ? 'var(--danger)' : subject.color};">
                <h4>${sanitizeHTML(task.title)}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: var(--spacing-xs) 0;">${sanitizeHTML(subject.name)}</p>
                <p style="color: ${isUrgent ? 'var(--danger)' : 'var(--text-tertiary)'}; font-size: 0.85rem;">
                    ${formatDate(task.deadline)} ${daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil} days)`}
                </p>
            </div>
        `;
    }).join('');
}
