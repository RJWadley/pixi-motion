/**
 * A combined ref implementation using the callback ref cleanups feature.
 * This will work in React 19.
 */

import { type Ref, useCallback } from "react"

type OptionalRef<T> = Ref<T> | undefined

type Cleanup = (() => void) | undefined

function setRef<T>(ref: OptionalRef<T>, value: T): Cleanup {
	if (typeof ref === "function") {
		const cleanup = ref(value)

		if (typeof cleanup === "function") {
			return cleanup
		}
		return () => ref(null)
	}

	if (ref) {
		ref.current = value
		return () => {
			ref.current = null
		}
	}
}

export function useCombinedRefs<T>(...refs: OptionalRef<T>[]) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: The hook already lists all dependencies
	return useCallback((value: T | null) => {
		const cleanups: Cleanup[] = []

		for (const ref of refs) {
			const cleanup = setRef(ref, value)
			cleanups.push(cleanup)
		}

		return () => {
			for (const cleanup of cleanups) {
				cleanup?.()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, refs)
}
