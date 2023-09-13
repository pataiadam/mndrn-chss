import { describe, expect, it } from 'bun:test'
import {request} from "../request";

describe('Elysia', () => {
  it('return a response', async () => {
    const response = await request('/games');
    expect(response.success).toBe(true)
  })
})
