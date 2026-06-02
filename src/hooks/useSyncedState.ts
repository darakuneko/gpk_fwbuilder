import { useState, type Dispatch, type SetStateAction } from 'react'

/**
 * Local state seeded from a prop that re-syncs whenever the prop value changes.
 * Implements React's render-time "adjusting state when a prop changes" pattern,
 * avoiding a prop->state useEffect (which causes an extra commit).
 */
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(value)
    const [prev, setPrev] = useState<T>(value)
    if (value !== prev) {
        setPrev(value)
        setState(value)
    }
    return [state, setState]
}
