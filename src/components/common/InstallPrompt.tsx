import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e);
      
      // Check if user has previously dismissed
      const installPromptDismissed = localStorage.getItem('installPromptDismissed');
      if (!installPromptDismissed) {
        // Show after a delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Hide prompt when app is installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setInstallPromptEvent(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  // Function to prompt the user to install the app
  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setShowPrompt(false);
    });
  };
  
  // Dismiss the prompt and remember for 7 days
  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
    
    // Remove from storage after 7 days
    setTimeout(() => {
      localStorage.removeItem('installPromptDismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };
  
  if (!showPrompt || dismissed) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40 flex justify-center pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md w-full flex items-start pointer-events-auto transform transition-all duration-300 translate-y-0">
        <div className="mr-4 bg-blue-100 p-2 rounded-full">
          <Download size={22} className="text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">Instalar aplicación</h3>
          <p className="text-sm text-gray-600 mb-3">
            Instala El Paradero del Cristiano para acceder rápidamente y trabajar sin conexión.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              No ahora
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;