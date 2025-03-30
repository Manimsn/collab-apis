// // components/ModelViewer.tsx
// 'use client';

// import { useEffect } from 'react';

// export default function ModelViewer() {
//   useEffect(() => {
//     import('@google/model-viewer'); // loads only on client
//   }, []);

//   return (
//     <model-viewer
//       src="/Astronaut.glb"
//       alt="3D Model"
//       camera-controls
//       auto-rotate
//       ar
//       style={{ width: '100%', height: '500px' }}
//     />
//   );
// }

"use client";

import React, { useEffect, forwardRef } from "react";

interface Private3dModelViewerProps {
  src: string;
  hideCameraControls?: boolean;
}

const Custom3dModelViewer = forwardRef<any, Private3dModelViewerProps>(
  ({ src, hideCameraControls }, ref) => {
    useEffect(() => {
      if (!customElements.get("model-viewer")) {
        import("@google/model-viewer");
      }
    }, []);

    return (
      <model-viewer
        ref={ref}
        src={src}
        ar
        ar-modes="scene-viewer quick-look webxr"
        {...(!hideCameraControls && { "camera-controls": true })}
        {...(!hideCameraControls && { "interaction-prompt-style": "wiggle" })}
        {...(!hideCameraControls && { "auto-rotate": "true" })}
        ar-scale="auto"
        ar-placement="floor"
        loading="lazy"
        camera-orbit="0deg 75deg auto"
        bounds="tight"
        min-camera-orbit="auto auto 100%"
        max-camera-orbit="auto auto 150%"
        field-of-view="45deg"
        min-field-of-view="25deg"
        max-field-of-view="45deg"
        interaction-prompt="none"
        interaction-prompt-threshold="0"
        interaction-prompts="touch"
        interaction-prompt-scale="2"
        auto-rotate-delay="0"
        environment-image="neutral"
        exposure="1"
        shadow-intensity="1"
        ar-tracking="camera"
        xr-environment
        interaction-policy="always-allow"
        style={{
          width: "100%",
          height: "500px", // or "100%" if preferred
        }}
      />
    );
  }
);

Custom3dModelViewer.displayName = "Custom3dModelViewer";
export default Custom3dModelViewer;
