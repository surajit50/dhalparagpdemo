import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion"; // For animations

interface SuccessFormProps {
  message?: string;
}

const SuccessForm = ({ message }: SuccessFormProps) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} // Fade-in animation
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm flex items-center gap-3 mb-4"
    >
      <FaCheckCircle className="text-green-500 shrink-0" size={20} />
      <p className="text-green-700 font-medium text-sm">{message}</p>
    </motion.div>
  );
};

export default SuccessForm;
