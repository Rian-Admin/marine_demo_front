import React from 'react';

import { translate } from '@/utils/i18n';

import useAppStore from '@/store/useAppStore';

const Settings: React.FC = () => {
  // 전역 상태 가져오기
  const {
    radarEnabled,
    setRadarEnabled,
    weatherEnabled,
    setWeatherEnabled,
    alertSoundEnabled,
    setAlertSoundEnabled,
    language,
    setLanguage,
    isInitialized,
  } = useAppStore();

  // 언어 변경 핸들러
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
  };

  // 토글 스위치 컴포넌트
  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }> = ({ checked, onChange, label, description }) => (
    <div className="mb-6">
      <label className="flex cursor-pointer items-center">
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`block h-8 w-14 rounded-full transition-colors duration-200 ${
              checked ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          ></div>
          <div
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${
              checked ? 'translate-x-6 transform' : ''
            }`}
          ></div>
        </div>
        <span className="ml-3 font-medium text-white">{label}</span>
      </label>
      {description && (
        <p className="mt-1 ml-17 text-sm text-gray-400">{description}</p>
      )}
    </div>
  );

  // 알림 컴포넌트
  const Alert: React.FC<{
    type: 'info' | 'warning' | 'error';
    children: React.ReactNode;
  }> = ({ type, children }) => {
    const bgColor =
      type === 'info'
        ? 'bg-blue-900/50'
        : type === 'warning'
          ? 'bg-yellow-900/50'
          : 'bg-red-900/50';
    const borderColor =
      type === 'info'
        ? 'border-blue-500'
        : type === 'warning'
          ? 'border-yellow-500'
          : 'border-red-500';
    const textColor =
      type === 'info'
        ? 'text-blue-200'
        : type === 'warning'
          ? 'text-yellow-200'
          : 'text-red-200';

    return (
      <div
        className={`${bgColor} ${borderColor} ${textColor} mt-2 mb-2 rounded-r border-l-4 p-4`}
      >
        {children}
      </div>
    );
  };

  // Zustand가 persist된 상태를 불러올 때까지 잠깐 로딩 표시
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-8">
        <div className="text-xl text-white">
          {translate('설정을 불러오는 중...', 'Loading settings...', 'ko')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="mb-8 text-4xl font-bold text-white">
        {translate('설정', 'Settings', language)}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* 일반 설정 카드 */}
        <div className="rounded-lg border border-slate-600 bg-slate-800">
          <div className="border-b border-slate-600 p-4">
            <h2 className="text-xl font-semibold text-white">
              {translate('일반 설정', 'General Settings', language)}
            </h2>
          </div>
          <div className="p-6">
            {/* 언어 설정 */}
            <div className="mb-6">
              <label className="mb-2 block font-medium text-white">
                {translate('언어', 'Language', language)}
              </label>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-white transition-colors hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
              <p className="mt-1 text-sm text-gray-400">
                {translate(
                  '인터페이스 언어를 선택하세요',
                  'Select the interface language',
                  language
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 시스템 설정 카드 */}
        <div className="rounded-lg border border-slate-600 bg-slate-800">
          <div className="border-b border-slate-600 p-4">
            <h2 className="text-xl font-semibold text-white">
              {translate('시스템 설정', 'System Settings', language)}
            </h2>
          </div>
          <div className="p-6">
            {/* 레이더 활성화 토글 */}
            <ToggleSwitch
              checked={radarEnabled}
              onChange={setRadarEnabled}
              label={translate(
                '레이더 기능 사용',
                'Enable Radar Features',
                language
              )}
              description={translate(
                '레이더 관련 기능을 모두 활성화/비활성화합니다',
                'Enable or disable all radar-related features',
                language
              )}
            />

            {!radarEnabled && (
              <Alert type="info">
                {translate(
                  '레이더 기능이 비활성화되었습니다. 레이더 관련 탭과 기능이 표시되지 않습니다.',
                  'Radar features are disabled. Radar-related tabs and functions will not be displayed.',
                  language
                )}
              </Alert>
            )}

            {/* 기상정보 활성화 토글 */}
            <ToggleSwitch
              checked={weatherEnabled}
              onChange={setWeatherEnabled}
              label={translate(
                '기상정보 기능 사용',
                'Enable Weather Features',
                language
              )}
              description={translate(
                '기상정보 관련 기능을 모두 활성화/비활성화합니다',
                'Enable or disable all weather-related features',
                language
              )}
            />

            {!weatherEnabled && (
              <Alert type="info">
                {translate(
                  '기상정보 기능이 비활성화되었습니다. 기상정보 관련 탭과 기능이 표시되지 않습니다.',
                  'Weather features are disabled. Weather-related tabs and functions will not be displayed.',
                  language
                )}
              </Alert>
            )}

            {/* 구분선 */}
            <div className="my-6 border-t border-slate-600"></div>

            {/* 알림 소리 토글 */}
            <ToggleSwitch
              checked={alertSoundEnabled}
              onChange={setAlertSoundEnabled}
              label={translate(
                '알림 소리 사용',
                'Enable Alert Sounds',
                language
              )}
            />
          </div>
        </div>

        {/* 추가 설정 카드 */}
        <div className="rounded-lg border border-slate-600 bg-slate-800">
          <div className="border-b border-slate-600 p-4">
            <h2 className="text-xl font-semibold text-white">
              {translate('기타 설정', 'Other Settings', language)}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-300">
              {translate(
                '추가 설정 옵션이 여기에 표시됩니다.',
                'Additional setting options will be displayed here.',
                language
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
