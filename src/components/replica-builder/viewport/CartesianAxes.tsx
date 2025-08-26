export const CartesianAxes = () => {
  const axisLength = 10000; // A large number to simulate infinite axes
  const strokeColor = '#aaa'; // Light gray color for the axes
  const strokeWidth = 2;
  const markerStep = 50;
  const markerLength = 10;
  const markerStrokeWidth = 1;
  const labelFontSize = 10;
  const labelOffset = 5;

  const markers = [];
  for (let i = markerStep; i <= axisLength; i += markerStep) {
    markers.push(i);
    markers.push(-i);
  }

  return (
    <g className="pointer-events-none select-none">
      {/* X-axis */}
      <line
        x1={-axisLength}
        y1={0}
        x2={axisLength}
        y2={0}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Y-axis */}
      <line
        x1={0}
        y1={-axisLength}
        x2={0}
        y2={axisLength}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {markers.map((pos) => (
        <g key={`marker-${pos}`}>
          {/* X-axis marker */}
          <line
            x1={pos}
            y1={-markerLength / 2}
            x2={pos}
            y2={markerLength / 2}
            stroke={strokeColor}
            strokeWidth={markerStrokeWidth}
          />
          {/* Y-axis marker */}
          <line
            x1={-markerLength / 2}
            y1={pos}
            x2={markerLength / 2}
            y2={pos}
            stroke={strokeColor}
            strokeWidth={markerStrokeWidth}
          />
          {/* X-axis label */}
          <text
            x={pos}
            y={markerLength / 2 + labelOffset}
            fill={strokeColor}
            fontSize={labelFontSize}
            textAnchor="middle"
            dominantBaseline="hanging"
          >
            {pos}
          </text>
          {/* Y-axis label */}
          <text
            x={-markerLength / 2 - labelOffset}
            y={pos}
            fill={strokeColor}
            fontSize={labelFontSize}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {-pos}
          </text>
        </g>
      ))}
    </g>
  );
};
