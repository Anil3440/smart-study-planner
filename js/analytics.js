

function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    const subjects = getSubjects();
    const tasks = getTasks();

    if (subjects.length === 0 || tasks.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: var(--spacing-2xl);">
                <svg style="width: 80px; height: 80px; color: var(--text-tertiary); margin: 0 auto var(--spacing-lg);" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3V21H21" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3 style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">No data available</h3>
                <p style="color: var(--text-tertiary);">Add subjects and tasks to see analytics</p>
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
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
            <div class="card" style="text-align: center; background: linear-gradient(135deg, var(--success)20 0%, var(--success)10 100%); border-top: 3px solid var(--success);">
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Completed</p>
                <h2 style="color: var(--success); font-size: 2.5rem;">${completedTasks}</h2>
            </div>
            
            <div class="card" style="text-align: center; background: linear-gradient(135deg, var(--warning)20 0%, var(--warning)10 100%); border-top: 3px solid var(--warning);">
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Pending</p>
                <h2 style="color: var(--warning); font-size: 2.5rem;">${pendingTasks}</h2>
            </div>
            
            <div class="card" style="text-align: center; background: linear-gradient(135deg, var(--danger)20 0%, var(--danger)10 100%); border-top: 3px solid var(--danger);">
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Overdue</p>
                <h2 style="color: var(--danger); font-size: 2.5rem;">${overdueTasks}</h2>
            </div>
            
            <div class="card" style="text-align: center; background: linear-gradient(135deg, var(--primary)20 0%, var(--primary)10 100%); border-top: 3px solid var(--primary);">
                <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xs);">Completion Rate</p>
                <h2 style="color: var(--primary); font-size: 2.5rem;">${completionRate}%</h2>
            </div>
        </div>
        
        <!-- Charts -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl); margin-bottom: var(--spacing-xl);">
            <!-- Completion Chart -->
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-lg);">Task Completion</h3>
                <div style="position: relative; height: 300px;">
                    <canvas id="completionChart"></canvas>
                </div>
            </div>
            
            <!-- Subject Distribution -->
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-lg);">Tasks by Subject</h3>
                <div style="position: relative; height: 300px;">
                    <canvas id="subjectChart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Subject Performance -->
        <div class="card">
            <h3 style="margin-bottom: var(--spacing-lg);">Subject Performance</h3>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
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
        <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); border-left: 4px solid ${subject.color};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                <h4 style="color: var(--text-primary);">${sanitizeHTML(subject.name)}</h4>
                <span style="color: var(--text-secondary); font-weight: 600;">${completed}/${total} tasks</span>
            </div>
            
            <!-- Progress Bar -->
            <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                <div style="width: ${percentage}%; height: 100%; background: ${subject.color}; transition: width 0.3s ease;"></div>
            </div>
            
            <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-top: var(--spacing-xs);">
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
