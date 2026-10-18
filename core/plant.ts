/**
 * 중계펌프장 학습용 운전 상태.
 *
 * 실제 PLC 로직·실제 수위 설정값을 모사하지 않는다. 화면이나 Three.js를 모르며,
 * 공개된 설비 구성과 학습용 사건을 일관되게 전이시키는 순수 모델이다.
 */

export type RelayPumpId = 'PM-103-A' | 'PM-103-B' | 'PM-103-C'
export type PumpState = 'stopped' | 'running' | 'faulted' | 'isolated'
export type RelayPumpAlarm = 'none' | 'high-water' | 'pump-fault' | 'power-loss'
export type HoistState = 'blocked' | 'ready' | 'lifting'

export interface TrainingThresholds {
  highWaterM: number
  /** 실제 현장의 PLC setpoint가 아닌 콘텐츠용 수치임을 강제한다. */
  trainingOnly: true
}

export interface RelayPumpStationState {
  waterLevelM: number
  pumps: Record<RelayPumpId, PumpState>
  controlMode: 'remote' | 'local'
  lvPanelEnergized: boolean
  mccEnergized: boolean
  upsHealthy: boolean
  trainingThresholds: TrainingThresholds
  workPermitApproved: boolean
  wetWellOccupied: boolean
  hoist: HoistState
  hoistedPump: RelayPumpId | null
  alarm: RelayPumpAlarm
}

export type RelayPumpStationEvent =
  | { type: 'water-level'; metres: number }
  | { type: 'pump-fault'; pump: RelayPumpId }
  | { type: 'isolate-pump'; pump: RelayPumpId }
  | { type: 'mcc-power'; energized: boolean }
  | { type: 'work-permit'; approved: boolean }
  | { type: 'wet-well-occupancy'; occupied: boolean }
  | { type: 'request-hoist'; pump: RelayPumpId }

export interface RelayPumpStationOptions {
  trainingThresholds?: { highWaterM: number }
}

const PUMPS: readonly RelayPumpId[] = ['PM-103-A', 'PM-103-B', 'PM-103-C']

const alarmOf = (state: Omit<RelayPumpStationState, 'alarm'>): RelayPumpAlarm => {
  if (!state.mccEnergized) return 'power-loss'
  if (PUMPS.some((pump) => state.pumps[pump] === 'faulted')) return 'pump-fault'
  if (state.waterLevelM >= state.trainingThresholds.highWaterM) return 'high-water'
  return 'none'
}

const withAlarm = (state: Omit<RelayPumpStationState, 'alarm'>): RelayPumpStationState => ({
  ...state,
  alarm: alarmOf(state),
})

export function createRelayPumpStationState(
  options: RelayPumpStationOptions = {},
): RelayPumpStationState {
  const state: Omit<RelayPumpStationState, 'alarm'> = {
    waterLevelM: 4,
    pumps: { 'PM-103-A': 'running', 'PM-103-B': 'running', 'PM-103-C': 'stopped' },
    controlMode: 'remote',
    lvPanelEnergized: true,
    mccEnergized: true,
    upsHealthy: true,
    trainingThresholds: { highWaterM: options.trainingThresholds?.highWaterM ?? 8, trainingOnly: true },
    workPermitApproved: false,
    /* 모름은 안전하지 않다. 명시적으로 "없음"을 확인하기 전까지 인양을 막는다. */
    wetWellOccupied: true,
    hoist: 'blocked',
    hoistedPump: null,
  }
  return withAlarm(state)
}

export function applyRelayPumpStationEvent(
  state: RelayPumpStationState,
  event: RelayPumpStationEvent,
): RelayPumpStationState {
  const next: Omit<RelayPumpStationState, 'alarm'> = {
    ...state,
    pumps: { ...state.pumps },
  }

  switch (event.type) {
    case 'water-level':
      next.waterLevelM = event.metres
      break
    case 'pump-fault':
      next.pumps[event.pump] = 'faulted'
      break
    case 'isolate-pump':
      next.pumps[event.pump] = 'isolated'
      break
    case 'mcc-power':
      next.mccEnergized = event.energized
      if (!event.energized) {
        for (const pump of PUMPS) {
          if (next.pumps[pump] !== 'isolated' && next.pumps[pump] !== 'faulted') next.pumps[pump] = 'stopped'
        }
      }
      break
    case 'work-permit':
      next.workPermitApproved = event.approved
      break
    case 'wet-well-occupancy':
      next.wetWellOccupied = event.occupied
      break
    case 'request-hoist': {
      const allowed = next.pumps[event.pump] === 'isolated'
        && next.workPermitApproved
        && !next.wetWellOccupied
      next.hoist = allowed ? 'lifting' : 'blocked'
      next.hoistedPump = allowed ? event.pump : null
      break
    }
  }

  if (next.hoist === 'lifting' && (!next.workPermitApproved || next.wetWellOccupied
    || !next.hoistedPump || next.pumps[next.hoistedPump] !== 'isolated')) {
    next.hoist = 'blocked'
    next.hoistedPump = null
  }
  return withAlarm(next)
}
