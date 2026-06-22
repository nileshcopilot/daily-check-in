import { useEffect, useRef } from 'react';

var COLORS = ['#2ecc71', '#3498db', '#e67e22', '#e67e22', '#e74c3c'];
var TOP_OFFSET = window.innerHeight;
var LEFT_OFFSET = 300;

const generateWholeNumber = (min: number, max: number) => min + Math.floor(Math.random() * (max - min));

const generateRandomColor = () => COLORS[generateWholeNumber(0, COLORS.length)];

interface ParticlesProps {
  count: number;
}

export function Particles({ count }: ParticlesProps) {
  const particles = [];
  const types = [SquiggleParticle, CircularParticle, CircularParticle];

  let n = count;
  while (n--) {
    const ParticleComponent = types[generateWholeNumber(0, 3)];
    particles.push(<ParticleComponent key={n} />);
  }

  return <div className="dcp-particles">{particles}</div>;
}

function CircularParticle() {
  const circleRef = useRef<HTMLDivElement | null>(null);

  const size = generateWholeNumber(5, 10);
  const left = generateWholeNumber(0, window.innerWidth);
  const top = generateWholeNumber(-TOP_OFFSET, 0);
  const initialRotation = generateWholeNumber(0, 45);

  const style = {
    backgroundColor: generateRandomColor(),
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size}px`,
    transform: `rotateZ(${initialRotation}deg)`,
    left: `${left}px`,
    top: `${top}px`,
  };

  useEffect(() => {
    const node = circleRef.current;
    if (!node) return;

    // Force browser layout reflow to commit initial styles before setting the target styles
    void node.offsetHeight;

    node.style.top = `${window.innerHeight + generateWholeNumber(0, TOP_OFFSET)}px`;
    node.style.left = `${left + generateWholeNumber(-LEFT_OFFSET, LEFT_OFFSET)}px`;
  }, [left]);

  return <div ref={circleRef} className="dcp-particle" style={style} />;
}

function SquiggleParticle() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const size = generateWholeNumber(15, 45);
  const left = generateWholeNumber(0, window.innerWidth);
  const top = generateWholeNumber(-TOP_OFFSET, 0);
  const fill = generateRandomColor();
  const initialRotation = generateWholeNumber(-15, 15);

  const style = {
    fill: fill,
    width: `${size}px`,
    height: `${size}px`,
    transform: `rotateZ(${initialRotation}deg)`,
    left: `${left}px`,
    top: `${top}px`,
  };

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    // Force browser layout reflow to commit initial styles before setting the target styles
    void node.offsetHeight;

    node.style.top = `${window.innerHeight + generateWholeNumber(0, TOP_OFFSET)}px`;
    node.style.left = `${left + generateWholeNumber(-LEFT_OFFSET, LEFT_OFFSET)}px`;
    node.style.transform = `rotateZ(${generateWholeNumber(-15, 15)}deg)`;
  }, [left]);

  return (
    <svg
      ref={svgRef}
      className="dcp-particle"
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        fill={fill}
        d="M428.127,0l-12.716,10.062l12.718-10.06c8.785,11.101,19.716,24.917,19.716,51.051 s-10.932,39.951-19.716,51.053c-7.382,9.331-12.716,16.072-12.716,30.927c0,14.854,5.334,21.594,12.716,30.925   c8.784,11.101,19.716,24.917,19.716,51.05c0,26.135-10.931,39.949-19.715,51.051c-7.383,9.331-12.717,16.072-12.717,30.927   c0,14.855,5.332,21.593,12.711,30.919l-25.435,20.124c-8.781-11.097-19.708-24.909-19.708-51.042 c0-26.135,10.931-39.949,19.715-51.051c7.383-9.331,12.717-16.072,12.717-30.927c0-14.855-5.335-21.595-12.717-30.926 c-8.784-11.101-19.715-24.916-19.715-51.049s10.931-39.95,19.715-51.051c7.383-9.331,12.717-16.072,12.717-30.928 c0-14.855-5.335-21.596-12.718-30.927L428.127,0z"
      />
    </svg>
  );
}
