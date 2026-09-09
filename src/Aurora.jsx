import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

import "./Aurora.css";

const vertexShader = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 ramp = mix(uColorStops[0], uColorStops[1], smoothstep(0.0, 0.55, uv.x));
  ramp = mix(ramp, uColorStops[2], smoothstep(0.45, 1.0, uv.x));

  float wave = noise(vec2(uv.x * 2.0 + uTime * 0.08, uTime * 0.16)) * uAmplitude;
  float height = uv.y * 2.0 - exp(wave * 0.65) + 0.2;
  float intensity = 0.6 * height;
  float alpha = smoothstep(0.20 - uBlend * 0.5, 0.20 + uBlend * 0.5, intensity);
  gl_FragColor = vec4(intensity * ramp * alpha, alpha);
}
`;

export default function Aurora({
  colorStops = ["#0521EA", "#1C61FF", "#8AC7FF"],
  amplitude = 1,
  blend = 0.5,
  speed = 0.5,
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({ colorStops, amplitude, blend, speed });
  propsRef.current = { colorStops, amplitude, blend, speed };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStops.map((hex) => {
          const color = new Color(hex);
          return [color.r, color.g, color.b];
        }) },
        uResolution: { value: [1, 1] },
        uBlend: { value: blend },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      program.uniforms.uResolution.value = [container.offsetWidth, container.offsetHeight];
    };
    const update = (time) => {
      const current = propsRef.current;
      program.uniforms.uTime.value = time * 0.0001 * current.speed;
      program.uniforms.uAmplitude.value = current.amplitude;
      program.uniforms.uBlend.value = current.blend;
      program.uniforms.uColorStops.value = current.colorStops.map((hex) => {
        const color = new Color(hex);
        return [color.r, color.g, color.b];
      });
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(update);
    };

    let frame = requestAnimationFrame(update);
    resize();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div className="aurora-container" ref={containerRef} aria-hidden="true" />;
}
