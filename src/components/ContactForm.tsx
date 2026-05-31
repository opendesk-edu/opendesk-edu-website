"use client";

import { useState, useCallback } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

interface ContactFormProps {
  onClose: () => void;
  t: (key: string) => string;
}

export default function ContactForm({ onClose, t }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === "submitting") return;

      setState("submitting");
      setErrorMessage("");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Unknown error");
        }

        setState("success");
      } catch (err) {
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    },
    [name, email, subject, message, state]
  );

  if (state === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-background rounded-xl max-w-md w-full p-6 text-center space-y-4">
          <div className="text-4xl">✓</div>
          <p className="text-lg font-medium text-foreground">
            {t("contactSuccess")}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            {t("contactClose")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {t("contactTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground transition-colors p-1"
            aria-label={t("contactClose")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="contact-name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              {t("contactName")}
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder={t("contactNamePlaceholder")}
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-foreground mb-1"
            >
              {t("contactEmail")}
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder={t("contactEmailPlaceholder")}
              maxLength={254}
            />
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="block text-sm font-medium text-foreground mb-1"
            >
              {t("contactSubject")}
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder={t("contactSubjectPlaceholder")}
              maxLength={200}
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-foreground mb-1"
            >
              {t("contactMessage")}
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-y"
              placeholder={t("contactMessagePlaceholder")}
              minLength={10}
              maxLength={10000}
            />
          </div>

          {state === "error" && (
            <p className="text-sm text-red-500" role="alert">
              {errorMessage || t("contactError")}
            </p>
          )}

          {state === "submitting" && !errorMessage && (
            <p className="text-sm text-foreground-secondary">
              {t("contactSending")}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              {t("contactCancel")}
            </button>
            <button
              type="submit"
              disabled={state === "submitting"}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {state === "submitting"
                ? t("contactSending")
                : t("contactSend")}
            </button>
          </div>
        </form>

        <p className="text-xs text-foreground-secondary text-center">
          {t("contactNotice")}
        </p>
      </div>
    </div>
  );
}
