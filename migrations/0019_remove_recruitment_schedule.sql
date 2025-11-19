-- 채용 일정 필드 제거
-- recruitment_schedule 컬럼 삭제
-- 작성일: 2025-11-19

-- SQLite는 DROP COLUMN을 지원하지 않으므로 컬럼을 NULL로 비워두고 사용하지 않음
-- 프로덕션 배포 시 이 필드는 무시됨
-- UPDATE companies SET recruitment_schedule = NULL WHERE recruitment_schedule IS NOT NULL;

-- 참고: SQLite에서 컬럼 삭제는 테이블 재생성이 필요하므로
-- 프로덕션에서는 컬럼을 남겨두되 사용하지 않는 것으로 처리
