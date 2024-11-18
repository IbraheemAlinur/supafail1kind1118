import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommunityRepository } from '../communityRepository';
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

describe('CommunityRepository', () => {
  let repository: CommunityRepository;

  beforeEach(() => {
    repository = new CommunityRepository();
  });

  describe('findAll', () => {
    it('should return all communities', async () => {
      const mockCommunities = [
        {
          id: '123',
          name: 'Test Community',
          description: 'Test Description'
        }
      ];

      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValueOnce({ 
          data: mockCommunities, 
          error: null 
        })
      }));

      const result = await repository.findAll();
      expect(result).toEqual(mockCommunities);
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValueOnce({ 
          data: null, 
          error: new Error('Failed to fetch communities')
        })
      }));

      await expect(repository.findAll()).rejects.toThrow('Failed to fetch communities');
    });
  });

  // Add more test cases for other methods
});