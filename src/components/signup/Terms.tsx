import React from "react";

interface TermsProps {
  show: boolean;
  onClose: () => void;
}

const Terms: React.FC<TermsProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 md:px-0 px-3 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-bg-gray text-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 cursor-pointer text-neutral-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
        <div className="text-sm text-neutral-300 max-h-64 overflow-y-auto pr-2">
          <p>
            Welcome to our platform. By creating an account you agree to abide
            by our rules, respect other users, and use the system responsibly.
            Any misuse may lead to suspension or termination of your account.
          </p>
          <p className="mt-2">
            Please read the full Terms & Conditions carefully before proceeding.
            By checking the box you confirm that you have read and agreed.
          </p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-btn-primary px-4 cursor-pointer py-2 rounded hover:bg-btn-primary-hover transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
