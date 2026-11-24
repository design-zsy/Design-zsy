import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownRight,
  ArrowUpRight,
  Mail,
  MessageCircle,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";
import ColorBends from "./ColorBends";
import Aurora from "./Aurora";
import FoldText from "./FoldText";
import SpecularButton from "./SpecularButton";

import "./styles.css";

// 图片统一按 base 路径解析，保证部署到 GitHub Pages 子目录时也能加载。
const assetUrl = (path) => import.meta.env.BASE_URL.replace(/\/$/, "") + path;

const projects = [
  {
    number: "01",
    type: "B2B SAAS / EMPLOYEE EXPERIENCE",
    title: "宜员文化产品体验升级",
    description: "企业文化中台与员工端体验重构",
    image: "/portfolio-cover.webp",
    detailTitle: "宜员文化产品体验升级",
    gallery: Array.from({ length: 40 }, (_, index) => `/新改的图/${index}.webp`),
    accent: "#4568ff",
    meta: "2022-2026",
  },
  {
    number: "02",
    type: "Character Design",
    title: "宜小班IP设计",
    description: "让企业文化平台更具亲和力，提升情感联结",
    image: "/ip-design-cover.webp",
    imageRatio: "3840 / 3056",
    detailTitle: "宜小班IP设计",
    detailLabel: "Visual Design",
    gallery: [
      "/ip设计/1.webp",
      "/ip设计/2.webp",
      "/ip设计/3.webp",
      "/ip设计/4.webp",
      "/ip设计/5.webp",
    ],
    accent: "#8093ff",
    meta: "2022-2026",
  },
  {
    number: "03",
    type: "MOBILE PRODUCT / FINTECH",
    title: "WBF交易所移动端设计",
    description: "3.0升级设计思路",
    image: "/wbf-1.webp",
    gallery: Array.from(
      { length: 17 },
      (_, index) => `/WBF/${index + 1}.webp`,
    ),
    accent: "#a0afff",
    meta: "2019-2022",
  },
];

const strengths = [
  [
    "01",
    "设计技能",
    "使用 Figma Make、Codex 等 AI 工具辅助方案探索与交互原型制作，支持设计方案的快速比较和沟通。",
  ],
  [
    "02",
    "产品能力",
    "结合客户访谈和用户反馈梳理体验问题，与产品、研发及运营团队协作推进设计迭代。",
  ],
  [
    "03",
    "优势项目",
    "专注 B 端 SaaS 与企业员工端体验设计，具备复杂业务模块重构及多端适配经验。",
  ],
  [
    "04",
    "复盘沉淀",
    "参与设计规范、组件与页面状态体系建设，兼顾跨模块一致性、客户定制需求与研发落地。",
  ],
];

function DotField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let raf = 0;
    let pointer = { x: -1000, y: -1000 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      const step = 18;
      const time = frame * 0.008;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(148,166,255,.33)");
      gradient.addColorStop(1, "rgba(67,91,219,.12)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      for (let y = 10; y < height; y += step)
        for (let x = 10; x < width; x += step) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - distance / 320);
          const wave =
            Math.sin(x * 0.024 + time) * 1.2 +
            Math.cos(y * 0.018 - time * 0.7) * 1.1;
          const px = x - (dx / Math.max(distance, 1)) * influence * 10;
          const py = y - (dy / Math.max(distance, 1)) * influence * 10 + wave;
          const radius = 0.75 + influence * 1.3;
          ctx.moveTo(px + radius, py);
          ctx.arc(px, py, radius, 0, Math.PI * 2);
        }
      ctx.fill();
      frame += 1;
      raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas className="dot-field" ref={canvasRef} aria-hidden="true" />;
}

function LegacyColorBends() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let time = 0;
    let pointer = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      target = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;
      const bands = [
        { y: 0.34, amp: 88, width: 94, alpha: 0.82, speed: 0.46, phase: 0 },
        { y: 0.55, amp: 64, width: 56, alpha: 0.72, speed: -0.33, phase: 2.1 },
        { y: 0.73, amp: 104, width: 82, alpha: 0.62, speed: 0.28, phase: 4.2 },
      ];
      for (const band of bands) {
        ctx.beginPath();
        for (let x = -60; x <= width + 60; x += 10) {
          const n = x / width;
          const cursor =
            Math.exp(-Math.pow((n - (pointer.x + 1) / 2) * 2.8, 2)) *
            pointer.y *
            90;
          const y =
            height * band.y +
            Math.sin(n * 4.7 + time * band.speed + band.phase) * band.amp +
            Math.sin(n * 9.2 - time * 0.24 + band.phase) * 23 +
            cursor;
          if (x === -60) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const stroke = ctx.createLinearGradient(
          0,
          height * 0.25,
          width,
          height * 0.85,
        );
        stroke.addColorStop(0, "rgba(5,33,234,0)");
        stroke.addColorStop(0.22, "#123df1");
        stroke.addColorStop(0.47, "#8aa6ff");
        stroke.addColorStop(0.58, "#d8e1ff");
        stroke.addColorStop(0.78, "#315dff");
        stroke.addColorStop(1, "rgba(5,33,234,0)");
        ctx.strokeStyle = stroke;
        ctx.globalAlpha = band.alpha;
        ctx.lineWidth = band.width;
        ctx.shadowBlur = 42;
        ctx.shadowColor = "rgba(43, 79, 255, .8)";
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      time += 0.014;
      raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas className="color-bends" ref={canvasRef} aria-hidden="true" />;
}

function CardSpecular() {
  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll(".project-card, .strength-card"),
    );
    const update = (event) => {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--specular-x",
        ((event.clientX - rect.left) / rect.width) * 100 + "%",
      );
      card.style.setProperty(
        "--specular-y",
        ((event.clientY - rect.top) / rect.height) * 100 + "%",
      );
    };
    const enter = (event) => event.currentTarget.classList.add("is-specular");
    const leave = (event) =>
      event.currentTarget.classList.remove("is-specular");
    cards.forEach((card) => {
      card.addEventListener("pointermove", update);
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
    });
    return () =>
      cards.forEach((card) => {
        card.removeEventListener("pointermove", update);
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
      });
  }, []);
  return null;
}

function FoldedText({ text, splitBy = "char", stagger = 0.018, trigger = "scroll" }) {
  return (
    <FoldText
      text={text}
      splitBy={splitBy}
      trigger={trigger}
      hinge="top"
      duration={0.58}
      stagger={stagger}
      ease="power3.out"
      perspective={780}
      creaseShading={0.48}
    />
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav
          id="mobile-navigation"
          className={menuOpen ? "nav-links is-open" : "nav-links"}
          aria-label="主导航"
        >
          <a href="#top" onClick={() => setMenuOpen(false)}>
            <FoldedText text="Home" splitBy="word" trigger="mount" stagger={0.04} />
          </a>
          <a href="#work" onClick={() => setMenuOpen(false)}>
            <FoldedText text="Work" splitBy="word" trigger="mount" stagger={0.04} />
          </a>
          <a href="#advantages" onClick={() => setMenuOpen(false)}>
            <FoldedText text="About" splitBy="word" trigger="mount" stagger={0.04} />
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            <FoldedText text="Contact" splitBy="word" trigger="mount" stagger={0.04} />
          </a>
        </nav>
      </header>
      <main>
        <section className="hero" id="top">
          <div className="hero-video" aria-hidden="true">
            <ColorBends
              autoRotate={0}
              bandWidth={6}
              colors={["#3B82F6"]}
              frequency={1}
              intensity={1.5}
              iterations={1}
              mouseInfluence={1}
              noise={0.15}
              parallax={0.5}
              rotation={90}
              scale={1}
              speed={0.2}
              warpStrength={1}
            />
            <DotField />
            <div className="hero-fade" />
          </div>
          <div className="hero-copy">
            <p className="hero-kicker"><FoldedText text="ZHANG XUAN / SENIOR UI·UX DESIGNER" trigger="mount" stagger={0.012} /></p>
            <h1 className="hero-title">
              <span className="hero-title-line">
                <span className="hero-title-text"><FoldedText text="Making complex products" trigger="mount" stagger={0.025} /></span>
              </span>
              <span className="hero-title-line hero-title-line--accent">
                <span className="hero-title-text"><FoldedText text="easy to understand." trigger="mount" stagger={0.025} /></span>
              </span>
            </h1>
            <p className="hero-description">
              <FoldedText text="我是一名 UI/UX 设计师，专注于 B 端 SaaS 和企业员工体验，习惯从真实业务出发，把复杂流程做得清晰、易用。" trigger="mount" stagger={0.012} />
            </p>
            <div className="hero-buttons">
              <SpecularButton
                size="lg"
                radius={10}
                tint="#ffffff"
                tintOpacity={0}
                blur={0}
                textColor="#f5f5f5"
                lineColor="#ffffff"
                baseColor="#525252"
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
                className="hero-btn primary"
                onClick={() => {
                  console.log("View selected work clicked");
                  document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <FoldedText text="View selected work" splitBy="word" trigger="mount" stagger={0.035} /> <ArrowDownRight size={14} />
              </SpecularButton>
              <SpecularButton
                size="lg"
                radius={10}
                tint="#ffffff"
                tintOpacity={0}
                blur={0}
                textColor="#f5f5f5"
                lineColor="#6178ff"
                baseColor="#525252"
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
                className="hero-btn secondary"
                onClick={() => {
                  console.log("Get in touch clicked");
                  window.location.href = "mailto:zsy64@foxmail.com";
                }}
              >
                <FoldedText text="Get in touch" splitBy="word" trigger="mount" stagger={0.035} /> <span><FoldedText text="zsy64@foxmail.com" splitBy="word" trigger="mount" stagger={0.035} /></span>
              </SpecularButton>
            </div>
            <p className="hero-proof">
              <FoldedText text="DESIGN SYSTEMS · COMPONENT LIBRARIES · FIGMA MAKE · CODEX · MULTI-PLATFORM" splitBy="word" trigger="mount" stagger={0.02} />
            </p>
          </div>
        </section>
        <div className="below-hero">
          <div className="below-hero-aurora">
            <Aurora
              colorStops={["#0521EA", "#1C61FF", "#8AC7FF"]}
              amplitude={1}
              blend={0.5}
              speed={0.5}
            />
          </div>
        <section className="section work" id="work">
          <div className="section-label">
            <span><FoldedText text="01" /></span>
            <span><FoldedText text="SELECTED WORK / 精选项目" stagger={0.012} /></span>
          </div>
          <div className="section-heading">
            <h2>
              <FoldedText text="Selected work" splitBy="word" stagger={0.06} /><span><FoldedText text="." /></span>
            </h2>
            <p>
              <FoldedText text="Three directions, one consistent belief:" splitBy="word" stagger={0.03} />
              <br />
              <FoldedText text="design should make the next step obvious." splitBy="word" stagger={0.03} />
            </p>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article
                className="project-card"
                key={project.number}
                onClick={() => setActiveProject(project)}
                style={{ "--project-accent": project.accent }}
              >
                <div
                  className="project-image"
                  style={
                    project.imageRatio
                      ? { aspectRatio: project.imageRatio }
                      : undefined
                  }
                >
                  <img
                    src={assetUrl(project.image)}
                    alt={`${project.title} 项目界面`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="project-shade" />
                  <span className="project-number"><FoldedText text={project.number} /></span>
                  <span className="project-open">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div className="project-info">
                  <div>
                    <p className="project-type"><FoldedText text={project.type} stagger={0.012} /></p>
                    <h3><FoldedText text={project.title} stagger={0.025} /></h3>
                    <p><FoldedText text={project.description} stagger={0.012} /></p>
                  </div>
                  <span className="project-meta">
                    <FoldedText text={project.meta} splitBy="word" stagger={0.03} /> <ArrowUpRight size={15} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section advantages" id="advantages">
          <div className="section-label">
            <span><FoldedText text="02" /></span>
            <span><FoldedText text="WHAT I BRING / 个人优势" stagger={0.012} /></span>
          </div>
          <div className="section-heading">
            <h2>
              <FoldedText text="Useful by" splitBy="word" stagger={0.06} />
              <br />
              <em><FoldedText text="design." splitBy="word" stagger={0.06} /></em>
            </h2>
            <p>
              <FoldedText
                text="Design is a craft, but it is also a way of making decisions together."
                splitBy="word"
                stagger={0.03}
              />
            </p>
          </div>
          <div className="strength-grid">
            {strengths.map(([number, title, copy]) => (
              <article className="strength-card" key={number}>
                <span className="strength-number"><FoldedText text={number} /></span>
                <div className="strength-orbit">
                  <span />
                </div>
                <h3><FoldedText text={title} /></h3>
                <p><FoldedText text={copy} stagger={0.012} /></p>
              </article>
            ))}
          </div>
        </section>
        <section className="closing" id="contact">
          <div className="closing-glow" />
          <div className="section-label">
            <span><FoldedText text="03" /></span>
            <span><FoldedText text="CONTACT / 联系" stagger={0.012} /></span>
          </div>
          <div className="closing-content">
            <p className="eyebrow">
              <span className="note-pulse" />
              <FoldedText text="OPEN TO THE NEXT GOOD PROBLEM" splitBy="word" stagger={0.035} />
            </p>
            <h2>
              <FoldedText text="Looking forward to" splitBy="word" stagger={0.06} />
              <br />
              <em><FoldedText text="your invitation." splitBy="word" stagger={0.06} /></em>
            </h2>
            <a className="email-link" href="mailto:zsy64@foxmail.com">
              <FoldedText text="zsy64@foxmail.com" splitBy="word" stagger={0.04} /> <ArrowUpRight size={23} />
            </a>
            <div className="closing-bottom">
              <span><FoldedText text="张璇 / UI·UX Designer" splitBy="word" stagger={0.025} /></span>
              <span><FoldedText text="Wechat: kkssssssy · 186 6813 8661" splitBy="word" stagger={0.025} /></span>
              <span><FoldedText text="© 2026" splitBy="word" stagger={0.025} /></span>
            </div>
          </div>
        </section>
        </div>
      </main>
      {activeProject && (
        <>
          <div
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title} 项目详情`}
            onClick={() => setActiveProject(null)}
          >
            <div
              className="modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-project-header">
                <div className="modal-project-title">
                  <h2>{activeProject.detailTitle || activeProject.title}</h2>
                  <span>{activeProject.detailLabel || "UI/UX"}</span>
                </div>
              </div>
              <div className="modal-gallery">
                {(activeProject.gallery || [activeProject.image]).map(
                  (image, index) => (
                    <img
                      key={`${activeProject.number}-${image}`}
                      src={assetUrl(image)}
                      alt={`${activeProject.title} 项目图片 ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      onClick={() =>
                        setExpandedImage({
                          image,
                          alt: `${activeProject.title} 项目图片 ${index + 1}`,
                        })
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="modal-project-actions">
            <a
              className="modal-contact-icon"
              href="weixin://"
              aria-label="微信联系"
              data-tooltip="kkssssssy"
            >
              <MessageCircle size={17} />
            </a>
            <a
              className="modal-contact-icon"
              href="tel:18668138661"
              aria-label="电话联系"
              data-tooltip="18668138661"
            >
              <Phone size={17} />
            </a>
          </div>
          <button
            className="modal-close"
            onClick={() => {
              setExpandedImage(null);
              setActiveProject(null);
            }}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </>
      )}
      {expandedImage && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="放大查看项目图片"
          onClick={() => setExpandedImage(null)}
        >
          <img src={assetUrl(expandedImage.image)} alt={expandedImage.alt} />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
