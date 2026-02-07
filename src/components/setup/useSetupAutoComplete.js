import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SETUP_STEPS } from "../../config/setupSteps";
import { useSetupStore } from "../../store/setupStore";

export default function useSetupAutoComplete() {
  const location = useLocation();
  const { setupStatus, markStepComplete } = useSetupStore();

  useEffect(() => {
    const step = SETUP_STEPS.find(
      (s) => s.route === location.pathname
    );

    if (step && !setupStatus[step.key]) {
      markStepComplete(step.key);
    }
  }, [location.pathname]);
}
