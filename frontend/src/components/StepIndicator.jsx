export default function StepIndicator({ currentStep, labels = ['Basic Info', 'Resume Details', 'Review'] }) {
  const steps = labels.map((label, i) => ({ num: i + 1, label }))

  return (
    <div className="step-indicator">
      {steps.map((step, i) => (
        <div key={step.num} className="step-item">
          <div className="step-row">
            <div className={`step-circle ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'done' : ''}`}>
              {currentStep > step.num ? '✓' : step.num}
            </div>
            {i < steps.length - 1 && (
              <div className={`step-line ${currentStep > step.num ? 'active' : ''}`} />
            )}
          </div>
          <span className={`step-label ${currentStep >= step.num ? 'active' : ''}`}>{step.label}</span>
        </div>
      ))}
    </div>
  )
}
