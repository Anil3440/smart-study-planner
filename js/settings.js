function renderSettings() {
    const container = document.getElementById('settingsContent');
    const settings = getSettings();

    container.innerHTML = `
        <div style="max-width: 800px;">
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-lg);">Appearance</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">Theme</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Choose your preferred color scheme</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-secondary ${settings.theme === 'light' ? 'active' : ''}" onclick="changeTheme('light')">Light</button>
                        <button class="btn btn-secondary ${settings.theme === 'dark' ? 'active' : ''}" onclick="changeTheme('dark')">Dark</button>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-lg);">Preferences</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">Notifications</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Enable deadline reminders</p>
                    </div>
                    <label style="cursor: pointer;">
                        <input type="checkbox" ${settings.notifications ? 'checked' : ''} onchange="updateNotifications(this.checked)" style="width: 24px; height: 24px; cursor: pointer;">
                    </label>
                </div>
            </div>
            
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-lg); color: var(--danger);">Reset Data</h3>
                
                <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: var(--spacing-md);">Delete all subjects, schedules, and tasks. This cannot be undone!</p>
                    <button class="btn btn-secondary" style="color: var(--danger);" onclick="resetDataHandler()">Reset All Data</button>
                </div>
            </div>
        </div>
    `;
}

function changeTheme(theme) {
    updateSettings({ theme });
    applyTheme(theme);
    showToast(`Switched to ${theme} mode!`);
    renderSettings();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function updateNotifications(enabled) {
    updateSettings({ notifications: enabled });
    showToast(`Notifications ${enabled ? 'enabled' : 'disabled'}!`);
}

function resetDataHandler() {
    if (confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
        resetAllData();
        showToast('All data has been reset!');
        renderDashboard();
        renderSubjects();
        renderSchedule();
        renderTasks();
        renderAnalytics();
        renderSettings();
        navigateToSection('dashboard');
    }
}
