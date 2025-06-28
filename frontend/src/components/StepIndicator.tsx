import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  label: string;
  tooltip?: string;
}

interface StepIndicatorProps {
  title: string;
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ title, steps }) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="step-indicator-container">
      <h2 className="step-indicator-title">{title}</h2>
      
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.id} className="step-wrapper">
            {/* Step Circle */}
            <motion.div
              className="step-circle-container"
              onHoverStart={() => setHoveredStep(step.id)}
              onHoverEnd={() => setHoveredStep(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="step-circle">
                {step.id}
              </div>
              
              {/* Tooltip */}
              {hoveredStep === step.id && step.tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="step-tooltip"
                >
                  {step.tooltip}
                </motion.div>
              )}
            </motion.div>
            
            {/* Step Label */}
            <div className="step-label">
              {step.label}
            </div>
            
            {/* Arrow (except for last step) */}
            {index < steps.length - 1 && (
              <div className="step-arrow">
                →
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <motion.div
        className="progress-container"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
      
      <style jsx>{`
        .step-indicator-container {
          padding: 2rem 0;
        }
        
        .step-indicator-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 2rem;
          color: #374151;
        }
        
        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .step-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .step-circle-container {
          position: relative;
        }
        
        .step-circle {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(to right, #635BFF, #00C6FF);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.875rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          min-height: 44px; /* iOS touch target */
          min-width: 44px;
        }
        
        .step-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          max-width: 120px;
          text-align: center;
        }
        
        .step-arrow {
          margin-left: 0.5rem;
          color: #9CA3AF;
          font-size: 1.25rem;
        }
        
        .step-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
          background-color: #1F2937;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 10;
          max-width: 200px;
          white-space: normal;
          text-align: center;
        }
        
        .progress-container {
          margin-top: 1.5rem;
          height: 0.5rem;
          background-color: #E5E7EB;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, #635BFF, #00C6FF);
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .steps-container {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .step-wrapper {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
            width: 100%;
            max-width: 280px;
          }
          
          .step-arrow {
            transform: rotate(90deg);
            margin: 0.5rem 0;
          }
          
          .step-label {
            max-width: 240px;
            font-size: 0.8rem;
            line-height: 1.3;
          }
          
          .step-tooltip {
            max-width: 180px;
            font-size: 0.7rem;
          }
          
          .step-indicator-title {
            font-size: 1.3rem;
            margin-bottom: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .step-circle {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 0.8rem;
          }
          
          .step-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
