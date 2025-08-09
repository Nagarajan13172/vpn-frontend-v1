'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-xl">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="mb-6 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Settings Coming Soon
          </h1>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto text-sm sm:text-base">
            We're working hard to bring you a powerful and intuitive settings experience for your private VPN. Stay tuned for upcoming features and customization options!
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Loader2 className="h-6 w-6 text-blue-500 dark:text-blue-400 animate-spin" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Under Development
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}