"use client";

import dynamic from "next/dynamic";

const VantaBackground = dynamic(() => import("./VantaBackground"), {
  ssr: false,
});

export default VantaBackground;
