import { http, HttpResponse } from 'msw'

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// Mock user database
const mockUsers: any[] = []
let userIdCounter = 1

// Mock product database
const mockProducts = [
  {
    id: 1,
    name: 'Rolling Hardside Spinner Large',
    description: 'Durable hardside luggage with 360° spinner wheels. TSA-approved lock, expandable design, and scratch-resistant finish. Perfect for long trips.',
    price: 249.99,
    category: 'luggage',
    image_url: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800',
    stock: 25,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 2,
    name: 'Travel Backpack 40L',
    description: 'Versatile 40L travel backpack with laptop sleeve. Carry-on compliant size. Multiple access points and compression straps.',
    price: 119.99,
    category: 'bags',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    stock: 50,
    created_at: new Date('2024-01-02').toISOString(),
    updated_at: new Date('2024-01-02').toISOString(),
  },
  {
    id: 3,
    name: 'Travel Pillow Memory Foam',
    description: 'Ergonomic memory foam travel pillow with removable, washable cover. Provides neck support on planes, trains, and cars.',
    price: 29.99,
    category: 'travel_accessories',
    image_url: 'https://images.unsplash.com/photo-1545987796-b199d6abb1b4?w=800',
    stock: 80,
    created_at: new Date('2024-01-03').toISOString(),
    updated_at: new Date('2024-01-03').toISOString(),
  },
  {
    id: 4,
    name: 'Laptop Stand Portable Aluminum',
    description: 'Adjustable laptop stand folds flat for travel. Compatible with laptops up to 17 inches. Improves posture and airflow.',
    price: 49.99,
    category: 'digital_nomad',
    image_url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800',
    stock: 55,
    created_at: new Date('2024-01-04').toISOString(),
    updated_at: new Date('2024-01-04').toISOString(),
  },
]

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

  // Product Endpoints
  http.get('http://localhost:5001/api/products', async ({ request }) => {
    await sleep(500)

    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const sortBy = url.searchParams.get('sort_by') || 'created_at'
    const sortOrder = url.searchParams.get('sort_order') || 'desc'
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('page_size') || '12')

    let filteredProducts = [...mockProducts]

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    filteredProducts.sort((a: any, b: any) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    const total = filteredProducts.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

    return HttpResponse.json({
      products: paginatedProducts,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    })
  }),

  http.get('http://localhost:5001/api/products/:id', async ({ params }) => {
    await sleep(300)

    const productId = parseInt(params.id as string)
    const product = mockProducts.find((p) => p.id === productId)

    if (!product) {
      return HttpResponse.json(
        { detail: `Product with id ${productId} not found` },
        { status: 404 },
      )
    }

    return HttpResponse.json(product)
  }),
]
