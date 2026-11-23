import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
          borderRadius: 8,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5.5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
