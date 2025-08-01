// DirectionBboxData용 더미 데이터
// API 함수에서 가져온 directionBboxData가 비어있을 때 사용
import type { DirectionBboxData } from '@/api/dashboard/rightSidePannel';

// 랜덤 bbox 데이터 생성 함수
export const getRandomDummyDataset = (): DirectionBboxData => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const species = ['까마귀', '매', '갈매기', '독수리', '참새', '비둘기'];
  const cameras = [1, 2, 3];

  const result: DirectionBboxData = {};

  directions.forEach((direction) => {
    // 각 방위별로 0~6개의 랜덤한 bbox 생성
    const bboxCount = Math.floor(Math.random() * 7); // 0~6개
    result[direction] = [];

    for (let i = 0; i < bboxCount; i++) {
      // 방위별 좌표 범위 설정
      let baseX = 0.5,
        baseY = 0.5; // 중심점
      let rangeX = 0.4,
        rangeY = 0.4; // 변동 범위

      switch (direction) {
        case 'N': // 북쪽 (상단)
          baseY = 0.2;
          rangeX = 0.3;
          rangeY = 0.2;
          break;
        case 'NE': // 북동쪽 (우상단)
          baseX = 0.75;
          baseY = 0.2;
          rangeX = 0.2;
          rangeY = 0.2;
          break;
        case 'E': // 동쪽 (우측)
          baseX = 0.8;
          rangeX = 0.15;
          rangeY = 0.3;
          break;
        case 'SE': // 남동쪽 (우하단)
          baseX = 0.75;
          baseY = 0.8;
          rangeX = 0.2;
          rangeY = 0.15;
          break;
        case 'S': // 남쪽 (하단)
          baseY = 0.8;
          rangeX = 0.3;
          rangeY = 0.15;
          break;
        case 'SW': // 남서쪽 (좌하단)
          baseX = 0.25;
          baseY = 0.8;
          rangeX = 0.2;
          rangeY = 0.15;
          break;
        case 'W': // 서쪽 (좌측)
          baseX = 0.2;
          rangeX = 0.15;
          rangeY = 0.3;
          break;
        case 'NW': // 북서쪽 (좌상단)
          baseX = 0.25;
          baseY = 0.2;
          rangeX = 0.2;
          rangeY = 0.2;
          break;
      }

      // 랜덤 bbox 크기 (작은것부터 큰것까지)
      const sizeType = Math.random();
      let width, height;

      if (sizeType < 0.4) {
        // 작은 bbox (40%)
        width = 0.02 + Math.random() * 0.05; // 2~7%
        height = 0.02 + Math.random() * 0.05;
      } else if (sizeType < 0.7) {
        // 중간 bbox (30%)
        width = 0.05 + Math.random() * 0.08; // 5~13%
        height = 0.05 + Math.random() * 0.08;
      } else {
        // 큰 bbox (30%)
        width = 0.08 + Math.random() * 0.15; // 8~23%
        height = 0.08 + Math.random() * 0.15;
      }

      // 중심점 계산 (방위 범위 내에서 랜덤)
      const centerX = Math.max(
        width / 2,
        Math.min(1 - width / 2, baseX + (Math.random() - 0.5) * rangeX)
      );
      const centerY = Math.max(
        height / 2,
        Math.min(1 - height / 2, baseY + (Math.random() - 0.5) * rangeY)
      );

      // bbox 좌표 계산
      const bb_left = Math.max(0, centerX - width / 2);
      const bb_right = Math.min(1, centerX + width / 2);
      const bb_top = Math.max(0, centerY - height / 2);
      const bb_bottom = Math.min(1, centerY + height / 2);

      // 랜덤 bbox 생성
      const bbox = {
        bb_left,
        bb_right,
        bb_top,
        bb_bottom,
        bbox_id: `${direction}_${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        species: species[Math.floor(Math.random() * species.length)],
        camera_id: cameras[Math.floor(Math.random() * cameras.length)],
      };

      result[direction].push(bbox);
    }
  });

  return result;
};
