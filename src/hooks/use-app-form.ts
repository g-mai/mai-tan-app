import { createFormHook } from "@tanstack/react-form";
import {
  ColorField,
  PasswordField,
  SelectField,
  SubscribeButton,
  TextField,
} from "#/components/shared/form-components";
import { fieldContext, formContext } from "./use-form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField, SelectField, ColorField },
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
});
