"use client";

import React from "react";
import zxcvbn from "zxcvbn";

interface Props {
  password?: string;
}

const PasswordStrengthMeter: React.FC<Props> = ({ password = "" }) => {
  const result = zxcvbn(password);
  const score = result.score;

  const getStrengthLabel = () => {
    switch (score) {
      case 0:
        return "非常に弱い";
      case 1:
        return "弱い";
      case 2:
        return "普通";
      case 3:
        return "強い";
      case 4:
        return "非常に強い";
      default:
        return "";
    }
  };

  const getBarColor = () => {
    switch (score) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${(score + 1) * 20}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-left text-sm mt-1 text-gray-500">{result.feedback.warning}</p>
        <p className="text-right text-sm mt-1 text-gray-600 font-semibold">{getStrengthLabel()}</p>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;