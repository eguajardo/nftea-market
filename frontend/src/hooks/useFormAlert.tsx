import { useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FormProcessingStatus, FormState } from "types/forms";

function useFormAlert(formState: FormState) {
  const Alert = useMemo(() => {
    return withReactContent(Swal);
  }, []);

  useEffect(() => {
    switch (formState.status) {
      case FormProcessingStatus.Processing:
        Alert.fire({
          icon: "info",
          title: formState.statusTitle ?? undefined,
          text: formState.statusMessage ?? undefined,
          didOpen: () => {
            Alert.showLoading();
          },
        });
        break;
      case FormProcessingStatus.Success:
        Alert.fire({
          icon: "success",
          title: formState.statusTitle ?? "Success!",
          text: formState.statusMessage ?? undefined,
          timer: 2000,
          timerProgressBar: true,
        });
        break;
      case FormProcessingStatus.Error:
        Alert.fire({
          icon: "error",
          title: formState.statusTitle ?? "Something went wrong :(",
          text: formState.statusMessage ?? undefined,
        });
        break;
    }
  }, [formState, Alert]);

  return Alert;
}

export default useFormAlert;
