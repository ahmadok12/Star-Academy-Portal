import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';
import { AcademySettings } from '../../types/database.types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings?: AcademySettings | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTab,
  onSelectTab,
  settings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#F7F8FA] text-slate-800 flex overflow-hidden font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        academyName={settings?.academy_name}
        logoUrl={settings?.logo_url}
      />

      {/* Main Content Area - Full View Spanning Whole Screen */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          academyName={settings?.academy_name}
          currentTab={currentTab}
          onSelectTab={onSelectTab}
        />

        <main className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 lg:p-8 bg-[#F7F8FA]">
          <div className="w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
