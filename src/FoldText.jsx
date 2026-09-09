import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./FoldText.css";

gsap.registerPlugin(ScrollTrigger);

const hinges = {
  top: { origin: "50% 0%", rotateX: -92, rotateY: 0 },
  bottom: { origin: "50% 100%", rotateX: 92, rotateY: 0 },
  left: { origin: "0% 50%", rotateX: 0, rotateY: 92 },
  right: { origin: "100% 50%", rotateX: 0, rotateY: -92 },
};

export default function FoldText({
  text,
  splitBy = "char",
  hinge = "top",
  duration = 0.58,
  stagger = 0.018,
  ease = "power3.out",
  perspective = 780,
  creaseShading = 0.48,
  trigger = "scroll",
  fontSize = "inherit",
  fontWeight = "inherit",
  color = "currentColor",
  className = "",
  style = {},
}) {
  const rootRef = useRef(null);
  const config = hinges[hinge] || hinges.top;
  const segments = useMemo(() => {
    if (splitBy === "word") {
      return text.split(/(\s+)/).map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span className="fold-text-whitespace" key={`space-${index}`}>{part}</span>;
        }
        return (
          <span className="fold-text-segment" key={`word-${index}`} style={{ "--fold-perspective": `${perspective}px` }}>
            <span className="fold-text-piece" data-fold-hinge={hinge} style={{ transformOrigin: config.origin }}>
              {part}
            </span>
          </span>
        );
      });
    }

    return Array.from(text).map((character, index) => (
      <span className="fold-text-segment" key={`character-${index}`} style={{ "--fold-perspective": `${perspective}px` }}>
        <span className="fold-text-piece" data-fold-hinge={hinge} style={{ transformOrigin: config.origin }}>
          {character === " " ? "\u00A0" : character}
        </span>
      </span>
    ));
  }, [config.origin, hinge, perspective, splitBy, text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = Array.from(root.querySelectorAll(".fold-text-piece"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = {
      opacity: 0,
      rotateX: reduceMotion ? 0 : config.rotateX,
      rotateY: reduceMotion ? 0 : config.rotateY,
      "--fold-crease": reduceMotion ? 0 : creaseShading,
      transformOrigin: config.origin,
      force3D: true,
    };
    const to = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      "--fold-crease": 0,
      duration: reduceMotion ? 0.2 : duration,
      ease: reduceMotion ? "power1.out" : ease,
      stagger: reduceMotion ? 0.01 : stagger,
    };

    const context = gsap.context(() => {
      if (trigger === "scroll") {
        gsap.set(pieces, from);
        let animation;
        const play = () => {
          animation?.kill();
          gsap.set(pieces, from);
          animation = gsap.to(pieces, to);
        };
        ScrollTrigger.create({
          trigger: root,
          start: "top 82%",
          onEnter: play,
          onEnterBack: play,
        });
      } else {
        gsap.fromTo(pieces, from, to);
      }
    }, root);

    return () => context.revert();
  }, [config.origin, config.rotateX, config.rotateY, creaseShading, duration, ease, stagger, trigger]);

  return (
    <span
      className={`fold-text ${className}`.trim()}
      ref={rootRef}
      style={{
        "--fold-text-font-size": fontSize,
        "--fold-text-font-weight": fontWeight,
        "--fold-text-color": color,
        ...style,
      }}
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">{segments}</span>
    </span>
  );
}
