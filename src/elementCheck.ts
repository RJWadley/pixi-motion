/**
 * type only utility to make sure all supported elements are exported, and no others
 */

import type { SupportedElements } from "./createMotionComponent.js"
import pixiMotion from "./index.js"

// check that all supported elements are defined
pixiMotion satisfies Record<SupportedElements, unknown>

// check that no extra elements are defined
type ExtraElements = Exclude<keyof typeof pixiMotion, SupportedElements>
// @ts-expect-error
const test: ExtraElements = undefined
test satisfies never
