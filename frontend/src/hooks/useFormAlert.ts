import { useEffect, useMemo, useState } from "react";
import Swal, { SweetAlertResult } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FormProcessingStatus, FormState } from "types/forms";

function useFormAlert(formState: FormState) {
  const [successAlertResult, setSuccessAlertResult] =
    useState<SweetAlertResult<any>>();

  const Alert = useMemo(() => {
    return withReactContent(Swal);
  }, []);

  useEffect(() => {
    setSuccessAlertResult(undefined);

    switch (formState.status) {
      case FormProcessingStatus.Processing:
        Alert.fire({
          icon: "info",
          title: formState.statusTitle ?? undefined,
          html: formState.statusMessage ?? undefined,
          didOpen: () => {
            Alert.showLoading();
          },
        });
        break;
      case FormProcessingStatus.Success:
        const successAlertPromise: Promise<SweetAlertResult<any>> = Alert.fire({
          icon: "success",
          title: formState.statusTitle ?? "Success!",
          html: formState.statusMessage ?? undefined,
          timer: 2000,
          timerProgressBar: true,
        });

        if (successAlertPromise) {
          console.log("successAlertPromise", successAlertPromise);
          successAlertPromise.then((result) => {
            setSuccessAlertResult(result);
          });
        }

        break;
      case FormProcessingStatus.Error:
        Alert.fire({
          icon: "error",
          title: formState.statusTitle ?? "Something went wrong :(",
          html: formState.statusMessage ?? undefined,
        });
        break;
    }
  }, [formState, Alert]);

  return { Alert, successAlertResult };
}

export default useFormAlert;
