/**
 * 조류별 방위 출현현황을 계산하고 그래프로 나타내는 컴포넌트
 * dashboard 오른쪽 패널 하단 방위별 출현현황 그래프
 * fetchDirectionBboxData 함수를 통해 방위별 출현현황 데이터를 받아옴
 * - bbox 데이터를 불러오고, 좌표를 계산해서 반환
 */
import * as d3 from 'd3';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DirectionBboxData,
  fetchDirectionBboxData,
} from '@/api/dashboard/rightSidePannel';
import { getRandomDummyDataset } from '@/context/bbox_dummy';

interface DirectionDistributionProps {
  directionBboxData: DirectionBboxData;
  directionStatsLoading: boolean;
  onDataUpdate: (data: DirectionBboxData) => void;
  onLoadingUpdate: (loading: boolean) => void;
}

interface BboxData {
  id: string;
  x: number;
  y: number;
  cameraId: number;
  color: string;
  species: string;
  bbox_width: number;
  bbox_height: number;
  detection_time: string;
  direction?: string;
}

const DirectionDistribution: React.FC<DirectionDistributionProps> = ({
  directionBboxData,
  directionStatsLoading,
  onDataUpdate,
  onLoadingUpdate,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [initialized, setInitialized] = useState(false);

  // 데이터 새로고침 함수
  const onRefresh = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        onLoadingUpdate(true);
      }
      try {
        // 임시로 더미 데이터 사용 (실제 API 대신)
        // const data = await fetchDirectionBboxData();
        const data = getRandomDummyDataset();

        onDataUpdate(data);
      } catch (error) {
        console.error('방위별 출현현황 데이터 새로고침 오류:', error);
      } finally {
        if (showLoading) {
          onLoadingUpdate(false);
        }
      }
    },
    [onDataUpdate, onLoadingUpdate]
  );

  // 주기적 업데이트
  useEffect(() => {
    // 1초마다 자동 새로고침 (데이터 유무 상관없이 항상)
    const interval = setInterval(() => {
      onRefresh(false); // 자동 업데이트시에는 로딩 표시 안함
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [onRefresh]);

  // 카메라별 색상 및 각도 범위 설정 (상수)
  const cameraConfig = useMemo(
    () => ({
      1: { color: '#3E6D9C', minAngle: 240, maxAngle: 360, name: '북서쪽' }, // 북서쪽
      2: { color: '#5E8C61', minAngle: 0, maxAngle: 120, name: '북동쪽' }, // 북동쪽
      3: { color: '#AF7AB3', minAngle: 120, maxAngle: 240, name: '남쪽' }, // 남쪽
    }),
    []
  );

  // 실제 bbox 데이터를 플롯 데이터로 변환
  const convertBboxDataToPlotData = useCallback(
    (bboxData: DirectionBboxData): BboxData[] => {
      const plotData: BboxData[] = [];

      // 방위별로 실제 bbox 데이터 처리
      Object.entries(bboxData).forEach(([direction, bboxes]) => {
        bboxes.forEach((bbox, index) => {
          const config =
            cameraConfig[bbox.camera_id as keyof typeof cameraConfig] ||
            cameraConfig[1];

          plotData.push({
            id: bbox.bbox_id || `${direction}_${index}_${Date.now()}`,
            x: 0, // 나중에 계산됨
            y: 0, // 나중에 계산됨
            cameraId: bbox.camera_id || 1,
            color: config.color,
            species: bbox.species || '미확인',
            bbox_width: (bbox.bb_right - bbox.bb_left) * 100, // 실제 bbox 너비 (%)
            bbox_height: (bbox.bb_bottom - bbox.bb_top) * 100, // 실제 bbox 높이 (%)
            detection_time: new Date().toISOString(),
            direction, // 방위 정보 추가
          });
        });
      });

      return plotData;
    },
    [cameraConfig]
  );

  // 초기 배경 그리기 (한 번만 실행)
  useEffect(() => {
    if (initialized || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 30, bottom: 10, left: 10 };
    const width = 280 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.45;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 배경 원 그리기
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .style('fill', 'none')
      .style('stroke', 'rgba(122, 139, 160, 0.3)')
      .style('stroke-width', 1);

    // 섹터 경계선 그리기 (3개의 경계선: 0도, 120도, 240도)
    const boundaries = [0, 120, 240];
    boundaries.forEach((angle) => {
      const angleRad = ((angle - 90) * Math.PI) / 180;
      g.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX + radius * Math.cos(angleRad))
        .attr('y2', centerY + radius * Math.sin(angleRad))
        .style('stroke', 'rgba(122, 139, 160, 0.3)')
        .style('stroke-width', 1);
    });

    // 방위 표시
    const directions = [
      { angle: 0, label: 'N' },
      { angle: 45, label: 'NE' },
      { angle: 90, label: 'E' },
      { angle: 135, label: 'SE' },
      { angle: 180, label: 'S' },
      { angle: 225, label: 'SW' },
      { angle: 270, label: 'W' },
      { angle: 315, label: 'NW' },
    ];

    directions.forEach((dir) => {
      const angleRad = ((dir.angle - 90) * Math.PI) / 180;
      const labelRadius = radius * 1.15;
      const x = centerX + labelRadius * Math.cos(angleRad);
      const y = centerY + labelRadius * Math.sin(angleRad);

      g.append('text')
        .attr('x', x)
        .attr('y', y)
        .style('font-size', '10px')
        .style('fill', '#7a8ba0')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .text(dir.label);
    });

    // 거리 원 추가 (50m, 100m, 150m, 200m)
    const distanceCircles = [
      { distance: 50, r: 0.28, opacity: 0.15 },
      { distance: 100, r: 0.43, opacity: 0.12 },
      { distance: 150, r: 0.58, opacity: 0.08 },
      { distance: 200, r: 0.75, opacity: 0.05 },
    ];

    distanceCircles.forEach((circle) => {
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius * circle.r)
        .style('fill', 'none')
        .style('stroke', 'rgba(122, 139, 160, ' + circle.opacity + ')')
        .style('stroke-width', 0.5);
    });

    // 플롯을 위한 그룹 생성
    g.append('g').attr('class', 'plot-group');

    // 빈 상태 텍스트를 위한 그룹 생성
    g.append('g').attr('class', 'empty-state-group');

    setInitialized(true);
  }, [initialized]);

  // 플롯 업데이트
  useEffect(() => {
    if (!initialized || !svgRef.current) return;

    const margin = { top: 10, right: 30, bottom: 10, left: 10 };
    const width = 280 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.45;

    // SVG 선택 및 플롯 그룹 선택
    const svg = d3.select(svgRef.current);
    const plotGroup = svg.select('.plot-group');
    const emptyStateGroup = svg.select('.empty-state-group');

    if (plotGroup.empty()) return;

    // 실제 bbox 데이터를 플롯 데이터로 변환
    const bboxPlotData = convertBboxDataToPlotData(directionBboxData);

    // 바운딩 박스 데이터를 극좌표로 변환
    const processedData = bboxPlotData
      .map((bb: BboxData) => {
        const config = cameraConfig[bb.cameraId as keyof typeof cameraConfig];
        if (!config) return null;

        // 카메라의 각도 범위 내에서 랜덤하게 배치
        const angleRange = config.maxAngle - config.minAngle;
        const angle = config.minAngle + Math.random() * angleRange;
        const angleRad = ((angle - 90) * Math.PI) / 180;

        // 반경은 바운딩 박스 크기에 따라 조정
        const bboxArea = bb.bbox_width * bb.bbox_height;

        // 거리 계산 (바운딩 박스 크기 기반)
        let distance;
        if (bboxArea >= 50) {
          distance = 0.2; // 매우 가까이
        } else if (bboxArea >= 25) {
          distance = 0.3;
        } else if (bboxArea >= 15) {
          distance = 0.4;
        } else if (bboxArea >= 10) {
          distance = 0.5;
        } else if (bboxArea >= 5) {
          distance = 0.6;
        } else {
          distance = 0.7; // 멀리
        }

        const r = radius * distance;

        return {
          ...bb,
          x: centerX + r * Math.cos(angleRad),
          y: centerY + r * Math.sin(angleRad),
        };
      })
      .filter((d) => d !== null) as BboxData[];

    // 빈 상태 메시지 처리
    if (processedData.length === 0) {
      // 데이터가 없을 때 메시지 표시
      emptyStateGroup.selectAll('*').remove();
      emptyStateGroup
        .append('text')
        .attr('x', centerX)
        .attr('y', centerY)
        .style('font-size', '12px')
        .style('fill', '#7a8ba0')
        .style('text-anchor', 'middle')
        .style('dominant-baseline', 'middle')
        .text('데이터 없음');
    } else {
      // 데이터가 있을 때 메시지 제거
      emptyStateGroup.selectAll('*').remove();
    }

    // 기존 점들 업데이트/제거/추가
    const circles = plotGroup
      .selectAll<SVGCircleElement, BboxData>('circle')
      .data(processedData, (d: BboxData) => d.id);

    // 제거
    circles.exit().transition().duration(300).style('opacity', 0).remove();

    // 추가
    const newCircles = circles
      .enter()
      .append('circle')
      .attr('cx', (d: BboxData) => d.x)
      .attr('cy', (d: BboxData) => d.y)
      .attr('r', 0)
      .style('fill', (d: BboxData) => d.color)
      .style('opacity', 0)
      .style('cursor', 'pointer');

    // 업데이트 (기존 + 신규)
    newCircles
      .merge(circles)
      .transition()
      .duration(300)
      .attr('cx', (d: BboxData) => d.x)
      .attr('cy', (d: BboxData) => d.y)
      .attr('r', 3)
      .style('fill', (d: BboxData) => d.color)
      .style('opacity', 0.8);

    // 이벤트 핸들러 추가
    plotGroup
      .selectAll<SVGCircleElement, BboxData>('circle')
      .on('mouseover', function (event: MouseEvent, d: BboxData) {
        // 기존 툴팁 제거
        d3.selectAll('.bbox-tooltip').remove();

        // 툴팁 표시
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'bbox-tooltip')
          .style('position', 'absolute')
          .style('padding', '10px')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('border-radius', '4px')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('font-size', '12px')
          .style('z-index', '1000')
          .style('max-width', '200px');

        tooltip.transition().duration(200).style('opacity', 0.9);

        const config = cameraConfig[d.cameraId as keyof typeof cameraConfig];

        // 거리 추정
        const area = d.bbox_width * d.bbox_height;
        let estimatedDistance;
        if (area >= 50) estimatedDistance = '10-30m';
        else if (area >= 25) estimatedDistance = '30-50m';
        else if (area >= 15) estimatedDistance = '50-80m';
        else if (area >= 10) estimatedDistance = '80-120m';
        else if (area >= 5) estimatedDistance = '120-180m';
        else estimatedDistance = '180m+';

        tooltip
          .html(
            `
          <strong>${d.species}</strong><br/>
          카메라: ${d.cameraId} (${config.name})<br/>
          크기: ${d.bbox_width.toFixed(1)}% × ${d.bbox_height.toFixed(1)}%<br/>
          면적: ${area.toFixed(0)}%²<br/>
          추정 거리: ${estimatedDistance}
        `
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');

        // 호버된 점 강조
        d3.select(this as SVGCircleElement)
          .transition()
          .duration(100)
          .attr('r', 5)
          .style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.selectAll('.bbox-tooltip').remove();

        // 원래 크기로 복원
        d3.select(this as SVGCircleElement)
          .transition()
          .duration(100)
          .attr('r', 3)
          .style('opacity', 0.8);
      });
  }, [directionBboxData, initialized, convertBboxDataToPlotData, cameraConfig]);

  return (
    <div
      className="relative h-1/3 rounded-lg border p-4"
      style={{
        backgroundColor: 'rgba(10, 25, 41, 0.95)',
        borderColor: 'rgba(30, 58, 90, 0.8)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      <h3 className="mb-3 font-semibold text-white">방위별 출현현황</h3>

      <div className="relative flex items-center justify-center">
        <svg
          ref={svgRef}
          width="280"
          height="220"
          style={{ width: '280px', height: '220px' }}
        />

        {/* 로딩 오버레이 */}
        {directionStatsLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/20">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
              <span className="text-xs text-gray-300">로딩 중...</span>
            </div>
          </div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <button
        onClick={() => onRefresh(true)}
        disabled={directionStatsLoading}
        className="absolute top-2 right-2 p-1 text-white/50 hover:text-white/80 disabled:opacity-30"
        title="방위별 출현현황 새로고침"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};

export default DirectionDistribution;
