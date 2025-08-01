import React from 'react';

import {
  getRiskColorClass,
  getRiskLevel,
  getRiskText,
} from '@/utils/riskUtils';

import { DetectionWithBboxInfo } from '@/api/dashboard/cameraView';

interface DetectionItemProps {
  detection: DetectionWithBboxInfo;
}

const DetectionItem: React.FC<DetectionItemProps> = ({ detection }) => {
  const bbCount = detection.bb_count || 0;
  const riskLevel = getRiskLevel(bbCount);

  // 첫 번째 종류와 추가 종류 수 계산
  const firstSpecies = detection.bbox_info?.[0]?.class_name || '미확인';
  const additionalCount = Math.max(0, (detection.bbox_info?.length || 0) - 1);

  return (
    <div className="flex items-center space-x-3">
      <div className="h-2 w-2 rounded-full bg-green-500" />

      <div className="flex flex-row">
        <p className="text-sm text-gray-700">카메라 {detection.camera_id}</p>
        <p className={`text-sm font-semibold ${getRiskColorClass(riskLevel)}`}>
          {getRiskText(riskLevel)}
        </p>
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-800">
          {firstSpecies}
          {additionalCount > 0 && (
            <span className="text-gray-500"> 외 {additionalCount}종</span>
          )}
        </p>
        <p className="text-xs text-gray-500">{detection.timestamp}</p>
      </div>
    </div>
  );
};

export default DetectionItem;
