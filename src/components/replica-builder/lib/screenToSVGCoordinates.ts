const map = new WeakMap<SVGSVGElement, DOMPoint>();

export function screenToSVGCoordinates(x: number, y: number, svg: SVGSVGElement) {
  let svgPoint = map.get(svg);
  if (!svgPoint) {
    svgPoint = svg.createSVGPoint();
    map.set(svg, svgPoint);
  }
  svgPoint.x = x;
  svgPoint.y = y;

  const ctm = svg.getScreenCTM();
  if (!ctm) {
    console.error('SVG Screen CTM is not available.');
    return null;
  }

  const transformedPoint = svgPoint.matrixTransform(ctm.inverse());
  // transformedPoint.x = Math.round(transformedPoint.x);
  // transformedPoint.y = Math.round(transformedPoint.y);
  transformedPoint.x = transformedPoint.x;
  transformedPoint.y = transformedPoint.y;
  return transformedPoint;
}
