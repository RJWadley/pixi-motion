"use client"

import RedBox from "@/app/RedBox"
import { safeWindow } from "@/app/safeWindow"
import { Application } from "@pixi/react"
import { useInterval } from "ahooks"
import { pixiMotion } from "pixi-motion"
import { useState } from "react"

export default function BasicMovement() {
	const [position, setPosition] = useState({ x: 100, y: 100 })

	useInterval(() => {
		setPosition({
			x: Math.random() * 1000,
			y: Math.random() * 1000,
		})
	}, 1000)

	return (
		<Application resizeTo={safeWindow}>
			<pixiMotion.pixiContainer
				initial={{ alpha: 0 }}
				angle={180}
				animate={{ position, alpha: 1, angle: 0 }}
			>
				<RedBox />
			</pixiMotion.pixiContainer>
		</Application>
	)
}
