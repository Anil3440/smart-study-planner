/*
 * ============================================
 * SETTINGS.JS - Settings Management Module
 * ============================================
 * This file handles the settings page where users can:
 * - Change theme (light/dark mode)
 * - Enable/disable notifications
 * - Reset all data
 */

/**
 * Render the settings page
 * Shows theme toggle, notification toggle, and reset button
 */
function renderSettings() {
    const container = document.getElementById('settingsContent');
    const settings = getSettings();  // Get current settings from LocalStorage

    // Build the settings page HTML with Tailwind classes
    container.innerHTML = `
        <div class="max-w-2xl space-y-6">
            <!-- Appearance Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Appearance</h3>
                
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white">Theme</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose your preferred color scheme</p>
                    </div>
                    <!-- Theme Toggle Buttons -->
                    <div class="flex gap-2">
                        <button class="px-4 py-2 rounded-md font-medium transition-colors ${settings.theme === 'light' ? 'bg-black text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}" 
                                onclick="changeTheme('light')">Light</button>
                        <button class="px-4 py-2 rounded-md font-medium transition-colors ${settings.theme === 'dark' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}" 
                                onclick="changeTheme('dark')">Dark</button>
                    </div>
                </div>
            </div>
            
            <!-- Preferences Section -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Preferences</h3>
                
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable deadline reminders</p>
                    </div>
                    <!-- Notification Checkbox -->
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               ${settings.notifications ? 'checked' : ''} 
                               onchange="updateNotifications(this.checked)" 
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            
            <!-- Danger Zone - Reset Data -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-red-200 dark:border-red-900">
                <h3 class="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Reset Data</h3>
                
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Delete all subjects, schedules, and tasks. This cannot be undone!
                </p>
                <button class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors" 
                        onclick="resetDataHandler()">Reset All Data</button>
            </div>
        </div>
    `;
}

/**
 * Change the app theme
 * @param {String} theme - Either 'light' or 'dark'
 */
function changeTheme(theme) {
    // Save the new theme to LocalStorage
    updateSettings({ theme });

    // Apply the theme to the page
    applyTheme(theme);

    // Show success message
    showToast(`Switched to ${theme} mode!`);

    // Re-render settings to update button states
    renderSettings();
}

/**
 * Apply theme to the page
 * This changes the CSS by adding/removing 'dark' class
 * @param {String} theme - Either 'light' or 'dark'
 */
function applyTheme(theme) {
    // Add or remove 'dark' class from <html> element
    // Tailwind uses this to apply dark mode styles
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Update notification preference
 * @param {Boolean} enabled - True to enable, false to disable
 */
function updateNotifications(enabled) {
    // Save the preference to LocalStorage
    updateSettings({ notifications: enabled });

    // Show confirmation message
    showToast(`Notifications ${enabled ? 'enabled' : 'disabled'}!`);
}

/**
 * Handle reset data button click
 * Shows confirmation dialog before deleting all data
 */
function resetDataHandler() {
    // Ask for confirmation (this is a destructive action!)
    if (confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
        // Delete all data from LocalStorage
        resetAllData();

        // Show success message
        showToast('All data has been reset!');

        // Re-render all sections to show empty state
        renderDashboard();
        renderSubjects();
        renderSchedule();
        renderTasks();
        renderAnalytics();
        renderSettings();

        // Navigate back to dashboard
        navigateToSection('dashboard');
    }
}
