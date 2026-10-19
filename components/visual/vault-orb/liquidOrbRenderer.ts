import { MATTE_ORB_SHADER as LIQUID_ORB_SHADER } from "./matte-orb-shader";
import {
  LIQUID_ORB_ACTIVATION_MS,
  LIQUID_ORB_RIBBON_INSTANCE_COUNT,
  LIQUID_ORB_RIBBON_STYLE_INDEX,
  LIQUID_ORB_SETTLE_MS,
  LIQUID_ORB_STATE_SEEDS,
  LIQUID_ORB_UNIFORM_FLOATS,
  type LiquidOrbState,
} from "./liquidOrbShader";

/**
 * Faithful port of the Liquid Orb demo's runtime (Eythan's paste,
 * 2026-09-09): WebGPU pipelines over the verbatim WGSL, the
 * idle/thinking uniform transition with sRGB-linear colour mixing,
 * and the particle-ribbon path. Fails SILENTLY when WebGPU is
 * unavailable — the workbench just shows no backdrop.
 */

// The repo's TS lib has no WebGPU declarations; the renderer keeps the
// demo's dynamic style behind one loosely-typed alias.
// biome-ignore lint/suspicious/noExplicitAny: WebGPU types aren't in the TS lib — verbatim demo port
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Source WebGPU renderer keeps its untyped platform boundary local.
type Gpu = any;

export type LiquidOrbController = {
  setState(state: LiquidOrbState): void;
  /** Pin individual uniforms (float index → value) on top of the
   * state transition; pass an empty map to release them all. */
  setOverrides(overrides: ReadonlyMap<number, number>): void;
  destroy(): void;
};

function srgbToLinear(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  return value <= 0.0031308
    ? value * 12.92
    : 1.055 * value ** (1 / 2.4) - 0.055;
}

function mixSrgb(from: number, to: number, progress: number): number {
  return linearToSrgb(
    srgbToLinear(from) + (srgbToLinear(to) - srgbToLinear(from)) * progress,
  );
}

/** A state's seeds, padded to the uniform struct's rounded byte size. */
function paddedSeed(state: LiquidOrbState): Float32Array {
  const seed = new Float32Array(LIQUID_ORB_UNIFORM_FLOATS);
  seed.set(LIQUID_ORB_STATE_SEEDS[state]);
  return seed;
}

export function createLiquidOrb(
  canvas: HTMLCanvasElement,
  initialState: LiquidOrbState = "idle",
): LiquidOrbController {
  let uniformOverrides: ReadonlyMap<number, number> = new Map();
  let animationFrame = 0;
  // Perf audit #5: the 60 fps loop pauses while the tab is hidden or the
  // canvas is scrolled/`display:none`d out of view (each desktop page
  // holds 3-4 orbs, several inside breakpoint-hidden chrome). `frame`
  // checks `paused` and parks; resume restarts the loop.
  let paused = false;
  let frameFn: ((now: number) => void) | null = null;
  const onVisibility = () => {
    setPaused(document.visibilityState === "hidden" || !intersecting);
  };
  let intersecting = true;
  const io =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver((entries) => {
          intersecting = entries[0]?.isIntersecting ?? true;
          onVisibility();
        })
      : null;
  io?.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  function setPaused(next: boolean): void {
    if (paused === next) return;
    paused = next;
    if (paused) {
      cancelAnimationFrame(animationFrame);
      lastFrameAt = null;
    } else if (!stopped && frameFn) {
      animationFrame = requestAnimationFrame(frameFn);
    }
  }
  let device: Gpu = null;
  let ribbonTarget: Gpu = null;
  let stopped = false;
  let state: LiquidOrbState = initialState;
  let transitionTargetState: LiquidOrbState = state;
  let fromUniforms = paddedSeed(state);
  let targetUniforms = paddedSeed(state);
  const displayedUniforms = paddedSeed(state);
  let transitionStartedAt = 0;
  let activeTransitionDuration = 0;
  let lastFrameAt: number | null = null;
  let motionPhase = 0;

  function transitionProgress(now: number): number {
    if (activeTransitionDuration === 0) return 1;
    const raw = Math.min(
      1,
      Math.max(0, (now - transitionStartedAt) / activeTransitionDuration),
    );
    return transitionTargetState === "thinking"
      ? 1 - (1 - raw) ** 3
      : raw * raw * (3 - 2 * raw);
  }

  function sampleTransition(now: number): Float32Array {
    const progress = transitionProgress(now);
    for (let index = 3; index < displayedUniforms.length; index += 1) {
      const colorComponent = index >= 40 && (index - 40) % 4 < 3;
      displayedUniforms[index] = colorComponent
        ? mixSrgb(fromUniforms[index], targetUniforms[index], progress)
        : fromUniforms[index] +
          (targetUniforms[index] - fromUniforms[index]) * progress;
    }
    return displayedUniforms;
  }

  function setState(nextState: LiquidOrbState): void {
    if (nextState === state) return;
    const now = performance.now();
    sampleTransition(now);
    fromUniforms = new Float32Array(displayedUniforms);
    targetUniforms = paddedSeed(nextState);
    transitionTargetState = nextState;
    transitionStartedAt = now;
    activeTransitionDuration =
      nextState === "thinking"
        ? LIQUID_ORB_ACTIVATION_MS
        : LIQUID_ORB_SETTLE_MS;
    state = nextState;
  }

  function destroy(): void {
    document.removeEventListener("visibilitychange", onVisibility);
    io?.disconnect();
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(animationFrame);
    ribbonTarget?.destroy();
    device?.destroy();
  }

  async function start(): Promise<void> {
    const gpu: Gpu = (navigator as Gpu).gpu;
    if (!gpu) return;
    const adapter = await gpu.requestAdapter();
    if (!adapter || stopped) return;
    device = await adapter.requestDevice();
    if (stopped) {
      device?.destroy();
      return;
    }
    const context: Gpu = canvas.getContext("webgpu");
    if (!context) return;

    const format = gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "premultiplied" });
    const shader = device.createShaderModule({ code: LIQUID_ORB_SHADER });
    const compilation = await shader.getCompilationInfo();
    const errors = compilation.messages.filter(
      (message: Gpu) => message.type === "error",
    );
    if (errors.length) {
      destroy();
      return;
    }

    const GPUBufferUsageAny: Gpu = (globalThis as Gpu).GPUBufferUsage;
    const GPUTextureUsageAny: Gpu = (globalThis as Gpu).GPUTextureUsage;

    const alphaBlend = {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    };
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "vs_main" },
      fragment: {
        module: shader,
        entryPoint: "fs_main",
        targets: [{ format, blend: { color: alphaBlend, alpha: alphaBlend } }],
      },
      primitive: { topology: "triangle-list" },
    });
    const ribbonPipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "ribbon_vs_main" },
      fragment: {
        module: shader,
        entryPoint: "ribbon_fs_main",
        targets: [
          {
            format,
            blend: {
              color: { srcFactor: "one", dstFactor: "one", operation: "add" },
              alpha: alphaBlend,
            },
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    });
    const ribbonCompositePipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "vs_main" },
      fragment: {
        module: shader,
        entryPoint: "ribbon_composite_fs_main",
        targets: [{ format, blend: { color: alphaBlend, alpha: alphaBlend } }],
      },
      primitive: { topology: "triangle-list" },
    });
    const values = new Float32Array(displayedUniforms);
    const uniformBuffer = device.createBuffer({
      size: values.byteLength,
      usage: GPUBufferUsageAny.UNIFORM | GPUBufferUsageAny.COPY_DST,
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });
    const ribbonBindGroup = device.createBindGroup({
      layout: ribbonPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });
    const ribbonSampler = device.createSampler({
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
    });
    let ribbonCompositeBindGroup: Gpu = null;
    device.lost.then(() => destroy());
    device.addEventListener("uncapturederror", (event: Gpu) => {
      event.preventDefault();
      destroy();
    });

    function frame(now: number): void {
      if (stopped) return;
      try {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          ribbonTarget?.destroy();
          ribbonTarget = null;
          ribbonCompositeBindGroup = null;
        }
        values.set(sampleTransition(now));
        for (const [index, value] of uniformOverrides) {
          values[index] = value;
        }
        const frameDelta =
          lastFrameAt === null
            ? 0
            : Math.min(0.1, Math.max(0, (now - lastFrameAt) / 1000));
        lastFrameAt = now;
        motionPhase += frameDelta * Math.max(values[3], 0);
        values[0] = width;
        values[1] = height;
        values[2] = motionPhase / Math.max(values[3], 0.001);
        device.queue.writeBuffer(uniformBuffer, 0, values);

        const isParticleRibbon =
          Math.round(values[15]) === LIQUID_ORB_RIBBON_STYLE_INDEX;
        const encoder = device.createCommandEncoder();
        if (isParticleRibbon) {
          if (!ribbonTarget || !ribbonCompositeBindGroup) {
            ribbonTarget = device.createTexture({
              size: { width, height },
              format,
              usage:
                GPUTextureUsageAny.RENDER_ATTACHMENT |
                GPUTextureUsageAny.TEXTURE_BINDING,
            });
            ribbonCompositeBindGroup = device.createBindGroup({
              layout: ribbonCompositePipeline.getBindGroupLayout(0),
              entries: [
                { binding: 0, resource: { buffer: uniformBuffer } },
                { binding: 1, resource: ribbonTarget.createView() },
                { binding: 2, resource: ribbonSampler },
              ],
            });
          }
          const particlePass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: ribbonTarget.createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: "clear",
                storeOp: "store",
              },
            ],
          });
          particlePass.setPipeline(ribbonPipeline);
          particlePass.setBindGroup(0, ribbonBindGroup);
          particlePass.draw(6, LIQUID_ORB_RIBBON_INSTANCE_COUNT);
          particlePass.end();
        }
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        if (isParticleRibbon) {
          pass.setPipeline(ribbonCompositePipeline);
          pass.setBindGroup(0, ribbonCompositeBindGroup);
        } else {
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
        }
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
        if (canvas.dataset.ready !== "true") canvas.dataset.ready = "true";
        if (!paused) animationFrame = requestAnimationFrame(frame);
      } catch {
        destroy();
      }
    }

    frameFn = frame;
    if (!paused) animationFrame = requestAnimationFrame(frame);
  }

  function setOverrides(overrides: ReadonlyMap<number, number>): void {
    uniformOverrides = overrides;
  }

  void start().catch(() => destroy());

  return { setState, setOverrides, destroy };
}
