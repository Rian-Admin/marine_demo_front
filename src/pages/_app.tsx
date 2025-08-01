import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { AppProps } from 'next/app';

import '@/styles/globals.css';

import Layout from '@/layout/mainLayout';

export default function App({ Component, pageProps }: AppProps) {
  const [language, setLanguage] = useState('ko');

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log('로그아웃 클릭됨');
    // 예: 토큰 제거, 로그인 페이지로 리다이렉트 등
  };

  return (
    <>
      <Layout
        language={language}
        changeLanguage={changeLanguage}
        handleLogout={handleLogout}
      >
        <Component {...pageProps} />
      </Layout>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
}
