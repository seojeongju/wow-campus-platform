import { Hono } from 'hono'

const contact = new Hono()

// Contact form submission handler
contact.post('/submit', async (c) => {
  try {
    const body = await c.req.json()
    const { name, phone, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return c.json({ 
        success: false, 
        error: '필수 항목을 모두 입력해주세요.' 
      }, 400)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ 
        success: false, 
        error: '올바른 이메일 주소를 입력해주세요.' 
      }, 400)
    }

    // Get Resend API key from environment
    const resendApiKey = c.env?.RESEND_API_KEY
    
    // If no API key, log to console and return success (for testing)
    if (!resendApiKey) {
      console.log('=== Contact Form Submission (No Email API) ===')
      console.log('From:', name, '<' + email + '>')
      console.log('Phone:', phone || 'N/A')
      console.log('Subject:', subject)
      console.log('Message:', message)
      console.log('=====================================')
      
      return c.json({ 
        success: true, 
        message: '문의가 접수되었습니다. (이메일 API 미설정 - 콘솔 로그 확인)',
        debug: 'RESEND_API_KEY not configured'
      })
    }

    // Prepare email content for Resend
    const emailContent = {
      from: 'WOW-CAMPUS <noreply@w-campus.com>',
      to: ['wow3d16@naver.com'],
      reply_to: email,
      subject: `[WOW-CAMPUS 문의] ${subject}`,
      html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .label { font-weight: bold; color: #667eea; margin-bottom: 5px; display: block; }
                .value { color: #555; }
                .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin-top: 10px; white-space: pre-wrap; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; color: #6c757d; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 28px;">🔔 새로운 문의가 도착했습니다</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">WOW-CAMPUS 플랫폼</p>
                </div>
                <div class="content">
                  <div class="field">
                    <span class="label">👤 문의자 이름</span>
                    <span class="value">${name}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">📧 이메일</span>
                    <span class="value">${email}</span>
                  </div>
                  
                  ${phone ? `
                  <div class="field">
                    <span class="label">📱 연락처</span>
                    <span class="value">${phone}</span>
                  </div>
                  ` : ''}
                  
                  <div class="field">
                    <span class="label">📌 제목</span>
                    <span class="value"><strong>${subject}</strong></span>
                  </div>
                  
                  <div class="field">
                    <span class="label">💬 문의 내용</span>
                    <div class="message-box">${message}</div>
                  </div>
                  
                  <div class="footer">
                    <p><strong>(주)와우쓰리디</strong></p>
                    <p>서울시 마포구 독막로 93 상수빌딩 4층</p>
                    <p>📞 서울: 02-3144-3137 | 구미: 054-464-3137</p>
                    <p>📧 wow3d16@naver.com</p>
                    <p style="margin-top: 20px; font-size: 12px; color: #999;">
                      이 메일은 WOW-CAMPUS 플랫폼의 문의하기 폼을 통해 자동으로 발송되었습니다.
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', result)
      return c.json({ 
        success: false, 
        error: '메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        debug: result
      }, 500)
    }

    console.log('Email sent successfully:', result)
    
    return c.json({ 
      success: true, 
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return c.json({ 
      success: false, 
      error: '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.' 
    }, 500)
  }
})

export default contact
