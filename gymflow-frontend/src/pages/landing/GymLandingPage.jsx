import React, { useState } from 'react';
import HeaderSection from '../../components/ui/landing/HeaderSection';
import FeaturesSection from '../../components/ui/landing/FeaturesSection';
import FooterSection from '../../components/ui/landing/FooterSection';
import LoginModal from '../../components/ui/auth/LoginModal';

const GymLandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="bg-gradient-to-br from-gray-100 to-white text-gray-900 font-inter antialiased min-h-screen flex flex-col items-center justify-center">
        <div className="relative overflow-hidden w-full max-w-7xl mx-auto flex flex-col items-center justify-center flex-grow">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.3),transparent)] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,146,60,0.3),transparent)] -z-10"></div>

          <HeaderSection onLoginClick={() => setIsModalOpen(true)} />
          <FeaturesSection />
          <FooterSection />
        </div>
      </div>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default GymLandingPage;
