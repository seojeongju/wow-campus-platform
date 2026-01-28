
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Bindings, Variables } from '../types/env';

const documents = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 문서 업로드 API
documents.post('/upload', authMiddleware, async (c) => {
    const user = c.get('user');

    console.log('📤 문서 업로드 API 호출됨');
    console.log('👤 사용자 정보:', {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        user_type: user?.user_type
    });

    // 로그인한 모든 사용자 허용 (구직자, 기업, 에이전트, 관리자)
    if (!user) {
        console.error('❌ 로그인되지 않은 사용자');
        return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
    }

    try {
        const formData = await c.req.formData();
        console.log('📦 FormData 파싱 완료');

        const file = formData.get('file') as File;
        const documentType = formData.get('documentType') as string;
        const description = formData.get('description') as string || '';

        console.log('📄 업로드 요청 정보:', {
            hasFile: !!file,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type,
            documentType: documentType,
            description: description
        });

        if (!file) {
            console.error('❌ 파일이 FormData에 없음');
            return c.json({ success: false, message: '파일이 제공되지 않았습니다.' }, 400);
        }

        // 파일 크기 제한 (10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        console.log('📊 파일 크기 체크:', {
            size: file.size,
            maxSize: MAX_FILE_SIZE,
            sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });

        if (file.size > MAX_FILE_SIZE) {
            console.error('❌ 파일 크기 초과');
            return c.json({ success: false, message: '파일 크기는 10MB를 초과할 수 없습니다.' }, 400);
        }

        // 허용된 MIME 타입 체크
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];

        console.log('🔍 MIME 타입 체크:', {
            fileType: file.type,
            isAllowed: allowedTypes.includes(file.type)
        });

        if (!allowedTypes.includes(file.type)) {
            console.error('❌ 허용되지 않는 파일 형식:', file.type);
            return c.json({
                success: false,
                message: `허용되지 않는 파일 형식입니다. (${file.type})\nPDF, Word, 이미지 파일만 업로드 가능합니다.`
            }, 400);
        }

        // 파일명 생성 (중복 방지)
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop();
        const storageFileName = `${timestamp}_${randomStr}.${fileExt}`;

        console.log('📝 스토리지 파일명 생성:', storageFileName);

        // 파일 데이터 읽기
        const fileBuffer = await file.arrayBuffer();
        console.log('✅ 파일 데이터 읽기 완료:', fileBuffer.byteLength, 'bytes');

        // R2 버킷 사용 가능 여부 확인
        const hasR2 = !!c.env.DOCUMENTS_BUCKET;
        console.log('💾 스토리지 방식:', hasR2 ? 'R2 버킷' : 'Base64 DB 저장');

        let result;
        if (hasR2) {
            // R2 스토리지 사용
            const storageKey = `documents/${user.id}/${storageFileName}`;
            console.log('☁️ R2 업로드 시작:', storageKey);

            await c.env.DOCUMENTS_BUCKET.put(storageKey, fileBuffer, {
                httpMetadata: {
                    contentType: file.type,
                },
                customMetadata: {
                    originalName: file.name,
                    uploadedBy: user.id.toString(),
                    uploadDate: new Date().toISOString(),
                },
            });
            console.log('✅ R2 업로드 완료');

            // 데이터베이스에 메타데이터 저장 (R2 사용 시)
            console.log('💿 DB에 메타데이터 저장 중...');
            result = await c.env.DB.prepare(`
        INSERT INTO documents (
          user_id, document_type, file_name, original_name, 
          file_size, mime_type, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
                user.id,
                documentType,
                storageKey,  // storage_key를 file_name에 저장
                file.name,
                file.size,
                file.type,
                description
            ).run();
            console.log('✅ DB 저장 완료, document_id:', result.meta.last_row_id);
        } else {
            // Base64로 데이터베이스에 저장 (R2 없을 때)
            console.log('🔄 Base64 인코딩 중...');
            const base64Data = Buffer.from(fileBuffer).toString('base64');
            console.log('✅ Base64 인코딩 완료:', base64Data.length, 'chars');

            console.log('💿 DB에 파일 데이터 저장 중...');

            // file_data 컬럼이 있는지 먼저 확인
            try {
                result = await c.env.DB.prepare(`
          INSERT INTO documents (
            user_id, document_type, file_name, original_name, 
            file_size, mime_type, file_data, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
                    user.id,
                    documentType,
                    `base64_${storageFileName}`,  // file_name에 고유값 저장
                    file.name,
                    file.size,
                    file.type,
                    base64Data,
                    description
                ).run();
                console.log('✅ DB 저장 완료 (file_data 사용), document_id:', result.meta.last_row_id);
            } catch (error) {
                // file_data 컬럼이 없으면 기본 컬럼만 사용
                console.warn('⚠️ file_data 컬럼 없음, 메타데이터만 저장');
                result = await c.env.DB.prepare(`
          INSERT INTO documents (
            user_id, document_type, file_name, original_name, 
            file_size, mime_type, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
                    user.id,
                    documentType,
                    `base64_${storageFileName}`,
                    file.name,
                    file.size,
                    file.type,
                    description
                ).run();
                console.log('✅ DB 저장 완료 (메타데이터만), document_id:', result.meta.last_row_id);
            }
        }

        console.log('🎉 문서 업로드 성공!');

        // 리다이렉트 with success message
        return c.redirect('/dashboard/jobseeker/documents?success=1');

    } catch (error) {
        console.error('❌❌❌ 문서 업로드 오류 발생 ❌❌❌');
        console.error('오류 타입:', error?.constructor?.name);
        console.error('오류 메시지:', error instanceof Error ? error.message : String(error));
        console.error('전체 오류 객체:', error);
        if (error instanceof Error && error.stack) {
            console.error('스택 트레이스:', error.stack);
        }

        // 리다이렉트 with error message
        const errorMsg = encodeURIComponent(
            error instanceof Error ? error.message : '문서 업로드 중 오류가 발생했습니다.'
        );
        return c.redirect(`/dashboard/jobseeker/documents?error=${errorMsg}`);
    }
});

// 문서 목록 조회 API
documents.get('/', authMiddleware, async (c) => {
    const user = c.get('user');

    // 로그인한 모든 사용자 허용
    if (!user) {
        return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
    }

    try {
        const documents = await c.env.DB.prepare(`
      SELECT 
        id, document_type, file_name, original_name, 
        file_size, mime_type, upload_date, description, is_active
      FROM documents
      WHERE user_id = ? AND is_active = 1
      ORDER BY upload_date DESC
    `).bind(user.id).all();

        return c.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                user_type: user.user_type
            },
            documents: documents.results || []
        });

    } catch (error) {
        console.error('문서 목록 조회 오류:', error);
        return c.json({
            success: false,
            message: '문서 목록 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
});

// 문서 다운로드 API
documents.get('/:id/download', authMiddleware, async (c) => {
    const user = c.get('user');
    const documentId = c.req.param('id');

    // 로그인한 모든 사용자 허용
    if (!user) {
        return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
    }

    try {
        // 문서 정보 조회
        const document = await c.env.DB.prepare(`
      SELECT * FROM documents 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).bind(documentId, user.id).first();

        if (!document) {
            return c.json({ success: false, message: '문서를 찾을 수 없습니다.' }, 404);
        }

        // R2 또는 Base64에서 파일 가져오기
        let fileData;

        if (document.file_data) {
            // Base64에서 파일 가져오기
            const base64Data = document.file_data as string;
            const buffer = Buffer.from(base64Data, 'base64');
            fileData = buffer;
        } else if (c.env.DOCUMENTS_BUCKET && document.file_name) {
            // R2에서 파일 가져오기
            const storageKey = `documents/${user.id}/${document.file_name}`;
            const file = await c.env.DOCUMENTS_BUCKET.get(storageKey);

            if (!file) {
                return c.json({ success: false, message: '파일을 찾을 수 없습니다.' }, 404);
            }

            fileData = await file.arrayBuffer();
        } else {
            return c.json({
                success: false,
                message: '파일 데이터를 찾을 수 없습니다.'
            }, 404);
        }

        // 파일 다운로드 응답
        return new Response(fileData, {
            headers: {
                'Content-Type': document.mime_type as string,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(document.original_name as string)}"`,
                'Content-Length': document.file_size?.toString() || '0',
            },
        });

    } catch (error) {
        console.error('문서 다운로드 오류:', error);
        return c.json({
            success: false,
            message: '문서 다운로드 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
});

// 문서 삭제 핸들러 (공통 로직)
const handleDocumentDelete = async (c: any) => {
    const user = c.get('user');
    const documentId = c.req.param('id');

    // 로그인한 모든 사용자 허용
    if (!user) {
        return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
    }

    try {
        // 문서 소유권 확인
        const document = await c.env.DB.prepare(`
      SELECT id FROM documents 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `).bind(documentId, user.id).first();

        if (!document) {
            return c.json({ success: false, message: '문서를 찾을 수 없습니다.' }, 404);
        }

        // 소프트 삭제 (is_active = 0)
        await c.env.DB.prepare(`
      UPDATE documents 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(documentId, user.id).run();

        return { success: true };

    } catch (error) {
        console.error('문서 삭제 오류:', error);
        throw error;
    }
};

// DELETE 방식 (API용)
documents.delete('/:id', authMiddleware, async (c) => {
    try {
        await handleDocumentDelete(c);
        return c.json({
            success: true,
            message: '문서가 성공적으로 삭제되었습니다.'
        });
    } catch (error) {
        return c.json({
            success: false,
            message: '문서 삭제 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : String(error)
        }, 500);
    }
});

// POST 방식 (Form용)
documents.post('/:id/delete', authMiddleware, async (c) => {
    try {
        await handleDocumentDelete(c);
        return c.redirect('/dashboard/jobseeker/documents?success=delete');
    } catch (error) {
        const errorMsg = encodeURIComponent('문서 삭제 중 오류가 발생했습니다.');
        return c.redirect(`/dashboard/jobseeker/documents?error=${errorMsg}`);
    }
});

export default documents;
