import { useEffect, useContext } from "react";
import { useForm } from "react-hook-form";

import { getDefaultRequiredVal } from "../../../../../common/helpers/util";
import { VoidPermitFormData } from "../types/VoidPermit";
import { VoidPermitContext } from "../context/VoidPermitContext";

export const useVoidPermitForm = () => {
  const { voidPermitData, setVoidPermitData, next } =
    useContext(VoidPermitContext);

  const defaultFormData = {
    permitId: voidPermitData.permitId,
    reason: getDefaultRequiredVal("", voidPermitData.reason),
    revoke: voidPermitData.revoke,
    email: getDefaultRequiredVal("", voidPermitData.email),
    additionalEmail: getDefaultRequiredVal("", voidPermitData.additionalEmail),
  };

  const formMethods = useForm<VoidPermitFormData>({
    defaultValues: defaultFormData,
    reValidateMode: "onChange",
  });

  const { setValue } = formMethods;

  useEffect(() => {
    setValue("email", getDefaultRequiredVal("", voidPermitData.email));
  }, [voidPermitData.email]);

  useEffect(() => {
    setValue(
      "additionalEmail",
      getDefaultRequiredVal("", voidPermitData.additionalEmail),
    );
  }, [voidPermitData.additionalEmail]);

  return {
    permitId: voidPermitData.permitId,
    formMethods,
    setVoidPermitData,
    next,
  };
};
