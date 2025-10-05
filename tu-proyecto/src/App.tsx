import React, { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import WelcomePageFormal from './components/WelcomePageFormal'
import SummaryPage from './components/SummaryPage'

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

type AppScreen = 'welcome' | 'search' | 'summary';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [summaryData, setSummaryData] = useState<{ title: string; source: string; summary: string } | null>(null);

  const handleWelcomeComplete = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('search');
    console.log('User data:', data);
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleBackToSearch = () => {
    setCurrentScreen('search');
  };

  const handleShowSummary = (summaryData: { title: string; source: string; summary: string }) => {
    setSummaryData(summaryData);
    setCurrentScreen('summary');
  };

  const handleSearch = (query: string) => {
    console.log('Search performed by', userData?.name, ':', query);
    console.log('User profile:', userData?.userType);
    console.log('Interests:', userData?.interests);
  };

  // Render current screen
  if (currentScreen === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (currentScreen === 'summary' && summaryData) {
    return <SummaryPage summaryData={summaryData} onBack={handleBackToSearch} />;
  }

  return (
    <WelcomePageFormal 
      onSearch={handleSearch} 
      userData={userData!}
      onBack={handleBackToWelcome}
      onShowSummary={handleShowSummary}
    />
  );
}

export default App;
