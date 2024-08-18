import { writable } from 'svelte/store'

export interface MessageBox {
    title: string
    message: string
    buttons: MessageBoxButton[]
}

export interface MessageBoxButton {
    text: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback?: (...args: any[]) => void | Promise<void>
}

export interface MessageBoxState {
    messageBoxes: MessageBox[]
}

const initState: MessageBoxState = {
    messageBoxes: []
}

const store = writable<MessageBoxState>(initState)

export function createMessageBoxStore() {
    return {
        subscribe: store.subscribe,
        pop: () => store.update(s => ({ ...s, messageBoxes: s.messageBoxes.slice(1) })),
        push: (title: string, message: string, buttons: MessageBoxButton[]) => store.update(s => ({ ...s, messageBoxes: [...s.messageBoxes, { title, message, buttons }] })),
    }
}