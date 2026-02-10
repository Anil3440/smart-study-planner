function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    const subjects = getSubjects();
    const tasks = getTasks();

    if (subjects.length === 0 || tasks.length === 0) {
        container.innerHTML = `
            <div class="card empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3V21H21" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3 class="empty-state-title">No data available</h3>
                <p class="empty-state-text">Add subjects and tasks to see analytics</p>
            </div>
        `;
        return;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const overdueTasks = tasks.filter(t => !t.completed && isOverdue(t.deadline)).length;

    const tasksBySubject = groupBy(tasks, 'subjectId');

    container.innerHTML = `
        <div class="grid-stats mb-xl">
            <div class="card card-gradient-success">
                <p class="stats-label mb-xs">Completed</p>
                <h2 style="color: var(--success); font-size: 2.5rem;">${completedTasks}</h2>
            </div>
            
            <div class="card card-gradient-warning">
                <p class="stats-label mb-xs">Pending</p>
                <h2 style="color: var(--warning); font-size: 2.5rem;">${pendingTasks}</h2>
            </div>
            
            <div class="card card-gradient-danger">
                <p class="stats-label mb-xs">Overdue</p>
                <h2 style="color: var(--danger); font-size: 2.5rem;">${overdueTasks}</h2>
            </div>
            
            <div class="card card-gradient-primary">
                <p class="stats-label mb-xs">Completion Rate</p>
                <h2 style="color: var(--primary); font-size: 2.5rem;">${completionRate}%</h2>
            </div>
        </div>
        
        <div class="grid-2-col mb-xl">
            <div class="card">
                <h3 class="mb-lg">Task Completion</h3>
                <div class="chart-container">
                    <canvas id="completionChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <h3 class="mb-lg">Tasks by Subject</h3>
                <div class="chart-container">
                    <canvas id="subjectChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 class="mb-lg">Subject Performance</h3>
            <div class="flex-col-gap">
                ${subjects.map(subject => renderSubjectPerformance(subject, tasksBySubject[subject.id] || [])).join('')}
            </div>
        </div>
    `;

    setTimeout(() => {
        renderCompletionChart(completedTasks, pendingTasks, overdueTasks);
        renderSubjectChart(subjects, tasksBySubject);
    }, 0);
}

function renderSubjectPerformance(subject, tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return `
        <div class="performance-card" style="color: ${subject.color}">
            <div class="performance-header">
                <h4>${sanitizeHTML(subject.name)}</h4>
                <span class="performance-tasks">${completed}/${total} tasks</span>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background: ${subject.color};"></div>
            </div>
            
            <p class="performance-percentage">
                ${percentage}% complete
            </p>
        </div>
    `;
}

let completionChartInstance = null;
let subjectChartInstance = null;

function renderCompletionChart(completed, pending, overdue) {
    const canvas = document.getElementById('completionChart');
    if (!canvas) return;

    if (completionChartInstance) {
        completionChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    completionChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [completed, pending, overdue],
                backgroundColor: [
                    'hsl(145, 65%, 50%)',
                    'hsl(40, 90%, 55%)',
                    'hsl(0, 75%, 60%)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderSubjectChart(subjects, tasksBySubject) {
    const canvas = document.getElementById('subjectChart');
    if (!canvas) return;

    if (subjectChartInstance) {
        subjectChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const labels = subjects.map(s => s.name);
    const data = subjects.map(s => (tasksBySubject[s.id] || []).length);
    const colors = subjects.map(s => s.color);

    subjectChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tasks',
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}
