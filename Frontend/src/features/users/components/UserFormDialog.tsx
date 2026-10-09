"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type SubmitEventHandler,
  type ReactNode,
} from "react";
import { Dialog } from "@/shared/components/Dialog";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { fieldClass } from "@/shared/lib/FieldClass";
import { useCreateUser } from "../hooks/UseCreateUser";
import { useUpdateUser } from "../hooks/UseUpdateUser";
import { userErrorMessage } from "../lib/UserErrorMessage";
import { useUserDialogStore } from "../store/UserDialogStore";
import {
  validateUserForm,
  type UserFormErrors,
} from "../validation/ValidateUserForm";

export function UserFormDialog(): ReactNode {
  const mode = useUserDialogStore((state) => state.mode);
  const user = useUserDialogStore((state) => state.user);
  const close = useUserDialogStore((state) => state.close);
  const isOpen = mode === "create" || mode === "edit";
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<UserFormErrors | null>(null);
  const nameId = useId();
  const emailId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const isSaving = createUser.isPending || updateUser.isPending;
  const failure = createUser.error ?? updateUser.error;
  const hasServerError = createUser.isError || updateUser.isError;
  const resetCreate = createUser.reset;
  const resetUpdate = updateUser.reset;
  const syncedSession = useRef("");
  useEffect(() => {
    const session = isOpen ? `${mode}:${user?.id ?? "new"}` : "";
    if (!isOpen) {
      if (syncedSession.current) {
        resetCreate();
        resetUpdate();
      }
      syncedSession.current = "";
      return;
    }
    if (syncedSession.current === session) return;
    syncedSession.current = session;
    resetCreate();
    resetUpdate();
    setName(mode === "edit" ? (user?.name ?? "") : "");
    setEmail(mode === "edit" ? (user?.email ?? "") : "");
    setErrors(null);
  }, [isOpen, mode, user, resetCreate, resetUpdate]);
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const nextErrors = validateUserForm({ name, email });
    setErrors(nextErrors);
    if (nextErrors) return;
    const payload = { name: name.trim(), email: email.trim() };
    if (mode === "edit" && user) {
      void updateUser
        .mutateAsync({ id: user.id, ...payload })
        .catch(() => undefined);
      return;
    }
    void createUser.mutateAsync(payload).catch(() => undefined);
  };
  return (
    <Dialog
      isOpen={isOpen}
      title={mode === "edit" ? "Editar usuario" : "Nuevo usuario"}
      description={
        mode === "edit"
          ? "Actualiza el nombre o el correo."
          : "El correo se guarda en minúsculas."
      }
      onClose={close}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field
          id={nameId}
          errorId={nameErrorId}
          label="Nombre"
          value={name}
          error={errors?.name}
          autoComplete="name"
          onChange={(value) => {
            setName(value);
            setErrors(null);
          }}
        />
        <Field
          id={emailId}
          errorId={emailErrorId}
          label="Correo"
          value={email}
          error={errors?.email}
          autoComplete="email"
          type="email"
          onChange={(value) => {
            setEmail(value);
            setErrors(null);
          }}
        />
        {hasServerError ? (
          <p
            role="alert"
            className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {userErrorMessage(failure)}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={buttonClass("ghost")}
            onClick={close}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={buttonClass("primary")}
            disabled={isSaving}
          >
            {isSaving
              ? "Guardando…"
              : mode === "edit"
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

interface FieldProps {
  readonly id: string;
  readonly errorId: string;
  readonly label: string;
  readonly value: string;
  readonly error?: string;
  readonly autoComplete: string;
  readonly type?: "text" | "email";
  readonly onChange: (value: string) => void;
}

function Field({
  id,
  errorId,
  label,
  value,
  error,
  autoComplete,
  type = "text",
  onChange,
}: FieldProps): ReactNode {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={fieldClass(Boolean(error))}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
