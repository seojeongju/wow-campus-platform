#!/usr/bin/env python3
"""
index.tsx에서 페이지 컴포넌트를 자동으로 추출하는 스크립트
- 기존 JSX 구조를 100% 그대로 유지
- c.render() 패턴을 그대로 사용
- 디자인과 기능 무변경
"""

import re
from pathlib import Path

def extract_route_handler(content, start_pattern):
    """
    라우트 핸들러를 추출합니다.
    app.get('/path', (c) => { return c.render(...) })
    에서 (c) => { return c.render(...) } 부분을 추출
    """
    # 핸들러 시작 찾기
    match = re.search(r'app\.(get|post)\([^,]+,\s*(\([^)]*\))\s*=>\s*\{', content)
    if not match:
        return None, None
    
    param = match.group(2)  # (c) 또는 (c: Context)
    start_pos = match.end() - 1  # '{' 위치
    
    # 중괄호 매칭으로 함수 끝 찾기
    brace_count = 1
    i = start_pos + 1
    while i < len(content) and brace_count > 0:
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
        i += 1
    
    # 함수 본문 추출 (중괄호 내부만)
    function_body = content[start_pos + 1:i - 1].strip()
    
    return param, function_body

def read_file_lines(filepath, start_line, end_line):
    """파일에서 특정 라인 범위를 읽습니다 (1-based index)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        return ''.join(lines[start_line - 1:end_line])

def create_page_file(route_path, content, output_path, original_lines):
    """페이지 파일을 생성합니다"""
    
    param, function_body = extract_route_handler(content, 'app.get')
    
    if not function_body:
        print(f"  ⚠️  핸들러 추출 실패, 원본 그대로 사용")
        function_body = content
        param = "(c: Context)"
    
    # 파일 내용 생성
    file_content = f"""/**
 * Page Component
 * Route: {route_path}
 * Original: src/index.tsx lines {original_lines}
 */

import type {{ Context }} from 'hono'

export function handler(c: Context) {{
  {function_body}
}}
"""
    
    # 파일 저장
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(file_content)
    
    return True

# 추출할 페이지 목록 (path, start_line, end_line, output_file)
PAGES_TO_EXTRACT = [
    ('/contact', 13317, 13494, 'src/pages/contact.tsx'),
    ('/faq', 13050, 13112, 'src/pages/faq.tsx'),
    ('/guide', 13113, 13215, 'src/pages/guide.tsx'),
    ('/notice', 13495, 13599, 'src/pages/notice.tsx'),
    ('/blog', 13600, 13720, 'src/pages/blog.tsx'),
    ('/terms', 15358, 15485, 'src/pages/terms.tsx'),
    ('/privacy', 15486, 15649, 'src/pages/privacy.tsx'),
    ('/cookies', 15650, 15878, 'src/pages/cookies.tsx'),
    ('/matching', 12346, 12973, 'src/pages/matching.tsx'),
    ('/support', 12974, 13049, 'src/pages/support.tsx'),
]

def main():
    print("🚀 페이지 컴포넌트 자동 추출 시작...\n")
    
    source_file = Path('src/index.tsx')
    if not source_file.exists():
        print("❌ src/index.tsx 파일을 찾을 수 없습니다.")
        return
    
    success_count = 0
    
    for route_path, start_line, end_line, output_path in PAGES_TO_EXTRACT:
        try:
            print(f"📄 {route_path} -> {output_path}")
            print(f"   Lines: {start_line}-{end_line}")
            
            # 원본 코드 읽기
            content = read_file_lines(source_file, start_line, end_line)
            
            # 페이지 파일 생성
            if create_page_file(route_path, content, output_path, f"{start_line}-{end_line}"):
                print(f"   ✅ 생성 완료\n")
                success_count += 1
            else:
                print(f"   ❌ 생성 실패\n")
                
        except Exception as e:
            print(f"   ❌ 오류: {str(e)}\n")
    
    print(f"\n{'='*60}")
    print(f"✅ 완료: {success_count}/{len(PAGES_TO_EXTRACT)}개 페이지 추출됨")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
