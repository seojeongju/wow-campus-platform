/**
 * Page Component
 * Route: /contact
 * Original: src/index.tsx lines 13317-13494
 */

import type { Context } from 'hono'

export function handler(c: Context) {
  const user = c.get('user');
  const { t } = c.get('i18n');

  return c.render(
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <a href="/home" class="flex items-center space-x-3">
              <img src="/images/logo.png" alt="WOW-CAMPUS" class="h-16 md:h-20 w-auto" />
            </a>
            <div class="flex items-center space-x-4">
              <a href="/support" class="text-gray-600 hover:text-blue-600">{t('contact.page.back_to_support')}</a>
              <a href="/home" class="text-blue-600 hover:text-blue-800">{t('contact.page.back_to_home')}</a>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">{t('contact.page.title')}</h1>
          <p class="text-gray-600 text-lg">{t('contact.page.subtitle')}</p>
        </div>

        <div class="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-bold mb-8">{t('contact.contact_info.title')}</h2>
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-envelope text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">{t('contact.contact_info.email.title')}</h3>
                    <p class="text-gray-600 mb-2">{t('contact.contact_info.email.address')}</p>
                    <p class="text-sm text-gray-500">{t('contact.contact_info.email.description')}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-phone text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">{t('contact.contact_info.phone.title')}</h3>
                    <div class="space-y-1 mb-2">
                      <p class="text-gray-600"><span class="font-medium text-gray-900">{t('contact.contact_info.phone.seoul')}:</span> {t('contact.contact_info.phone.seoul_number')}</p>
                      <p class="text-gray-600"><span class="font-medium text-gray-900">{t('contact.contact_info.phone.gumi')}:</span> {t('contact.contact_info.phone.gumi_number')}</p>
                    </div>
                    <p class="text-sm text-gray-500">{t('contact.contact_info.phone.hours')}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-sm">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-map-marker-alt text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-3">{t('contact.contact_info.office.title')}</h3>
                    <div class="space-y-3">
                      <div>
                        <p class="font-medium text-gray-900 mb-1">{t('contact.contact_info.office.seoul.name')}</p>
                        <p class="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: t('contact.contact_info.office.seoul.address') }}></p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">{t('contact.contact_info.office.gumi.name')}</p>
                        <p class="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: t('contact.contact_info.office.gumi.address') }}></p>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 mb-1">{t('contact.contact_info.office.jeonju.name')}</p>
                        <p class="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: t('contact.contact_info.office.jeonju.address') }}></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-2xl font-bold mb-8">{t('contact.form.title')}</h2>
            <form id="contact-form" class="bg-white p-8 rounded-lg shadow-sm space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.name.label')}</label>
                  <input type="text" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('contact.form.name.placeholder')} />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.phone.label')}</label>
                  <input type="tel" name="phone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('contact.form.phone.placeholder')} />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.email.label')}</label>
                <input type="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('contact.form.email.placeholder')} />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.category.label')}</label>
                <select name="category" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="general">{t('contact.form.category.options.general')}</option>
                  <option value="technical">{t('contact.form.category.options.technical')}</option>
                  <option value="partnership">{t('contact.form.category.options.partnership')}</option>
                  <option value="other">{t('contact.form.category.options.other')}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.subject.label')}</label>
                <input type="text" name="subject" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t('contact.form.subject.placeholder')} />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">{t('contact.form.message.label')}</label>
                <textarea name="message" required rows={6} class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder={t('contact.form.message.placeholder')}></textarea>
              </div>

              <div class="text-center">
                <button type="submit" id="submit-btn" class="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {t('contact.form.submit')}
                </button>
                <p class="text-sm text-gray-500 mt-3">{t('contact.form.response_time')}</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
        // Contact form submission
        (function() {
          const locale = window.locale || 'ko';
          const translations = window.translations || {};
          
          const t = (key) => {
            const keys = key.split('.');
            let value = translations[locale] || translations['ko'];
            for (const k of keys) {
              if (value && value[k] !== undefined) {
                value = value[k];
              } else {
                return key;
              }
            }
            return value || key;
          };
          
          document.getElementById('contact-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const form = e.target;
            const submitBtn = document.getElementById('submit-btn');
            const formData = new FormData(form);
            
            const data = {
              name: formData.get('name'),
              phone: formData.get('phone'),
              email: formData.get('email'),
              category: formData.get('category'),
              subject: formData.get('subject'),
              message: formData.get('message')
            };
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = t('contact.form.submitting');
            
            try {
              const response = await fetch('/api/contact/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              });
              
              const result = await response.json();
              
              if (result.success) {
                toast.success('✅ ' + (result.message || t('contact.messages.success')));
                form.reset();
              } else {
                toast.error('❌ ' + (result.error || t('contact.messages.error')));
              }
            } catch (error) {
              console.error('Contact form error:', error);
              toast.error('❌ ' + t('contact.messages.error_network'));
            } finally {
              submitBtn.disabled = false;
              submitBtn.textContent = t('contact.form.submit');
            }
          });
        })();
      `}} />
    </div>
  )
}
