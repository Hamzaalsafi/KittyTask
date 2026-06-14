export function GraphLeft() {
  return (
    <div className="graph__wrapper2">
      <svg width="80%" viewBox="0 0 315 107" version="1.1" style={{ overflow: "visible" }}>
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <path
            id="Path-1"
            className="path"
            fill="none"
            stroke="#ea2088"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M1.4,2.1c0,0,86,57,211.5,41.5s172.5-24.5,289,81"
          />
          <path
            className="dashed"
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M1.4,2.1c0,0,86,57,211.5,41.5s172.5-24.5,289,81"
          />
          <polyline id="arrow" points="0,-9 18,0 0,9 5,0" fill="#db5862">
            <animateMotion rotate="auto" begin="1s" dur="1.6s" repeatCount="1" fill="freeze">
              <mpath href="#Path-1" />
            </animateMotion>
          </polyline>
          <text
            className="pointer-events-none"
            fill="#E0E0E0"
            fontSize="33"
            fontFamily="Arial"
            transform="rotate(180, 227.5, 43.5) translate(0,-7)"
          >
            <textPath href="#Path-1" startOffset="64%" textAnchor="middle">
              Shared Boards
              <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
