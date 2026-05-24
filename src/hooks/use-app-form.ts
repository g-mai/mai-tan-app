import { createFormHook } from "@tanstack/react-form";
import {
  PasswordField,
  SubscribeButton,
  TextField,
} from "#/components/shared/form-components";
import { fieldContext, formContext } from "./use-form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField },
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
});
