/*
 * ============================================
 * APP.JS - Main Application Controller
 * ============================================
 * This file initializes the app and handles:
 * - Navigation between sections
 * - Modal popup controls
 * - Sidebar toggle (mobile menu)
 * - Theme toggle
 * - Deadline notifications
 */

/**
 * Wait for the page to fully load before running the app
 * DOMContentLoaded event fires when HTML is completely loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the entire application
 * This is the first function that runs when the app starts
 */
function initializeApp() {
    // Load sample data if database is empty
    initializeSampleData();

    // Get user's saved settings (theme, notifications)
    const settings = getSettings();

    // Apply the saved theme (light or dark)
    applyTheme(settings.theme);

    // Setup all event listeners
    setupNavigation();      // Sidebar navigation clicks
    setupModal();           // Modal open/close
    setupSidebarToggle();   // Mobile menu toggle

    // Show the dashboard first
    renderDashboard();

    // Check if any tasks are due soon and show notification
    checkDeadlineAlerts();
}

/**
 * Setup navigation menu event listeners
 * When user clicks a nav button, show the corresponding section
 */
function setupNavigation() {
    // Get all navigation buttons
    const navItems = document.querySelectorAll('.nav-item');

    // Add click listener to each button
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get the section name from data-section attribute
            // Example: <button data-section="dashboard">
            const section = item.getAttribute('data-section');

            // Navigate to that section
            navigateToSection(section);
        });
    });
}

/**
 * Navigate to a specific section
 * This is how we switch between Dashboard, Subjects, Tasks, etc.
 * @param {String} sectionName - Name of section (dashboard, subjects, tasks, etc.)
 */
function navigateToSection(sectionName) {
    // Step 1: Remove 'active' class and styling from all nav buttons
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active', 'bg-white/20', 'text-white');
        item.classList.add('text-white/80');
    });

    // Step 2: Add 'active' class and styling to clicked nav button
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) {
        activeNav.classList.add('active', 'bg-white/20', 'text-white');
        activeNav.classList.remove('text-white/80');
    }

    // Step 3: Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    // Step 4: Show the selected section
    const activeSection = document.getElementById(`${sectionName}Section`);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.classList.remove('hidden');
    }

    // Step 5: Render the content for that section
    switch (sectionName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'subjects':
            renderSubjects();
            break;
        case 'schedule':
            renderSchedule();
            break;
        case 'tasks':
            renderTasks();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'settings':
            renderSettings();
            break;
    }

    // Step 6: On mobile, close the sidebar after navigation
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

/**
 * Setup modal popup controls
 * Modal is used for Add/Edit forms
 */
function setupModal() {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    // Close modal when clicking the overlay (dark background)
    modalOverlay.addEventListener('click', closeModal);

    // Close modal when clicking the X button
    modalClose.addEventListener('click', closeModal);

    // Close modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
        // Check if Escape key is pressed AND modal is open
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Close the modal popup
 * Removes the 'flex' class and adds 'hidden' to hide it
 */
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

/**
 * Setup sidebar toggle for mobile devices
 * On mobile, sidebar is hidden by default and slides in when toggled
 */
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    // Toggle sidebar when clicking the hamburger menu
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to document
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside of it (only on mobile)
    document.addEventListener('click', (e) => {
        // Only on mobile screens (768px or less)
        if (window.innerWidth <= 768) {
            // If click is outside sidebar AND outside toggle button AND sidebar is open
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
}

/**
 * Check for upcoming deadlines and show notification
 * Shows a toast if tasks are due today or tomorrow
 */
function checkDeadlineAlerts() {
    const settings = getSettings();

    // Only check if notifications are enabled
    if (!settings.notifications) return;

    const tasks = getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to midnight for accurate comparison

    // Find tasks that are due today or tomorrow
    const urgentTasks = tasks.filter(task => {
        // Skip completed tasks
        if (task.completed) return false;

        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);

        // Calculate days until deadline
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        // Include tasks due today (0) or tomorrow (1)
        return daysUntil >= 0 && daysUntil <= 1;
    });

    // If there are urgent tasks, show notification
    if (urgentTasks.length > 0) {
        const message = urgentTasks.length === 1
            ? `You have 1 task due soon!`
            : `You have ${urgentTasks.length} tasks due soon!`;

        // Show toast after 1 second delay
        setTimeout(() => {
            showToast(message, 'warning');
        }, 1000);
    }
}

/**
 * Theme toggle button event listener
 * Switches between light and dark mode
 */
document.getElementById('themeToggle')?.addEventListener('click', () => {
    const settings = getSettings();

    // Toggle theme (if light, make dark; if dark, make light)
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';

    // Apply the new theme
    changeTheme(newTheme);
});

/**
 * Handle window resize events
 * Re-render analytics charts when window is resized
 */
let resizeTimeout;
window.addEventListener('resize', () => {
    // Clear previous timeout
    clearTimeout(resizeTimeout);

    // Wait 250ms after resize stops before re-rendering
    // This prevents too many re-renders while user is resizing
    resizeTimeout = setTimeout(() => {
        // Only re-render if analytics section is visible
        if (document.getElementById('analyticsSection').classList.contains('active')) {
            renderAnalytics();
        }
    }, 250);
});

/**
 * Prevent default form submission
 * We handle form submission with JavaScript, not page reload
 */
document.addEventListener('submit', (e) => {
    if (e.target.tagName === 'FORM') {
        e.preventDefault();  // Stop the form from submitting normally
    }
});
