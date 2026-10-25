/**
 * Himdrishti Antarctic Digital Twin - WebGL Support & Diagnostics
 * Robust detection of WebGL 1/2 capabilities, context loss recovery,
 * and hardware acceleration status.
 */

export interface WebGLDiagnosticResult {
  supported: boolean;
  version: "webgl2" | "webgl1" | "none";
  renderer?: string;
  vendor?: string;
  maxTextureSize?: number;
  reason?: string;
}

/**
 * Checks if WebGL is available and functional in the current browser session.
 */
export function checkWebGLSupport(): WebGLDiagnosticResult {
  if (typeof window === "undefined" || !window.document) {
    return {
      supported: false,
      version: "none",
      reason: "Server-side rendering environment (DOM unavailable)",
    };
  }

  // Check URL override for testing fallback mode (?fallback=1 or ?nowebgl=1)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("fallback") === "1" || searchParams.get("nowebgl") === "1") {
      return {
        supported: false,
        version: "none",
        reason: "Simulated WebGL restriction via URL override parameter (?fallback=1)",
      };
    }
  } catch {
    // Ignore URL parse error
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    // Check WebGL 2 first
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let version: "webgl2" | "webgl1" | "none" = "none";

    const contextAttributes: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: true,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
    };

    try {
      gl = canvas.getContext("webgl2", contextAttributes) as WebGL2RenderingContext | null;
      if (gl) version = "webgl2";
    } catch {
      // webgl2 not supported, fallback to webgl1
    }

    if (!gl) {
      try {
        gl = (canvas.getContext("webgl", contextAttributes) ||
          canvas.getContext("experimental-webgl", contextAttributes)) as WebGLRenderingContext | null;
        if (gl) version = "webgl1";
      } catch {
        // webgl1 also failed
      }
    }

    if (!gl) {
      return {
        supported: false,
        version: "none",
        reason:
          "WebGL context creation failed. Hardware acceleration might be disabled in browser settings or GPU driver is unsupported.",
      };
    }

    // Query GPU Vendor & Renderer details if extension is available
    let renderer = "Generic Hardware Accelerator";
    let vendor = "Generic Vendor";
    try {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        if (unmaskedRenderer) renderer = String(unmaskedRenderer);
        if (unmaskedVendor) vendor = String(unmaskedVendor);
      }
    } catch {
      // Security / fingerprinting shields may block extension
    }

    let maxTextureSize = 2048;
    try {
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;
    } catch {
      // Default
    }

    // Clean up temporary context
    try {
      const loseContextExt = gl.getExtension("WEBGL_lose_context");
      if (loseContextExt) {
        loseContextExt.loseContext();
      }
    } catch {
      // Ignore
    }

    return {
      supported: true,
      version,
      renderer,
      vendor,
      maxTextureSize,
    };
  } catch (err: any) {
    return {
      supported: false,
      version: "none",
      reason: err?.message || "Unknown error occurred while testing WebGL context.",
    };
  }
}
