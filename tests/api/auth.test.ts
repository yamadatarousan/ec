import { POST as loginHandler } from '@/app/api/auth/login/route'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { GET as meHandler } from '@/app/api/auth/me/route'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ userId: 'test-user-id', role: 'CUSTOMER' })),
}))

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    it('正しい認証情報でログインできる', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        role: 'CUSTOMER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      })
      expect(jwt.sign).toHaveBeenCalled()
    })

    it('間違ったパスワードでログイン失敗', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
        role: 'CUSTOMER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid credentials')
    })

    it('存在しないユーザーでログイン失敗', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await loginHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('POST /api/auth/register', () => {
    it('新規ユーザー登録ができる', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'CUSTOMER',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(newUser)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toEqual({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      })
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    })

    it('重複するメールアドレスで登録失敗', async () => {
      const existingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'CUSTOMER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User already exists')
    })
  })

  describe('GET /api/auth/me', () => {
    it('認証されたユーザー情報を取得できる', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'CUSTOMER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token',
        },
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toEqual(mockUser)
    })

    it('認証なしでアクセス拒否', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
      })

      const response = await meHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })
  })
})