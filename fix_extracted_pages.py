#!/usr/bin/env python3
"""
추출된 페이지 파일들의 문법 오류를 자동으로 수정합니다.
1. 마지막 불필요한 }) 제거
2. async 함수 시그니처 수정
3. handler 함수를 올바른 형태로 변환
"""

import re
from pathlib import Path

def fix_page_file(filepath):
    """페이지 파일의 문법 오류 수정"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. 마지막 }) 제거 (앱 라우트의 닫는 괄호)
    # "// Middleware: ..." 바로 위의 })를 제거
    content = re.sub(r'\}\)\s*\n\s*\n\s*// Middleware:', '\n// Middleware:', content)
    
    # 2. async 키워드가 필요한지 확인 (await 사용하는 경우)
    has_await = 'await ' in content
    
    # 3. handler 함수 시그니처 수정
    if has_await:
        # async 함수로 변경
        content = re.sub(
            r'export const handler = \(c: Context\) => \{',
            'export const handler = async (c: Context) => {',
            content
        )
    
    # 4. 파일 끝부분 정리
    # 여러 개의 빈 줄을 하나로
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # 변경사항이 있으면 저장
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    print("🔧 추출된 페이지 파일 수정 중...\n")
    
    pages_dir = Path('src/pages')
    if not pages_dir.exists():
        print("❌ src/pages 디렉토리를 찾을 수 없습니다.")
        return
    
    # 모든 .tsx 파일 찾기
    page_files = list(pages_dir.rglob('*.tsx'))
    
    fixed_count = 0
    skipped_count = 0
    
    for filepath in sorted(page_files):
        try:
            if fix_page_file(filepath):
                print(f"✅ 수정: {filepath}")
                fixed_count += 1
            else:
                print(f"⏭️  건너뜀: {filepath}")
                skipped_count += 1
        except Exception as e:
            print(f"❌ 오류 ({filepath}): {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"✅ 수정 완료: {fixed_count}개")
    print(f"⏭️  건너뜀: {skipped_count}개")
    print(f"📁 총 파일: {len(page_files)}개")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    main()
