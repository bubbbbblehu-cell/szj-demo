/** All durations are seconds; offsets are CSS pixels. No network dependencies. */
export const spaceConfig = Object.freeze({
  useOriginalStars: true,
  starCount: 42,
  twinkleMinDuration: 2,
  twinkleMaxDuration: 5,
  minOpacity: 0.35,
  maxOpacity: 1,
  starColors: Object.freeze(['#fff4d5', '#ffe8a6', '#a8edff', '#69d5f5']),
  enableNebulaBreathing: false,
  nebulaBreathingDuration: 24,
  nebulaBreathingStrength: 0.018,
  enableParallax: false,
  parallaxMaxOffset: 5,
});
