
export const LanguageDropdownItems = () => {
    return (
        <>
            <a href="#" onclick="changeLanguage('ko'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">한국어</a>
            <a href="#" onclick="changeLanguage('en'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">English</a>
            <a href="#" onclick="changeLanguage('ja'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">日本語</a>
            <a href="#" onclick="changeLanguage('vi'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Tiếng Việt</a>
            <a href="#" onclick="changeLanguage('zh'); return false;" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">中文</a>
        </>
    )
}
