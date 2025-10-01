import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>WOW-CAMPUS Work Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            .container { max-width: 1200px; }
            .fade-in { animation: fadeIn 0.5s ease-in; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .hover-scale { transition: transform 0.2s; }
            .hover-scale:hover { transform: scale(1.02); }
          `
        }} />
      </head>
      <body class="bg-gray-50 text-gray-900">
        {children}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js?v=6"></script>
      </body>
    </html>
  )
})
