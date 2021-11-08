export const createSubmissionHandler =
  (onSubmit: Function, onError: Function, validateForm?: Function) =>
  async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (validateForm && !validateForm()) {
      return;
    }

    try {
      await onSubmit();
    } catch (err: any) {
      console.log(err);
      await onError(err);
    }
  };
