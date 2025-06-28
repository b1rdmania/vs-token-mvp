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

  const stepIndicatorStyles = {
    container: {
      padding: '2rem 0',
    },
    title: {
      textAlign: 'center' as const,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      color: '#374151',
    },
    stepsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap' as const,
    },
    stepWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    stepCircle: {
      width: '3rem',
      height: '3rem',
      background: 'linear-gradient(to right, #635BFF, #00C6FF)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      position: 'relative' as const,
    },
    stepLabel: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
    },
    arrow: {
      marginLeft: '0.5rem',
      color: '#9CA3AF',
      fontSize: '1.25rem',
    },
    tooltip: {
      position: 'absolute' as const,
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: '0.5rem',
      backgroundColor: '#1F2937',
      color: 'white',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap' as const,
      zIndex: 10,
    },
    progressContainer: {
      marginTop: '1.5rem',
      height: '0.5rem',
      backgroundColor: '#E5E7EB',
      borderRadius: '9999px',
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      background: 'linear-gradient(to right, #635BFF, #00C6FF)',
    },
  };

  return (
    <div style={stepIndicatorStyles.container}>
      <h2 style={stepIndicatorStyles.title}>{title}</h2>
      
      <div style={stepIndicatorStyles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={step.id} style={stepIndicatorStyles.stepWrapper}>
            {/* Step Circle */}
            <motion.div
              style={{ position: 'relative' }}
              onHoverStart={() => setHoveredStep(step.id)}
              onHoverEnd={() => setHoveredStep(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div style={stepIndicatorStyles.stepCircle}>
                {step.id}
              </div>
              
              {/* Tooltip */}
              {hoveredStep === step.id && step.tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={stepIndicatorStyles.tooltip}
                >
                  {step.tooltip}
                </motion.div>
              )}
            </motion.div>
            
            {/* Step Label */}
            <div style={stepIndicatorStyles.stepLabel}>
              {step.label}
            </div>
            
            {/* Arrow (except for last step) */}
            {index < steps.length - 1 && (
              <div style={stepIndicatorStyles.arrow}>
                →
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <motion.div
        style={stepIndicatorStyles.progressContainer}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <motion.div
          style={stepIndicatorStyles.progressBar}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};
