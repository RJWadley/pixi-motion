import { extend } from "@pixi/react"
import { Container, Graphics } from "pixi.js"
import { useCallback } from "react"

extend({ Graphics, Container })

export default function RedBox() {
	const drawCallback = useCallback((graphics: Graphics) => {
		graphics.clear()
		graphics.setFillStyle({ color: "red" })
		graphics.rect(0, 0, 100, 100)
		graphics.fill()
	}, [])

	return <pixiGraphics draw={drawCallback} />
}
