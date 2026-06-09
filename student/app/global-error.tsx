'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, Bug } from 'lucide-react';

/**
 * Global Root Error Boundary (Global Error) for StudyVault PK
 * 
 * This is the absolute fallback error handler that catches errors 
 * outside the React component tree (e.g., in Next.js app layout, 
 * middleware, or during initial hydration).
 * 
 * Features:
 * - Minimal dependencies (no router access needed)
 * - Auto-reload functionality
 * - Network status detection
 * - Pakistani localized messaging
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Log to monitoring service
    console.error('[GlobalError] Critical error caught:', error);

    // Network listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [error]);

  const handleReload = () => {
    setRetryCount(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const getErrorInfo = () => {
    if (!isOnline) {
      return {
        title: 'No Internet Connection',
        titleUrdu: 'انٹرنیٹ کنکشن نہیں ہے',
        description: 'Please connect to the internet and reload the page.',
        descriptionUrdu: 'براہ کرم انٹرنیٹ سے جڑیں اور صفحہ دوبارہ لوڈ کریں۔',
        icon: WifiOff,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      };
    }

    if (error.message?.includes('NEXT_NOT_FOUND')) {
      return {
        title: 'Page Not Found',
        titleUrdu: 'صفحہ نہیں ملا',
        description: "The page you're looking for doesn't exist or has been moved.",
        descriptionUrdu: 'جو صفحہ آپ ڈھونڈ رہے ہیں وہ موجود نہیں یا منتقل کر دیا گیا ہے۔',
        icon: Bug,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
    }

    return {
      title: 'System Error',
      titleUrdu: 'سسٹم کی خرابی',
      description: 'Something went wrong at the core level. Let\'s reload everything.',
      descriptionUrdu: 'بنیادی سطح پر کچھ غلط ہو گیا۔ آئیے سب کچھ دوبارہ لوڈ کرتے ہیں۔',
      icon: ServerCrash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    };
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
        <Card className="w-full max-w-lg border-2 border-red-100 shadow-2xl animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center pb-3">
            <div className={`mx-auto mb-4 w-20 h-20 rounded-full ${errorInfo.bgColor} flex items-center justify-center`}>
              <IconComponent className={`w-10 h-10 ${errorInfo.color}`} />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {errorInfo.title}
            </CardTitle>
            <p className="text-base text-gray-600 mt-2 font-medium">
              {errorInfo.titleUrdu}
            </p>
          </CardHeader>

          <CardContent className="text-center space-y-5">
            <CardDescription className="text-lg text-gray-700 leading-relaxed">
              {errorInfo.description}
            </CardDescription>

            <div className="bg-white/90 backdrop-blur rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-800 font-medium">
                    Technical Details:
                  </p>
                  <p className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-2 rounded">
                    {error.digest || error.message || 'Unknown error'}
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-orange-600 font-semibold mt-2">
                      Reload attempts: {retryCount}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!isOnline && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <WifiOff className="w-5 h-5" />
                  <p className="font-semibold">You are offline</p>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Connect to Wi-Fi or mobile data to continue.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  وائی فائی یا موبائل ڈیٹا سے جڑیں۔
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleReload}
              disabled={!isOnline}
              className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reload Page
              <span className="block text-sm opacity-90 mt-1">صفحہ دوبارہ لوڈ کریں</span>
            </Button>
          </CardFooter>

          <div className="px-6 pb-6 pt-2">
            <p className="text-center text-xs text-gray-400">
              If this keeps happening, please contact support at{' '}
              <a href="mailto:support@studyvault.pk" className="text-emerald-600 hover:underline font-medium">
                support@studyvault.pk
              </a>
            </p>
          </div>
        </Card>
      </body>
    </html>
  );
}
