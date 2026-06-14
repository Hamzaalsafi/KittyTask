export function GraphAnimation() {
  return (
    <div className="graph__wrapper">
      <svg width="80%" viewBox="0 0 315 107" version="1.1" style={{ overflow: "visible" }}>
        <defs>
          <path
            id="textPath"
            d="M1.4,2.1c0,0,86,57,211.5,41.5s172.5-24.5,289,81"
            fill="none"
          />
        </defs>
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
            className="pointer-events-none arrowText"
            fill="#E0E0E0"
            fontSize="33"
            fontFamily="Arial"
            transform="translate(0,-10)"
          >
            <textPath href="#textPath" startOffset="24%" textAnchor="middle">
              My Board
            </textPath>
            <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
          </text>
        </g>
      </svg>
    </div>
  );
}
