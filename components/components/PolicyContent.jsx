import React from 'react';

const PolicyContent = ({ children }) => {
  return (
    <div className="prose prose-gray max-w-none dark:prose-invert text-sm sm:text-base">
      {children}
    </div>
  );
};

export default PolicyContent;