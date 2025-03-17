document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');

    // Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            document.body.classList.toggle('light-theme');
            
            // Save theme preference
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${savedTheme}-theme`);
    }

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // Save sidebar state
            localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
        });

        // Load saved sidebar state
        const sidebarState = localStorage.getItem('sidebarState');
        if (sidebarState === 'collapsed') {
            sidebar.classList.add('collapsed');
        }
    }

    // Sidebar Menu Items
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
        });
    });

    // Search Functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const menuItems = document.querySelectorAll('.sidebar-menu-item');
            
            menuItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Notifications
    const notificationBell = document.getElementById('notification-bell');
    const notificationPanel = document.getElementById('notification-panel');
    
    if (notificationBell && notificationPanel) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
            // Update notification count
            const notificationCount = document.querySelector('.notification-count');
            if (notificationCount) {
                notificationCount.style.display = 'none';
            }
        });

        // Close notification panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationPanel.contains(e.target) && e.target !== notificationBell) {
                notificationPanel.classList.remove('active');
            }
        });
    }

    // Quick Actions
    const quickActionButtons = document.querySelectorAll('.quick-action-button');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const actionType = button.dataset.action;
            handleQuickAction(actionType);
        });
    });

    // Initialize tooltips
    initializeTooltips();
});

// Quick Action Handler
function handleQuickAction(actionType) {
    switch(actionType) {
        case 'new-task':
            // Handle new task creation
            console.log('Creating new task...');
            break;
        case 'new-project':
            // Handle new project creation
            console.log('Creating new project...');
            break;
        case 'generate-report':
            // Handle report generation
            console.log('Generating report...');
            break;
        default:
            console.log('Unknown action type');
    }
}

// Initialize Tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            document.body.appendChild(tooltip);

            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        });

        element.addEventListener('mouseleave', () => {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Error Handler
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // You can add more error handling logic here
}

// Add event listener for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${newTheme}-theme`);
    localStorage.setItem('theme', newTheme);
});

// Add resize observer for responsive adjustments
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target === document.body) {
            // Handle responsive adjustments
            const isMobile = window.innerWidth < 768;
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                if (isMobile && !sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                }
            }
        }
    }
});

resizeObserver.observe(document.body);
