import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostRepository } from '../postRepository';
import { supabase } from '../../client';

vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      order: vi.fn()
    }))
  }
}));

describe('PostRepository', () => {
  let repository: PostRepository;

  beforeEach(() => {
    repository = new PostRepository();
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          id: '123',
          title: 'Test Post',
          description: 'Test Description',
          type: 'ask'
        }
      ];

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ 
          data: mockPosts, 
          error: null 
        })
      }));

      const result = await repository.findAll();
      expect(result).toEqual(mockPosts);
    });

    it('should apply filters when provided', async () => {
      const mockPosts = [
        {
          id: '123',
          title: 'Test Post',
          description: 'Test Description',
          type: 'ask'
        }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ 
          data: mockPosts, 
          error: null 
        })
      };

      vi.mocked(supabase.from).mockImplementationOnce(() => mockQuery);

      await repository.findAll({ type: 'ask', status: 'open' });

      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'ask');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'open');
    });
  });

  // Add more test cases for other methods
});