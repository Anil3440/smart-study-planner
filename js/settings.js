function renderSettings() {
    const container = document.getElementById('settingsContent');
    const settings = getSettings();

    container.innerHTML = `
        <div class="settings-container">
            <div class="card mb-xl">
                <h3 class="mb-lg">Appearance</h3>
                
                <div class="settings-item">
                    <div class="settings-info">
                        <h4>Theme</h4>
                        <p>Choose your preferred color scheme</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-secondary ${settings.theme === 'light' ? 'active' : ''}" onclick="changeTheme('light')">Light</button>
                        <button class="btn btn-secondary ${settings.theme === 'dark' ? 'active' : ''}" onclick="changeTheme('dark')">Dark</button>
                    </div>
                </div>
            </div>
            
            <div class="card mb-xl">
                <h3 class="mb-lg">Preferences</h3>
                
                <div class="settings-item">
                    <div class="settings-info">
                        <h4>Notifications</h4>
                        <p>Enable deadline reminders</p>
                    </div>
                    <label style="cursor: pointer;">
                        <input type="checkbox" ${settings.notifications ? 'checked' : ''} onchange="updateNotifications(this.checked)" class="settings-checkbox">
                    </label>
                </div>
            </div>
            
            <div class="card">
                <h3 class="mb-lg danger-text">Reset Data</h3>
                
                <div class="settings-item">
                    <p class="empty-state-text" style="margin-bottom: var(--spacing-md);">Delete all subjects, schedules, and tasks. This cannot be undone!</p>
                    <button class="btn btn-secondary btn-danger-text" onclick="resetDataHandler()">Reset All Data</button>
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
