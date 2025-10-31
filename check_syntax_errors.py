#!/usr/bin/env python3
"""
모든 페이지 파일의 문법 오류를 체크하고 자동으로 수정합니다.
"""

import re
from pathlib import Path

def check_and_fix_file(filepath):
    """파일의 문법 오류를 체크하고 수정합니다."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    errors = []
    fixed = []
    
    # 1. 파일 끝에 잘못된 })가 있는지 체크
    if re.search(r'\}\)\s*\n\s*// ', content):
        content = re.sub(r'\}\)\s*\n\s*// ', '\n// ', content)
        fixed.append("Removed incorrect })")
    
    # 2. handler 함수가 제대로 닫혀있는지 체크
    # export const handler = ... 로 시작하는 함수가 있는지
    handler_match = re.search(r'export const handler = (async )?\(c: Context\) => \{', content)
    if handler_match:
        # handler 함수 이후의 내용 분석
        handler_start = handler_match.end()
        
        # 중괄호 카운팅으로 함수 끝 찾기
        brace_count = 1
        i = handler_start
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1
        
        if brace_count != 0:
            errors.append(f"Unmatched braces: {brace_count}")
        
        # handler 함수 끝 이후에 })가 있으면 제거
        remaining = content[i:].strip()
        if remaining.startswith('})'):
            content = content[:i] + '\n' + remaining[2:]
            fixed.append("Removed extra }) after handler")
    
    # 3. async 키워드 확인 (await가 있으면 async 필요)
    has_await = 'await ' in content
    has_async = 'export const handler = async' in content
    
    if has_await and not has_async:
        content = content.replace(
            'export const handler = (c: Context) => {',
            'export const handler = async (c: Context) => {'
        )
        fixed.append("Added missing 'async' keyword")
    
    # 4. 파일 끝 정리
    # - 여러 빈 줄을 최대 2개로
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # - 파일이 개행으로 끝나도록
    if not content.endswith('\n'):
        content += '\n'
    
    # 5. 추가 검증: return 문이 있는지 확인
    if 'export const handler' in content and 'return c.render' not in content and 'return c.json' not in content:
        errors.append("No return statement found in handler")
    
    # 변경사항 저장
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, fixed, errors
    
    return False, fixed, errors

def main():
    print("🔍 페이지 파일 문법 검사 및 자동 수정...\n")
    
    pages_dir = Path('src/pages')
    page_files = sorted(pages_dir.rglob('*.tsx'))
    
    fixed_files = []
    error_files = []
    ok_files = []
    
    for filepath in page_files:
        rel_path = str(filepath)
        
        try:
            was_fixed, fixes, errors = check_and_fix_file(filepath)
            
            if errors:
                print(f"❌ {rel_path}")
                for error in errors:
                    print(f"   - {error}")
                error_files.append(str(rel_path))
            elif was_fixed:
                print(f"✅ {rel_path}")
                for fix in fixes:
                    print(f"   - {fix}")
                fixed_files.append(str(rel_path))
            else:
                print(f"✓  {rel_path} - OK")
                ok_files.append(str(rel_path))
                
        except Exception as e:
            print(f"❌ {rel_path} - ERROR: {str(e)}")
            error_files.append(str(rel_path))
    
    print(f"\n{'='*60}")
    print(f"✅ 수정 완료: {len(fixed_files)}개")
    print(f"✓  정상: {len(ok_files)}개")
    print(f"❌ 오류: {len(error_files)}개")
    print(f"📁 총: {len(page_files)}개")
    print(f"{'='*60}\n")
    
    if error_files:
        print("⚠️  다음 파일들은 수동 수정이 필요합니다:")
        for f in error_files:
            print(f"   - {f}")

if __name__ == '__main__':
    main()
