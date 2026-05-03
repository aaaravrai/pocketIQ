import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FinancialProvider, useFinancialData } from './context/FinancialContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav, TabType } from './components/BottomNav';
import { TopAppBar } from './components/TopAppBar';
import { Dashboard } from './screens/Dashboard';
import { AddTransaction } from './screens/AddTransaction';
import { GoalsInsights } from './screens/GoalsInsights';
import { Reports } from './screens/Reports';
import { Notifications } from './screens/Notifications';
import { Opportunities } from './screens/Opportunities';
import { EducationROI } from './screens/EducationROI';
import { AuthScreen } from './screens/AuthScreen';
import { Onboarding } from './screens/Onboarding';
import { ProfileModal } from './components/ProfileModal';
import { AnimatePresence, motion } from 'motion/react';
import { signOutUser } from './lib/firebase';

const AppContent: React.FC = () => {
  const { authUser, userProfile, isAuthLoading, isLoaded } = useFinancialData();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreen />;
  }

  if (authUser && !userProfile && isLoaded) {
    return <Onboarding />;
  }

  const renderContent = () => {
    if (showNotifications) return <Notifications />;
    
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'add': return <AddTransaction onComplete={() => setActiveTab('home')} />;
      case 'goals': return <GoalsInsights />;
      case 'opportunities': return <Opportunities />;
      case 'roi': return <EducationROI />;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    if (showNotifications) return "Alerts";
    switch (activeTab) {
      case 'add': return "New Transaction";
      case 'goals': return "Goals";
      case 'opportunities': return "Opportunities";
      case 'roi': return "Academic ROI";
      default: return "PocketIQ";
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-32">
      <TopAppBar 
        title={getPageTitle()} 
        onNotifications={() => {
          setShowNotifications(!showNotifications);
          setShowProfile(false);
        }} 
        onProfile={() => {
          setShowProfile(true);
        }}
      />
      
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <main className="pt-24 px-5 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={showNotifications ? 'notifications' : activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!showNotifications && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            setShowNotifications(false);
          }} 
        />
      )}

      {/* Decorative Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-10%] w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <FinancialProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </FinancialProvider>
    </ThemeProvider>
  );
}
