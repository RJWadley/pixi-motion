import type { PixiElements } from "@pixi/react"
import {
	MotionConfigContext,
	type ValueAnimationTransition,
	animate as motionAnimate,
} from "motion/react"
import {
	type ComponentProps,
	type JSX,
	createElement,
	use,
	useCallback,
	useEffect,
	useRef,
} from "react"
import { useCombinedRefs } from "./useCombinedRefs.js"
import { useCompareEffect } from "./useDeepCompareEffect.js"
import { useLatestFunction } from "./useLatestFunction.js"

type BasicProps =
	| "alpha"
	| "angle"
	| "rotation"
	| "x"
	| "y"
	| "width"
	| "height"

type NestedProps = "scale" | "pivot" | "position" | "skew"

type AllProps = BasicProps | NestedProps

/**
 * elements that accept all the above properties
 */
export type SupportedElements = keyof {
	[K in keyof PixiElements as Required<PixiElements[K]> extends Record<
		AllProps,
		unknown
	>
		? PixiElements[K] extends never
			? never
			: K
		: never]: never
}

type SupportedValues = {
	[K in AllProps]: ComponentProps<SupportedElements>[K]
}

type PropertyTransitions = {
	[K in AllProps]?: ValueAnimationTransition
} & ValueAnimationTransition

type WithMotionProps<Props> = Props & {
	initial?: Partial<SupportedValues>
	animate?: Partial<SupportedValues> & { transition?: PropertyTransitions }
	transition?: PropertyTransitions
}

export type PixiMotionComponent<TagName extends SupportedElements> = (
	props: WithMotionProps<ComponentProps<TagName>>,
) => JSX.Element

const filterTransition = (transition: ValueAnimationTransition | undefined) => {
	if (transition === undefined) return undefined

	const keysToRemove = {
		alpha: 0,
		angle: 0,
		rotation: 0,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		scale: 0,
		pivot: 0,
		skew: 0,
		position: 0,
	} satisfies Record<AllProps, 0>

	const withRemovedKeys = Object.fromEntries(
		Object.entries(transition).filter(([key]) => !(key in keysToRemove)),
	)

	if (Object.keys(withRemovedKeys).length === 0) return undefined
	return withRemovedKeys as ValueAnimationTransition
}

export function createMotionComponent<TagName extends SupportedElements>(
	Component: TagName,
): PixiMotionComponent<TagName> {
	return function MotionComponent(combinedProps) {
		const {
			alpha,
			angle,
			rotation,
			x,
			y,
			width,
			height,
			scale,
			pivot,
			position,
			skew,
			initial,
			animate,
			ref: userRef,
			transition,
			...props
		} = combinedProps
		const ref = useRef<PixiElements[TagName]>(null)
		const outputRef = useCombinedRefs(ref, userRef as typeof ref)
		const firstRenderRef = useRef(true)
		const defaultTransition = use(MotionConfigContext)
			.transition as PropertyTransitions

		/**
		 * get the transition options for a particular property
		 */
		const getTransitionDetails = useLatestFunction(
			(property: AllProps): ValueAnimationTransition | undefined => {
				// extract from the animate property
				const scopedVague = combinedProps.animate?.transition
				const scopedSpecific = combinedProps.animate?.transition?.[property]

				// extract from the transition property
				const transitionPropertyVague = combinedProps.transition
				const transitionPropertySpecific = combinedProps.transition?.[property]

				// extract from motion config
				const motionConfigVague = defaultTransition
				const motionConfigSpecific = defaultTransition?.[property]

				// TODO: how does motion/react handle precedence?
				return (
					filterTransition(scopedSpecific) ??
					filterTransition(scopedVague) ??
					filterTransition(transitionPropertySpecific) ??
					filterTransition(transitionPropertyVague) ??
					filterTransition(motionConfigSpecific) ??
					filterTransition(motionConfigVague)
				)
			},
		)

		/**
		 * get the initial state for a property
		 *
		 * the priority matters here: initial always wins, then prefer props over animate
		 */
		const useInitialState = (key: AllProps) => {
			return useRef(initial?.[key] ?? combinedProps[key] ?? animate?.[key])
				.current
		}

		/**
		 * animate to a certain state
		 */
		const to = useCallback(
			<T extends AllProps>(key: T, value?: SupportedValues[T]) => {
				if (value === undefined) return
				if (!ref.current)
					throw new Error("attempted to animate an unmounted component")

				const transition = getTransitionDetails(key)

				if (typeof value === "object") {
					const { x, y } = value

					if (x !== undefined) {
						motionAnimate(ref.current[key], { x }, transition)
					}
					if (y !== undefined) {
						motionAnimate(ref.current[key], { y }, transition)
					}
				} else {
					motionAnimate(ref.current, { [key]: value }, transition)
				}
			},
			[getTransitionDetails],
		)

		/**
		 * instantly jump to a certain state, interrupting any running animations
		 */
		const set = useCallback(
			<T extends AllProps>(key: T, value?: SupportedValues[T]) => {
				if (value === undefined) return
				if (firstRenderRef.current) return
				if (!ref.current)
					throw new Error("attempted to animate an unmounted component")

				// @ts-expect-error propably not possible to narrow, but types will catch it
				ref.current[key] = value
			},
			[],
		)

		/**
		 * track our initial values, which never change after mount
		 */
		const initialAlpha = useInitialState("alpha")
		const initialAngle = useInitialState("angle")
		const initialRotation = useInitialState("rotation")
		const initialX = useInitialState("x")
		const initialY = useInitialState("y")
		const initialWidth = useInitialState("width")
		const initialHeight = useInitialState("height")
		const initialScale = useInitialState("scale")
		const initialPivot = useInitialState("pivot")
		const initialSkew = useInitialState("skew")
		const initialPosition = useInitialState("position")

		/**
		 * instantly jump to a new value when that prop changes
		 */
		useEffect(() => set("alpha", alpha), [set, alpha])
		useEffect(() => set("angle", angle), [set, angle])
		useEffect(() => set("rotation", rotation), [set, rotation])
		useEffect(() => set("x", x), [set, x])
		useEffect(() => set("y", y), [set, y])
		useEffect(() => set("width", width), [set, width])
		useEffect(() => set("height", height), [set, height])
		useCompareEffect(() => set("scale", scale), [set, scale])
		useCompareEffect(() => set("pivot", pivot), [set, pivot])
		useCompareEffect(() => set("skew", skew), [set, skew])
		useCompareEffect(() => set("position", position), [set, position])

		/**
		 * animate our values when they change
		 */
		useEffect(() => to("alpha", animate?.alpha), [to, animate?.alpha])
		useEffect(() => to("angle", animate?.angle), [to, animate?.angle])
		useEffect(() => to("rotation", animate?.rotation), [to, animate?.rotation])
		useEffect(() => to("x", animate?.x), [to, animate?.x])
		useEffect(() => to("y", animate?.y), [to, animate?.y])
		useEffect(() => to("width", animate?.width), [to, animate?.width])
		useEffect(() => to("height", animate?.height), [to, animate?.height])
		useCompareEffect(() => to("scale", animate?.scale), [to, animate?.scale])
		useCompareEffect(() => to("pivot", animate?.pivot), [to, animate?.pivot])
		useCompareEffect(() => to("skew", animate?.skew), [to, animate?.skew])
		useCompareEffect(
			() => to("position", animate?.position),
			[to, animate?.position],
		)

		/**
		 * this effect must be last, or it won't be usable in our other effects
		 */
		useEffect(() => {
			firstRenderRef.current = false
		}, [])

		return createElement(Component, {
			ref: outputRef,
			alpha: initialAlpha,
			angle: initialAngle,
			rotation: initialRotation,
			x: initialX,
			y: initialY,
			width: initialWidth,
			height: initialHeight,
			scale: initialScale,
			pivot: initialPivot,
			skew: initialSkew,
			position: initialPosition,
			...props,
		})
	}
}
