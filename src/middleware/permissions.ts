// Permissions middleware for WOW-CAMPUS Work Platform
// 사용자별 페이지 접근 권한 및 기능 제어

import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';

// 권한 매트릭스 정의
export const PERMISSIONS = {
  guest: {
    pages: ['/', '/jobs', '/study', '/terms', '/privacy', '/cookies', '/matching'],
    actions: ['view_jobs', 'view_study_info', 'view_public_matching']
  },
  jobseeker: {
    pages: ['/', '/jobs', '/study', '/jobseekers', '/matching', '/profile', '/terms', '/privacy', '/cookies'],
    actions: ['view_jobs', 'apply_job', 'manage_profile', 'view_matches', 'use_matching_system']
  },
  company: {
    pages: ['/', '/jobs', '/jobseekers', '/matching', '/profile', '/terms', '/privacy', '/cookies'],
    actions: ['view_jobseekers', 'post_jobs', 'manage_jobs', 'view_applicants', 'use_matching_system']
  },
  agent: {
    pages: ['/', '/jobs', '/jobseekers', '/agents', '/matching', '/profile', '/terms', '/privacy', '/cookies'],
    actions: ['view_jobs', 'view_jobseekers', 'manage_clients', 'facilitate_matching', 'use_matching_system']
  },
  admin: {
    pages: ['*'], // 모든 페이지 접근 가능
    actions: ['*'], // 모든 액션 가능
    adminOnly: ['/statistics', '/admin', '/user-management']
  }
} as const;

// 페이지 접근 권한 검증 미들웨어
export const checkPageAccess = (requiredPage: string) =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    const user = c.get('user');
    const userType = user?.user_type || 'guest';
    
    // 관리자는 모든 페이지 접근 가능
    if (userType === 'admin') {
      await next();
      return;
    }
    
    // 관리자 전용 페이지 체크
    const adminOnlyPages = ['/statistics', '/admin', '/user-management'];
    if (adminOnlyPages.includes(requiredPage) && userType !== 'admin') {
      throw new HTTPException(403, { 
        message: '관리자만 접근할 수 있는 페이지입니다. 관리자 계정으로 로그인해주세요.' 
      });
    }
    
    // 일반 사용자 권한 체크
    const userPermissions = PERMISSIONS[userType as keyof typeof PERMISSIONS];
    if (!userPermissions) {
      throw new HTTPException(403, { message: '잘못된 사용자 유형입니다.' });
    }
    
    // '*' 권한이 있거나 특정 페이지가 허용되어 있는지 확인
    const hasAccess = userPermissions.pages.includes('*') || 
                     userPermissions.pages.includes(requiredPage);
    
    if (!hasAccess) {
      throw new HTTPException(403, { 
        message: `이 페이지에 접근할 권한이 없습니다. (${userType} 사용자)` 
      });
    }
    
    await next();
  });

// 특정 액션 권한 검증 미들웨어  
export const checkActionPermission = (requiredAction: string) =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    const user = c.get('user');
    const userType = user?.user_type || 'guest';
    
    // 관리자는 모든 액션 가능
    if (userType === 'admin') {
      await next();
      return;
    }
    
    const userPermissions = PERMISSIONS[userType as keyof typeof PERMISSIONS];
    if (!userPermissions) {
      throw new HTTPException(403, { message: '잘못된 사용자 유형입니다.' });
    }
    
    // '*' 권한이 있거나 특정 액션이 허용되어 있는지 확인
    const hasPermission = userPermissions.actions.includes('*') || 
                         userPermissions.actions.includes(requiredAction);
    
    if (!hasPermission) {
      throw new HTTPException(403, { 
        message: `이 작업을 수행할 권한이 없습니다. (${requiredAction})` 
      });
    }
    
    await next();
  });

// 관리자 전용 페이지 미들웨어
export const requireAdminPage = checkPageAccess('/statistics');

// 로그인 필수 페이지 미들웨어
export const requireLogin = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const user = c.get('user');
  
  if (!user) {
    throw new HTTPException(401, { 
      message: '로그인이 필요한 페이지입니다. 먼저 로그인해주세요.' 
    });
  }
  
  await next();
});

// 데이터 접근 권한 검증 (개인정보 보호)
export const checkDataAccess = (resourceType: 'jobseeker' | 'company' | 'job' | 'application') =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    const user = c.get('user');
    const resourceId = c.req.param('id');
    
    if (!user) {
      throw new HTTPException(401, { message: '로그인이 필요합니다.' });
    }
    
    // 관리자는 모든 데이터 접근 가능
    if (user.user_type === 'admin') {
      await next();
      return;
    }
    
    // 리소스 타입별 접근 권한 체크
    switch (resourceType) {
      case 'jobseeker':
        if (user.user_type !== 'jobseeker' && user.user_type !== 'company' && user.user_type !== 'agent') {
          throw new HTTPException(403, { message: '구직자 정보에 접근할 권한이 없습니다.' });
        }
        break;
        
      case 'company':
        if (user.user_type !== 'company' && user.user_type !== 'jobseeker') {
          throw new HTTPException(403, { message: '기업 정보에 접근할 권한이 없습니다.' });
        }
        break;
        
      case 'job':
        // 모든 로그인 사용자가 구인 정보 열람 가능
        break;
        
      case 'application':
        // 지원서는 해당 구직자나 채용 기업만 접근 가능 (추가 검증 필요)
        break;
    }
    
    await next();
  });

// 사용자별 맞춤 권한 정보 조회 함수
export function getUserPermissions(userType: string = 'guest') {
  const permissions = PERMISSIONS[userType as keyof typeof PERMISSIONS];
  if (!permissions) {
    return PERMISSIONS.guest;
  }
  return permissions;
}

// 페이지 접근 가능 여부 체크 함수
export function canAccessPage(userType: string = 'guest', page: string): boolean {
  const permissions = getUserPermissions(userType);
  
  // 관리자는 모든 페이지 접근 가능
  if (userType === 'admin') {
    return true;
  }
  
  // 관리자 전용 페이지 체크
  const adminOnlyPages = ['/statistics', '/admin', '/user-management'];
  if (adminOnlyPages.includes(page) && userType !== 'admin') {
    return false;
  }
  
  return permissions.pages.includes('*') || permissions.pages.includes(page);
}

// 액션 수행 가능 여부 체크 함수
export function canPerformAction(userType: string = 'guest', action: string): boolean {
  const permissions = getUserPermissions(userType);
  return permissions.actions.includes('*') || permissions.actions.includes(action);
}