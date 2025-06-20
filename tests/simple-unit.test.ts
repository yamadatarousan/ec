// Simple unit test to verify Jest is working
describe('Jest Setup Test', () => {
  test('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  test('should handle async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })

  test('should mock functions', () => {
    const mockFn = jest.fn(() => 'mocked')
    expect(mockFn()).toBe('mocked')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})