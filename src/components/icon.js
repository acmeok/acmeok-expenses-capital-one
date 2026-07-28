import {
  Mic,
  Square,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  LogOut,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
} from 'lucide-static';

const icons = {
  mic: Mic,
  square: Square,
  check: Check,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  search: Search,
  logOut: LogOut,
  arrowLeft: ArrowLeft,
  play: Play,
  pause: Pause,
  rotateCcw: RotateCcw,
  alertCircle: AlertCircle,
};

export function icon(name, { size = 20 } = {}) {
  const svg = icons[name];
  if (!svg) return '';
  return svg.replace('<svg', `<svg width="${size}" height="${size}"`);
}
