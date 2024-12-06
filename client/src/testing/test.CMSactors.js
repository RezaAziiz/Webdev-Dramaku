// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import CmsActors from './CmsActors';  // Path to the CmsActors component
// import '@testing-library/jest-dom';

// beforeAll(() => {
//     global.fetch = jest.fn();
//   });
  
//   afterEach(() => {
//     jest.clearAllMocks();
//   });
  

//   test('filters actors based on search term', async () => {
//     const mockActorsData = [
//       { id: 51, actor_name: 'Actor 1', country: 'USA', birth_date: '1990-01-01' },
//       { id: 55, actor_name: 'Actor 2', country: 'UK', birth_date: '1995-01-01' },
//     ];
  
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       json: () => Promise.resolve(mockActorsData),
//     });
  
//     render(<CmsActors />);
  
//     // Wait for data to load
//     await waitFor(() => screen.getByText('Tom Holland'));
  
//     // Search for an actor
//     fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Tom Holland' } });
  
//     // Assert that only matching actor is displayed
//     expect(screen.getByText('Tom Holland')).toBeInTheDocument();
//     expect(screen.queryByText('Heny Cavill')).toBeNull();  // Actor 2 should not be visible
//   });
  