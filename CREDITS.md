# 에셋 출처 · 라이선스

## 이 폴더에 실제로 들어 있는 것 (2026-09-22 정리)

이 파일의 뒷부분(「정밀 미리보기 OrbitControls」부터 끝까지)은 2026-09-18에 **원본 지피티 프로젝트에서 복사해 온 조사 기록**이다.
그 안의 `prototypes/…`, `tools/build-precision.py`, `tools/export-human.py`, `docs/third-party-three-r170-LICENSE.txt` 같은 경로는
**이 사이트에는 없고** 원본 작업 공간에만 있다. 기록으로 남겨 둔다.

이 폴더가 실제로 싣고 있는 외부 에셋은 아래가 전부다.

| 파일 | 무엇 | 라이선스 | 근거 |
|---|---|---|---|
| `vendor/three.module.js`, `vendor/jsm/loaders/GLTFLoader.js`, `vendor/jsm/utils/BufferGeometryUtils.js` | three.js r170 | MIT | `vendor/THREE-LICENSE.txt` |
| `vendor/human/human-full.glb` | 3D 현장의 사람 모델(`world/main.mjs`가 불러옴. MakeHuman/MPFB로 프로젝트 소유자가 제작) | CC0 (MakeHuman export 예외) | 아래 「전신 인체 — human-full.glb」 |
| `vendor/fonts/paperlogy-700.woff2`, `paperlogy-800.woff2` | 제목용 서체 Paperlogy(페이퍼로지) 7Bold·8ExtraBold. 한글 음절·라틴·문장부호만 남긴 서브셋 | SIL Open Font License 1.1 · Copyright (c) 2024 PT& · www.designptn.com | `vendor/fonts/PAPERLOGY-LICENSE.txt`, 확인일 2026-09-19. 폰트 안 라이선스 표기 보존 |

3D 현장의 콘크리트 질감은 `world/main.mjs`가 코드로 그린다(외부 텍스처 없음). MCC·UPS 모델도 `world/equipment.mjs`에서 직접 만든 것이다.

### 앱 셸 이미지 (`assets/`)

| 파일 | 출처 |
|---|---|
| `assets/brand/logo.png` | 사용자 제공(받을 때 파일명은 `꿈을 찾아! 드림 폰트`였으나 실제로는 로고 PNG) |
| `assets/brand/app.ico` | 위 로고의 "드림★" 부분을 잘라 만든 바로 가기 아이콘 |
| `assets/heroes/home-hero.jpg` | 사용자 제공 |
| `assets/jobs/`, `assets/heroes/<id>-hero.jpg`, `assets/tasks/`, `assets/callouts/` | 사용자가 **지피티(Codex 포함)의 이미지 생성**으로 만들어 제공. 프롬프트는 `assets/PROMPTS.md`, `assets/직업 이미지 프롬프트.md` |

- 생성 도구의 **이용 약관·상업 이용 조건은 이 앱에서 확인하지 않았다.** 앱을 인터넷에 공개하거나 배포하기 전에 확인한다.
- 줄이기 전 원본은 `assets/_original/`에 있다(앱은 읽지 않음).

### 외부 자료 링크 (앱 안에서 새 탭으로 연결)

| 곳 | 주소 | 비고 |
|---|---|---|
| 커리어넷 직업백과 | `https://www.career.go.kr/cloud/w/job/view?seq=<번호>` / 목록 | 번호 18개는 2026-09-21에 상세 페이지를 열어 대조. `core/sources.mjs` |
| 고용24(옛 워크넷) | `https://www.work24.go.kr` | 직업별 주소가 없어 첫 화면으로 |

---

## 정밀 미리보기 OrbitControls

- 파일: `prototypes/vendor/jsm/controls/OrbitControls.js`, three.js r170.
- 출처: https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/jsm/controls/OrbitControls.js
- 라이선스: MIT, Copyright © 2010-2024 three.js authors.
- 확인일: 2026-09-10. 공식 r170 LICENSE 직접 확인, `docs/third-party-three-r170-LICENSE.txt`에 원문 보존.
- 정밀 공간 및 MCC 모델은 `tools/build-precision.py`에서 직접 생성한 대표 설계다.

스펙 §16 에 따라 모든 외부 에셋의 출처·라이선스·확인일을 여기에 기록한다.
재배포가 제한된 에셋은 리포지터리에 커밋하지 않고 획득 절차만 남긴다.

## 3D 모델

### 손 (generic-hand)

| | |
|---|---|
| 파일 | `prototypes/vendor/hands/{left,right}.glb` |
| 출처 | `@webxr-input-profiles/assets@1.0` — `dist/profiles/generic-hand/` |
| 원 저장소 | https://github.com/immersive-web/webxr-input-profiles |
| 라이선스 | **MIT** (Copyright (c) 2019 Amazon) |
| 확인일 | 2026-08-26 — 패키지의 `LICENSE.md` 원문을 직접 받아 확인 |
| 내용 | glTF v2 · SkinnedMesh 1개 · **WebXR 표준 25관절** (`wrist` … `pinky-finger-tip`) · 텍스처 없음 |
| 왜 이것인가 | WebXR 표준 뼈대라 데스크톱에서는 우리가 관절을 구동하고 VR 에서는 핸드트래킹이 같은 뼈대를 구동한다 — 입력만 갈아끼우면 되므로 손 시스템을 두 번 만들지 않는다. 텍스처가 없어 맨손·니트릴·절연장갑 교체가 순수 머티리얼 교체가 된다. |

> 상표 주의: 이 패키지에는 실제 컨트롤러 외형을 묘사한 에셋도 함께 들어 있고, 그쪽에는
> 제조사 상표 관련 제약이 붙는다. 우리가 쓰는 `generic-hand` 는 특정 제품을 묘사하지
> 않으므로 해당되지 않는다. 컨트롤러 에셋을 쓰게 되면 그때 다시 확인할 것.

### 전신 인체 (스파이크 전용 — 배포 금지)

| | |
|---|---|
| 파일 | `prototypes/vendor/human/Xbot.glb` · `Michelle.glb` |
| 출처 | three.js 저장소의 예제 모델 (`examples/models/gltf`) |
| 원 저작 | Mixamo (Adobe) — 본 이름이 `mixamorig:` 로 시작 |
| 라이선스 | **불명확.** Mixamo 약관은 프로젝트 내 사용은 허용하지만 원본 에셋 재배포를 제한한다 |
| 용도 | **스파이크에서 눈으로 확인하는 용도로만 쓴다.** `.gitignore` 로 커밋에서 제외했고, 제품에는 넣지 않는다 |
| 확인일 | 2026-08-26 |
| 리그 | 본 65~67개 · **손가락 본 42개** · Xbot 은 `idle`·`walk`·`run` 포함 · 본 축은 로컬 +Y |

> **이 조사에서 나온 결론 하나**: 제대로 된 인체 리그는 손가락 본이 다 들어 있다.
> 따라서 별도의 손 모델을 붙일 이유가 없고, 스펙 §7.1.1 의 "손가락 리그 품질이
> 갈림길" 은 이것으로 판정났다 — 전신 하나로 간다.

### 전신 인체 — `human-full.glb` (채택)

| | |
|---|---|
| 파일 | `prototypes/vendor/human/human-full.glb` (출고용) · `human-full-measure.glb` (측정용) |
| 원본 | `human-full.blend` — 프로젝트 소유자가 MakeHuman/MPFB 로 만들었다 |
| 내보내기 | `blender -b <원본>.blend --python tools/export-human.py -- <출력>.glb 1.75` |
| 라이선스 | **CC0** — MakeHuman 의 export 예외 (아래 조건 참조) |
| 확인일 | 2026-09-01 |
| 리그 | `Default` 스켈레톤 · 뼈 137 개 · **손가락 뼈 30 개** |
| 메시 | 몸 · 눈알 · 정장 · 신발 — 삼각형 40,300 · 5.1MB |
| 생성기 | `Khronos glTF Blender I/O` (Blender 5.2) |
| 치수 | 키 1.750m · 눈 1.644m · 팔(어깨→손끝) 0.733m — `node tools/measure-rig.mjs` 로 실측 |

`.gitignore` 의 `prototypes/vendor/human/` 아래라 **커밋되지 않는다.** 라이선스는
CC0 라 커밋해도 되지만, 5MB 바이너리를 스파이크 단계에서 저장소에 넣지 않는다.
M4 에서 에셋 파이프라인이 생기면 그때 정식 경로로 옮긴다. 대신 내보내는 방법을
`tools/export-human.py` 에 고정해 두어, 원본만 있으면 같은 파일이 다시 나온다.

#### 옷

| 에셋 | 출처 | 라이선스 | 확인일 |
|---|---|---|---|
| `male_casualsuit01` | MakeHuman/MPFB 기본 에셋 | 문제 없음 — 프로젝트 소유자 확인 | 2026-09-03 |
| `shoes01` | 〃 | 〃 | 2026-09-03 |

소유자가 배포본에서 직접 확인했다. 라이선스 이름까지는 여기 안 적혀 있으므로,
M4 에서 에셋을 정리할 때 조항 이름을 채워 넣는 것이 좋다.

#### 저작된 키는 1.9726m 였다

내보낼 때 0.887 배로 줄여 1.75m 로 맞춘다 (`tools/export-human.py` 의 인자).
197cm 는 성인 남성 분포의 거의 끝이고, 씬의 모든 높이가 그 사람 기준으로 다시
잡혀야 한다. 슬라이더로 고치면 인자를 빼면 된다.

#### 체형 (2026-09-01 실측)

| | 이 모델 |
|---|---|
| 가슴 / 허리 / 엉덩이 | 0.343 / 0.272 / 0.324 m |
| 가슴/엉덩이 | 1.06 |
| 허리/엉덩이 | 0.84 |

셰이프 키 가중치로 읽은 MakeHuman 성별 슬라이더는 **약 0.86 (남성 쪽)** 이다
(`$ma` 합 2.72 대 `$fe` 합 0.45). 최대는 아니지만 정장 아래에서는 구분되지 않는다.

앞서 "이 모델은 여성 체형" 이라고 두 번 적었던 것은 **측정이 틀린 것이었다.**
팔에 실린 정점을 전부 빼고 어깨 너비를 쟀는데, 그러면 삼각근이 같이 날아가서
갈비뼈 폭이 나온다 — 어깨 관절이 0.428m 떨어져 있는데 "어깨 폭" 이 0.340m 로
나오면 그건 사람이 아니라 자가 틀린 것이다. 지금 도구는 어깨를 아예 재지 않고,
겹치는 구간 바깥일 때만 경고한다.

**아직 못 갖춘 것:**

- **몸에 재질이 없다.** 옷과 신발에는 텍스처가 있지만 살갗은 맨 메시라, 프로토타입이
  코드에서 살색을 칠한다. 얼굴은 카메라 근평면 안쪽이라 안 보이지만 **손은 보인다.**
- **애니메이션이 없다.** 보행 주기는 다른 데서 가져와 리타깃해야 한다 (CMU mocap →
  MakeHuman 뼈 이름). 지금은 자세를 절차적으로 푼다.
- **신발이 바짓단을 뚫는다.** MakeHuman 의 옷들은 각자 몸에 맞춰졌을 뿐 서로 맞춰지지
  않았다. 내보내기에서 신발 깃을 좁혀 가렸다 (`SHOE_TAPER`). 에셋을 바꾸면 다시 볼 것.

**이 모델을 재면서 배운 것 — 도구가 조용히 다른 것을 내보낼 수 있다.**
한동안 "`eye.L` 본이 눈알보다 7cm 위에 있다" 고 여기 적어 두고 있었는데, 그건
리그의 성질이 아니라 **내보내기가 틀려서 생긴 허깨비**였다. MakeHuman 의 슬라이더는
MPFB 안에서 셰이프 키로 남는데, 굽지 않고 내보내면 메시는 중립 기본형(1.695m)이
나가고 뼈는 실제 캐릭터(1.9726m)의 것이 된다. 그러면 뼈가 전부 메시보다 높이 뜬다.
제대로 구워서 다시 재니 `eye.L` 은 눈알 중심과 0.2mm 안에서 일치했다.

`pelvis.L` 이 이름과 달리 몸 중앙선(x=0)에 있는 것은 사실이고, 그건 여전히 유효하다.
차이는 이렇다 — 그건 **이름을 믿어서** 틀린 것이고, 눈 본 쪽은 **결과가 그럴듯해서**
틀린 것이었다. 후자가 더 오래 갔다.

## 라이브러리 (개발용, 재배포 아님)

| | |
|---|---|
| `three` 0.170.0 | MIT · https://github.com/mrdoob/three.js |
| `GLTFLoader` · `BufferGeometryUtils` | three.js 예제 모듈, 동일 MIT |

## 인체 모델 — 조사 결과 (2026-08-26)

사실적 + 리깅됨 + 상업 이용 자유 + 직접 내려받기 가능, 네 가지를 동시에 만족하는
무료 인체 모델은 사실상 없다. 사실적 인체는 3D 에셋 중 가장 상업적으로 비싼 부류다.

| 후보 | 라이선스 | 판정 |
|---|---|---|
| **MakeHuman 공식 export** | **CC0** (AGPL 앱의 export 예외) | ✅ **채택 예정.** 해부학적으로 실제, 리깅 포함, 상업 이용 무제한. GUI 앱이라 사람이 직접 실행해야 한다 |
| Ready Player Me | CC BY-**NC**-SA 4.0 | ❌ 비상업 전용. 제품이 목표이므로 쓸 수 없다 |
| Mixamo | 무료 사용 가능, 원본 재배포 제한 | △ 제품 라이선스가 불분명해 보류 |
| Quaternius · poly.pizza | CC0 | △ 리깅은 되지만 저폴리·양식화. 사실적이지 않다 |
| Sketchfab CC0 인체 | 개별 상이 | △ 품질 편차가 크고 로그인 없이 스크립트로 못 받는다 |

**MakeHuman CC0 예외의 조건**: 공식·비개조 버전의 GUI 에서 export 기능으로 내보낸
결과물이어야 한다. 라이브러리로 링크하거나 서버 모드로 대량 생산하면 예외가 적용되지 않는다.

## 아직 확보하지 않은 것

- 제조사 CAD (차단기·단자대·함체) — M4. 각 포털의 약관을 확인한 뒤 기록한다.
- CC0 PBR 텍스처 · HDRI (Poly Haven, ambientCG) — M4~M5.
- 실물 분전반 포토그래메트리 — M4. 촬영자와 촬영일을 남긴다.
- **전신 인체 모델 — MakeHuman export.** 부위를 나누지 않고 전신 하나를 쓴다(스펙 §7.1.1).
  확보 시 확인·요구할 것:
  1. **`Default` 스켈레톤으로 내보낼 것.** `Game engine` 스켈레톤에는 손가락 뼈가 없어
     잡기 포즈가 성립하지 않는다.
  2. ~~머리 메시를 제거한 1인칭용 변형본~~ — **철회.** 카메라를 얼굴 앞면에 세우면
     근평면이 머리를 잘라내므로 필요 없다 (스펙 §7.1.1). 한동안 요구사항으로 적어 뒀던
     것을 취소한다.
  3. **옷을 입힌 상태일 것.** 1인칭에서 팔이 화면의 상당 부분을 차지하는데 맨살이면 이상하다.

## MediaPipe Tasks Vision — 손 추적 (2026-08-28 확인)

| 항목 | 내용 |
|---|---|
| 패키지 | `@mediapipe/tasks-vision` 1.0.1 |
| 라이선스 | **Apache-2.0** (`package.json` 의 `license` 필드에서 확인, author `mediapipe@google.com`) |
| 모델 | `hand_landmarker.task` (float16/1) — Google 공식 배포처에서 내려받음 |
| 용도 | **스파이크 전용** (`prototypes/hand-track.html`). 제품에 넣을지는 측정 결과로 정한다 |
| 위치 | `prototypes/vendor/mediapipe/` — **gitignore 됨** (약 42MB) |

모델 파일 자체의 라이선스는 아직 별도로 확인하지 않았다. 제품에 넣기로 결정하면
그때 Google 의 모델 카드에서 확인하고 여기에 적는다.

## 걷기 · 대기 애니메이션 — CMU 모션캡처 DB (2026-08-28 확인)

| 항목 | 내용 |
|---|---|
| 출처 | Carnegie Mellon University Motion Capture Database — http://mocap.cs.cmu.edu/ |
| 조건 | **상업 제품에 포함 가능. 단 데이터 자체의 재판매는 금지** (변환한 형태라도) |
| 형식 | C3D (원본 마커) · ASF/AMC · BVH |
| 판정 | ✅ 우리 용도에 맞는다. 앱에 넣어 파는 것은 "commercially-sold products 에 포함" 에 해당하고, 우리가 파는 것은 앱이지 모션 데이터가 아니다 |

원문 (사이트에서 직접 받아 확인):

> This data is free for use in research projects.
> You may include this data in commercially-sold products,
> but you may not resell this data directly, even in converted form.

**표기 요청** (필수는 아니고 "would appreciate" 이지만 넣는다):

> The data used in this project was obtained from mocap.cs.cmu.edu.
> The database was created with funding from NSF EIA-0196217.

**주의**: 여러 2차 출처가 이 데이터를 "public domain" 이라고 적어 두었는데 **틀렸다.**
재판매 금지 조항이 있으므로 퍼블릭 도메인이 아니다. 원문을 직접 확인해서 잡았다.

**남은 일**: CMU 스켈레톤은 Mixamo·MPFB2 본 구조와 다르다. Blender 에서
리타게팅해야 하며, 그건 인체 모델이 확보된 뒤에 한다.

## 임상병리 팩 — 새로 만든 에셋 0점 (2026-08-29)

M6 의 합격 기준 중 하나가 "신규 에셋 0점" 이다. `content/clinical-lab/` 의
`presentation.placements` 는 전부 공유 라이브러리를 참조한다.

| 참조 | 종류 | 새로 만들었는가 |
|---|---|---|
| `env:micro-lab` | 환경 | 아니오 — 화학분석·식품위생·환경측정 팩이 함께 쓴다 |
| `equip:labware/petri` | 장비 | 아니오 |
| `equip:labware/scope` | 장비 | 아니오 |
| `equip:labware/burner` | 장비 | 아니오 |

**주의**: 이 참조들은 아직 실물 에셋이 없다. M4~M5 에서 라이브러리를 채울 때
이 id 들이 실제로 존재하는지 확인해야 한다. 지금은 "새 에셋을 요구하지
않는다" 는 것만 성립한다.

## 텍스처

### 전기실 방 텍스처 (Poly Haven)

| | |
|---|---|
| 파일 | `prototypes/vendor/tex/<슬러그>/{diff,arm,nor}.jpg` — 2K JPG |
| 받는 법 | `node tools/fetch-textures.mjs` (목록이 그 파일 안에 있다) |
| 라이선스 | **CC0 1.0** — 저작자 표시 의무 없음. 그래도 아래에 남긴다 |
| 확인일 | 2026-09-04 — polyhaven.com/license 원문과 API 응답을 직접 확인 |

| 재질 | 에셋 | 저작 |
|---|---|---|
| `floor_concrete` | [Concrete Floor 02](https://polyhaven.com/a/concrete_floor_02) | Rob Tuytel |
| `wall_paint` | [Plastered Wall 04](https://polyhaven.com/a/plastered_wall_04) | Rob Tuytel |
| `ceiling_paint` | [Plaster Grey 04](https://polyhaven.com/a/plaster_grey_04) | Rob Tuytel |

> `trim_paint` 과 `steel_painted` 에는 일부러 텍스처를 안 넣었다. 걸레받이·문틀·전선관은
> 좁고 매끈한 도장면이라, 가진 것 중 아무 무늬나 씌우면 텍스처가 없는 것보다 나쁘게 보인다.
> 그쪽은 환경맵 반사가 맡는다.

> 세 장을 받는다 — `diff`(색) · `arm`(AO·거칠기·금속 합본) · `nor`(법선, OpenGL 방향).
> `arm` 은 glTF 가 그대로 원하는 형식이라 따로 굽지 않아도 실린다.
