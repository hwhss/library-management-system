import { describe, expect, it } from 'vitest'
import { getRouteAccessDecision } from './permission.js'

describe('route access decisions', () => {
  it('sends unauthenticated visitors to login', () => {
    expect(getRouteAccessDecision({ path: '/books', meta: { requiresAuth: true } }, null)).toEqual({ allow: false, redirect: '/login' })
  })

  it('sends authenticated visitors away from login', () => {
    expect(getRouteAccessDecision({ path: '/login', meta: { guestOnly: true } }, { role: 'admin' })).toEqual({ allow: false, redirect: '/dashboard' })
  })

  it('blocks a normal user from admin-only routes', () => {
    expect(getRouteAccessDecision({ path: '/books', meta: { requiresAuth: true, roles: ['admin'] } }, { role: 'user' })).toEqual({ allow: false, redirect: '/dashboard', message: '您无权限访问该页面' })
  })

  it('allows the role assigned to a protected route', () => {
    expect(getRouteAccessDecision({ path: '/profile', meta: { requiresAuth: true, roles: ['admin', 'user'] } }, { role: 'user' })).toEqual({ allow: true })
  })
})
