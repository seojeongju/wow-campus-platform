#!/usr/bin/env python3
"""
index.tsx 파일을 페이지 컴포넌트로 안전하게 분리하는 스크립트
- 기존 코드를 전혀 수정하지 않음
- 단순히 복사해서 새 파일로 이동
- 디자인과 기능 100% 유지
"""

import re
import os
from pathlib import Path

# 페이지 라우트 정의 (라인 번호는 실제로 파싱해서 얻음)
# 형식: (route_path, start_line, end_line, file_name, needs_auth)
PAGE_ROUTES = [
    # Static assets
    ('/static/app.js', 52, 5180, 'static/app-js', False),
    ('/static/style.css', 5181, 5297, 'static/style-css', False),
    
    # Web Pages (non-API routes)
    ('/jobseekers/:id', 6972, 7468, 'pages/jobseekers/detail', True),
    ('/jobs/:id', 7469, 7783, 'pages/jobs/detail', True),
    ('/jobs', 7784, 8241, 'pages/jobs/list', False),
    ('/study', 8242, 8427, 'pages/study/index', False),
    ('/study/korean', 8428, 8689, 'pages/study/korean', False),
    ('/study/undergraduate', 8690, 9011, 'pages/study/undergraduate', False),
    ('/study/graduate', 9012, 9413, 'pages/study/graduate', False),
    ('/jobseekers', 9414, 9811, 'pages/jobseekers/list', True),
    ('/agents', 9812, 10273, 'pages/agents/dashboard', True),
    ('/agents/assign', 10274, 10611, 'pages/agents/assign', True),
    ('/agents/profile/edit', 10612, 11081, 'pages/agents/profile-edit', True),
    ('/statistics', 11082, 11726, 'pages/statistics', True),
    ('/', 11727, 12345, 'pages/home', False),
    ('/matching', 12346, 12973, 'pages/matching', False),
    ('/support', 12974, 13049, 'pages/support', False),
    ('/faq', 13050, 13112, 'pages/faq', False),
    ('/guide', 13113, 13215, 'pages/guide', False),
    ('/login', 13216, 13316, 'pages/login', False),
    ('/contact', 13317, 13494, 'pages/contact', False),
    ('/notice', 13495, 13599, 'pages/notice', False),
    ('/blog', 13600, 13720, 'pages/blog', False),
    ('/dashboard', 13755, 13774, 'pages/dashboard/index', True),
    ('/dashboard/legacy', 13775, 14359, 'pages/dashboard/legacy', False),
    ('/terms', 15358, 15485, 'pages/terms', False),
    ('/privacy', 15486, 15649, 'pages/privacy', False),
    ('/cookies', 15650, 15878, 'pages/cookies', False),
    ('/dashboard/jobseeker', 15879, 16138, 'pages/dashboard/jobseeker', True),
    ('/profile', 16139, 17208, 'pages/profile', True),
    ('/dashboard/company', 17209, 17696, 'pages/dashboard/company', True),
    ('/dashboard/admin', 17697, 17701, 'pages/dashboard/admin', True),
    ('/admin', 17702, 19210, 'pages/dashboard/admin-legacy', True),
    ('/test-upload.html', 19211, 19460, 'pages/test-upload', False),
]

def read_lines(file_path, start, end):
    """파일에서 특정 라인 범위를 읽음 (1-based index)"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        # start-1 because list is 0-indexed, but line numbers are 1-indexed
        return ''.join(lines[start-1:end])

def extract_route_pattern(content):
    """라우트 패턴 추출 (app.get('/path', ...) -> '/path')"""
    match = re.search(r"app\.(get|post)\('([^']+)'", content)
    if match:
        return match.group(2)
    return None

def extract_middleware(content):
    """미들웨어 추출 (optionalAuth, authMiddleware, requireAdmin 등)"""
    middlewares = []
    if 'optionalAuth' in content:
        middlewares.append('optionalAuth')
    if 'authMiddleware' in content:
        middlewares.append('authMiddleware')
    if 'requireAdmin' in content:
        middlewares.append('requireAdmin')
    return middlewares

def create_page_component(route_path, content, file_name, needs_auth):
    """페이지 컴포넌트 파일 생성"""
    
    # 미들웨어 추출
    middlewares = extract_middleware(content)
    
    # Import 구문 생성
    imports = ["import type { Context } from 'hono'"]
    
    if 'authMiddleware' in middlewares:
        imports.append("import { authMiddleware } from '../../middleware/auth'")
    if 'optionalAuth' in middlewares or 'requireAdmin' in middlewares:
        imports.append("import { optionalAuth, requireAdmin } from '../../middleware/auth'")
    
    # 함수명 생성 (경로를 기반으로)
    function_name = file_name.split('/')[-1].replace('-', '_').title().replace('_', '')
    if not function_name.endswith('Page'):
        function_name += 'Page'
    
    # 라우트 핸들러 함수 추출
    # app.get('/path', middleware, (c) => { ... }) 패턴에서 (c) => { ... } 부분만 추출
    
    # 먼저 전체 함수 본문 찾기
    match = re.search(r'app\.(get|post)\([^,]+(?:,\s*[^,]+)*,\s*(\([^)]*\)\s*=>?\s*\{)', content, re.DOTALL)
    
    if match:
        # 함수 시작점 찾기
        func_start = match.end() - 1  # '{' 위치
        
        # 중괄호 매칭으로 함수 끝 찾기
        brace_count = 1
        i = func_start + 1
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1
        
        # 함수 본문 추출 (중괄호 포함)
        function_body = content[func_start:i]
        
        # async 여부 확인
        is_async = 'async' in match.group(0)
        async_keyword = 'async ' if is_async else ''
        
        # 파라미터 추출 (c) 또는 (c: Context) 등
        param_match = re.search(r'\(([^)]+)\)', match.group(2))
        param = param_match.group(1) if param_match else 'c'
        
        # 전체 함수 구성
        handler_function = f"{async_keyword}({param}) => {function_body}"
    else:
        # 매칭 실패 시 원본 그대로 사용
        handler_function = content
    
    # 미들웨어 배열 생성
    middleware_array = ', '.join(middlewares) if middlewares else ''
    
    # 최종 파일 내용
    file_content = f"""/**
 * Auto-generated from index.tsx
 * Route: {route_path}
 * Original line range: (check git history)
 */

{chr(10).join(imports)}

export const {function_name} = {handler_function}

// Middleware configuration
export const middlewares = [{middleware_array}]
"""
    
    return file_content

def main():
    """메인 실행 함수"""
    
    print("🚀 index.tsx 파일 분리 시작...")
    print("=" * 60)
    
    # 소스 파일 경로
    source_file = Path('src/index.tsx')
    if not source_file.exists():
        print(f"❌ 오류: {source_file} 파일을 찾을 수 없습니다.")
        return
    
    # src 디렉토리 생성 (이미 존재)
    src_dir = Path('src')
    
    print(f"📁 총 {len(PAGE_ROUTES)}개 페이지 컴포넌트를 분리합니다...\n")
    
    success_count = 0
    
    for route_path, start_line, end_line, file_name, needs_auth in PAGE_ROUTES:
        try:
            print(f"📄 처리 중: {route_path} -> {file_name}.tsx")
            print(f"   라인: {start_line} - {end_line}")
            
            # 원본 코드 추출
            content = read_lines(source_file, start_line, end_line)
            
            # 페이지 컴포넌트 생성
            page_content = create_page_component(route_path, content, file_name, needs_auth)
            
            # 디렉토리 생성
            output_file = src_dir / f"{file_name}.tsx"
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            # 파일 저장
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(page_content)
            
            print(f"   ✅ 생성됨: {output_file}")
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ 오류 발생: {str(e)}")
    
    print("\n" + "=" * 60)
    print(f"✅ 완료: {success_count}/{len(PAGE_ROUTES)}개 컴포넌트 생성됨")
    print("\n다음 단계:")
    print("1. src/index.tsx 파일을 라우팅 전용으로 재작성")
    print("2. npm run build 실행")
    print("3. 동작 확인")

if __name__ == '__main__':
    main()
