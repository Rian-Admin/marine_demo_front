import React from 'react';

export default function Alerts() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.929 2.929l1.414 1.414A7.975 7.975 0 004 12c0 4.418 3.582 8 8 8s8-3.582 8-8-3.582-8-8-8a7.975 7.975 0 00-7.657 2.343z"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">알림</h1>
        <p className="text-gray-600">알림이 구현될 예정입니다</p>
      </div>
    </div>
  );
}
