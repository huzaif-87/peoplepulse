import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export const AppLayout = ({ children, title = "Dashboard" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="md:pl-60 flex flex-col flex-1 min-h-screen transition-all">
        {/* Top Header */}
        <TopHeader
          title={title}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
