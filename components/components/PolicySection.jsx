import React from 'react';

const PolicySection = ({ title, children, id }) => {
  return (
    <section 
      id={id}
      className="mb-6 sm:mb-8 last:mb-0"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="text-foreground/90 leading-relaxed text-sm sm:text-base">
        {children}
      </div>
    </section>
  );
};

export default PolicySection;