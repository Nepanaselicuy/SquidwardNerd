export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return 'Selamat Pagi';
  } else if (hour >= 12 && hour < 15) {
    return 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else {
    return `${diffDays} hari yang lalu`;
  }
}
