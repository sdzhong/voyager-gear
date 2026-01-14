import { http, HttpResponse } from 'msw'

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Mock user database
const mockUsers: any[] = []
let userIdCounter = 1

export const handlers = [
  http.get('http://localhost:3000/api/doclist', async () => {
    const data: DocList = [
      { name: 'React', url: 'https://react.dev/' },
      { name: 'Vite', url: 'https://vitejs.dev/' },
      {
        name: 'React Router',
        url: 'https://reactrouter.com/en/main/start/overview',
      },
      { name: 'MSW', url: 'https://mswjs.io/' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
    ]

    await sleep(2000)

    return HttpResponse.json(data)
  }),

  // Auth Endpoints
  http.post('http://localhost:5001/api/auth/register', async ({ request }) => {
    await sleep(500)

    const body = (await request.json()) as any

    // Validate username
    if (body.username.length < 3) {
      return HttpResponse.json(
        { detail: 'Username must be at least 3 characters' },
        { status: 400 },
      )
    }

    // Check if username already exists
    if (mockUsers.find((u) => u.username === body.username)) {
      return HttpResponse.json({ detail: 'Username already taken' }, { status: 409 })
    }

    // Check if email already exists
    if (mockUsers.find((u) => u.email === body.email)) {
      return HttpResponse.json({ detail: 'Email already registered' }, { status: 409 })
    }

    // Create mock user
    const newUser = {
      id: userIdCounter++,
      username: body.username,
      email: body.email,
      password: body.password, // In mock, store plain password for testing
      is_active: true,
      is_verified: false,
      created_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return HttpResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        is_active: newUser.is_active,
        is_verified: newUser.is_verified,
        created_at: newUser.created_at,
      },
      { status: 201 },
    )
  }),

  http.post('http://localhost:5001/api/auth/login', async ({ request }) => {
    await sleep(500)

    const body = (await request.json()) as any

    // Find user by username or email
    const user = mockUsers.find(
      (u) => (u.username === body.username || u.email === body.username) && u.password === body.password,
    )

    if (!user) {
      return HttpResponse.json({ detail: 'Invalid username or password' }, { status: 400 })
    }

    // Generate mock JWT token
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`

    return HttpResponse.json({
      access_token: mockToken,
      token_type: 'bearer',
      expires_in: 1800,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    })
  }),

  http.get('http://localhost:5001/api/auth/me', async ({ request }) => {
    await sleep(300)

    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Extract user ID from mock token
    const tokenMatch = token.match(/mock-jwt-token-(\d+)-/)
    if (!tokenMatch) {
      return HttpResponse.json({ detail: 'Invalid token' }, { status: 401 })
    }

    const userId = parseInt(tokenMatch[1])
    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return HttpResponse.json({ detail: 'User not found' }, { status: 404 })
    }

    return HttpResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created_at: user.created_at,
    })
  }),

  http.post('http://localhost:5001/api/auth/logout', async () => {
    await sleep(200)
    return new HttpResponse(null, { status: 204 })
  }),
]
