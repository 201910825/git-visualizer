export function GraphBackground() {
    return (
        <div className="absolute inset-0 z-0">
            <svg
  className="w-full h-full"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    {/* Grid Pattern */}
    <pattern
      id="grid-pattern"
      x="0"
      y="0"
      width="60"
      height="60"
      patternUnits="userSpaceOnUse"
    >
      {/* Vertical lines */}
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="60"
        stroke="currentColor"
        strokeWidth="1"
        className="text-gray-300 dark:text-gray-600"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.8;0.3"
          dur="4s"
          repeatCount="indefinite"
        />
      </line>
      {/* Horizontal lines */}
      <line
        x1="0"
        y1="0"
        x2="60"
        y2="0"
        stroke="currentColor"
        strokeWidth="1"
        className="text-gray-300 dark:text-gray-600"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.8;0.3"
          dur="4s"
          repeatCount="indefinite"
          begin="2s"
        />
      </line>
      {/* Animated dots at intersections */}
      <circle
        cx="0"
        cy="0"
        r="1"
        className="text-blue-400 dark:text-blue-500"
        fill="currentColor"
      >
        <animate
          attributeName="r"
          values="1;3;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>
    </pattern>

    {/* Moving dots pattern */}
    <pattern
      id="dots-pattern"
      x="0"
      y="0"
      width="120"
      height="120"
      patternUnits="userSpaceOnUse"
    >
      <circle
        cx="60"
        cy="60"
        r="2"
        className="text-green-400 dark:text-green-500"
        fill="currentColor"
      >
        <animate
          attributeName="cx"
          values="60;80;60;40;60"
          dur="8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="60;40;60;80;60"
          dur="8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0;1;0"
          dur="8s"
          repeatCount="indefinite"
        />
      </circle>
    </pattern>

    {/* Animated dashed lines */}
    <pattern
      id="dashed-lines"
      x="0"
      y="0"
      width="200"
      height="200"
      patternUnits="userSpaceOnUse"
    >
      <line
        x1="0"
        y1="100"
        x2="200"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="10,5"
        className="text-purple-300 dark:text-purple-600"
        opacity="0.6"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;15"
          dur="2s"
          repeatCount="indefinite"
        />
      </line>
      <line
        x1="100"
        y1="0"
        x2="100"
        y2="200"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="10,5"
        className="text-purple-300 dark:text-purple-600"
        opacity="0.6"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;15"
          dur="2s"
          repeatCount="indefinite"
          begin="1s"
        />
      </line>
    </pattern>

    {/* Radial gradient mask */}
    <radialGradient id="fade-gradient" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stopColor="white" stopOpacity="0" />
      <stop offset="30%" stopColor="white" stopOpacity="0" />
      <stop offset="70%" stopColor="white" stopOpacity="0.3" />
      <stop offset="100%" stopColor="white" stopOpacity="0.8" />
    </radialGradient>
  </defs>

  {/* Grid layer */}
  <rect
    width="100%"
    height="100%"
    fill="url(#grid-pattern)"
  />

  {/* Moving dots layer */}
  <rect
    width="100%"
    height="100%"
    fill="url(#dots-pattern)"
    opacity="0.7"
  />

  {/* Dashed lines layer */}
  <rect
    width="100%"
    height="100%"
    fill="url(#dashed-lines)"
    opacity="0.4"
  />

  {/* Fade overlay */}
  <rect
    width="100%"
    height="100%"
    fill="url(#fade-gradient)"
    className="pointer-events-none"
  />
    </svg>
</div>
)
}