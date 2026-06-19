// ProFinance Design System - Color Palette
export const colors = {
  // Primary backgrounds
  background: '#29314738',      // Main app background
  surface: '#13b7f33f',         // Sidebar/Topbar background
  card: '#272930eb',            // Card/Container background
  border: '#1c245070',          // Border color

  // Input & form
  inputBg: '#13151E',         // Input background
  inputBorder: '#2A2D3E',     // Input border

  // Accent colors
  primary: '#08027b',         // Primary accent (purple-blue)
  primaryHover: '#0b0a1e',    // Primary hover

  // Semantic colors
  success: '#22C55E',         // Income/Success (green)
  danger: '#c61938',          // Expense/Danger (red)
  warning: '#F59E0B',         // Warning (amber)
  info: '#3B82F6',            // Info (blue)
  
  // Secondary accents
  secondary: '#A855F7',       // Secondary purple
  cyan: '#06B6D4',            // Cyan accent

  // Text colors
  text: '#E8E9F0',            // Primary text
  textMuted: '#8B8FA8',       // Muted/secondary text
  textSecondary: '#6B7280',   // Tertiary text

  // Status colors
  online: '#22C55E',
  offline: '#6B7280',

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #010108 0%, #8B85FF 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    balance: 'linear-gradient(135deg, #6C63FF 0%, #A855F7 100%)',
  }
};

// Category colors
export const categoryColors = {
  // Expense categories
  Food: '#F59E0B',
  Transport: '#3B82F6',
  Housing: '#8B5CF6',
  Health: '#EF4444',
  Entertainment: '#EC4899',
  Shopping: '#06B6D4',
  Education: '#6366F1',
  Charity: '#10B981',
  Football: '#D946EF',
  'Monthly Internet': '#14B8A6',
  Internet: '#0EA5E9',

  // Income categories
  Salary: '#22C55E',
  Freelance: '#6366F1',
  Business: '#8B5CF6',
  Investment: '#F59E0B',
  Gift: '#EC4899',

  // Todo categories
  Work: '#3B82F6',
  Study: '#6366F1',
  Personal: '#A855F7',
  Finance: '#22C55E',
  Home: '#F59E0B',

  // Savings goals
  'Emergency Fund': '#EF4444',
  Vacation: '#EC4859',
  Car: '#3B82F6',
  Retirement: '#22C55E',

  // Default
  Other: '#6B7280',
};

// Priority colors
export const priorityColors = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#10B981',
};

// Status colors
export const statusColors = {
  Open: '#3B82F6',
  'In Progress': '#F59E0B',
  Completed: '#22C55E',
  Archived: '#6B7280',
};
