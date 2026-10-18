import { createRelayPumpStationState, applyRelayPumpStationEvent } from '../runtime/plant.js';
import { validateReading, readingText, assessReadings } from './inspection.mjs';
import { createDiagnosis, restoreDiagnosis } from './diagnosis.mjs';
import {restoreRecovery} from './recovery.mjs';

export const STATIONS = {
  hmi: { label: '운전감시 HMI', position: { x: 2.9, z: -3.08, yaw: 0, pitch: -.59 } },
  mcc: { label: 'MCC-P 제어반', position: { x: -1.98, z: -3.1, yaw: 0, pitch: 0 } },
  ups: { label: 'UPS 예비전원', position: { x: .28, z: -3.1, yaw: 0, pitch: 0 } },
  field: { label: '현장 배관·안전구역', position: { x: 2.85, z: -.35, yaw: Math.PI / 2, pitch: -.446 } },
};
export const CASES = {
  fault: { title: '01 · 오전 순회점검', brief: '운전 담당자가 경보 발생을 전달했습니다. 전원과 펌프 상태를 대조하고, 확인한 사실과 다음 조치를 보고하세요.', event: { type: 'pump-fault', pump: 'PM-103-B' }, diagnosis: 'pump', risk: 'capacity' },
  power: { title: '02 · 교대 후 점검', brief: '교대 직후 운전 상태가 달라졌습니다. 화면이 켜져 있다는 사실만으로 설비 전체가 정상인지 판단하지 마세요.', event: { type: 'mcc-power', energized: false }, diagnosis: 'power', risk: 'stopped' },
  high: { title: '03 · 우천 중 점검', brief: '강우 중 경보가 발생했습니다. 수위와 펌프·전원 상태를 함께 확인해 우선 보고할 사항을 판단하세요.', event: { type: 'water-level', metres: 8.1 }, diagnosis: 'water', risk: 'overflow' },
};
const status = { running: '운전', stopped: '정지', faulted: '고장 표시', isolated: '격리' };
export function plantFor(id) {
  if (!Object.hasOwn(CASES, id)) throw new Error('알 수 없는 훈련 회차입니다.');
  return applyRelayPumpStationEvent(createRelayPumpStationState(), CASES[id].event);
}
export function createRound(caseId = 'fault',variant='load') {
  plantFor(caseId);
  return { version: 5, caseId, phase: 'briefing', observations: {}, diagnosis:caseId==='fault'?createDiagnosis(variant):null, ...(caseId==='fault'&&variant==='supply'?{recoveryRequired:true}:{}),report: null, result: null };
}
export function startRound(round) {
  return round.phase === 'briefing' ? { ...round, phase: 'inspection' } : round;
}
export function evidenceFor(caseId, station) {
  const p = plantFor(caseId);
  switch (station) {
    case 'hmi': return `수위 ${p.waterLevelM.toFixed(1)} m / 학습용 경보 기준 ${p.trainingThresholds.highWaterM.toFixed(1)} m. A ${status[p.pumps['PM-103-A']]} · B ${status[p.pumps['PM-103-B']]} · C ${status[p.pumps['PM-103-C']]}.`;
    case 'mcc': return `MCC 전원 ${p.mccEnergized ? '표시 켜짐' : '표시 꺼짐'}. A ${status[p.pumps['PM-103-A']]} · B ${status[p.pumps['PM-103-B']]} · C ${status[p.pumps['PM-103-C']]}. 외함은 닫혀 있으며 내부 원인은 확인하지 않았습니다.`;
    case 'ups': return `UPS 상태 표시 ${p.upsHealthy ? '정상' : '이상'}. 제어 화면이 켜져 있습니다. 이것만으로 MCC 동력 전원 상태를 확정할 수는 없습니다.`;
    case 'field': return '안전 통로에서 보이는 배관·밸브 주변에 뚜렷한 누수는 없습니다. 펌프 본체는 습정 안에 있어 직접 확인하지 않았습니다. 내부 고장 원인과 습정 무인 여부는 미확인입니다.';
    default: throw new Error('관찰 대상이 아닙니다.');
  }
}
export function observe(round, station, record, timestamp = new Date().toISOString()) {
  if (round.phase !== 'inspection') throw new Error('점검 진행 중에만 기록할 수 있습니다.');
  if(round.recovery)throw new Error('복구 이후에는 초기 관찰을 바꾸지 않습니다. 시험 기록을 별도로 남기세요.');
  const checked=validateReading(station,record);
  if(typeof record.photo==='string'&&record.photo.startsWith('data:image/jpeg;base64,')&&record.photo.length<800000)checked.photo=record.photo;
  const text = readingText(station,checked);
  return { ...round, observations: { ...round.observations, [station]: { ...checked,text, timestamp } } };
}
export function submitReport(round, report) {
  if (round.phase !== 'inspection') throw new Error('제출 가능한 점검이 없습니다.');
  const missing = Object.keys(STATIONS).filter(id => !round.observations[id]);
  if (missing.length) throw new Error(`아직 기록하지 않은 대상: ${missing.map(id => STATIONS[id].label).join(', ')}`);
  if (!report || !['pump','power','water','normal'].includes(report.diagnosis)
    || !['capacity','stopped','overflow','none'].includes(report.risk)
    || !['report','restart','enter'].includes(report.action)
    || !['unconfirmed','confirmed'].includes(report.certainty)
    || typeof report.note !== 'string' || report.note.trim().length < 20 || report.note.length > 2000) {
    throw new Error('판단 항목을 모두 선택하고 인계 메모를 20~2,000자로 작성하세요.');
  }
  const scenario = CASES[round.caseId];
  if(round.caseId==='fault'&&round.diagnosis?.status!=='handedoff')throw new Error('추가 확인 수첩에서 근거를 대조해 점검을 요청하고 후속 회신을 받은 뒤 최종 보고하세요.');
  if((round.recoveryRequired||round.recovery)&&round.recovery?.stage!=='verified')throw new Error('복구 검토와 시험운전 기록을 확인한 뒤 최종 인계하세요.');
  const mismatches=assessReadings(plantFor(round.caseId),round.observations);
  const checks = [
    { label: '설비를 읽은 근거', points: 25, ok: mismatches.length===0, feedback: mismatches.length?mismatches.join(' · '):'직접 기록한 수위·표시·외관이 현장 상태와 일치합니다. 자유서술 판단 이유는 보고서에 보존됩니다.' },
    { label: '이상 상태 판단', points: 25, ok: report.diagnosis === scenario.diagnosis, feedback: ({ fault: 'B 펌프 고장 표시와 MCC 전원 상태를 함께 봅니다.', power: 'UPS 정상과 MCC 동력 전원 상실은 동시에 발생할 수 있습니다.', high: '펌프가 운전 중이어도 고수위 경보를 별도로 판단합니다.' })[round.caseId] },
    { label: '위험 우선순위', points: 20, ok: report.risk === scenario.risk, feedback: ({ fault: 'B 펌프 고장으로 배수 능력 저하 가능성이 있습니다.', power: '동력 전원 상실로 모든 펌프가 정지했습니다.', high: '학습용 경보 기준을 넘은 수위는 넘침 위험으로 우선 보고합니다.' })[round.caseId] },
    { label: '조치 선택', points: 20, ok: report.action === 'report', feedback: '이번 업무는 관찰·보고입니다. 상태를 담당자에게 알리고 승인된 후속 점검을 요청합니다. 임의 재기동·습정 진입은 수행하지 않습니다.' },
    { label: '사실과 추정 구분', points: 10, ok: report.certainty === 'unconfirmed', feedback: '외부 표시만으로 내부 원인이나 습정 무인 여부를 확인했다고 보고할 수 없습니다.' },
  ];
  const score = checks.filter(c => c.ok).reduce((sum, c) => sum + c.points, 0);
  const result = { score, passed: checks.every(c => c.ok), checks, completedAt: new Date().toISOString() };
  return { ...round, phase: 'complete', report: { ...report, note: report.note.trim() }, result };
}
// Restore by replaying known actions; do not trust cached scores or text.
export function restoreRound(raw) {
  try {
    if (!raw || raw.version !== 5 || !['briefing','inspection','complete'].includes(raw.phase)) return null;
    let round = createRound(raw.caseId,raw.diagnosis?.variant);
    if(raw.recoveryRequired===true)round.recoveryRequired=true;else delete round.recoveryRequired;
    if (raw.phase === 'briefing') return round;
    round = startRound(round);
    if(round.caseId==='fault')round.diagnosis=restoreDiagnosis(raw.diagnosis);
    for (const id of Object.keys(STATIONS)) {
      const observation = raw.observations?.[id];
      if (observation && typeof observation.timestamp === 'string' && Number.isFinite(Date.parse(observation.timestamp))) round = observe(round, id, observation,observation.timestamp);
    }
    if(raw.recovery){if(round.diagnosis?.status!=='handedoff')throw new Error('전문 점검 회신 없는 복구 이력');round.recovery=restoreRecovery(raw.recovery);}
    if (raw.phase === 'complete') {
      round = submitReport(round, raw.report);
      if (typeof raw.result?.completedAt === 'string' && Number.isFinite(Date.parse(raw.result.completedAt))) round.result.completedAt = raw.result.completedAt;
    }
    return round;
  } catch { return null; }
}
