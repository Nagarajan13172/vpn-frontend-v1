import React, { createContext, useContext, useState } from "react";

// Define the type for breadcrumb items
type BreadcrumbItem = {
  label: any;
  href?: string; // Optional link
};

// Define the context type
type BreadcrumbContextType = {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
};

// Create the context
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

// Create a provider component
export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Custom hook to use the breadcrumb context
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};