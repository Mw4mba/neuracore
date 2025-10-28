import React from "react";

interface ToggleProps {
  pressed?: boolean;
  onPressedChange?: () => void;
  children: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({
  pressed,
  onPressedChange,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onPressedChange}
      className={`p-2  cursor-pointer rounded transition-all duration-150 
        ${pressed ? " text-brand-red bg-bg " : " text-text-primary"} 
        hover:bg-bg hover:text-brand-red
        active:scale-95`}
    >
      {children}
    </button>
  );
};

export default Toggle;
