/**
 * Company Profile Page - Redesigned
 * Route: /profile/company
 * 梨꾩슜?占쏀뼢??湲곕컲 8占??占쎄퇋 ?占쎈뱶 ?占쏀븿
 */

import type { Context } from 'hono'
import { NavigationHeader } from '../../components/navigation'

export const handler = async (c: Context) => {
  const user = c.get('user');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <NavigationHeader />

      {/* Main Content */}
      <main class="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div class="mb-8">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">기업 프로필 관리</h1>
              <p class="text-gray-600">채용 정보를 포함한 상세 기업 프로필을 관리하세요</p>
            </div>
            <div class="flex items-center space-x-3">
              <div id="profile-completeness" class="hidden px-4 py-2 bg-blue-50 rounded-lg">
                <span class="text-sm font-medium text-blue-700">?占쎈줈???占쎌꽦?? <span id="completeness-percent">0</span>%</span>
              </div>
              <a href="/dashboard/company" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                ?占?占쎈낫?占쎈줈
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button id="tab-view" class="tab-button border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
              <i class="fas fa-eye mr-2"></i>?占쎈줈??蹂닿린
            </button>
            <button id="tab-edit" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              <i class="fas fa-edit mr-2"></i>?占쎈줈???占쎌젙
            </button>
          </nav>
        </div>

        {/* View Section */}
        <div id="view-section" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">湲곗뾽 ?占쎈낫占?遺덈윭?占쎈뒗 占?..</p>
            </div>
          </div>
        </div>

        {/* Edit Section */}
        <div id="edit-section" class="hidden space-y-6">
          <form id="company-profile-form">
            {/* 1. 湲곕낯 ?占쎈낫 */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-building text-purple-600 mr-3 text-2xl"></i>
                <span>湲곕낯 ?占쎈낫</span>
              </h2>
              
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="company_name" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쎌껜占?<span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="company_name" 
                      name="company_name" 
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?? (占??占쏙옙?罹좏띁??
                    />
                  </div>

                  <div>
                    <label for="representative_name" class="block text-sm font-medium text-gray-700 mb-2">대표자 <span class="text-red-500">*</span> <span class="text-xs text-blue-600">(신규)</span></label>
                    <input
                      type="text"
                      id="representative_name"
                      name="representative_name"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="대표자 이름"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="business_number" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쎌뾽?占쎈벑濡앸쾲??<span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="business_number" 
                      name="business_number"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="000-00-00000"
                    />
                  </div>

                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쏀솕踰덊샇 <span class="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone"
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="02-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                    ?占쎌뾽?占쎌옱吏 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    <div class="flex gap-2">
                      <input 
                        type="text" 
                        id="postcode" 
                        name="postcode"
                        readonly
                        class="w-32 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="?占쏀렪踰덊샇"
                      />
                      <button 
                        type="button"
                        onclick="execDaumPostcode()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ?占쏀렪踰덊샇 李얘린
                      </button>
                    </div>
                    <input 
                      type="text" 
                      id="address" 
                      name="address"
                      readonly
                      required
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      placeholder="二쇱냼 (?占쏀렪踰덊샇 李얘린 踰꾪듉???占쎈┃?占쎌꽭??"
                    />
                    <input 
                      type="text" 
                      id="detailAddress" 
                      name="detailAddress"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?占쎌꽭二쇱냼 (嫄대Ъ占? ???占쎌닔 ??"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쎌쥌
                    </label>
                    <input 
                      type="text" 
                      id="industry" 
                      name="industry"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="?? IT/?占쏀봽?占쎌썾??
                    />
                  </div>

                  <div>
                    <label for="company_size" class="block text-sm font-medium text-gray-700 mb-2">
                      湲곗뾽 洹쒕え
                    </label>
                    <select 
                      id="company_size" 
                      name="company_size"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">?占쏀깮?占쎌꽭??/option>
                      <option value="startup">?占쏙옙??占쎌뾽 (1-10占?</option>
                      <option value="small">?占쎄린??(11-50占?</option>
                      <option value="medium">以묎린??(51-200占?</option>
                      <option value="large">?占쎄린??(201占??占쎌긽)</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쎌궗?占쏀듃
                    </label>
                    <input 
                      type="url" 
                      id="website" 
                      name="website"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div>
                    <label for="founded_year" class="block text-sm font-medium text-gray-700 mb-2">
                      ?占쎈┰ ?占쎈룄
                    </label>
                    <input 
                      type="number" 
                      id="founded_year" 
                      name="founded_year"
                      min="1900"
                      max="2030"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="2020"
                    />
                  </div>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    湲곗뾽 ?占쎄컻
                  </label>
                  <textarea 
                    id="description" 
                    name="description"
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="湲곗뾽??鍮꾩쟾, ?占쎌뾽 ?占쎌슜, ?占쎌쭠 ?占쎌쓣 ?占쎄컻?占쎌＜?占쎌슂"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 2. 梨꾩슜 ?占쎈낫 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-user-tie text-blue-600 mr-3 text-2xl"></i>
                <span>梨꾩슜 ?占쎈낫</span>
                <span class="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="space-y-6">
                {/* 梨꾩슜 吏곸쥌 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    梨꾩슜 吏곸쥌 <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_tech_it" name="recruitment_positions[]" value="湲곗닠 占?IT 遺꾩빞 (Technology & IT)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_tech_it" class="ml-2 text-sm text-gray-700">湲곗닠 占?IT 遺꾩빞 (Technology & IT)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_marketing_sales" name="recruitment_positions[]" value="留덌옙???占??占쎌뾽 遺꾩빞 (Marketing & Sales)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_marketing_sales" class="ml-2 text-sm text-gray-700">留덌옙???占??占쎌뾽 遺꾩빞 (Marketing & Sales)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_rnd" name="recruitment_positions[]" value="?占쎄뎄 占?媛쒕컻 遺꾩빞 (R&D)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_rnd" class="ml-2 text-sm text-gray-700">?占쎄뎄 占?媛쒕컻 遺꾩빞 (R&D)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="pos_other_prof" name="recruitment_positions[]" value="湲곤옙? ?占쎈Ц 遺꾩빞 (Other Professional Fields)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_other_prof" class="ml-2 text-sm text-gray-700">湲곤옙? ?占쎈Ц 遺꾩빞 (Other Professional Fields)</label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="pos_other" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="pos_other" class="text-sm text-gray-700">湲곤옙?-吏곸젒湲곗엯:</label>
                      <input type="text" id="pos_other_text" class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" placeholder="吏곸젒 ?占쎈젰" />
                    </div>
                  </div>
                </div>

                {/* 鍮꾩옄 醫낅쪟 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    鍮꾩옄 醫낅쪟 <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_e7" name="visa_types[]" value="E-7 (?占쎌젙?占쎈룞)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_e7" class="ml-2 text-sm text-gray-700">E-7 (?占쎌젙?占쎈룞)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_e9" name="visa_types[]" value="E-9 (鍮꾩쟾臾몄랬??" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_e9" class="ml-2 text-sm text-gray-700">E-9 (鍮꾩쟾臾몄랬??</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_h2" name="visa_types[]" value="H-2 (諛⑸Ц痍⑥뾽)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_h2" class="ml-2 text-sm text-gray-700">H-2 (諛⑸Ц痍⑥뾽)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f2" name="visa_types[]" value="F-2 (嫄곗＜)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f2" class="ml-2 text-sm text-gray-700">F-2 (嫄곗＜)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f4" name="visa_types[]" value="F-4 (?占쎌쇅?占쏀룷)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f4" class="ml-2 text-sm text-gray-700">F-4 (?占쎌쇅?占쏀룷)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f5" name="visa_types[]" value="F-5 (?占쎌＜)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f5" class="ml-2 text-sm text-gray-700">F-5 (?占쎌＜)</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="visa_f6" name="visa_types[]" value="F-6 (寃고샎?占쏙옙?)" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_f6" class="ml-2 text-sm text-gray-700">F-6 (寃고샎?占쏙옙?)</label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="visa_other" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="visa_other" class="text-sm text-gray-700">湲곤옙?:</label>
                      <input type="text" id="visa_other_text" class="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" placeholder="吏곸젒 ?占쎈젰" />
                    </div>
                  </div>
                </div>

                {/* 梨꾩슜 ?占쎌썝 */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="recruitment_count" class="block text-sm font-medium text-gray-700 mb-2">
                      梨꾩슜 ?占쎌썝 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="number" 
                        id="recruitment_count" 
                        name="recruitment_count" 
                        required
                        min="1"
                        class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1"
                      />
                      <span class="absolute right-4 top-2 text-gray-500">占?/span>
                    </div>
                  </div>

                  <div>
                    <label for="minimum_salary" class="block text-sm font-medium text-gray-700 mb-2">
                      理쒖냼 ?占쎈큺 <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input 
                        type="number" 
                        id="minimum_salary" 
                        name="minimum_salary" 
                        required
                        min="0"
                        step="100"
                        class="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="3000"
                      />
                      <span class="absolute right-4 top-2 text-gray-500">留뚯썝 ?占쎌긽</span>
                    </div>
                  </div>
                </div>

                {/* 洹쇰Т ?占쏀깭 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    洹쇰Т ?占쏀깭 <span class="text-red-500">*</span>
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_fulltime" name="employment_types[]" value="?占쎄퇋占? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_fulltime" class="ml-2 text-sm text-gray-700">?占쎄퇋占?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_contract" name="employment_types[]" value="怨꾩빟占? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_contract" class="ml-2 text-sm text-gray-700">怨꾩빟占?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="emp_intern" name="employment_types[]" value="?占쏀꽩?? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="emp_intern" class="ml-2 text-sm text-gray-700">?占쏀꽩??/label>
                    </div>
                  </div>
                </div>

                {/* ?占쎌닔 ?占쎄꺽 */}
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    ?占쎌닔 ?占쎄꺽
                  </label>
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_acu" name="qualifications[]" value="ACU Fusion ?占쎄꺽占? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_acu" class="ml-2 text-sm text-gray-700">ACU Fusion ?占쎄꺽占?/label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_degree" name="qualifications[]" value="?占쎌궗?占쎌쐞 ?占쎌긽" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_degree" class="ml-2 text-sm text-gray-700">?占쎌궗?占쎌쐞 ?占쎌긽</label>
                    </div>
                    <div class="flex items-center">
                      <input type="checkbox" id="qual_korean" name="qualifications[]" value="?占쎄뎅???占쎌궗?占쏀넻 媛?? class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                      <label for="qual_korean" class="ml-2 text-sm text-gray-700">?占쎄뎅???占쎌궗?占쏀넻 媛??/label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 吏???占쏀빆 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-green-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-hands-helping text-green-600 mr-3 text-2xl"></i>
                <span>吏???占쏀빆</span>
                <span class="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_visa" name="support_items[]" value="visa" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_visa" class="ml-3">
                    <div class="font-medium text-gray-900">E-7-4 鍮꾩옄 ?占쎌껌 ?占쎌“</div>
                    <div class="text-sm text-gray-500">鍮꾩옄 ?占쎌껌 占?痍⑤뱷 吏??/div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_education" name="support_items[]" value="korean_education" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_education" class="ml-3">
                    <div class="font-medium text-gray-900">?占쎈궡 ?占쎄뎅??援먯쑁 吏??/div>
                    <div class="text-sm text-gray-500">?占쎄뎅??援먯쑁 ?占쎈줈洹몃옩 ?占쎄났</div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_mentoring" name="support_items[]" value="mentoring" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_mentoring" class="ml-3">
                    <div class="font-medium text-gray-900">硫섑넗占??占쎈줈洹몃옩 ?占쎌쁺</div>
                    <div class="text-sm text-gray-500">1:1 硫섑넗占?吏??/div>
                  </label>
                </div>

                <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input type="checkbox" id="support_accommodation" name="support_items[]" value="accommodation" class="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <label for="support_accommodation" class="ml-3">
                    <div class="font-medium text-gray-900">?占쎌냼 吏???占쎈뒗 二쇨굅占?蹂댁“</div>
                    <div class="text-sm text-gray-500">二쇨굅 愿??吏??/div>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. 梨꾩슜 ?占쎌젙 (NEW!) */}
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-orange-500">
              <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
                <i class="fas fa-calendar-check text-orange-600 mr-3 text-2xl"></i>
                <span>梨꾩슜 ?占쎌젙</span>
                <span class="ml-3 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">NEW</span>
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label for="schedule_document" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-file-alt text-orange-500 mr-2"></i>?占쎈쪟?占쏀삎
                  </label>
                  <input 
                    type="text" 
                    id="schedule_document" 
                    name="schedule_document" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? 援먯쑁 ?占쎈즺 ??1占??占쎈궡"
                  />
                </div>

                <div>
                  <label for="schedule_interview" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-comments text-orange-500 mr-2"></i>硫댁젒?占쏀삎
                  </label>
                  <input 
                    type="text" 
                    id="schedule_interview" 
                    name="schedule_interview" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? ?占쎈쪟?占쎄꺽???占??
                  />
                </div>

                <div>
                  <label for="schedule_final" class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-check-circle text-orange-500 mr-2"></i>理쒖쥌?占쎄꺽 ?占쎈낫
                  </label>
                  <input 
                    type="text" 
                    id="schedule_final" 
                    name="schedule_final" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="?? 硫댁젒 ??1占??占쎈궡 ?占쎈낫"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div class="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="button" 
                id="cancel-btn"
                class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <i class="fas fa-times mr-2"></i>痍⑥냼
              </button>
              <button 
                type="submit"
                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-save mr-2"></i>?占?占쏀븯占?              </button>
            </div>
          </form>
        </div>
      </main>

      {/* JavaScript */}
      <script dangerouslySetInnerHTML={{__html: `
        // ==================== 湲곗뾽 ?占쎈줈??JavaScript ====================
        
        let companyProfile = null;
        
        // ?占쎌씠吏 濡쒕뱶
        document.addEventListener('DOMContentLoaded', async () => {
          await loadCompanyProfile();
          setupTabs();
          setupForm();
          setupOtherPositionCheckbox();
          setupOtherVisaCheckbox();
        });
        
        // ???占쎌젙
        function setupTabs() {
          const viewTab = document.getElementById('tab-view');
          const editTab = document.getElementById('tab-edit');
          const viewSection = document.getElementById('view-section');
          const editSection = document.getElementById('edit-section');
          
          viewTab.addEventListener('click', () => {
            viewTab.classList.add('border-purple-600', 'text-purple-600');
            viewTab.classList.remove('border-transparent', 'text-gray-500');
            editTab.classList.remove('border-purple-600', 'text-purple-600');
            editTab.classList.add('border-transparent', 'text-gray-500');
            
            viewSection.classList.remove('hidden');
            editSection.classList.add('hidden');
          });
          
          editTab.addEventListener('click', () => {
            editTab.classList.add('border-purple-600', 'text-purple-600');
            editTab.classList.remove('border-transparent', 'text-gray-500');
            viewTab.classList.remove('border-purple-600', 'text-purple-600');
            viewTab.classList.add('border-transparent', 'text-gray-500');
            
            editSection.classList.remove('hidden');
            viewSection.classList.add('hidden');
          });
        }
        
        // '湲곤옙?' 吏곸쥌 泥댄겕諛뺤뒪 ?占쎌젙
        function setupOtherPositionCheckbox() {
          const otherCheckbox = document.getElementById('pos_other');
          const otherText = document.getElementById('pos_other_text');
          
          if (otherCheckbox && otherText) {
            otherCheckbox.addEventListener('change', (e) => {
              if (e.target.checked) {
                otherText.focus();
              } else {
                otherText.value = '';
              }
            });
            
            otherText.addEventListener('input', (e) => {
              if (e.target.value) {
                otherCheckbox.checked = true;
              }
            });
          }
        }
        
        // '湲곤옙?' 鍮꾩옄 泥댄겕諛뺤뒪 ?占쎌젙
        function setupOtherVisaCheckbox() {
          const otherCheckbox = document.getElementById('visa_other');
          const otherText = document.getElementById('visa_other_text');
          
          if (otherCheckbox && otherText) {
            otherCheckbox.addEventListener('change', (e) => {
              if (e.target.checked) {
                otherText.focus();
              } else {
                otherText.value = '';
              }
            });
            
            otherText.addEventListener('input', (e) => {
              if (e.target.value) {
                otherCheckbox.checked = true;
              }
            });
          }
        }
        
        // 湲곗뾽 ?占쎈줈??濡쒕뱶
        async function loadCompanyProfile() {
          try {
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              headers: {
                'Authorization': 'Bearer ' + token
              }
            });
            
            const result = await response.json();
            console.log('湲곗뾽 ?占쎈줈??', result);
            
            if (result.success && result.profile) {
              companyProfile = result.profile;
              displayCompanyProfile(result.profile);
              fillEditForm(result.profile);
              calculateCompleteness(result.profile);
            } else {
              document.getElementById('view-section').innerHTML = \`
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-4"></i>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">?占쎈줈???占쎈낫媛 ?占쎌뒿?占쎈떎</h3>
                      <p class="text-gray-600">채용 정보를 포함한 상세 기업 프로필을 관리하세요</p>
                    </div>
                  </div>
                </div>
              \`;
            }
          } catch (error) {
            console.error('?占쎈줈??濡쒕뱶 ?占쏀뙣:', error);
            document.getElementById('view-section').innerHTML = \`
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center">
                  <i class="fas fa-times-circle text-red-500 text-2xl mr-4"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">?占쎈쪟 諛쒖깮</h3>
                    <p class="text-gray-600">채용 정보를 포함한 상세 기업 프로필을 관리하세요</p>
                  </div>
                </div>
              </div>
            \`;
          }
        }
        
        // ?占쎈줈???占쎌꽦??怨꾩궛
        function calculateCompleteness(profile) {
          const requiredFields = [
            'company_name', 'representative_name', 'business_number', 
            'phone', 'address', 'recruitment_count', 'minimum_salary'
          ];
          const optionalFields = [
            'industry', 'company_size', 'website', 'founded_year', 
            'description', 'recruitment_positions', 'employment_types',
            'required_qualifications', 'support_items', 'visa_types'
          ];
          
          let filledRequired = 0;
          let filledOptional = 0;
          
          requiredFields.forEach(field => {
            if (profile[field] && profile[field] !== '' && profile[field] !== 0) {
              filledRequired++;
            }
          });
          
          optionalFields.forEach(field => {
            if (profile[field]) {
              if (typeof profile[field] === 'string' && profile[field] !== '' && profile[field] !== '[]' && profile[field] !== '{}') {
                filledOptional++;
              } else if (typeof profile[field] === 'object' && Object.keys(profile[field]).length > 0) {
                filledOptional++;
              }
            }
          });
          
          const totalFields = requiredFields.length + optionalFields.length;
          const totalFilled = filledRequired + filledOptional;
          const percentage = Math.round((totalFilled / totalFields) * 100);
          
          const completenessDiv = document.getElementById('profile-completeness');
          const percentSpan = document.getElementById('completeness-percent');
          
          if (completenessDiv && percentSpan) {
            completenessDiv.classList.remove('hidden');
            percentSpan.textContent = percentage;
            
            // ?占쎌긽 蹂占?            if (percentage < 50) {
              completenessDiv.className = 'px-4 py-2 bg-red-50 rounded-lg';
              percentSpan.className = 'text-sm font-medium text-red-700';
            } else if (percentage < 80) {
              completenessDiv.className = 'px-4 py-2 bg-yellow-50 rounded-lg';
              percentSpan.className = 'text-sm font-medium text-yellow-700';
            } else {
              completenessDiv.className = 'px-4 py-2 bg-green-50 rounded-lg';
              percentSpan.className = 'text-sm font-medium text-green-700';
            }
          }
        }
        
        // ?占쎈줈???占쎌떆 (怨꾩냽)
        function displayCompanyProfile(profile) {
          const viewSection = document.getElementById('view-section');
          
          // 湲곕낯 ?占쎈낫
          let basicInfoHtml = \`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span class="text-gray-600">?占쎌껜占?</span> <span class="font-medium">\${profile.company_name || '-'}</span></div>
              <div><span class="text-gray-600">?占?占쎌옄:</span> <span class="font-medium">\${profile.representative_name || '-'}</span> <span class="text-xs text-blue-600">NEW</span></div>
              <div><span class="text-gray-600">?占쎌뾽?占쎈벑濡앸쾲??</span> <span class="font-medium">\${profile.business_number || '-'}</span></div>
              <div><span class="text-gray-600">?占쏀솕踰덊샇:</span> <span class="font-medium">\${profile.phone || '-'}</span></div>
              <div class="md:col-span-2"><span class="text-gray-600">二쇱냼:</span> <span class="font-medium">\${profile.address || '-'}</span></div>
              <div><span class="text-gray-600">?占쎌쥌:</span> <span class="font-medium">\${profile.industry || '-'}</span></div>
              <div><span class="text-gray-600">湲곗뾽 洹쒕え:</span> <span class="font-medium">\${formatCompanySize(profile.company_size)}</span></div>
              <div><span class="text-gray-600">?占쎌궗?占쏀듃:</span> <span class="font-medium">\${profile.website ? \`<a href="\${profile.website}" target="_blank" class="text-blue-600 hover:underline">\${profile.website}</a>\` : '-'}</span></div>
              <div><span class="text-gray-600">?占쎈┰ ?占쎈룄:</span> <span class="font-medium">\${profile.founded_year || '-'}</span></div>
            </div>
            \${profile.description ? \`
              <div class="mt-4 pt-4 border-t">
                <div class="text-gray-600 mb-2">湲곗뾽 ?占쎄컻:</div>
                <div class="text-gray-800">\${profile.description}</div>
              </div>
            \` : ''}
          \`;
          
          // 梨꾩슜 ?占쎈낫 (NEW)
          let recruitmentInfoHtml = '';
          if (profile.recruitment_count || profile.recruitment_positions) {
            const positions = parseJSON(profile.recruitment_positions) || [];
            const employmentTypes = parseJSON(profile.employment_types) || [];
            const qualifications = parseJSON(profile.required_qualifications) || {};
            const visaTypes = parseJSON(profile.visa_types) || [];
            
            recruitmentInfoHtml = \`
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <i class="fas fa-user-tie text-blue-600 mr-3"></i>
                  梨꾩슜 ?占쎈낫
                  <span class="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="text-gray-600">梨꾩슜 ?占쎌썝:</span> 
                    <span class="font-medium text-blue-600">\${profile.recruitment_count || 0}占?/span>
                  </div>
                  <div>
                    <span class="text-gray-600">理쒖냼 ?占쎈큺:</span> 
                    <span class="font-medium text-green-600">\${profile.minimum_salary || 0}留뚯썝 ?占쎌긽</span>
                  </div>
                  \${positions.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">梨꾩슜 吏곸쥌:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${positions.map(p => \`<span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">\${p}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${visaTypes.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">鍮꾩옄 醫낅쪟:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${visaTypes.map(v => \`<span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">\${v}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${employmentTypes.length > 0 ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">洹쇰Т ?占쏀깭:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${employmentTypes.map(t => \`<span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">\${t}</span>\`).join('')}
                      </div>
                    </div>
                  \` : ''}
                  \${qualifications.certification || qualifications.degree || qualifications.korean ? \`
                    <div class="md:col-span-2">
                      <span class="text-gray-600">?占쎌닔 ?占쎄꺽:</span>
                      <div class="flex flex-wrap gap-2 mt-2">
                        \${qualifications.certification ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.certification}</span>\` : ''}
                        \${qualifications.degree ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.degree}</span>\` : ''}
                        \${qualifications.korean ? \`<span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">\${qualifications.korean}</span>\` : ''}
                      </div>
                    </div>
                  \` : ''}
                </div>
              </div>
            \`;
          }
          
          // 吏???占쏀빆 (NEW)
          let supportInfoHtml = '';
          if (profile.support_items) {
            const supportItems = parseJSON(profile.support_items) || {};
            const hasSupport = Object.values(supportItems).some(v => v);
            
            if (hasSupport) {
              supportInfoHtml = \`
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-hands-helping text-green-600 mr-3"></i>
                    吏???占쏀빆
                    <span class="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">NEW</span>
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    \${supportItems.visa ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>E-7-4 鍮꾩옄 ?占쎌껌 ?占쎌“</span>
                      </div>
                    \` : ''}
                    \${supportItems.korean_education ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>?占쎈궡 ?占쎄뎅??援먯쑁 吏??/span>
                      </div>
                    \` : ''}
                    \${supportItems.mentoring ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>硫섑넗占??占쎈줈洹몃옩 ?占쎌쁺</span>
                      </div>
                    \` : ''}
                    \${supportItems.accommodation ? \`
                      <div class="flex items-center p-3 bg-green-50 rounded-lg">
                        <i class="fas fa-check-circle text-green-600 mr-3"></i>
                        <span>?占쎌냼 吏???占쎈뒗 二쇨굅占?蹂댁“</span>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`;
            }
          }
          
          // 梨꾩슜?占쎌젙 ?占쎈뱶 ??占쏙옙??(2025-11-19)
          let scheduleInfoHtml = '';
          
          viewSection.innerHTML = \`
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-building text-purple-600 mr-3"></i>
                湲곕낯 ?占쎈낫
              </h3>
              \${basicInfoHtml}
            </div>
            \${recruitmentInfoHtml}
            \${supportInfoHtml}
            \${scheduleInfoHtml}
          \`;
        }
        
        // JSON ?占쎌떛 ?占쏀띁
        function parseJSON(str) {
          try {
            return typeof str === 'string' ? JSON.parse(str) : str;
          } catch (e) {
            return null;
          }
        }
        
        // 湲곗뾽 洹쒕え ?占쎈㎎
        function formatCompanySize(size) {
          const sizes = {
            'startup': '?占쏙옙??占쎌뾽 (1-10占?',
            'small': '?占쎄린??(11-50占?',
            'medium': '以묎린??(51-200占?',
            'large': '?占쎄린??(201占??占쎌긽)'
          };
          return sizes[size] || '-';
        }
        
        // ??梨꾩슦占?        function fillEditForm(profile) {
          // 湲곕낯 ?占쎈낫
          document.getElementById('company_name').value = profile.company_name || '';
          document.getElementById('representative_name').value = profile.representative_name || '';
          document.getElementById('business_number').value = profile.business_number || '';
          document.getElementById('phone').value = profile.phone || '';
          // 二쇱냼 ?占쎌떛 (?占쎌떇: [?占쏀렪踰덊샇] 二쇱냼 ?占쎌꽭二쇱냼)
          const fullAddress = profile.address || '';
          const postcodeMatch = fullAddress.match(/\[(\d{5})\]/);
          const postcode = postcodeMatch ? postcodeMatch[1] : '';
          let addressWithoutPostcode = fullAddress.replace(/\[\d{5}\]\s*/, '');
          
          // 留덌옙?占?怨듬갚??湲곤옙??占쎈줈 ?占쎌꽭二쇱냼 遺꾨━ (媛꾨떒??諛⑸쾿)
          const lastSpaceIndex = addressWithoutPostcode.lastIndexOf(' ');
          let mainAddress = addressWithoutPostcode;
          let detailAddress = '';
          
          if (lastSpaceIndex > 0 && addressWithoutPostcode.length - lastSpaceIndex < 50) {
            mainAddress = addressWithoutPostcode.substring(0, lastSpaceIndex);
            detailAddress = addressWithoutPostcode.substring(lastSpaceIndex + 1);
          }
          
          document.getElementById('postcode').value = postcode;
          document.getElementById('address').value = mainAddress;
          document.getElementById('detailAddress').value = detailAddress;
          document.getElementById('industry').value = profile.industry || '';
          document.getElementById('company_size').value = profile.company_size || '';
          document.getElementById('website').value = profile.website || '';
          document.getElementById('founded_year').value = profile.founded_year || '';
          document.getElementById('description').value = profile.description || '';
          
          // 梨꾩슜 ?占쎈낫
          document.getElementById('recruitment_count').value = profile.recruitment_count || '';
          document.getElementById('minimum_salary').value = profile.minimum_salary || '';
          
          // 梨꾩슜 吏곸쥌
          const positions = parseJSON(profile.recruitment_positions) || [];
          positions.forEach(pos => {
            const checkbox = document.querySelector(\`input[name="recruitment_positions[]"][value="\${pos}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 洹쇰Т ?占쏀깭
          const employmentTypes = parseJSON(profile.employment_types) || [];
          employmentTypes.forEach(type => {
            const checkbox = document.querySelector(\`input[name="employment_types[]"][value="\${type}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // ?占쎌닔 ?占쎄꺽
          const qualifications = parseJSON(profile.required_qualifications) || {};
          if (qualifications) {
            Object.values(qualifications).forEach(qual => {
              const checkbox = document.querySelector(\`input[name="qualifications[]"][value="\${qual}"]\`);
              if (checkbox) checkbox.checked = true;
            });
          }
          
          // 吏???占쏀빆
          const supportItems = parseJSON(profile.support_items) || {};
          Object.keys(supportItems).forEach(key => {
            if (supportItems[key]) {
              const checkbox = document.querySelector(\`input[name="support_items[]"][value="\${key}"]\`);
              if (checkbox) checkbox.checked = true;
            }
          });
          
          // 鍮꾩옄 醫낅쪟
          const visaTypes = parseJSON(profile.visa_types) || [];
          visaTypes.forEach(visa => {
            const checkbox = document.querySelector(\`input[name="visa_types[]"][value="\${visa}"]\`);
            if (checkbox) checkbox.checked = true;
          });
          
          // 梨꾩슜 ?쇱젙
          const schedule = parseJSON(profile.recruitment_schedule) || {};
          if (document.getElementById('schedule_document')) {
            document.getElementById('schedule_document').value = schedule.document || '';
          }
          if (document.getElementById('schedule_interview')) {
            document.getElementById('schedule_interview').value = schedule.interview || '';
          }
          if (document.getElementById('schedule_final')) {
            document.getElementById('schedule_final').value = schedule.final || '';
          }
        }
        
        // ???占쎌젙
        function setupForm() {
          const form = document.getElementById('company-profile-form');
          const cancelBtn = document.getElementById('cancel-btn');
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfile();
          });
          
          cancelBtn.addEventListener('click', () => {
            if (companyProfile) {
              fillEditForm(companyProfile);
            } else {
              form.reset();
            }
            // 蹂닿린 ??占쏙옙占??占쏀솚
            document.getElementById('tab-view').click();
          });
        }
        
        // ?占쎈줈???占??        async function saveProfile() {
          try {
            const formData = new FormData(document.getElementById('company-profile-form'));
            
            // 梨꾩슜 吏곸쥌 (諛곗뿴)
            const positions = [];
            document.querySelectorAll('input[name="recruitment_positions[]"]:checked').forEach(cb => {
              positions.push(cb.value);
            });
            // '湲곤옙?' 吏곸쥌 異뷂옙?
            const otherPosition = document.getElementById('pos_other_text').value;
            if (otherPosition && document.getElementById('pos_other').checked) {
              positions.push(otherPosition);
            }
            
            // 洹쇰Т ?占쏀깭 (諛곗뿴)
            const employmentTypes = [];
            document.querySelectorAll('input[name="employment_types[]"]:checked').forEach(cb => {
              employmentTypes.push(cb.value);
            });
            
            // ?占쎌닔 ?占쎄꺽 (媛앹껜)
            const qualifications = {};
            document.querySelectorAll('input[name="qualifications[]"]:checked').forEach(cb => {
              if (cb.value.includes('ACU')) qualifications.certification = cb.value;
              if (cb.value.includes('?占쎌궗')) qualifications.degree = cb.value;
              if (cb.value.includes('?占쎄뎅??)) qualifications.korean = cb.value;
            });
            
            // 吏???占쏀빆 (媛앹껜)
            const supportItems = {};
            document.querySelectorAll('input[name="support_items[]"]:checked').forEach(cb => {
              supportItems[cb.value] = true;
            });
            
            // 鍮꾩옄 醫낅쪟 (諛곗뿴)
            const visaTypes = [];
            document.querySelectorAll('input[name="visa_types[]"]:checked').forEach(cb => {
              visaTypes.push(cb.value);
            });
            // '湲곤옙?' 鍮꾩옄 異뷂옙?
            const otherVisa = document.getElementById('visa_other_text').value;
            if (otherVisa && document.getElementById('visa_other').checked) {
              visaTypes.push(otherVisa);
            }
            
            const postcode = formData.get('postcode') || '';
            const address = formData.get('address') || '';
            const detailAddress = formData.get('detailAddress') || '';
            const fullAddress = '[' + postcode + '] ' + address + ' ' + detailAddress;
            
            // 梨꾩슜 ?쇱젙 (媛앹껜)
            const recruitmentSchedule = {
              document: formData.get('schedule_document') || '',
              interview: formData.get('schedule_interview') || '',
              final: formData.get('schedule_final') || ''
            };
            
            const data = {
              company_name: formData.get('company_name'),
              representative_name: formData.get('representative_name'),
              business_number: formData.get('business_number'),
              phone: formData.get('phone'),
              address: fullAddress.trim(),
              industry: formData.get('industry'),
              company_size: formData.get('company_size'),
              website: formData.get('website'),
              founded_year: formData.get('founded_year'),
              description: formData.get('description'),
              recruitment_count: parseInt(formData.get('recruitment_count')) || 0,
              minimum_salary: parseInt(formData.get('minimum_salary')) || 0,
              recruitment_positions: JSON.stringify(positions),
              employment_types: JSON.stringify(employmentTypes),
              required_qualifications: JSON.stringify(qualifications),
              support_items: JSON.stringify(supportItems),
              visa_types: JSON.stringify(visaTypes),
              recruitment_schedule: JSON.stringify(recruitmentSchedule)
            };
            
            console.log('?占?占쏀븷 ?占쎌씠??', data);
            
            const token = localStorage.getItem('wowcampus_token');
            const response = await fetch('/api/profile/company', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
              if (window.toast) {
                window.toast.success('?占쎈줈?占쎌씠 ?占?占쎈릺?占쎌뒿?占쎈떎');
              } else {
                alert('?占쎈줈?占쎌씠 ?占?占쎈릺?占쎌뒿?占쎈떎');
              }
              await loadCompanyProfile();
              document.getElementById('tab-view').click();
            } else {
              throw new Error(result.message || '?占???占쏀뙣');
            }
          } catch (error) {
            console.error('?占???占쎈쪟:', error);
            if (window.toast) {
              window.toast.error('?占??占??占쎈쪟媛 諛쒖깮?占쎌뒿?占쎈떎: ' + error.message);
            } else {
              alert('?占??占??占쎈쪟媛 諛쒖깮?占쎌뒿?占쎈떎: ' + error.message);
            }
          }
        }
        
        // Daum ?占쏀렪踰덊샇 API ?占쏀뻾
        function execDaumPostcode() {
          new daum.Postcode({
            oncomplete: function(data) {
              // ?占쏀렪踰덊샇?占?二쇱냼 ?占쎈낫占??占쎈젰
              document.getElementById('postcode').value = data.zonecode;
              
              let addr = ''; // 二쇱냼 蹂??              
              // ?占쎌슜?占쏙옙? ?占쏀깮??二쇱냼 ?占?占쎌뿉 ?占쎈씪 ?占쎈떦 二쇱냼 媛믪쓣 媛?占쎌삩??              if (data.userSelectedType === 'R') { // ?占쎈줈占?二쇱냼
                addr = data.roadAddress;
              } else { // 吏占?二쇱냼
                addr = data.jibunAddress;
              }
              
              // 二쇱냼 ?占쎈낫占??占쎈떦 ?占쎈뱶???占쎈뒗??              document.getElementById('address').value = addr;
              
              // 而ㅼ꽌占??占쎌꽭二쇱냼 ?占쎈뱶占??占쎈룞
              document.getElementById('detailAddress').focus();
            }
          }).open();
        }
      `}} />
      
      {/* Daum ?占쏀렪踰덊샇 ?占쎈퉬???占쏀겕由쏀듃 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    </div>
  )
}
