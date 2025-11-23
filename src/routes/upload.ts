import { Hono } from 'hono';
import type { Bindings, Variables } from '../types/env';
import { authMiddleware } from '../middleware/auth';

const upload = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply authentication to all routes
upload.use('*', authMiddleware);

// File upload endpoint
upload.post('/', async (c) => {
  try {
    // Check if R2 bucket is available
    if (!c.env.DOCUMENTS_BUCKET) {
      return c.json(
        {
          success: false,
          message: '파일 업로드 기능이 현재 사용 불가능합니다. R2 스토리지가 설정되지 않았습니다.',
          error: 'R2_BUCKET_NOT_CONFIGURED',
        },
        503
      );
    }

    // Get user from context (set by authMiddleware)
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

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          message: '파일을 찾을 수 없습니다.',
        },
        400
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return c.json(
        {
          success: false,
          message: '지원하지 않는 파일 형식입니다. 이미지(JPG, PNG, GIF, WebP) 또는 문서(PDF, DOC, DOCX)만 업로드 가능합니다.',
        },
        400
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json(
        {
          success: false,
          message: '파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.',
        },
        400
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/\s+/g, '_');
    const uniqueFilename = `${user.id}/${timestamp}_${sanitizedName}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.DOCUMENTS_BUCKET.put(uniqueFilename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        userId: user.id.toString(),
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    return c.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/api/upload/${uniqueFilename}`,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return c.json(
      {
        success: false,
        message: '파일 업로드 중 오류가 발생했습니다.',
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

    const filename = c.req.param('filename');

    // Check if file belongs to user
    if (!filename.startsWith(`${user.id}/`)) {
      return c.json(
        {
          success: false,
          message: '이 파일을 삭제할 권한이 없습니다.',
        },
        403
      );
    }

    // Delete from R2
    await c.env.DOCUMENTS_BUCKET.delete(filename);

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

// List user's files
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

    const files = listed.objects.map((obj) => ({
      filename: obj.key,
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

export default upload;
