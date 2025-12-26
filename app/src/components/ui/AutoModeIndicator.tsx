import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/switch'

interface AutoModeIndicatorProps {
  autoMode: boolean
  retryCount?: number
  showToggle?: boolean
  onToggle?: (enabled: boolean) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function AutoModeIndicator({
  autoMode,
  retryCount,
  showToggle = false,
  onToggle,
  size = 'md'
}: AutoModeIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const toggleSizeClasses = {
    sm: 'scale-75',
    md: 'scale-90',
    lg: 'scale-100'
  }

  if (showToggle && onToggle) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={autoMode ? 'default' : 'secondary'}
            className={`${sizeClasses[size]} ${
              autoMode 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {autoMode ? '自动模式' : '手动模式'}
          </Badge>
          {retryCount && retryCount > 0 && (
            <Badge variant="outline" className={sizeClasses[size]}>
              重试 {retryCount}
            </Badge>
          )}
        </div>
        <Switch
          checked={autoMode}
          onCheckedChange={onToggle}
          className={toggleSizeClasses[size]}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={autoMode ? 'default' : 'secondary'}
        className={`${sizeClasses[size]} ${
          autoMode 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {autoMode ? '自动模式' : '手动模式'}
      </Badge>
      {retryCount && retryCount > 0 && (
        <Badge variant="outline" className={sizeClasses[size]}>
          重试 {retryCount}
        </Badge>
      )}
    </div>
  )
}
