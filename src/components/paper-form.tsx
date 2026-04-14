"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "email" | "password" | "textarea" | "select"

export interface FormField {
  name: string
  label: string
  type?: FieldType
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[] // for select
}

export interface PaperFormProps {
  fields: FormField[]
  onSubmit: (values: Record<string, string>) => void | Promise<void>
  submitLabel?: string
  title?: string
  description?: string
  className?: string
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PaperLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold uppercase tracking-wide text-foreground"
    >
      {children}
      {required && <span className="ml-1 text-destructive">*</span>}
    </label>
  )
}

const inputBase =
  "w-full border-2 border-foreground bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"

function PaperInput({ id, type = "text", className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return <input id={id} type={type} className={cn(inputBase, className)} {...props} />
}

function PaperTextarea({ id, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return <textarea id={id} rows={4} className={cn(inputBase, "resize-none", className)} {...props} />
}

function PaperSelect({ id, options, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string; options: { label: string; value: string }[] }) {
  return (
    <select id={id} className={cn(inputBase, "cursor-pointer appearance-none bg-background", className)} {...props}>
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function PaperForm({
  fields,
  onSubmit,
  submitLabel = "Submit",
  title,
  description,
  className,
}: PaperFormProps) {
  const [values, setValues] = React.useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((f) => [f.name, ""]))
  )
  const [loading, setLoading] = React.useState(false)

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("border-2 border-foreground bg-background paper-shadow", className)}>
      {(title || description) && (
        <div className="border-b-2 border-foreground px-6 py-4">
          {title && <h2 className="font-headline text-xl font-bold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <PaperLabel htmlFor={field.name} required={field.required}>
              {field.label}
            </PaperLabel>

            {field.type === "textarea" ? (
              <PaperTextarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === "select" && field.options ? (
              <PaperSelect
                id={field.name}
                name={field.name}
                required={field.required}
                options={field.options}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : (
              <PaperInput
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name]}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 border-2 border-foreground bg-foreground px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground paper-btn-dark disabled:opacity-50"
        >
          {loading ? "…" : submitLabel}
        </button>
      </form>
    </div>
  )
}
