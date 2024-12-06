import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MovieDetail from '../views/detail'; // Pastikan ini adalah komponen yang benar
import axios from 'axios';

// Mocking axios untuk mencegah permintaan HTTP yang sebenarnya
jest.mock('axios');

// Mocking localStorage untuk memastikan token tersedia
beforeAll(() => {
  // Set token di localStorage sebelum pengujian dimulai
  localStorage.setItem('token', 'mocked_token');
});

describe('CommentSection', () => {
  const mockMovie = {
    id: 1,
    comments: [],
  };

  it('should submit a valid comment', async () => {
    axios.post.mockResolvedValue({
      data: {
        comments: [
          { userName: 'Test User', text: 'Great movie!', rating: 5, createdAt: new Date().toISOString() },
        ],
      },
    }); // Mock response

    render(<MovieDetail movie={mockMovie} />); // Menggunakan MovieDetail yang benar

    // Interaksi dengan form komentar
    fireEvent.change(screen.getByPlaceholderText('Write your comment...'), {
      target: { value: 'Great movie!' },
    });

    // Rating
    const ratingStars = screen.getAllByRole('img'); // Jika rating menggunakan ikon gambar
    fireEvent.click(ratingStars[4]); // Klik bintang rating 5

    // Klik tombol submit
    fireEvent.click(screen.getByText('Submit'));

    // Memastikan axios dipanggil dengan benar
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3005/movies/1/comments',
        { commentText: 'Great movie!', rating: 5 },
        { headers: { Authorization: `Bearer mocked_token` } }
      )
    );

    // Memastikan input form di-reset setelah submit
    expect(screen.getByPlaceholderText('Write your comment...').value).toBe('');
    expect(screen.getByText('0')).toBeInTheDocument(); // Rating harus ter-reset
  });

  it('should show alert when comment or rating is not provided', () => {
    render(<MovieDetail movie={mockMovie} />);

    // Coba submit tanpa menulis komentar atau memberikan rating
    fireEvent.click(screen.getByText('Submit'));

    // Memastikan alert muncul
    expect(screen.getByText('Please provide a comment and a rating.')).toBeInTheDocument();
  });

  it('should show the comment form when "Add Comment" button is clicked', () => {
    render(<MovieDetail movie={mockMovie} />);

    // Pastikan form komentar tersembunyi pada awalnya
    expect(screen.queryByPlaceholderText('Write your comment...')).not.toBeInTheDocument();

    // Klik tombol "Add Comment"
    fireEvent.click(screen.getByText('Add Comment'));

    // Pastikan form komentar muncul
    expect(screen.getByPlaceholderText('Write your comment...')).toBeInTheDocument();
  });
});
