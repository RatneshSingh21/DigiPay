import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { SETUP_STEPS } from "../../config/setupSteps";
import { useSetupStore } from "../../store/setupStore";

export default function SetupGuidePanel() {
  const navigate = useNavigate();
  const { setupStatus } = useSetupStore();

  if (setupStatus.setupCompleted) return null;

  const currentStep = SETUP_STEPS.find(
    (step) => !setupStatus[step.key]
  );

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-5rem)] overflow-y-scroll w-80 border-l bg-white shadow-sm z-40">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Setup Progress</h3>
        <p className="text-xs text-gray-500">
          {Object.values(setupStatus).filter(Boolean).length - 1}
          {" / "}
          {SETUP_STEPS.length} completed
        </p>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto">
        {SETUP_STEPS.map((step) => {
          const completed = setupStatus[step.key];
          const active = currentStep?.key === step.key;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-md border
                ${active ? "border-primary bg-primary/5" : ""}
              `}
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {step.title}
                </span>
                {completed && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                {step.description}
              </p>

              {!completed && (
                <button
                  onClick={() => navigate(step.route)}
                  className="mt-2 text-xs text-primary inline-flex items-center gap-1"
                >
                  Go to setup <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
