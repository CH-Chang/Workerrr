import { writable } from 'svelte/store'
import { nanoid } from 'nanoid'

interface Spinner {
    id: string
    message?: string
}

export interface SpinnerState {
    spinners: Spinner[]
}

const initState: SpinnerState = {
    spinners: []
}

const store = writable<SpinnerState>(initState)

export function createSpinnerStore() {
    return {
        subscribe: store.subscribe,
        spinner: async <T> (expensiveFunc: () => Promise<T>, message?: string | undefined) => {
            const id = nanoid()
            try {
                store.update(s => ({ ...s, spinners: [...s.spinners, { id: id, message }] }))
                return await expensiveFunc()
            } finally {
                store.update(s => ({ ...s, spinners: s.spinners.filter(s => s.id !== id) }))
            }
        }
    }
}