import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5c89a',
          borderRadius: 40,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Steam lines */}
          <path d="M7 6 Q6.5 4.5 7 3 Q7.5 1.5 7 0" stroke="#5a3825" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M11 6 Q10.5 4.5 11 3 Q11.5 1.5 11 0" stroke="#5a3825" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M15 6 Q14.5 4.5 15 3 Q15.5 1.5 15 0" stroke="#5a3825" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Bowl */}
          <path
            d="M2 8 Q2 16 11 16 Q20 16 20 8 Z"
            fill="#5a3825"
          />
          {/* Bowl rim */}
          <rect x="1" y="7" width="20" height="2" rx="1" fill="#3d2418" />
          {/* Base */}
          <rect x="7" y="16" width="8" height="1.5" rx="0.75" fill="#3d2418" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
