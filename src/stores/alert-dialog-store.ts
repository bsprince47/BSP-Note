import { create } from "zustand"

type DialogOptions = {
  title: string
  description: string
  actionLabel?: string
  cancelLabel?: string
}

type DialogState = {
  open: boolean
  options: DialogOptions | null
  resolve?: (confirmed: boolean) => void
  show: (opts: DialogOptions) => Promise<boolean>
  close: () => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  open: false,
  options: null,
  resolve: undefined,

  show: (opts) =>
    new Promise((resolve) => {
      set({ open: true, options: opts, resolve })
    }),

  close: () => {
    const res = get().resolve
    res?.(false)
    set({ open: false, options: null, resolve: undefined })
  },
}))
