#!/usr/bin/env python3
"""
복잡한 페이지 컴포넌트 추출 (jobs, jobseekers, dashboard 등)
"""

import re
from pathlib import Path

def read_file_lines(filepath, start_line, end_line):
    """파일에서 특정 라인 범위를 읽습니다"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])

def extract_handler_simple(content):
    """
    간단하게 핸들러 본문만 추출
    app.get('/path', ..., (c) => { BODY }) -> BODY 추출
    """
    # 'app.get' 또는 'app.post' 이후 모든 내용에서 마지막 })를 제외
    # 단순히 라우트 정의 라인을 제거하고 나머지를 반환
    
    lines = content.split('\n')
    result_lines = []
    skip_first = True
    
    for line in lines:
        if skip_first and ('app.get' in line or 'app.post' in line):
            skip_first = False
            continue
        if not skip_first:
            result_lines.append(line)
    
    # 마지막 }) 제거
    result = '\n'.join(result_lines).rstrip()
    if result.endswith('})'):
        result = result[:-2]
    
    return result.strip()

def extract_middleware_from_route(content):
    """라우트에서 미들웨어 추출"""
    middlewares = []
    first_line = content.split('\n')[0]
    
    if 'optionalAuth' in first_line:
        middlewares.append('optionalAuth')
    if 'authMiddleware' in first_line:
        middlewares.append('authMiddleware')
    if 'requireAdmin' in first_line:
        middlewares.append('requireAdmin')
    if 'checkPageAccess' in first_line:
        middlewares.append('checkPageAccess')
    if 'requireAdminPage' in first_line:
        middlewares.append('requireAdminPage')
    
    return middlewares

def create_page_file_v2(route_path, content, output_path, original_lines):
    """개선된 페이지 파일 생성"""
    
    # 미들웨어 추출
    middlewares = extract_middleware_from_route(content)
    
    # Import 생성
    imports = ["import type { Context } from 'hono'"]
    
    if middlewares:
        if any(m in middlewares for m in ['authMiddleware']):
            imports.append("import { authMiddleware } from '../middleware/auth'")
        if any(m in middlewares for m in ['optionalAuth', 'requireAdmin']):
            imports.append("import { optionalAuth, requireAdmin } from '../middleware/auth'")
        if any(m in middlewares for m in ['checkPageAccess', 'requireAdminPage']):
            imports.append("import { checkPageAccess, requireAdminPage } from '../middleware/permissions'")
    
    # 핸들러 본문 추출
    handler_body = extract_handler_simple(content)
    
    # 파일 내용 생성 - 핸들러를 그대로 보존
    file_content = f"""/**
 * Page Component
 * Route: {route_path}
 * Original: src/index.tsx lines {original_lines}
 */

{chr(10).join(imports)}

export const handler = (c: Context) => {{
{handler_body}
}}

// Middleware: {', '.join(middlewares) if middlewares else 'none'}
"""
    
    # 파일 저장
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    return True

# 복잡한 페이지 목록
COMPLEX_PAGES = [
    # Jobs pages
    ('/jobs', 7784, 8241, 'src/pages/jobs/list.tsx'),
    ('/jobs/:id', 7469, 7783, 'src/pages/jobs/detail.tsx'),
    
    # Jobseekers pages
    ('/jobseekers', 9414, 9811, 'src/pages/jobseekers/list.tsx'),
    ('/jobseekers/:id', 6972, 7468, 'src/pages/jobseekers/detail.tsx'),
    
    # Study pages
    ('/study', 8242, 8427, 'src/pages/study/index.tsx'),
    ('/study/korean', 8428, 8689, 'src/pages/study/korean.tsx'),
    ('/study/undergraduate', 8690, 9011, 'src/pages/study/undergraduate.tsx'),
    ('/study/graduate', 9012, 9413, 'src/pages/study/graduate.tsx'),
    
    # Dashboard pages
    ('/dashboard', 13755, 13774, 'src/pages/dashboard/index.tsx'),
    ('/dashboard/legacy', 13775, 14359, 'src/pages/dashboard/legacy.tsx'),
    ('/dashboard/jobseeker', 15879, 16138, 'src/pages/dashboard/jobseeker.tsx'),
    ('/dashboard/company', 17209, 17696, 'src/pages/dashboard/company.tsx'),
    ('/dashboard/admin', 17697, 17701, 'src/pages/dashboard/admin.tsx'),
    ('/admin', 17702, 19210, 'src/pages/dashboard/admin-full.tsx'),
    
    # Agent pages
    ('/agents', 9812, 10273, 'src/pages/agents/dashboard.tsx'),
    ('/agents/assign', 10274, 10611, 'src/pages/agents/assign.tsx'),
    ('/agents/profile/edit', 10612, 11081, 'src/pages/agents/profile-edit.tsx'),
    
    # Other pages
    ('/statistics', 11082, 11726, 'src/pages/statistics.tsx'),
    ('/profile', 16139, 17208, 'src/pages/profile.tsx'),
    ('/', 11727, 12345, 'src/pages/home.tsx'),
]

def main():
    print("🚀 복잡한 페이지 컴포넌트 추출 시작...\n")
    
    source_file = Path('src/index.tsx')
    if not source_file.exists():
        print("❌ src/index.tsx 파일을 찾을 수 없습니다.")
        return
    
    success_count = 0
    fail_count = 0
    
    for route_path, start_line, end_line, output_path in COMPLEX_PAGES:
        try:
            print(f"📄 {route_path}")
            print(f"   -> {output_path}")
            print(f"   Lines: {start_line}-{end_line}")
            
            # 원본 코드 읽기
            content = read_file_lines(source_file, start_line, end_line)
            
            # 페이지 파일 생성
            if create_page_file_v2(route_path, content, output_path, f"{start_line}-{end_line}"):
                print(f"   ✅ 생성 완료\n")
                success_count += 1
            else:
                print(f"   ❌ 생성 실패\n")
                fail_count += 1
                
        except Exception as e:
            print(f"   ❌ 오류: {str(e)}\n")
            fail_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ 성공: {success_count}개")
    print(f"❌ 실패: {fail_count}개")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
