import { useCallback } from "react";
import { useTranslation } from "react-i18next";

// English phrases are keys so the remaining copy is easy to review alongside Khmer.
export function useInterfaceTranslation() {
  const { t } = useTranslation("interface");
  return useCallback(
    (text, values = {}) => typeof text === "string"
      ? t(text, { ...values, keySeparator: false, nsSeparator: false, defaultValue: text })
      : text,
    [t],
  );
}
