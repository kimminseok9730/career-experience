# 관찰실 상세 심장 v0.6

2026-10-18: 이 작업공간의 heart-lab/assets/heart-anatomy.glb 및 anatomy.json을 그대로 복사해 체험 앱에 통합했다. 모형은 합성 해부학 근사이며 실제 사례 검체 또는 임상 검증 자료가 아니다.

원본/통합 GLB SHA256: 59C52BF25146E00C8D0623393857EA42480EF96F5E13A7E0835DDA8C3507704C

88 meshes / 905774 triangles. 원본 정점·색을 보존하고, 원본 tissue-material.js를 forensic/studio-tissue.mjs로 복사했다. 표면과 내부 화면에 사용한다. 내부는 heart-lab의 section 가시성 규칙을 적용한다. 기존 HRA 기반 관상동맥 병변 단면은 별도 자료로 유지한다.

기록 모형 버전을 4로 올려 이전 모델의 위치 표시를 새 형상에 재사용하지 않는다. 모델 갱신 시 두 파일과 재질 코드 및 출처 설명을 함께 확인할 것.
