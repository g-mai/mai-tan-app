import { createFormHook } from "@tanstack/react-form";
import {
  PasswordField,
  SubscribeButton,
  TextField,
} from "../components/FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField, PasswordField },
  formComponents: { SubscribeButton },
  fieldContext,
  formContext,
});
