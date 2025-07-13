# Dark Mode, Loading States & Error Handling Implementation

## 🌙 **Dark Mode Implementation**

### Overview
SIIhadirin sekarang mendukung dark mode yang dapat diaktifkan/nonaktifkan oleh pengguna dengan smooth transitions dan konsistensi warna merah brand PT Intek Solusi Indonesia.

### Features
- **Theme Toggle**: Button untuk switch antara light dan dark mode
- **System Preference**: Otomatis mengikuti preferensi sistem (prefers-color-scheme)
- **Persistent Storage**: Theme preference disimpan di localStorage
- **Smooth Transitions**: Animasi smooth saat pergantian theme
- **Brand Consistency**: Warna merah brand tetap konsisten di kedua mode

### Implementation

#### 1. Theme Context (`client/src/contexts/ThemeContext.tsx`)
```tsx
// Theme management dengan localStorage dan system preference
const [theme, setThemeState] = useState<Theme>('light');

// Auto-detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply theme to document
useEffect(() => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  localStorage.setItem('theme', theme);
}, [theme]);
```

#### 2. Theme Toggle Button (`client/src/components/theme-toggle.tsx`)
```tsx
// Animated sun/moon icons dengan smooth transitions
<Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
```

#### 3. Dark Mode CSS Variables (`client/src/index.css`)
```css
.dark {
  /* Dark mode custom colors */
  --primary-red: hsl(0, 73%, 51%);
  --primary-red-dark: hsl(0, 73%, 61%);
  --primary-red-light: hsl(0, 73%, 41%);
  --secondary-red: hsl(0, 83%, 5%);
  --secondary-red-medium: hsl(0, 83%, 10%);
  --text-dark: hsl(220, 13%, 82%);
  --text-light: hsl(220, 9%, 54%);
}
```

### Usage Examples
```tsx
// Menggunakan theme context
const { theme, toggleTheme, setTheme } = useTheme();

// Theme toggle button
<ThemeToggle />

// Conditional styling
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content
</div>
```

## 🔄 **Loading States Implementation**

### Overview
Sistem loading yang sophisticated dengan berbagai variant dan animasi untuk memberikan feedback visual yang lebih baik kepada pengguna.

### Components

#### 1. Loading Spinner (`client/src/components/ui/loading-spinner.tsx`)
```tsx
// Multiple sizes dan variants
<LoadingSpinner size="lg" variant="primary" />
<LoadingSpinner size="sm" variant="success" />
<LoadingSpinner size="xl" variant="warning" />
```

**Variants:**
- `default`: Gray spinner
- `primary`: Red brand color
- `success`: Green color
- `warning`: Orange color

**Sizes:**
- `sm`: 16px
- `md`: 24px (default)
- `lg`: 32px
- `xl`: 48px

#### 2. Loading Dots
```tsx
// Animated bouncing dots
<LoadingDots size="md" />
```

#### 3. Loading Skeleton
```tsx
// Skeleton loading dengan random widths
<LoadingSkeleton lines={3} />
```

### Implementation Examples

#### Dashboard Loading
```tsx
if (employeeLoading) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner size="lg" variant="primary" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 flex items-center justify-center">
            <LoadingSkeleton lines={3} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### App Loading
```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-red-subtle dark:bg-secondary-red">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" variant="primary" />
        <p className="text-text-light dark:text-text-light">Loading SIIhadirin...</p>
      </div>
    </div>
  );
}
```

## ⚠️ **Error Handling Implementation**

### Overview
Sistem error handling yang comprehensive dengan error boundaries, user-friendly error messages, dan recovery mechanisms.

### Components

#### 1. Error Boundary (`client/src/components/ui/error-boundary.tsx`)
```tsx
// Catches React errors dan provides fallback UI
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

**Features:**
- Catches JavaScript errors di component tree
- Provides fallback UI
- Logs errors untuk debugging
- Retry mechanism
- Development error details

#### 2. Error Display (`client/src/components/ui/error-display.tsx`)
```tsx
// User-friendly error messages dengan variants
<ErrorDisplay
  title="Connection Error"
  message="Unable to connect to server"
  variant="error"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

**Variants:**
- `error`: Red styling untuk critical errors
- `warning`: Orange styling untuk warnings
- `info`: Blue styling untuk informational messages

### Implementation Examples

#### App-level Error Boundary
```tsx
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

#### Component Error Handling
```tsx
// Error display dalam component
{error && (
  <ErrorDisplay
    title="Failed to load data"
    message={error.message}
    variant="error"
    onRetry={() => refetch()}
  />
)}
```

#### Error Fallback
```tsx
// Custom error fallback
<ErrorBoundary
  fallback={
    <div className="p-4">
      <ErrorDisplay
        title="Something went wrong"
        message="Please refresh the page or contact support"
        variant="error"
        onRetry={() => window.location.reload()}
      />
    </div>
  }
>
  <Component />
</ErrorBoundary>
```

## 🎨 **Design System Integration**

### Color Consistency
Semua komponen menggunakan color palette yang konsisten:

```css
/* Light Mode */
--primary-red: hsl(0, 73%, 41%);
--text-dark: hsl(220, 13%, 18%);
--text-light: hsl(220, 9%, 46%);

/* Dark Mode */
--primary-red: hsl(0, 73%, 51%);
--text-dark: hsl(220, 13%, 82%);
--text-light: hsl(220, 9%, 54%);
```

### Animation System
```css
/* Smooth transitions untuk theme switching */
.transition-colors { transition: color 0.3s ease, background-color 0.3s ease; }

/* Loading animations */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
```

### Accessibility Features
- **ARIA Labels**: Semua interactive elements memiliki proper ARIA labels
- **Screen Reader Support**: Loading states dan error messages accessible
- **Keyboard Navigation**: Theme toggle dapat diakses via keyboard
- **Focus Management**: Proper focus handling untuk error states

## 🔧 **Technical Implementation**

### File Structure
```
client/src/
├── contexts/
│   └── ThemeContext.tsx          # Theme management
├── components/
│   ├── ui/
│   │   ├── loading-spinner.tsx   # Loading components
│   │   ├── error-boundary.tsx    # Error boundary
│   │   └── error-display.tsx     # Error display
│   └── theme-toggle.tsx          # Theme toggle button
└── index.css                     # Dark mode styles
```

### Integration Points
1. **App.tsx**: ThemeProvider dan ErrorBoundary wrapper
2. **Sidebar**: Theme toggle button integration
3. **All Pages**: Loading states dan error handling
4. **CSS**: Dark mode variables dan transitions

### Performance Considerations
- **Lazy Loading**: Components load only when needed
- **Smooth Transitions**: Hardware-accelerated CSS transitions
- **Minimal Re-renders**: Optimized theme switching
- **Error Recovery**: Graceful degradation

## 🚀 **Benefits**

### User Experience
- **Reduced Eye Strain**: Dark mode option untuk low-light environments
- **Better Feedback**: Clear loading states dan error messages
- **Consistent Design**: Unified design language across modes
- **Accessibility**: Better support untuk users dengan disabilities

### Developer Experience
- **Reusable Components**: Modular loading dan error components
- **Type Safety**: Full TypeScript support
- **Easy Maintenance**: Centralized theme management
- **Debugging**: Development error details

### Business Value
- **Professional Appearance**: Modern, polished UI
- **User Satisfaction**: Better user experience
- **Accessibility Compliance**: Meets accessibility standards
- **Brand Consistency**: Maintains brand identity across modes

## 🔮 **Future Enhancements**

1. **Advanced Animations**: Micro-interactions dan page transitions
2. **Custom Themes**: User-defined color schemes
3. **Offline Support**: Better error handling untuk offline scenarios
4. **Analytics**: Track theme preferences dan error patterns
5. **Internationalization**: Multi-language error messages 