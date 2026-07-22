# 기여 가이드 (Contributing)

Korea AI Map은 누구나 데이터를 조회·제보·수정할 수 있는 오픈 데이터 프로젝트입니다.
등재·검증 기준은 [METHODOLOGY.md](METHODOLOGY.md)를 먼저 읽어 주세요.

## 제출 방식

1. **GitHub Issue Form** — 코딩 없이 제보. [신규 등재](../../issues/new/choose) / 수정 제안 / 상태 변경 신고.
2. **Pull Request** — `data/` 아래 YAML을 직접 추가·수정.
3. **웹 제출 폼** — (Phase 2 이후 제공)

## Pull Request로 데이터 추가하기

1. 항목 유형에 맞는 폴더에 `{id}.yaml` 파일을 만든다.
   `data/organizations/`, `data/models/`, `data/products/`, `data/open-source/`, `data/datasets/`, `data/benchmarks/`
2. `id`는 **파일명**이 됩니다. 소문자-케밥-표기, 전역 유일. 예: `lg-ai-research`, `exaone-3.5`
3. 스키마([`web/src/content/schemas.ts`](web/src/content/schemas.ts))를 만족해야 합니다. 기존 파일을 예시로 참고하세요.
4. 로컬 검증:
   ```bash
   npm install            # 루트: 검증 스크립트 의존성
   npm run check:refs     # ID 중복 · 참조 무결성
   (cd web && npm install && npm run build)   # 스키마·필수필드·형식 검증 겸용
   ```
5. PR을 열면 `validate` 워크플로우가 자동으로 같은 검사를 수행합니다.

## 필수 입력 (모든 제출)

- 이름 (한글/영문)
- 유형
- 공식 웹사이트
- 개발 주체
- 설명
- **공식 출처(sources)** — 최소 1개
- 제출자 소속
- **이해관계 여부**

## 처리 상태

`접수 → 검토 중 → (추가 자료 요청) → 승인 / 반려 / 보류`

## 편집 원칙

- 출처 없는 홍보 표현은 삭제합니다.
- 자체 모델 여부는 기술적 근거로 판단합니다.
- 서비스 종료 항목은 삭제하지 않고 `archived`로 보존합니다.
- 논란이 있는 내용은 단정하지 않고 `disputed` 상태로 표시합니다.
- 모든 중요한 수정은 리뷰를 거칩니다.
- **기업 관계자의 제출은 자동 승인하지 않습니다.** ([GOVERNANCE.md](GOVERNANCE.md) 참고)

## 이해관계 공개 (필수)

다음 관계에 해당하면 PR/Issue에 반드시 밝혀 주세요. 자료 제출은 가능하지만 최종 승인자는 될 수 없습니다.

- 해당 기업 임직원 · 투자자 · 자문 관계 · 유료 계약 관계 · 가족/특수관계 · 경쟁사 소속
