import { expect, test } from "@playwright/test";

const storyUrl = "/iframe.html?id=foundation-agent-tools--all-states&viewMode=story";

type RecorderPageOptions = { denyFirstPermission?: boolean; delayFirstPermission?: boolean; mockPlayback?: boolean; playbackFailures?: number; deferStop?: boolean; validPlaybackAudio?: boolean; rejectPlaybackDecode?: boolean };

async function openAgentTools(page: import("@playwright/test").Page, options: RecorderPageOptions = {}) {
  await page.addInitScript(({ denyFirstPermission, delayFirstPermission, mockPlayback, playbackFailures, deferStop, validPlaybackAudio, rejectPlaybackDecode }) => {
    const state = {
      getUserMediaCalls: 0,
      trackStops: 0,
      lastPointerId: 0,
      playCalls: 0,
      playbackFailuresRemaining: playbackFailures,
      decodeCalls: 0,
      playbackContextCloseCalls: 0,
      playbackContext: null as AudioContext | null,
      deferStop,
      validPlaybackAudio,
      finishStop: undefined as (() => void) | undefined,
      denyFirstPermission,
      delayFirstPermission,
    };
    Object.defineProperty(window, "__agentToolsMediaState", { configurable: true, value: state });
    Object.defineProperty(window, "__finishAgentToolsStop", { configurable: true, value: () => state.finishStop?.() });
    window.addEventListener("pointerdown", (event) => { state.lastPointerId = event.pointerId; }, true);

    const makeStream = () => {
      const track = {
        kind: "audio",
        enabled: true,
        stop() { state.trackStops += 1; },
      };
      return {
        getTracks: () => [track],
        getAudioTracks: () => [track],
      };
    };

    const makePlaybackWave = () => {
      const sampleRate = 8000;
      const sampleCount = sampleRate * 2;
      const buffer = new ArrayBuffer(44 + sampleCount * 2);
      const view = new DataView(buffer);
      const writeText = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
      writeText(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true); writeText(8, "WAVE");
      writeText(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
      writeText(36, "data"); view.setUint32(40, sampleCount * 2, true);
      for (let index = 0; index < sampleCount; index++) {
        const second = index / sampleRate;
        const amplitude = second < 0.5 ? 0.12 : second < 1 ? 0.85 : second < 1.5 ? 0.32 : 1;
        view.setInt16(44 + index * 2, Math.round(Math.sin(2 * Math.PI * 440 * second) * amplitude * 32767), true);
      }
      return buffer;
    };
    const playbackBytes = validPlaybackAudio ? makePlaybackWave() : null;

    if (typeof AudioContext !== "undefined") {
      const decodeAudioData = AudioContext.prototype.decodeAudioData;
      const closeAudioContext = AudioContext.prototype.close;
      AudioContext.prototype.decodeAudioData = function decode(data, success, failure) {
        state.decodeCalls += 1;
        state.playbackContext = this;
        if (rejectPlaybackDecode) {
          const error = new DOMException("Audio decoding is unavailable", "NotSupportedError");
          failure?.(error);
          return Promise.reject(error);
        }
        return decodeAudioData.call(this, data, success, failure);
      };
      AudioContext.prototype.close = function close() {
        if (this === state.playbackContext) state.playbackContextCloseCalls += 1;
        return closeAudioContext.call(this);
      };
    }

    class MockMediaRecorder {
      state: "inactive" | "recording" | "paused" = "inactive";
      mimeType = validPlaybackAudio ? "audio/wav" : "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {}

      start() { this.state = "recording"; }
      pause() { this.state = "paused"; }
      resume() { this.state = "recording"; }
      stop() {
        this.state = "inactive";
        const finish = () => {
          this.ondataavailable?.({ data: new Blob([playbackBytes ?? "mock audio bytes"], { type: this.mimeType }) });
          this.onstop?.();
        };
        if (state.deferStop) state.finishStop = finish;
        else finish();
      }

      static isTypeSupported(type: string) { return type.startsWith("audio/"); }
    }

    Object.defineProperty(window, "MediaRecorder", {
      configurable: true,
      writable: true,
      value: MockMediaRecorder,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        async getUserMedia() {
          state.getUserMediaCalls += 1;
          if (state.denyFirstPermission && state.getUserMediaCalls === 1) {
            throw new DOMException("Permission denied", "NotAllowedError");
          }
          const currentStream = makeStream();
          if (state.delayFirstPermission && state.getUserMediaCalls === 1) {
            await new Promise((resolve) => setTimeout(resolve, 350));
          }
          return currentStream;
        },
      },
    });

    if (mockPlayback) {
      Object.defineProperty(HTMLMediaElement.prototype, "play", {
        configurable: true,
        value: function play() {
          state.playCalls += 1;
          if (state.playbackFailuresRemaining > 0) {
            state.playbackFailuresRemaining -= 1;
            return Promise.reject(new DOMException("Playback was blocked", "NotAllowedError"));
          }
          Object.defineProperty(this, "paused", { configurable: true, value: false });
          this.dispatchEvent(new Event("play"));
          return Promise.resolve();
        },
      });
      Object.defineProperty(HTMLMediaElement.prototype, "pause", {
        configurable: true,
        value: function pause() {
          Object.defineProperty(this, "paused", { configurable: true, value: true });
          this.dispatchEvent(new Event("pause"));
        },
      });
    }
  }, {
    denyFirstPermission: options.denyFirstPermission ?? false,
    delayFirstPermission: options.delayFirstPermission ?? false,
    mockPlayback: options.mockPlayback ?? false,
    playbackFailures: options.playbackFailures ?? 0,
    deferStop: options.deferStop ?? false,
    validPlaybackAudio: options.validPlaybackAudio ?? false,
    rejectPlaybackDecode: options.rejectPlaybackDecode ?? false,
  });

  await page.goto(storyUrl);
  await expect(page.getByRole("heading", { name: "Agent tools component contracts" })).toBeVisible();
}

async function mediaState(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as unknown as { __agentToolsMediaState: { getUserMediaCalls: number; trackStops: number; lastPointerId: number; playCalls: number; playbackFailuresRemaining: number; decodeCalls: number; playbackContextCloseCalls: number } }).__agentToolsMediaState);
}

async function pointerDownOnRecord(page: import("@playwright/test").Page, recorder: import("@playwright/test").Locator) {
  const button = recorder.getByRole("button", { name: "Record", exact: true });
  const bounds = await button.boundingBox();
  expect(bounds).not.toBeNull();
  const point = { x: bounds!.x + bounds!.width / 2, y: bounds!.y + bounds!.height / 2 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await expect(recorder).toHaveAttribute("data-state", "recording");
  return point;
}

async function startWithKeyboard(page: import("@playwright/test").Page, recorder: import("@playwright/test").Locator) {
  await recorder.getByRole("button", { name: "Record", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(recorder).toHaveAttribute("data-state", "recording");
}

test("VoiceRecorder records through pause and resume, retains an errored attach for retry, and releases the stream", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Recorder lifecycle and retry run once on desktop.");
  await openAgentTools(page);

  const recorder = page.getByRole("region", { name: "Voice note" });
  await startWithKeyboard(page, recorder);
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await page.waitForTimeout(40);
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await recorder.getByRole("button", { name: "Pause" }).click();
  await expect(recorder).toHaveAttribute("data-state", "paused");
  await recorder.getByRole("button", { name: "Resume" }).click();
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect(recorder.getByRole("slider", { name: "Recording position" })).toBeVisible();
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(1);
  expect(await recorder.locator('audio[aria-label="Recorded voice note"]').evaluate((audio) => (audio as HTMLAudioElement).controls)).toBe(false);
  expect((await mediaState(page)).trackStops).toBe(1);

  await recorder.getByRole("button", { name: "Attach recording" }).click();
  await expect(recorder.getByRole("alert")).toHaveText("Could not attach this recording. Try again.");
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(1);
  await expect(page.getByTestId("voice-attempts")).toHaveText("1");

  await recorder.getByRole("button", { name: "Attach recording" }).click();
  await expect(page.getByTestId("voice-result")).toContainText("Attached audio/webm audio");
  await expect(page.getByTestId("voice-attempts")).toHaveText("2");
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(0);
});

test("VoiceRecorder tap and keyboard activation keep recording until Stop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Tap and keyboard activation lifecycle runs once on desktop.");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openAgentTools(page);
  const recorder = page.getByRole("region", { name: "Voice note" });

  await recorder.getByRole("button", { name: "Record", exact: true }).click();
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await recorder.getByRole("button", { name: "Discard" }).click();

  const record = recorder.getByRole("button", { name: "Record", exact: true });
  await record.focus();
  await page.keyboard.press("Enter");
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await expect(recorder.getByRole("button", { name: "Pause" })).toBeFocused();
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect(recorder.getByRole("button", { name: "Play recording" })).toBeFocused();
  expect((await mediaState(page)).getUserMediaCalls).toBe(2);
});

test("VoiceRecorder hold release stops, left swipe discards, and pointer cancellation stops the mic", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Pointer gesture lifecycle runs once on desktop.");
  await openAgentTools(page);
  const recorder = page.getByRole("region", { name: "Voice note" });

  await pointerDownOnRecord(page, recorder);
  await page.waitForTimeout(260);
  await page.mouse.up();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  expect((await mediaState(page)).trackStops).toBe(1);
  await recorder.getByRole("button", { name: "Discard" }).click();

  const swipePoint = await pointerDownOnRecord(page, recorder);
  await page.mouse.move(swipePoint.x - 80, swipePoint.y);
  await expect(recorder).toHaveAttribute("data-cancelling", "true");
  await expect(recorder.getByText("Release to discard")).toBeVisible();
  await page.mouse.up();
  await expect(recorder).toHaveAttribute("data-state", "idle");
  expect((await mediaState(page)).trackStops).toBe(2);

  await pointerDownOnRecord(page, recorder);
  const pointerId = (await mediaState(page)).lastPointerId;
  expect(pointerId).toBeGreaterThan(0);
  await recorder.evaluate((element, id) => {
    element.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: id, pointerType: "mouse" }));
  }, pointerId);
  await expect(recorder).toHaveAttribute("data-state", "idle");
  await page.mouse.up();
  expect((await mediaState(page)).trackStops).toBe(3);
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(0);
});

test("VoiceRecorder custom playback reports failure, retries, pauses, and exposes seek control", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Custom playback lifecycle runs once on desktop.");
  await openAgentTools(page, { mockPlayback: true, playbackFailures: 1 });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await startWithKeyboard(page, recorder);
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect(recorder.getByRole("slider", { name: "Recording position" })).toBeVisible();
  await recorder.getByRole("button", { name: "Play recording" }).click();
  await expect(recorder.getByRole("alert")).toHaveText("Playback could not start. Try again or attach the recording.");
  expect((await mediaState(page)).playCalls).toBe(1);

  await recorder.getByRole("button", { name: "Play recording" }).click();
  await expect(recorder.getByRole("button", { name: "Pause playback" })).toBeVisible();
  await expect(recorder.getByRole("alert")).toHaveCount(0);
  await recorder.getByRole("button", { name: "Pause playback" }).click();
  await expect(recorder.getByRole("button", { name: "Play recording" })).toBeVisible();
  expect((await mediaState(page)).playCalls).toBe(2);
});

test("VoiceRecorder decodes playback bars and supports keyboard seeking", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Decoded waveform and keyboard seeking run once on desktop.");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openAgentTools(page, { mockPlayback: true, validPlaybackAudio: true });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await startWithKeyboard(page, recorder);
  await page.clock.runFor(1500);
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");

  const bars = recorder.locator(".hw-voice-playback-wave svg rect");
  await expect(bars).toHaveCount(64);
  await expect.poll(async () => (await mediaState(page)).decodeCalls).toBeGreaterThan(0);
  await expect.poll(async () => bars.evaluateAll(elements => Math.max(...elements.map(element => Number(element.getAttribute("height")))))).toBeGreaterThan(20);
  const heights = await bars.evaluateAll(elements => elements.map(element => Number(element.getAttribute("height"))));
  expect(Math.min(...heights)).toBeLessThan(6);
  expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(15);
  await expect.poll(async () => (await mediaState(page)).playbackContextCloseCalls).toBeGreaterThan(0);

  const seek = recorder.getByRole("slider", { name: "Recording position" });
  await expect(seek).toBeVisible();
  await seek.focus();
  for (let index = 0; index < 20; index += 1) await page.keyboard.press("ArrowRight");
  await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0.15);
  await expect(seek).toHaveAttribute("aria-valuetext", "0 of 2 seconds");
  await expect.poll(async () => recorder.locator('.hw-voice-playback-wave svg rect[data-played="true"]').count()).toBeGreaterThan(0);

  const position = await seek.inputValue();
  await recorder.getByRole("button", { name: "Play recording" }).click();
  await expect(recorder.getByRole("button", { name: "Pause playback" })).toBeVisible();
  await recorder.getByRole("button", { name: "Pause playback" }).click();
  await expect(seek).toHaveValue(position);
  await expect(recorder.getByRole("alert")).toHaveCount(0);
});

test("VoiceRecorder keeps seeking available and closes its decoder when audio decoding fails", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Audio decoding fallback and cleanup run once on desktop.");
  await openAgentTools(page, { validPlaybackAudio: true, rejectPlaybackDecode: true });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await startWithKeyboard(page, recorder);
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  const bars = recorder.locator(".hw-voice-playback-wave svg rect");
  await expect(bars).toHaveCount(64);
  await expect.poll(async () => (await mediaState(page)).decodeCalls).toBeGreaterThan(0);
  await expect.poll(async () => (await mediaState(page)).playbackContextCloseCalls).toBeGreaterThan(0);
  expect(await bars.evaluateAll(elements => elements.every(element => Number(element.getAttribute("height")) === 2))).toBe(true);
  await expect(recorder.getByRole("slider", { name: "Recording position" })).toBeVisible();
  await expect(recorder.getByRole("alert")).toHaveCount(0);
});

test("VoiceRecorder disables active controls while preparing playback and honors reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Stop preparation and reduced-motion behavior run once on desktop.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openAgentTools(page, { deferStop: true });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await startWithKeyboard(page, recorder);
  await expect(recorder).toHaveAttribute("data-state", "recording");
  expect(await recorder.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  expect(await recorder.locator("canvas").evaluate((element) => getComputedStyle(element).visibility)).toBe("hidden");

  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "stopping");
  await expect(recorder.getByRole("status")).toHaveText("Preparing playback");
  await expect(recorder.getByRole("button", { name: "Pause" })).toBeDisabled();
  await expect(recorder.getByRole("button", { name: "Stop recording" })).toBeDisabled();

  await page.evaluate(() => (window as unknown as { __finishAgentToolsStop: () => void }).__finishAgentToolsStop());
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect(recorder.getByRole("button", { name: "Play recording" })).toBeFocused();
});

test("VoiceRecorder recovers from denied permission, discards captured audio, and honors disabled", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Permission recovery, discard, and disabled behavior run once on desktop.");
  await openAgentTools(page, { denyFirstPermission: true });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await recorder.getByRole("button", { name: "Record", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(recorder.getByRole("alert")).toContainText("Microphone access was denied.");
  await startWithKeyboard(page, recorder);
  expect((await mediaState(page)).getUserMediaCalls).toBe(2);
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(1);
  await recorder.getByRole("button", { name: "Discard" }).click();
  await expect(recorder).toHaveAttribute("data-state", "idle");
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(0);
  expect((await mediaState(page)).trackStops).toBe(1);

  await page.getByTestId("toggle-voice-disabled").click();
  await expect(recorder.getByRole("button", { name: "Record", exact: true })).toBeDisabled();
  await expect.poll(async () => (await mediaState(page)).getUserMediaCalls).toBe(2);
});

test("VoiceRecorder cancels a delayed permission request without letting its stale stream replace a new recording", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Permission cancellation and stale stream cleanup run once on desktop.");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openAgentTools(page, { delayFirstPermission: true });
  const recorder = page.getByRole("region", { name: "Voice note" });

  await recorder.getByRole("button", { name: "Record", exact: true }).click();
  await expect(recorder).toHaveAttribute("data-state", "requesting");
  await recorder.getByRole("button", { name: "Cancel request" }).click();
  await expect(recorder).toHaveAttribute("data-state", "idle");
  await recorder.getByRole("button", { name: "Record", exact: true }).click();
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await page.clock.runFor(500);
  await expect.poll(async () => (await mediaState(page)).trackStops).toBe(1);
  expect((await mediaState(page)).getUserMediaCalls).toBe(2);
  await expect(recorder).toHaveAttribute("data-state", "recording");

  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await recorder.getByRole("button", { name: "Discard" }).click();
  expect((await mediaState(page)).trackStops).toBe(2);
});

test("VoiceRecorder releases its active stream when unmounted", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Unmount cleanup runs once on desktop.");
  await openAgentTools(page);
  const recorder = page.getByRole("region", { name: "Voice note" });
  await startWithKeyboard(page, recorder);

  await page.getByTestId("toggle-voice-mounted").click();
  await expect(recorder.getByRole("button", { name: "Record", exact: true })).toHaveCount(0);
  expect((await mediaState(page)).trackStops).toBe(1);
});

test("ContextTray inspects supplied content, restores focus, removes by id, and handles disabled items", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Context inspection and removal run once on desktop.");
  await openAgentTools(page);

  const tray = page.getByRole("region", { name: "Context tray" });
  const briefTrigger = tray.getByRole("button", { name: "Inspect Product brief" });
  await briefTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Product brief" });
  await expect(dialog).toContainText("Project goals and constraints");
  await expect(dialog).toContainText("Keep decisions reviewable");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(briefTrigger).toBeFocused();

  await tray.getByRole("button", { name: "Remove API reference" }).click();
  await expect(page.getByTestId("context-result")).toHaveText("Removed reference.");
  await expect(tray.getByRole("button", { name: "Inspect API reference" })).toHaveCount(0);

  await page.getByTestId("toggle-context-disabled").click();
  await expect(tray.getByRole("button", { name: "Inspect Product brief" })).toBeDisabled();
  await expect(tray.getByRole("button", { name: "Remove Product brief" })).toBeDisabled();
  await expect(page.getByTestId("context-result")).toHaveText("Removed reference.");
  await page.getByTestId("toggle-context-disabled").click();
  await tray.getByRole("button", { name: "Remove Product brief" }).click();
  await expect(tray).toContainText("No context attached.");
  await expect(page.getByTestId("context-result")).toHaveText("Removed brief.");
});

test("ContextTray keeps its preview in the viewport on a narrow phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "narrow", "Context dialog geometry is checked at 320px.");
  await openAgentTools(page);

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(pageWidth).toBeLessThanOrEqual(1);
  const tray = page.getByRole("region", { name: "Context tray" });
  await tray.getByRole("button", { name: "Inspect API reference" }).click();
  const dialog = page.getByRole("dialog", { name: "API reference" });
  await expect(dialog).toContainText("Components receive explicit values");
  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual((await page.evaluate(() => window.innerWidth)) + 1);
  await expect(dialog.locator(".hw-context-detail")).toBeVisible();
});

test("ReviewApplyCard shows comparison, blocks duplicate apply, retains errors for retry, and reports confirmed success", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Apply pending, error, and success lifecycle runs once on desktop.");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openAgentTools(page);

  const review = page.getByRole("region", { name: "Review and apply" });
  const card = review.locator('[data-slot="card"]');
  await expect(card.getByRole("region", { name: "Original content" })).toContainText("Welcome to the app.");
  await expect(card.getByRole("region", { name: "Proposed content" })).toContainText("your team's workspace");
  await expect(card).toContainText("Only the onboarding screen will change.");

  const apply = card.getByRole("button", { name: "Apply changes" });
  await apply.evaluate((button) => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(card).toHaveAttribute("aria-busy", "true");
  await expect(page.getByTestId("apply-attempts")).toHaveText("1");
  await expect(card.getByRole("button", { name: "Applying…" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Reject" })).toBeDisabled();

  await page.clock.runFor(500);
  await expect(card.getByRole("alert")).toHaveText("Could not apply the proposed change. Try again.");
  await expect(card).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId("apply-result")).toHaveText("Apply failed. The proposed change is still available to retry.");
  await expect(card.getByRole("button", { name: "Apply changes" })).toBeEnabled();

  await card.getByRole("button", { name: "Apply changes" }).click();
  await page.clock.runFor(500);
  await expect(page.getByTestId("apply-result")).toHaveText("Applied after retry.");
  await expect(card.getByRole("status")).toHaveText("Changes applied.");
  await expect(card.getByRole("button", { name: "Applied" })).toBeDisabled();
  await expect(page.getByTestId("apply-attempts")).toHaveText("2");
});

test("ReviewApplyCard rejection calls the host and disabled state blocks actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Reject and disabled actions run once on desktop.");
  await openAgentTools(page);
  const review = page.getByRole("region", { name: "Review and apply" });
  const card = review.locator('[data-slot="card"]');

  await page.getByTestId("toggle-review-disabled").click();
  await expect(card.getByRole("button", { name: "Apply changes" })).toBeDisabled();
  await expect(card.getByRole("button", { name: "Reject" })).toBeDisabled();
  await card.getByRole("button", { name: "Apply changes" }).evaluate((button) => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(page.getByTestId("apply-attempts")).toHaveText("0");

  await page.getByTestId("toggle-review-disabled").click();
  await card.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByTestId("reject-result")).toHaveText("Change rejected.");
  await expect(page.getByTestId("apply-attempts")).toHaveText("0");
});

test("ReviewApplyCard fits long comparison text on narrow phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "narrow", "Review card width is checked at 320px.");
  await openAgentTools(page);

  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  const review = page.getByRole("region", { name: "Review and apply" });
  const card = review.locator('[data-slot="card"]');
  await expect(card.getByRole("region", { name: "Original content" })).toBeVisible();
  await expect(card.getByRole("region", { name: "Proposed content" })).toBeVisible();
  const geometry = await card.evaluate((element) => ({
    width: element.getBoundingClientRect().width,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(geometry.width).toBeGreaterThan(0);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
});
