"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export function NewtonsCradle() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { Engine, Render, Runner, Body, Composite, Mouse, MouseConstraint, World, Bodies, Constraint } = Matter;

    const engine = Engine.create();
    const world = engine.world;

    const screenWidth = window.innerWidth < 700 ? window.innerWidth : 600;
    const render = Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: screenWidth + 150,
        height: 900,
        wireframes: false,
        background: "transparent",
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const balls: Matter.Body[] = [];
    let hue = 0;

    const createBall = (x: number, y: number, size: number) =>
      Bodies.circle(x, y, size, {
        inertia: Infinity,
        restitution: 1,
        friction: 0,
        frictionAir: 0.0001,
        render: {
          fillStyle: `hsl(340, 100%, 70%)`,
          strokeStyle: "rgb(220, 220, 220)",
          lineWidth: 2,
        },
      });

    const createNewtonsCradle = (x: number, y: number, number: number, size: number, length: number) => {
      const cradle = Composite.create({ label: "NewtonsCradle" });
      const spacing = size * 2;

      for (let i = 0; i < number; i++) {
        const ball = createBall(x + i * spacing, y + length, size);
        const constraint = Constraint.create({
          pointA: { x: x + i * spacing, y: y },
          bodyB: ball,
          pointB: { x: 0, y: 0 },
          length: length,
          stiffness: 0.9,
          render: {
            strokeStyle: "rgb(220, 220, 220,1)",
            lineWidth: 1.5,
          },
        });

        Composite.add(cradle, ball);
        Composite.add(cradle, constraint);
        balls.push(ball);
      }

      return cradle;
    };

    const numberOfBalls = 5;
    const ballSize = 21;
    const cradleWidth = ballSize * 2 * numberOfBalls;
    const startX = screenWidth / 2 - cradleWidth / 2;

    const cradle = createNewtonsCradle(startX, 135, numberOfBalls, ballSize, 175);
    World.add(world, cradle);
    Body.translate(cradle.bodies[0], { x: -140, y: -60 });

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: screenWidth - 50, y: 700 },
    });

    let frameId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const animateColors = () => {
      hue = (hue + 1) % 360;
      const fillColor = `hsl(340, 100%, ${70 + Math.sin(hue * 0.1) * 7}%)`;
      const strokeColor = `hsl(320, 100%, ${40 + Math.sin(hue * 0.1) * 7}%)`;

      balls.forEach((ball) => {
        ball.render.fillStyle = fillColor;
        ball.render.strokeStyle = strokeColor;
      });

      timeoutId = setTimeout(() => {
        frameId = requestAnimationFrame(animateColors);
      }, 200);
    };

    animateColors();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frameId);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  return <div ref={sceneRef} style={{ backgroundColor: "rgba(0, 0, 0, 0)" }} />;
}
