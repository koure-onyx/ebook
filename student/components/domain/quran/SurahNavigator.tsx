import React from 'react';
import { ChevronDown, Bookmark } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';

/**
 * SurahNavigator Component
 * 
 * Purpose: Navigate between Quranic chapters (Surahs)
 * Mobile Behavior: Scrollable list with search, quick access
 * Accessibility: Navigation landmarks, surah names, current indicator
 * 
 * @param {Object} props
 * @param {number} props.currentSurah - Current surah number (1-114)
 * @param {Function} props.onSurahChange - Surah change handler
 * @param {Array} props.surahList - List of all surahs
 */
interface SurahNavigatorProps {
  currentSurah: number;
  onSurahChange: (surahNumber: number) => void;
  surahList: Array<{
    number: number;
    name: string;
    englishName: string;
    ayahCount: number;
    revelationType: 'Meccan' | 'Medinan';
  }>;
}

const SurahNavigator: React.FC<SurahNavigatorProps> = ({
  currentSurah,
  onSurahChange,
  surahList
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const filteredSurahs = surahList.filter(surah =>
    surah.name.includes(searchQuery) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.number.toString().includes(searchQuery)
  );

  const currentSurahData = surahList.find(s => s.number === currentSurah);

  return (
    <div className="w-full">
      {/* Current Surah Display */}
      <Card
        variant="outlined"
        onClick={() => setIsOpen(true)}
        className="w-full cursor-pointer"
        style={{ minHeight: '44px' }}
        role="button"
        aria-label={`Current Surah: ${currentSurahData?.englishName || currentSurah}`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Surah Number Badge */}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-inverse"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
              }}
              aria-hidden="true"
            >
              {currentSurah}
            </div>
            
            {/* Surah Info */}
            <div>
              <h3
                className="text-base font-semibold text-text-primary"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {currentSurahData?.englishName || `Surah ${currentSurah}`}
              </h3>
              <p
                className="text-xs text-text-muted"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {currentSurahData?.ayahCount || 0} verses • {currentSurahData?.revelationType}
              </p>
            </div>
          </div>
          
          <ChevronDown
            size={20}
            stroke="var(--color-text-secondary)"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </Card>

      {/* Surah Selection Sheet/Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg-primary"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Select Surah"
        >
          {/* Header */}
          <div className="sticky top-0 p-4 border-b bg-bg-primary" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-lg font-semibold text-text-primary"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Select Surah
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label="Close"
              >
                <span className="text-xl text-text-secondary">×</span>
              </button>
            </div>
            
            {/* Search */}
            <Input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search surahs"
            />
          </div>

          {/* Surah List */}
          <div className="p-4 overflow-y-auto max-h-[70vh]">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  onSurahChange(surah.number);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 mb-2 rounded-lg border transition-all ${
                  surah.number === currentSurah
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-bg-secondary'
                }`}
                style={{ minHeight: '44px' }}
                aria-current={surah.number === currentSurah ? 'true' : undefined}
              >
                {/* Number */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                    surah.number === currentSurah
                      ? 'bg-primary text-inverse'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}
                  style={{
                    backgroundColor: surah.number === currentSurah
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-tertiary)',
                    color: surah.number === currentSurah
                      ? 'var(--color-text-inverse)'
                      : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                  aria-hidden="true"
                >
                  {surah.number}
                </div>
                
                {/* Info */}
                <div className="flex-1 text-left">
                  <p
                    className="text-sm font-semibold text-text-primary"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {surah.englishName}
                  </p>
                  <p
                    className="text-xs text-text-muted"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {surah.ayahCount} verses • {surah.revelationType}
                  </p>
                </div>
                
                {/* Arabic Name */}
                <p
                  className="text-lg text-text-secondary"
                  style={{
                    fontFamily: "'Amiri', 'Traditional Arabic', serif",
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-secondary)',
                    direction: 'rtl',
                  }}
                  lang="ar"
                >
                  {surah.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurahNavigator;
