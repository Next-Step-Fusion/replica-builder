export function Grid() {
  return (
    <>
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d0d0d0" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="5000" height="5000" x="-2500" y="-2500" fill="url(#grid)" />
    </>
  );
}
