import { api } from '@/api/axios';

// API 응답 타입 정의
interface DashboardStatsApiResponse {
  status: string;
  stats: {
    total_bb_today: number;
    camera_stats: CameraStatsItem[];
    species_stats: SpeciesStatsApiItem[];
  };
}

interface CameraStatsItem {
  camera_id: number;
  bb_count: number;
}

interface SpeciesStatsApiItem {
  name: string;
  count: number;
}

interface BirdAnalysisApiResponse {
  bb_data: BoundingBoxData[];
}

interface BoundingBoxData {
  bb_left: number;
  bb_right: number;
  bb_top: number;
  bb_bottom: number;
}

// 일일 카메라별 누적 현황 데이터 타입
export interface DailyCameraStats {
  total: number;
  camera1: number;
  camera2: number;
  camera3: number;
}

// 종별 통계 데이터 타입
export interface SpeciesStatsItem {
  name: string;
  count: number;
  color: string;
}

// 방위별 출현현황 데이터 타입
export interface DirectionStatsItem {
  direction: string;
  value: number;
}

// 실제 bbox 데이터 타입
export interface BboxItem {
  bb_left: number;
  bb_right: number;
  bb_top: number;
  bb_bottom: number;
  bbox_id?: string;
  species?: string;
  camera_id?: number;
}

// 방위별 bbox 데이터 타입
export interface DirectionBboxData {
  [direction: string]: BboxItem[];
}

/**
 * 일일 카메라별 누적 현황 데이터를 가져오는 API 함수
 */
export const fetchDailyCameraStats = async (): Promise<DailyCameraStats> => {
  try {
    const response = (await api.get(
      '/api/dashboard/stats/'
    )) as DashboardStatsApiResponse;

    if (response && response.status === 'success') {
      const stats = response.stats;

      const camera1 = stats.camera_stats.find((c) => c.camera_id === 1) || {
        bb_count: 0,
      };
      const camera2 = stats.camera_stats.find((c) => c.camera_id === 2) || {
        bb_count: 0,
      };
      const camera3 = stats.camera_stats.find((c) => c.camera_id === 3) || {
        bb_count: 0,
      };

      const dailyCameraStats: DailyCameraStats = {
        total: stats.total_bb_today,
        camera1: camera1.bb_count,
        camera2: camera2.bb_count,
        camera3: camera3.bb_count,
      };

      console.log(
        '일일 카메라별 누적 현황 데이터 가져오기 성공:',
        dailyCameraStats
      );
      return dailyCameraStats;
    }

    // API 응답이 없는 경우 기본값 반환
    return { total: 0, camera1: 0, camera2: 0, camera3: 0 };
  } catch (error) {
    console.error('일일 카메라별 누적 현황 데이터 가져오기 오류:', error);
    return { total: 0, camera1: 0, camera2: 0, camera3: 0 };
  }
};

/**
 * 종별 통계 데이터를 가져오는 API 함수
 */
export const fetchSpeciesStats = async (): Promise<SpeciesStatsItem[]> => {
  try {
    const response = (await api.get(
      '/api/dashboard/stats/'
    )) as DashboardStatsApiResponse;

    if (response && response.status === 'success') {
      const stats = response.stats;

      const colors = [
        '#4caf50',
        '#ff9800',
        '#2196f3',
        '#f44336',
        '#9c27b0',
        '#607d8b',
      ];
      const speciesStats: SpeciesStatsItem[] = stats.species_stats
        .slice(0, 6)
        .map((species, index) => ({
          name: species.name,
          count: species.count,
          color: colors[index % colors.length],
        }));

      console.log('종별 통계 데이터 가져오기 성공:', speciesStats);
      return speciesStats;
    }

    // API 응답이 없는 경우 기본값 반환
    return [];
  } catch (error) {
    console.error('종별 통계 데이터 가져오기 오류:', error);
    return [];
  }
};

/**
 * 방위별 실제 bbox 데이터를 가져오고 좌표 계산하는 API 함수
 */
export const fetchDirectionBboxData = async (): Promise<DirectionBboxData> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = (await api.get('/api/bird-analysis/data/', {
      params: {
        date_from: today,
        date_to: today,
        get_all: true,
      },
    })) as BirdAnalysisApiResponse;

    if (response && response.bb_data && response.bb_data.length > 0) {
      const bbData = response.bb_data;

      // 방위별로 bbox 데이터 분류
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const directionBboxData: DirectionBboxData = {};

      // 초기화
      directions.forEach((dir) => {
        directionBboxData[dir] = [];
      });

      // 각 bbox를 방위별로 분류
      bbData.forEach((bb, index) => {
        // 바운딩 박스 중심 위치에서 방위 계산
        const centerX = (bb.bb_left + bb.bb_right) / 2;
        const centerY = (bb.bb_top + bb.bb_bottom) / 2;

        // 중심에서의 상대적 위치를 기준으로 방위 할당
        let direction;
        if (centerY < 0.4) {
          if (centerX < 0.4) direction = 'NW';
          else if (centerX > 0.6) direction = 'NE';
          else direction = 'N';
        } else if (centerY > 0.6) {
          if (centerX < 0.4) direction = 'SW';
          else if (centerX > 0.6) direction = 'SE';
          else direction = 'S';
        } else {
          if (centerX < 0.4) direction = 'W';
          else if (centerX > 0.6) direction = 'E';
          else return; // 중앙은 방위 없음
        }

        // 카메라 ID 추정 (각도 기반)
        const angle =
          Math.atan2(centerY - 0.5, centerX - 0.5) * (180 / Math.PI);
        const normalizedAngle = (angle + 360) % 360;

        let camera_id = 1;
        if (normalizedAngle >= 0 && normalizedAngle < 120) camera_id = 2;
        else if (normalizedAngle >= 120 && normalizedAngle < 240) camera_id = 3;
        else camera_id = 1;

        // bbox 데이터에 추가 정보 포함
        const enrichedBbox: BboxItem = {
          ...bb,
          bbox_id: `bbox_${index}_${Date.now()}`,
          species: ['까마귀', '매', '갈매기', '독수리'][
            Math.floor(Math.random() * 4)
          ], // TODO: 실제 종 정보로 교체
          camera_id,
        };

        directionBboxData[direction].push(enrichedBbox);
      });

      console.log('방위별 bbox 데이터 가져오기 성공:', directionBboxData);
      return directionBboxData;
    }

    // API 응답이 없거나 데이터가 없는 경우 빈 객체 반환
    const emptyData: DirectionBboxData = {};
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach((dir) => {
      emptyData[dir] = [];
    });
    return emptyData;
  } catch (error) {
    console.error('방위별 bbox 데이터 가져오기 오류:', error);

    // 오류 시에도 UI를 유지하기 위해 빈 데이터 반환
    console.log('❌ API 호출 오류로 인해 빈 데이터를 반환합니다.');
    const emptyData: DirectionBboxData = {};
    ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].forEach((dir) => {
      emptyData[dir] = [];
    });
    return emptyData;
  }
};

/**
 * 전체 데이터를 한 번에 가져오는 함수
 */
export const fetchAllRightPanelData = async () => {
  try {
    const [dailyCameraStats, speciesStats, directionStats] = await Promise.all([
      fetchDailyCameraStats(),
      fetchSpeciesStats(),
      fetchDirectionBboxData(),
    ]);

    return {
      dailyCameraStats,
      speciesStats,
      directionStats,
    };
  } catch (error) {
    console.error('오른쪽 패널 전체 데이터 가져오기 오류:', error);
    return {
      dailyCameraStats: { total: 0, camera1: 0, camera2: 0, camera3: 0 },
      speciesStats: [],
      directionStats: [
        { direction: 'N', value: 0 },
        { direction: 'NE', value: 0 },
        { direction: 'E', value: 0 },
        { direction: 'SE', value: 0 },
        { direction: 'S', value: 0 },
        { direction: 'SW', value: 0 },
        { direction: 'W', value: 0 },
        { direction: 'NW', value: 0 },
      ],
    };
  }
};
