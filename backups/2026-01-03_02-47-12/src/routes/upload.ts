import { Hono } from 'hono';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware } from '../middleware/auth';

const upload = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication to all routes
upload.use('*', authMiddleware);

// Helper to validate and upload file
async function uploadFileToR2(c: any, file: File, folder: string) {
  // Check R2
  if (!c.env.DOCUMENTS_BUCKET) {
    throw new Error('R2 configuration missing');
  }

  // Validate type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type');
  }

  // Validate size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (Max 10MB)');
  }

  // Generate filename
  const user = c.get('user');
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueFilename = `${user.id}/${folder}/${timestamp}_${sanitizedName}`;

  // Upload
  const arrayBuffer = await file.arrayBuffer();
  await c.env.DOCUMENTS_BUCKET.put(uniqueFilename, arrayBuffer, {
    httpMetadata: { contentType: file.type },
    customMetadata: {
      userId: user.id.toString(),
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    }
  });

  return uniqueFilename;
}

// Resume Upload
upload.post('/resume', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

    const formData = await c.req.formData();
    const file = formData.get('resume');

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, message: 'No file uploaded' }, 400);
    }

    const uniqueFilename = await uploadFileToR2(c, file, 'resumes');

    // Save to DB (Non-fatal)
    try {
      const db = c.env.DB;
      await db.prepare(`
        INSERT INTO documents (user_id, document_type, file_name, original_name, file_size, mime_type, storage_key, created_at)
        VALUES (?, 'resume', ?, ?, ?, ?, ?, datetime('now'))
      `).bind(user.id, uniqueFilename, file.name, file.size, file.type, uniqueFilename).run();
    } catch (e) {
      console.warn('[Upload API] DB insert failed (non-fatal):', e);
    }

    return c.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        filename: uniqueFilename,
        url: `/api/upload/${uniqueFilename}`,
        originalName: file.name
      }
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return c.json({
      success: false,
      message: error.message || 'Upload failed',
      error: String(error),
      cause: error.cause
    }, 500);
  }
});

// Portfolio Upload
upload.post('/portfolio', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

    const formData = await c.req.formData();
    const files = formData.getAll('portfolio'); // Handle multiple files

    if (!files || files.length === 0) {
      return c.json({ success: false, message: 'No files uploaded' }, 400);
    }

    const uploadedFiles = [];
    const db = c.env.DB;

    for (const entry of files) {
      if (entry instanceof File) {
        try {
          const uniqueFilename = await uploadFileToR2(c, entry, 'portfolios');

          // Save to DB (Non-fatal)
          try {
            await db.prepare(`
              INSERT INTO documents (user_id, document_type, file_name, original_name, file_size, mime_type, storage_key, created_at)
              VALUES (?, 'career', ?, ?, ?, ?, ?, datetime('now'))
            `).bind(user.id, uniqueFilename, entry.name, entry.size, entry.type, uniqueFilename).run();
          } catch (e) {
            console.warn('[Upload API] DB insert failed (non-fatal):', e);
          }

          uploadedFiles.push({
            filename: uniqueFilename,
            url: `/api/upload/${uniqueFilename}`,
            originalName: entry.name
          });
        } catch (e) {
          console.error(`Failed to upload one portfolio file: ${entry.name}`, e);
        }
      }
    }

    return c.json({
      success: true,
      message: 'Portfolio uploaded successfully',
      data: uploadedFiles
    });
  } catch (error: any) {
    console.error('Portfolio upload error:', error);
    return c.json({
      success: false,
      message: error.message || 'Upload failed',
      error: String(error),
      cause: error.cause
    }, 500);
  }
});

// Generic Document Upload (Certificate, etc)
upload.post('/document', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ success: false, message: 'Unauthorized' }, 401);

    const formData = await c.req.formData();
    const file = formData.get('document');
    const type = formData.get('type') as string;

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, message: 'No file uploaded' }, 400);
    }

    // Validate type matches DB constraint ('resume', 'career', 'certificate', 'other')
    // Map app.js types if necessary.
    // app.js sends 'certificate', 'career'.
    // If unknown, fallback to 'other'.
    let dbType = 'other';
    const validTypes = ['resume', 'career', 'certificate', 'other'];
    if (validTypes.includes(type)) dbType = type;

    const uniqueFilename = await uploadFileToR2(c, file, 'documents');

    // Save to DB (Non-fatal)
    try {
      const db = c.env.DB;
      await db.prepare(`
        INSERT INTO documents (user_id, document_type, file_name, original_name, file_size, mime_type, storage_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(user.id, dbType, uniqueFilename, file.name, file.size, file.type, uniqueFilename).run();
    } catch (e) {
      console.warn('[Upload API] DB insert failed (non-fatal):', e);
    }

    return c.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        filename: uniqueFilename,
        url: `/api/upload/${uniqueFilename}`,
        originalName: file.name
      }
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return c.json({
      success: false,
      message: error.message || 'Upload failed',
      error: String(error),
      cause: error.cause
    }, 500);
  }
});

// List files endpoint
upload.get('/list', async (c) => {
  try {
    // Check if R2 bucket is available
    if (!c.env.DOCUMENTS_BUCKET) {
      return c.json(
        {
          success: false,
          message: '파일 목록 조회 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.',
          error: 'R2_BUCKET_NOT_CONFIGURED',
        },
        503
      );
    }

    // Get user from context
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          message: '인증이 필요합니다.',
        },
        401
      );
    }

    // List files for user
    const prefix = `${user.id}/`;
    const listed = await c.env.DOCUMENTS_BUCKET.list({
      prefix,
    });

    const files = listed.objects.map((obj: any) => ({
      filename: obj.key,
      originalName: obj.customMetadata?.originalName || obj.key.split('/').pop(),
      size: obj.size,
      uploadedAt: obj.uploaded,
      url: `/api/upload/${obj.key}`,
    }));

    return c.json({
      success: true,
      data: {
        files,
        count: files.length,
      },
    });
  } catch (error) {
    console.error('File list error:', error);
    return c.json(
      {
        success: false,
        message: '파일 목록 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// File download endpoint
upload.get('/:filename{.+}', async (c) => {
  try {
    // Check if R2 bucket is available
    if (!c.env.DOCUMENTS_BUCKET) {
      return c.json(
        {
          success: false,
          message: '파일 다운로드 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.',
          error: 'R2_BUCKET_NOT_CONFIGURED',
        },
        503
      );
    }

    const filename = c.req.param('filename');

    // Get file from R2
    const object = await c.env.DOCUMENTS_BUCKET.get(filename);

    if (!object) {
      return c.json(
        {
          success: false,
          message: '파일을 찾을 수 없습니다.',
        },
        404
      );
    }

    // Return file with appropriate headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('File download error:', error);
    return c.json(
      {
        success: false,
        message: '파일 다운로드 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// Delete file endpoint
upload.delete('/:filename{.+}', async (c) => {
  try {
    // Check if R2 bucket is available
    if (!c.env.DOCUMENTS_BUCKET) {
      return c.json(
        {
          success: false,
          message: '파일 삭제 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.',
          error: 'R2_BUCKET_NOT_CONFIGURED',
        },
        503
      );
    }

    // Get user from context
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          success: false,
          message: '인증이 필요합니다.',
        },
        401
      );
    }

    const rawFilename = c.req.param('filename');
    const filename = decodeURIComponent(rawFilename);

    console.log(`[Upload API] DELETE request for file: ${filename}, user: ${user.id}`);

    // Check if file belongs to user
    // user.id might be number or string, ensure validation works
    const userIdPrefix = String(user.id);
    if (!filename.startsWith(`${userIdPrefix}/`)) {
      console.warn(`[Upload API] Unauthorized delete attempt. File: ${filename}, User: ${userIdPrefix}`);
      return c.json(
        {
          success: false,
          message: '이 파일을 삭제할 권한이 없습니다.',
        },
        403
      );
    }

    // Delete from R2
    try {
      console.log(`[Upload API] Deleting from R2: ${filename}`);
      await c.env.DOCUMENTS_BUCKET.delete(filename);
    } catch (r2Error) {
      console.error('[Upload API] R2 delete error:', r2Error);
      // R2 delete fails shouldn't necessarily block DB delete, but it's good to note.
      // throw r2Error; // Optionally rethrow if critical
    }

    // Delete from DB
    try {
      console.log(`[Upload API] Deleting from DB: ${filename}`);
      const dbResult = await c.env.DB.prepare('DELETE FROM documents WHERE storage_key = ?').bind(filename).run();
      console.log('[Upload API] DB delete result:', dbResult);
    } catch (dbError) {
      // DB 삭제 실패는 치명적이지 않음 (파일 목록은 R2 기준). 
      // 따라서 500 에러를 반환하지 않고 로그만 남기고 진행.
      console.error('[Upload API] DB delete warning (non-fatal):', dbError);
    }

    return c.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('File delete error:', error);
    return c.json(
      {
        success: false,
        message: '파일 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default upload;
