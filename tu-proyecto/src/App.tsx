import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import WelcomeScreen from './components/WelcomeScreen';
import WelcomePageFormal from './components/WelcomePageFormal';
import SummaryPage from './components/SummaryPage';

interface UserData {
  email: string;
  userType: number | null;
  interests: string[];
  experience: number | null;
  name: string;
  password: string;
}

type AppScreen = 'auth' | 'welcome' | 'search' | 'summary';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('auth');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [summaryData, setSummaryData] = useState<{ title: string; source: string; summary: string } | null>(null);

  // Callback cuando login/registro son exitosos
  const handleAuthComplete = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('welcome'); // después de autenticarse, va a WelcomeScreen
    console.log('Usuario autenticado:', data);
  };

  const handleWelcomeComplete = (data: UserData) => {
    setUserData(data); // guarda datos de perfil completados
    setCurrentScreen('search');
    console.log('User data after WelcomeScreen:', data);
  };

  const handleBackToAuth = () => {
    setCurrentScreen('auth');
    setUserData(null);
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
    // aquí se puede llamar la API o filtrar resultados
  };

  // Render actual según pantalla
  if (currentScreen === 'auth') {
    return <AuthPage onLoginComplete={handleAuthComplete} onRegisterClick={() => setCurrentScreen('welcome')} />;
  }

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (currentScreen === 'summary' && summaryData) {
    return <SummaryPage summaryData={summaryData} onBack={handleBackToSearch} />;
  }

  // Por defecto: pantalla de búsqueda
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
