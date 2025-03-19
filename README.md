# pixi-motion

Animation library that brings the power of [Motion](https://motion.dev/) to [@pixi/react](https://github.com/pixijs/pixi-react)

[![npm version](https://img.shields.io/npm/v/pixi-motion.svg)](https://www.npmjs.com/package/pixi-motion)
[![license](https://img.shields.io/npm/l/pixi-motion.svg)](https://github.com/rjwadley/pixi-motion/blob/main/LICENSE)

## Installation

Install with your favorite package manager:

```bash
npm install pixi-motion motion @pixi/react
yarn install pixi-motion motion @pixi/react
pnpm install pixi-motion motion @pixi/react
bun install pixi-motion motion @pixi/react
```

> [!NOTE]
> pixi-motion is still fresh and mostly untested, please try it out and report bugs!

## Basic Usage

Import `pixiMotion` and use it like a regular `@pixi/react` component, but with animation capabilities similar to `motion/react`:

```tsx
import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback } from "react";
import { pixiMotion } from "pixi-motion";

extend({
  Container,
  Graphics,
});

const MyComponent = () => {
  const drawCallback = useCallback((graphics) => {
    graphics.clear();
    graphics.setFillStyle({ color: "red" });
    graphics.rect(0, 0, 100, 100);
    graphics.fill();
  }, []);

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const handleClick = () => {
    // move to a random spot
    setPosition((prev) => ({
      x: Math.random() * 600,
      y: Math.random() * 600,
    }));
  };

  return (
    <Application>
      <pixiMotion.pixiContainer
        onClick={handleClick}
        initial={{ alpha: 0 }}
        position={position}
        transition={{
          duration: 1,
          bounce: 0.5,

          alpha: { ease: "easeOut", duration: 0.5 },
        }}
      >
        <pixiGraphics draw={drawCallback} />
      </pixiMotion.pixiContainer>
    </Application>
  );
};
```

## Supported Animation Features

`pixi-motion` supports the `initial` prop and the `animate` prop, which function similarly to `motion/react`. Nothing else is included right now.

## Animation Properties

You can animate the following properties:

- `x`, `y` (position coordinates)
- `position` (as a PointData object)
- `alpha` (transparency)
- `scale` (uniform or as a PointData object)
- `rotation`, `angle` (rotation in radians or degrees)
- `width`, `height` (dimensions)
- `pivot` (rotation origin)
- `skew` (skew transformation)

## Supported Components

pixiMotion supports all PixiJS components that have animatable properties, including:

- `pixiMotion.pixiContainer`
- `pixiMotion.pixiSprite`
- `pixiMotion.pixiGraphics`
- `pixiMotion.pixiText`
- `pixiMotion.pixiAnimatedSprite`
- ... and all other PixiJS components with animatable properties
