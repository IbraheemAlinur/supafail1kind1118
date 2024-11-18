import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../userRepository';
import { supabase } from '../../client';

vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
      single: vi.fn()
    }))
  }
}));

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockUser, error: null })
      }));

      const result = await repository.findById('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ 
          data: null, 
          error: new Error('User not found')
        })
      }));

      await expect(repository.findById('123')).rejects.toThrow('User not found');
    });
  });

  // Add more test cases for other methods
});