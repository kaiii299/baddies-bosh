const { execSync } = require('child_process');

const components = [
    'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar',
    'badge', 'button', 'calendar', 'card', 'checkbox',
    'collapsible', 'combobox', 'command', 'context-menu',
    'dialog', 'drawer', 'dropdown-menu', 'form', 'hover-card',
    'input', 'label', 'menubar', 'navigation-menu', 'popover',
    'progress', 'radio-group', 'scroll-area', 'select', 'separator',
    'sheet', 'skeleton', 'slider', 'switch', 'table', 'tabs',
    'textarea', 'toast', 'toggle', 'tooltip'
];

for (const component of components) {
    console.log(`Installing ${component}...`);
    execSync(`npx shadcn add ${component}`, { stdio: 'inherit' });
}

console.log('✅ All ShadCN components installed!');