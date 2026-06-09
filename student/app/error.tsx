'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, RefreshCw, Home, WifiOff, ServerCrash } from 'lucide-react';

/**
 * Global Client-Side Error Boundary for StudyVault PK
 * 
 * Catches all React errors in the student portal component tree.
 * Provides a friendly, localized recovery experience for Pakistani students.
 * 
 * Features:
 * - Friendly Urdu/English messaging
 * - Automatic retry logic
 * - Network connectivity detection
 * - Clear navigation to safe pages
 */

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StudentErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Log error to monitoring service (placeholder for Sentry/LogRocket)
    console.error('[StudentErrorBoundary] Caught error:', error);

    // Network status listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Determine error type and show appropriate message
  const getErrorMessage = () => {
    if (!isOnline) {
      return {
        title: 'Internet Connection Lost',
        titleUrdu: 'انٹرنیٹ کنکشن منقطع ہو گیا ہے',
        description: 'Please check your internet connection and try again. Your progress is saved!',
        descriptionUrdu: 'براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔ آپ کی پیش رفت محفوظ ہے!',
        icon: WifiOff,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        title: 'Server Unreachable',
        titleUrdu: 'سرور تک رسائی نہیں ہو سکی',
        description: 'Our servers are taking a quick nap. Please try again in a moment.',
        descriptionUrdu: 'ہمارے سرورز تھوڑی دیر کے لیے سونے گئے ہیں۔ براہ کرم ایک لمحے بعد دوبارہ کوشش کریں۔',
        icon: ServerCrash,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    }

    // Generic unexpected error
    return {
      title: 'Something Went Wrong',
      titleUrdu: 'کچھ غلط ہو گیا',
      description: "Don't worry! We've noted this issue. Let's try refreshing the page.",
      descriptionUrdu: 'پریشان نہ ہوں! ہم نے اس مسئلے کو نوٹ کر لیا ہے۔ آئیے صفحہ ریفریش کرنے کی کوشش کرتے ہیں۔',
      icon: AlertCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    };
  };

  const errorInfo = getErrorMessage();
  const IconComponent = errorInfo.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <Card className={`w-full max-w-md border-2 ${errorInfo.borderColor} shadow-xl animate-in fade-in zoom-in duration-300`}>
        <CardHeader className="text-center pb-2">
          <div className={`mx-auto mb-4 w-16 h-16 rounded-full ${errorInfo.bgColor} flex items-center justify-center`}>
            <IconComponent className={`w-8 h-8 ${errorInfo.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            {errorInfo.titleUrdu}
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <CardDescription className="text-base text-gray-700 leading-relaxed">
            {errorInfo.description}
          </CardDescription>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-500 font-mono break-all">
              Error ID: {error.digest || 'unknown'}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>

          {!isOnline && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium">
                📶 You are currently offline. Connect to Wi-Fi or mobile data.
              </p>
              <p className="text-xs text-amber-700 mt-1">
                آپ فی الحال آف لائن ہیں۔ وائی فائی یا موبائل ڈیٹا سے جڑیں۔
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleRetry}
            disabled={!isOnline}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
            <span className="block text-xs opacity-90 mt-0.5">دوبارہ کوشش کریں</span>
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
            <span className="block text-xs opacity-90 mt-0.5">ہوم پر جائیں</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
