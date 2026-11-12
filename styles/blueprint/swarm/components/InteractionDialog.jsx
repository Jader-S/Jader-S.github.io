import React, { useEffect, useRef, useState } from "react";
import { DialogKind, PlanName } from "../interactions/actions.js";
import { CONFIGURATION_LINES } from "../scene/sections/configuration.js";

/** 复制动作状态，统一控制按钮反馈与辅助提示。 */
const CopyState = Object.freeze({
  IDLE: "idle",
  COPYING: "copying",
  COPIED: "copied",
  MANUAL: "manual",
});

/** 方案信息仅描述本地预览中的卡片，不代表实际订阅或已开通服务。 */
const PLANS = {
  [PlanName.HIVE]: {
    price: "$0",
    period: "free forever",
    description: "For tinkering with your first swarm on a weekend.",
    features: ["Up to 10 agents", "Community support", "7-day trace history"],
  },
  [PlanName.COLONY]: {
    price: "$49",
    period: "per month, billed monthly",
    description: "For teams running agents in production, every day.",
    features: [
      "Up to 500 agents",
      "Shared memory + supervisors",
      "30-day trace history",
    ],
  },
  [PlanName.SWARM]: {
    price: "Let’s talk",
    period: "annual contract",
    description: "For fleets that never sleep and never stop shipping.",
    features: ["Unlimited agents", "SSO, audit logs, VPC", "Dedicated orchestrator"],
  },
};

/** 信息类弹窗的文案，明确区分本地交互与尚未连接的外部服务。 */
const INFORMATION = {
  [DialogKind.ABOUT]: {
    title: "Built by a swarm.",
    description: "An interactive page that takes shape as you explore it.",
    paragraphs: [
      "Every line, card and word is drawn by a cursor. Scroll to give the swarm more room to work, then use the navigation to explore the finished sections.",
      "This is a local, editable recreation of the Swarm page. The agents you see are animated cursors; they do not run AI tasks or connect to an orchestration service.",
    ],
  },
  [DialogKind.CAREERS]: {
    title: "Careers",
    description: "A place for future opportunities.",
    paragraphs: [
      "This local preview has no connected job board or application service. There are no live vacancies to apply for here.",
    ],
  },
  [DialogKind.BLOG]: {
    title: "Behind the page",
    description: "A small note on how this experience works.",
    paragraphs: [
      "The page starts as an empty canvas. Scrolling reveals work for the cursors: drawing outlines, typing text and duplicating cards.",
      "Each task waits for its dependencies. A card appears before its label, and a copied section receives its own text after it lands in place.",
    ],
  },
  [DialogKind.STATUS]: {
    title: "Preview status",
    description: "What is available in this local experience.",
    paragraphs: [
      "Navigation, configuration downloads and this dialog work in your browser. This page does not monitor a hosted Swarm service.",
    ],
  },
};

/**
 * 生成某个方案可下载的示例配置，免费方案的示例副本总数控制为十个。
 * @param {string} plan 已选方案名称。
 * @returns {string} 保留原有配置结构并注明本地预览性质的YAML文本。
 */
function planConfiguration(plan) {
  // 不添加虚构订阅字段；仅在注释里记录选择，并复用页面已有的配置示例。
  const lines = CONFIGURATION_LINES.map((line) => {
    if (plan !== PlanName.HIVE) return line;
    if (line.includes("research:")) return "  research: { model: fast, replicas: 6 }";
    if (line.includes("writer:")) return "  writer:   { model: smart, replicas: 2 }";
    return line;
  });
  return `# Local preview: ${plan}\n# Sample only; no account or subscription is created.\n${lines.join(
    "\n"
  )}\n`;
}

/**
 * 展示可复制、可下载的配置文本，并在剪贴板不可用时提供手动选择入口。
 * @param {{text:string,fileName?:string}} props 配置文本与下载文件名。
 * @returns {React.ReactElement} 配置代码与操作按钮。
 */
function ConfigurationFile({ text, fileName = "swarm.yaml" }) {
  // 复制反馈在本组件内维护，父页面的动画刷新不会重置用户操作。
  const [copyState, setCopyState] = useState(CopyState.IDLE);
  const [downloaded, setDownloaded] = useState(false);
  const codeRef = useRef(null);
  const requestRef = useRef(0);
  useEffect(() => {
    // 配置切换或弹窗卸载时，让旧剪贴板请求失效，避免反馈落到新文档上。
    requestRef.current += 1;
    setCopyState(CopyState.IDLE);
    setDownloaded(false);
    return () => {
      requestRef.current += 1;
    };
  }, [text]);

  /**
   * 将当前配置写入剪贴板；失败时选中代码以便用户按快捷键复制。
   * @returns {Promise<void>} 复制请求完成后的状态更新。
   */
  async function copyConfiguration() {
    // 异步响应必须属于当前文档，不能覆盖切换后的弹窗状态。
    const request = ++requestRef.current;
    setCopyState(CopyState.COPYING);
    setDownloaded(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      if (request === requestRef.current) setCopyState(CopyState.COPIED);
    } catch {
      if (request !== requestRef.current) return;
      setCopyState(CopyState.MANUAL);
      if (codeRef.current) {
        codeRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  /**
   * 将当前文本保存为本地YAML文件，不向服务器提交任何配置。
   * @returns {void}
   */
  function downloadConfiguration() {
    // 浏览器按用户点击创建下载，短暂保留对象地址以兼容文件读取时序。
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/yaml;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    // 最近一次操作是下载时，反馈文本优先显示下载状态。
    requestRef.current += 1;
    setCopyState(CopyState.IDLE);
    setDownloaded(true);
  }

  const feedback =
    copyState === CopyState.MANUAL
      ? "Clipboard access is unavailable. Select the code and press Ctrl+C or ⌘C."
      : copyState === CopyState.COPIED
        ? "Configuration copied to your clipboard."
        : downloaded
          ? "Download requested. Check your browser’s downloads."
          : "Save this example and adapt it to your own project.";
  return (
    <section className="dialog-file" aria-label="Example configuration">
      <div className="dialog-file-heading">
        <span>{fileName}</span>
        <span>YAML</span>
      </div>
      <pre
        className="dialog-code"
        ref={codeRef}
        tabIndex={0}
        aria-label="Configuration text"
      >
        <code>{text}</code>
      </pre>
      <div className="dialog-actions">
        <button type="button" className="dialog-button" onClick={downloadConfiguration}>
          Download YAML <span aria-hidden="true">↓</span>
        </button>
        <button
          type="button"
          className="dialog-button secondary"
          onClick={copyConfiguration}
          disabled={copyState === CopyState.COPYING}
        >
          {copyState === CopyState.COPYING
            ? "Copying…"
            : copyState === CopyState.COPIED
              ? "Copied ✓"
              : "Copy configuration"}
        </button>
      </div>
      <p className="dialog-feedback" role="status">
        {feedback}
      </p>
    </section>
  );
}

/**
 * 展示配置示例及关键字段说明，不将演示格式描述为可调用的真实API。
 * @param {{quickStart:boolean}} props 是否从开始使用按钮打开。
 * @returns {React.ReactElement} 使用说明和文件操作。
 */
function ConfigurationContent({ quickStart }) {
  // 说明保持与页面已展示的agents、routing和budget字段一致。
  return (
    <>
      <p className="dialog-description">
        {quickStart
          ? "Start with an example. Define your agents, choose a routing strategy and set a budget."
          : "One file brings your agents, routing and budget together. Explore the example below."}
      </p>
      <div className="dialog-field-grid">
        <div>
          <strong>01 / Agents</strong>
          <p>Define roles and the number of replicas for each role.</p>
        </div>
        <div>
          <strong>02 / Routing</strong>
          <p>Choose how work is assigned and where it falls back.</p>
        </div>
        <div>
          <strong>03 / Budget</strong>
          <p>Declare a spending limit and what happens when it is reached.</p>
        </div>
      </div>
      <ConfigurationFile text={`${CONFIGURATION_LINES.join("\n")}\n`} />
      <p className="dialog-note">
        This is a configuration example for the local preview. Downloading it does not
        launch agents or connect to a service.
      </p>
    </>
  );
}

/**
 * 展示已选方案及其示例文件，不处理付款、账号或销售联系。
 * @param {{plan:string}} props 当前方案名称。
 * @returns {React.ReactElement} 方案摘要与配置下载。
 */
function PlanContent({ plan }) {
  // 未知方案回退到免费方案，使调用方传入异常值时仍有明确展示内容。
  const selectedPlan = Object.hasOwn(PLANS, plan) ? plan : PlanName.HIVE;
  const details = PLANS[selectedPlan];
  return (
    <>
      <p className="dialog-description">{details.description}</p>
      <div className="dialog-plan-summary">
        <div>
          <strong>{details.price}</strong>
          <span>{details.period}</span>
        </div>
        <ul>
          {details.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      <p className="dialog-note">
        Local preview only. This selection does not create an account, subscription or
        sales request. You can download a sample configuration to explore.
      </p>
      <ConfigurationFile
        text={planConfiguration(selectedPlan)}
        fileName={`swarm-${selectedPlan.toLowerCase()}.yaml`}
      />
    </>
  );
}

/**
 * 为导航、文档和方案按钮提供统一原生模态窗口。
 * @param {{dialog:({kind:string,title?:string,plan?:string}|null),onClose:() => void}} props 当前弹窗描述与关闭回调。
 * @returns {React.ReactElement} 原生dialog容器，关闭时保持隐藏。
 */
export function InteractionDialog({ dialog, onClose }) {
  // 使用布尔开关管理原生窗口，避免动画每帧刷新或回调变化导致重复showModal。
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const backdropPressRef = useRef(false);
  closeRef.current = onClose;
  const isOpen = Boolean(dialog);
  useEffect(() => {
    // 原生模态提供焦点约束和背景惰性，关闭后恢复触发按钮，保持键盘导航连续。
    const node = dialogRef.current;
    if (!isOpen || !node) return undefined;
    const trigger = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    // 锁定背景滚动并保留滚动条占位，避免遮罩操作推进施工或让画布横向跳动。
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    if (!node.open) node.showModal();
    return () => {
      if (node.open) node.close();
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  /**
   * 通知页面关闭窗口，让React状态与原生dialog的可见状态一致。
   * @returns {void}
   */
  function requestClose() {
    // 所有关闭入口走同一回调，由上层清空当前弹窗描述。
    closeRef.current();
  }

  /**
   * 拦截原生Escape取消事件并交由React关闭，避免状态仍认为窗口开启。
   * @param {React.SyntheticEvent<HTMLDialogElement>} event 原生取消事件。
   * @returns {void}
   */
  function onCancel(event) {
    // 阻止浏览器独自关闭后遗留状态，再触发统一关闭入口。
    event.preventDefault();
    requestClose();
  }

  /**
   * 判断指针是否处于dialog边界之外，区分遮罩与弹窗自身留白。
   * @param {React.PointerEvent<HTMLDialogElement>|React.MouseEvent<HTMLDialogElement>} event 指针或点击事件。
   * @returns {boolean} 指针是否位于模态遮罩。
   */
  function isBackdrop(event) {
    // 原生遮罩事件的target也是dialog，必须额外检查边界才能避免误关内部区域。
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }

  /**
   * 记录按下是否来自遮罩，避免用户在代码区拖动选择后误触关闭。
   * @param {React.PointerEvent<HTMLDialogElement>} event 指针按下事件。
   * @returns {void}
   */
  function onBackdropPointerDown(event) {
    // 只有按下和释放都落在遮罩时，才将整个动作识别为关闭点击。
    backdropPressRef.current = isBackdrop(event);
  }

  /**
   * 处理完整遮罩点击并清除按下记录。
   * @param {React.MouseEvent<HTMLDialogElement>} event 点击事件。
   * @returns {void}
   */
  function onBackdropClick(event) {
    // 内部按钮的冒泡不会满足遮罩判断，因而不会影响配置复制和下载。
    if (backdropPressRef.current && isBackdrop(event)) requestClose();
    backdropPressRef.current = false;
  }

  const kind = dialog?.kind ?? DialogKind.QUICK_START;
  const information = INFORMATION[kind];
  const title =
    dialog?.title ??
    (kind === DialogKind.PLAN
      ? `Explore ${dialog?.plan ?? PlanName.HIVE}`
      : (information?.title ??
        (kind === DialogKind.DOCS
          ? "The configuration guide"
          : "Build your first swarm.")));
  return (
    <dialog
      ref={dialogRef}
      className="interaction-dialog"
      aria-labelledby="interaction-dialog-title"
      onCancel={onCancel}
      onPointerDown={onBackdropPointerDown}
      onClick={onBackdropClick}
    >
      {dialog && (
        <div className="dialog-surface">
          <header className="dialog-header">
            <span className="dialog-eyebrow">
              SWARM <span aria-hidden="true">/</span> LOCAL PREVIEW
            </span>
            <button
              type="button"
              className="dialog-close"
              onClick={requestClose}
              aria-label="Close dialog"
            >
              ×
            </button>
          </header>
          <h2
            id="interaction-dialog-title"
            className="dialog-title"
            tabIndex={-1}
            autoFocus
          >
            {title}
          </h2>
          {kind === DialogKind.PLAN ? (
            <PlanContent plan={dialog.plan} />
          ) : information ? (
            <>
              <p className="dialog-description">{information.description}</p>
              <div className="dialog-article">
                {information.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {kind === DialogKind.STATUS && (
                <ul className="dialog-status">
                  <li>
                    <span>Page navigation</span>
                    <strong>Available locally</strong>
                  </li>
                  <li>
                    <span>Configuration files</span>
                    <strong>Copy & download</strong>
                  </li>
                  <li>
                    <span>Hosted services</span>
                    <strong>Not connected</strong>
                  </li>
                </ul>
              )}
              <button type="button" className="dialog-button" onClick={requestClose}>
                Back to the page <span aria-hidden="true">↗</span>
              </button>
            </>
          ) : (
            <ConfigurationContent quickStart={kind === DialogKind.QUICK_START} />
          )}
        </div>
      )}
    </dialog>
  );
}
