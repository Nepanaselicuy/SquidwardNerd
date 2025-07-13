import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

export function ErrorDisplay({
  title,
  message,
  variant = 'error',
  onRetry,
  onDismiss,
  className,
  showIcon = true
}: ErrorDisplayProps) {
  const variantStyles = {
    error: {
      container: 'border-destructive/20 bg-destructive/5 dark:bg-destructive/10',
      icon: 'text-destructive',
      title: 'text-destructive',
      message: 'text-destructive/80'
    },
    warning: {
      container: 'border-accent-orange/20 bg-accent-orange/5 dark:bg-accent-orange/10',
      icon: 'text-accent-orange',
      title: 'text-accent-orange',
      message: 'text-accent-orange/80'
    },
    info: {
      container: 'border-info-blue/20 bg-info-blue/5 dark:bg-info-blue/10',
      icon: 'text-info-blue',
      title: 'text-info-blue',
      message: 'text-info-blue/80'
    }
  };

  const icons = {
    error: AlertTriangle,
    warning: AlertCircle,
    info: Info
  };

  const Icon = icons[variant];
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', styles.icon)} />
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('text-sm font-medium mb-1', styles.title)}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', styles.message)}>
            {message}
          </p>
          
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-8 px-3 text-xs hover:bg-primary-red/10 hover:text-primary-red"
            >
              Try Again
            </Button>
          )}
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  );
}

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  className?: string;
}

export function ErrorFallback({ 
  error, 
  resetErrorBoundary, 
  className 
}: ErrorFallbackProps) {
  return (
    <div className={cn('p-4', className)}>
      <ErrorDisplay
        title="Something went wrong"
        message={error?.message || 'An unexpected error occurred. Please try again.'}
        variant="error"
        onRetry={resetErrorBoundary}
        showIcon={true}
      />
    </div>
  );
} 