export function getRouteAccessDecision(to, userInfo) {
  if (to.meta?.guestOnly && userInfo) {
    return { allow: false, redirect: '/dashboard' }
  }

  if (to.meta?.requiresAuth && !userInfo) {
    return { allow: false, redirect: '/login' }
  }

  if (to.meta?.roles && !to.meta.roles.includes(userInfo?.role)) {
    return { allow: false, redirect: '/dashboard', message: '您无权限访问该页面' }
  }

  return { allow: true }
}
