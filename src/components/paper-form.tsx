"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType = "text" | "email" | "password" | "textarea" | "select"

type SelectOption = {
  label: string
  value: string
}

export interface FormField<Name extends string = string> {
  name: Name
  label: string
  type?: FieldType
  placeholder?: string
  required?: boolean
  options?: SelectOption[]
}

export type PaperFormValues<TFields extends readonly FormField[]> = {
  [Field in TFields[number] as Field["name"]]: string
}

type PaperFormKey<TFields extends readonly FormField[]> = Extract<
  keyof PaperFormValues<TFields>,
  string
>

export interface PaperFormProps<TFields extends readonly FormField[]> {
  fields: TFields
  onSubmit: (values: PaperFormValues<TFields>) => void | Promise<void>
  submitLabel?: string
  title?: string
  description?: string
  className?: string
}

function getInitialValues<TFields extends readonly FormField[]>(
  fields: TFields
): PaperFormValues<TFields> {
  return Object.fromEntries(fields.map((field) => [field.name, ""])) as PaperFormValues<TFields>
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

function PaperSelect({
  id,
  options,
  className,
  placeholder = "Select...",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  options: SelectOption[]
  placeholder?: string
}) {
  return (
    <select id={id} className={cn(inputBase, "cursor-pointer appearance-none bg-background", className)} {...props}>
      <option value="" disabled={props.required}>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function PaperForm<const TFields extends readonly FormField[]>({
  fields,
  onSubmit,
  submitLabel = "Submit",
  title,
  description,
  className,
}: PaperFormProps<TFields>) {
  const [values, setValues] = React.useState<PaperFormValues<TFields>>(() =>
    getInitialValues(fields)
  )
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setValues((prev) => {
      const nextValues = getInitialValues(fields)

      for (const field of fields) {
        const key = field.name as PaperFormKey<TFields>
        nextValues[key] = ((prev[key] as string | undefined) ?? "") as PaperFormValues<TFields>[PaperFormKey<TFields>]
      }

      return nextValues
    })
  }, [fields])

  function handleChange(name: PaperFormKey<TFields>, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }) as PaperFormValues<TFields>)
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
    <div className={cn("border-2 border-foreground bg-paper paper-shadow", className)}>
      {(title || description) && (
        <div className="border-b-2 border-foreground px-6 py-4">
          {title && <h2 className="font-headline text-xl font-bold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6">
        {fields.map((field) => {
          const fieldName = field.name as PaperFormKey<TFields>
          const fieldValue = (values[fieldName] as string | undefined) ?? ""

          return (
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
                  value={fieldValue}
                  disabled={loading}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                />
              ) : field.type === "select" && field.options ? (
                <PaperSelect
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  options={field.options}
                  placeholder={field.placeholder}
                  value={fieldValue}
                  disabled={loading}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                />
              ) : (
                <PaperInput
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={fieldValue}
                  disabled={loading}
                  onChange={(e) => handleChange(fieldName, e.target.value)}
                />
              )}
            </div>
          )
        })}

        <button
          type="submit"
          disabled={loading}
          className="paper-btn-dark mt-2 border-2 border-foreground bg-foreground px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-background disabled:opacity-50"
        >
          {loading ? "…" : submitLabel}
        </button>
      </form>
    </div>
  )
}
