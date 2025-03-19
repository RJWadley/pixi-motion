import type { ObservablePoint, PointData } from "pixi.js"
import { useEffect } from "react"

export const useCompareEffect = (
	callback: VoidFunction,
	[set, point]: [unknown, number | ObservablePoint | PointData | undefined],
) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: precise comparison
	return useEffect(callback, [
		set,
		typeof point === "object" ? point.x : null,
		typeof point === "object" ? point.y : null,
		typeof point !== "object" ? point : null,
	])
}
