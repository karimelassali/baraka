import React from 'react';

const PolicyLayout = ({ title, children, lastUpdated }) => {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">{title}</h1>
          {lastUpdated && (
            <p className="text-muted-foreground text-sm sm:text-base">
              Last updated: {lastUpdated}
            </p>
          )}
        </header>
        
        <main className="bg-card rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          {children}
        </main>
        
        <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Baraka. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PolicyLayout;