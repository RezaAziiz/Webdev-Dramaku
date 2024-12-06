const request = require('supertest');
// const http = require('http');
// const app = require('./server'); // Path ke aplikasi Anda
const fs = require('fs'); // Untuk membaca file yang digunakan dalam tes
const path = require('path'); // Untuk path file
const { pool } = require('./db'); // Pastikan ini sesuai dengan cara Anda mengonfigurasi koneksi ke database
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken')
const dayjs = require('dayjs');
const { app } = require('./server');
const http = require('http');



let server;

beforeAll(() => {
  server = http.createServer(app).listen(4000); // Jalankan server di port 4000
});

afterAll(() => {
  server.close(); // Tutup server setelah pengujian selesai
});



jest.setTimeout(40000); // Set waktu tunggu Jest jika diperlukan

// test('should return a list of genres', async () => {
//   const response = await request(app).get('/api/genres'); // Mengirim permintaan ke endpoint

//   // Memastikan respons status 200
//   expect(response.status).toBe(200);
//   // Memastikan body respons terdefinisi
//   expect(response.body).toBeDefined();
//   // Memastikan bahwa body respons berisi array
//   expect(Array.isArray(response.body)).toBe(true);
//   // Memastikan ada setidaknya satu genre
//   expect(response.body.length).toBeGreaterThan(0);
// });

// test('should add a new genre with specific id', async () => {
//   const newGenre = { name: 'NTR' }; // Hapus 'id' karena id akan ditetapkan otomatis

//   const response = await request(app).post('/api/genres').send(newGenre);

//   expect(response.status).toBe(201);
//   expect(response.body).toBeDefined();
//   expect(response.body.name).toBe(newGenre.name);
//   // Memastikan bahwa id genre yang baru ditambahkan adalah id yang otomatis diberikan
//   expect(response.body.id).toBeDefined();
// });

// Tes untuk endpoint GET /actors
// test('should return a list of actors with country names', async () => {
//   const response = await request(app).get('/actors'); // Mengirim permintaan ke endpoint /actors

//   // Memastikan respons status 200
//   expect(response.status).toBe(200);
//   // Memastikan body respons terdefinisi
//   expect(response.body).toBeDefined();
//   // Memastikan bahwa body respons berisi array
//   expect(Array.isArray(response.body)).toBe(true);
//   // Memastikan bahwa setiap item dalam array berisi id, name, birthdate, url_photos, dan country_name
//   response.body.forEach(actor => {
//     expect(actor).toHaveProperty('id');
//     expect(actor).toHaveProperty('name');
//     expect(actor).toHaveProperty('birthdate');
//     expect(actor).toHaveProperty('url_photos');
//     expect(actor).toHaveProperty('country_name');
//   });
//   // Memastikan bahwa ada setidaknya satu aktor dalam daftar
//   expect(response.body.length).toBeGreaterThan(0);
// });

// describe('Actor API', () => {
//   it('should add a new actor with photo', async () => {
//     const newActor = {
//       country_id: 2, // Sesuaikan dengan ID country dari database-mu
//       name: 'Actor Tes',
//       birth_date: '2004-04-30', // Pastikan format ini benar
//     };

//     // Path foto yang akan diunggah, gunakan path.join untuk menghindari kesalahan path
//     const photo = path.join(__dirname, 'uploads', 'putin.jpeg'); // Ubah ke path foto uji coba-mu

//     // Kirim permintaan POST dengan file dan data
//     const response = await request(app)
//       .post('/actors')
//       .set('Content-Type', 'multipart/form-data') // Memastikan header Content-Type untuk multipart
//       .field('country_id', newActor.country_id) // Kirim data teks
//       .field('name', newActor.name)
//       .field('birth_date', newActor.birth_date)
//       .attach('photo', photo, 'test-photo.jpg'); // Mengirim file foto

//     // Memastikan respons status 201 (created)
//     expect(response.status).toBe(201);

//     // Memastikan bahwa body respons terdefinisi dan berisi actor
//     expect(response.body).toBeDefined();
//     expect(response.body.actor).toBeDefined();

//     // Memastikan bahwa data aktor yang baru ditambahkan sesuai dengan yang dikirim
//     expect(response.body.actor.name).toBe(newActor.name);

//     // Mengonversi tanggal respons menjadi format 'YYYY-MM-DD' untuk perbandingan yang tepat
//     const actorBirthDate = dayjs(response.body.actor.birthdate).format('YYYY-MM-DD');
//     const expectedDate = dayjs(newActor.birth_date).format('YYYY-MM-DD');

//     // Memastikan tanggal yang diterima sesuai dengan yang dikirimkan
//     expect(actorBirthDate).toBe(expectedDate);

//     // Memastikan bahwa country_id sesuai dengan yang dikirimkan
//     expect(response.body.actor.country_id).toBe(newActor.country_id);

//     // Memastikan bahwa URL foto dikembalikan setelah upload
//     expect(response.body.actor.url_photos).toBeDefined();

//     // Memastikan bahwa id aktor yang baru ditambahkan ada
//     expect(response.body.actor.id).toBeDefined();
//   });
// });

// test('should update an actor with photo', async () => {
//   const actorId = 47; // ID actor yang akan diperbarui

//   const updatedActor = {
//     country_id: 3,
//     name: 'TESS',
//     birth_date: '2005-01-01',
//   };

//   // Path foto yang akan diunggah untuk tes
//   const photoPath = path.join(__dirname, 'uploads', 'putin.jpeg'); // Sesuaikan dengan foto yang ada

//   // Pastikan file ada di path yang diberikan
//   try {
//     const fs = require('fs');
//     if (!fs.existsSync(photoPath)) {
//       throw new Error(`File not found at path: ${photoPath}`);
//     }
//   } catch (err) {
//     console.error(err.message);
//     return;
//   }

//   // Mengirim request dengan file upload
//   const response = await request(app)
//     .put(`/actors/${actorId}`)
//     .set('Content-Type', 'multipart/form-data') // Pastikan header multipart untuk file upload
//     .field('name', updatedActor.name)
//     .field('birth_date', updatedActor.birth_date)
//     .field('country_id', updatedActor.country_id)
//     .attach('photo', photoPath); // Mengunggah foto

//   // Memastikan status respons adalah 200 (OK)
//   expect(response.status).toBe(200);

//   // Memastikan data yang dikembalikan sesuai dengan yang diupdate
//   expect(response.body.actor.name).toBe(updatedActor.name);

//   // Mengonversi tanggal respons menjadi format 'YYYY-MM-DD' untuk perbandingan yang tepat
//   const actorBirthDate = dayjs(response.body.actor.birthdate).format('YYYY-MM-DD');
//   const expectedDate = dayjs(updatedActor.birth_date).format('YYYY-MM-DD');
//   expect(actorBirthDate).toBe(expectedDate);
//   expect(response.body.actor.country_id).toBe(updatedActor.country_id);

//   // Memastikan URL foto dikembalikan
//   expect(response.body.actor.url_photos).toBeDefined();

//   // Memastikan id actor yang diperbarui adalah id yang benar
//   expect(response.body.actor.id).toBe(actorId);
// });

// test('should delete an actor and return status 200', async () => {
//   const actorId = 50; // Gantilah dengan ID aktor yang ada di database untuk tes ini

//   // Pastikan aktor ada dalam database sebelum menghapus
//   const checkActorExistence = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);
//   expect(checkActorExistence.rows.length).toBeGreaterThan(0); // Pastikan aktor ada

//   // Kirim request DELETE untuk menghapus aktor
//   const response = await request(app).delete(`/actors/${actorId}`);

//   // Memastikan status respons adalah 200 (OK)
//   expect(response.status).toBe(200);

//   // Pastikan aktor sudah dihapus
//   const checkActorAfterDeletion = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);
//   expect(checkActorAfterDeletion.rows.length).toBe(0); // Aktor sudah tidak ada lagi di database
// });

// LOGIN TEST
// Tes untuk login dengan kredensial yang benar
test('should login with valid credentials and return 200 with token', async () => {
  const validUsername = 'maul24';  // Pastikan ini sesuai dengan data pengguna yang ada di database
  const validPassword = 'maul4321'; // Pastikan ini sesuai dengan password yang di-hash di database
  
  // Untuk tes ini, kita perlu menambahkan hash password ke database secara manual atau lewat script migrasi

  // Kirim request login dengan username dan password yang benar
  const response = await request(app)
    .post('/login')
    .send({
      username: validUsername,
      password: validPassword
    });

  // Memastikan status respons adalah 200
  expect(response.status).toBe(200);

  // Memastikan body respons berisi token
  expect(response.body).toHaveProperty('token');

  // Memastikan body respons juga menyertakan informasi peran dan status banned
  expect(response.body).toHaveProperty('role');
  expect(response.body).toHaveProperty('banned');
});

// Tes untuk login dengan kredensial yang salah (username salah)
test('should return 404 when username does not exist', async () => {
  const invalidUsername = 'nonexistentuser';  // Username yang tidak ada di database
  const validPassword = 'maul4321';  // Password yang valid, meskipun username salah

  const response = await request(app)
    .post('/login')
    .send({
      username: invalidUsername,
      password: validPassword
    });

  // Memastikan status respons adalah 404
  expect(response.status).toBe(404);

  // Memastikan pesan kesalahan mengindikasikan pengguna tidak ditemukan
  expect(response.body.message).toBe('User not found');
});

// Tes untuk login dengan password yang salah
test('should return 401 when password is incorrect', async () => {
  const validUsername = 'maul24';  // Username yang valid
  const invalidPassword = 'wrongpassword';  // Password yang salah

  const response = await request(app)
    .post('/login')
    .send({
      username: validUsername,
      password: invalidPassword
    });

  // Memastikan status respons adalah 401
  expect(response.status).toBe(401);

  // Memastikan pesan kesalahan mengindikasikan kredensial tidak valid
  expect(response.body.message).toBe('Invalid credentials');
});

// Tes untuk login dengan akun yang diblokir (banned)
test('should return 403 when user is banned', async () => {
  const bannedUsername = 'yayann12';  // Username yang diblokir
  const validPassword = 'yayan4321';  // Password yang valid

  // Simulasikan bahwa akun ini diblokir (misalnya, user.banned = true di database)

  const response = await request(app)
    .post('/login')
    .send({
      username: bannedUsername,
      password: validPassword
    });

  // Memastikan status respons adalah 403 (Forbidden)
  expect(response.status).toBe(403);

  // Memastikan pesan kesalahan mengindikasikan akun diblokir
  expect(response.body.message).toBe('Your account has been banned.');
});


jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: '101465428093223209300', // ID Google pengguna
          name: 'Reza Maulana Aziiz',
          email: 'rezamaulanaaziz600@gmail.com',
        }),
      }),
    })),
  };
});

describe('Google Login API', () => {
  it('should login a user with Google and return JWT token', async () => {
    const googleToken = 'mock_google_token';

    const response = await request(app)
      .post('/google-login')
      .send({ token: googleToken });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.role).toBeDefined();

    const decodedToken = jwt.decode(response.body.token);
    expect(decodedToken.username).toBe('Reza Maulana Aziiz');
    expect(decodedToken.role).toBeDefined();
  });

//   it('should return 403 if the user is banned', async () => {
//     // Simulasi token Google yang valid
//     const googleToken = 'mock_google_token_banned_user';

//     // Ubah implementasi `verifyIdToken` untuk pengguna yang dibanned
//     require('google-auth-library').OAuth2Client.mockImplementationOnce(() => ({
//       verifyIdToken: jest.fn().mockResolvedValue({
//         getPayload: () => ({
//           sub: '101465428093223209300', // ID pengguna yang dibanned
//           name: 'Reza Maulana Aziiz',
//           email: 'rezamaulanaaziz600@gmail.com',
//         }),
//       }),
//     }));

//     // Simulasikan pengguna yang sudah dibanned
//     jest.spyOn(pool, 'query').mockResolvedValueOnce({
//       rows: [{
//         username: 'Reza Maulana Aziiz',
//         role_id: 'Writer',
//         banned: true, // Menandakan bahwa akun dibanned
//         google_id: '101465428093223209300',
//       }],
//     });

//     const response = await request(app)
//       .post('/google-login')
//       .send({ token: googleToken });

//     expect(response.status).toBe(403);
//     expect(response.body.message).toBe('Account is banned and cannot login.');
//   });
 }); // <-- Perbaiki: Menutup `describe` blok untuk Google Login API


jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: '101465428093223209300', // ID Google pengguna
          name: 'Reza Maulana Aziiz',
          email: 'rezamaulanaaziz600@gmail.com',
        }),
      }),
    })),
  };
});

// app.use((req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: 'You must be logged in to add a comment.' });
//   }
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, 'your_jwt_secret');
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).send({ message: 'Invalid token' });
//   }
// });

// Mock Google Authentication and Database query
// jest.mock('google-auth-library', () => {
//   return {
//     OAuth2Client: jest.fn().mockImplementation(() => ({
//       verifyIdToken: jest.fn().mockResolvedValue({
//         getPayload: () => ({
//           sub: '101465428093223209300', // ID Google pengguna
//           name: 'Reza Maulana Aziiz',
//           email: 'rezamaulanaaziz600@gmail.com',
//         }),
//       }),
//     })),
//   };
// });

// // Mocking Database interactions
// jest.mock('pg', () => {
//   const mClient = {
//     query: jest.fn(),
//     connect: jest.fn(),
//   };
//   const mPool = {
//     connect: jest.fn(() => mClient),
//     query: jest.fn(),
//     end: jest.fn(),
//   };
//   return { Pool: jest.fn(() => mPool) };
// });

// Mock the middleware to simulate an unauthenticated user
// jest.mock('./server', () => {
//   const originalModule = jest.requireActual('./server');
//   return {
//     ...originalModule,
//     authenticateToken: jest.fn((req, res, next) => {
//       // Simulating unauthenticated request (no token)
//       req.user = null; // Set the user to null to simulate an unauthenticated user
//       return res.status(401).json({ message: 'You must be logged in to add a comment.' }); // Return the 401 response
//     }),
//   };
// });


// describe('POST /movies/:id/comments', () => {
//   it('should return 401 if the user is not logged in', async () => {
//     const response = await request(app)
//       .post('/movies/:id/comments')
//       .send({ commentText: 'Great movie!', rating: 5 });
  
//     console.log(response);  // Log the entire response to inspect its structure
  
//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe('You must be logged in to add a comment.');
//   });
  
// });
