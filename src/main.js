const Hapi = require('@hapi/hapi');
const { nanoid } = require('nanoid');
const books = [];

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
      const { name, year, author, summary, publisher, pageCount, readPage, reading, } = request.payload;
    
      if (name === undefined) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);
      }
    
      if (pageCount < readPage) {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }
    
      const id = nanoid(16);
      const insertedAt = new Date().toISOString();
      const updatedAt = insertedAt;
      const finished = (pageCount === readPage);
      const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };
    
      books.push(newBook);
    
      const isSuccess = books.filter((book) => book.id === id).length > 0;
    
      if (isSuccess) {
        return h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        }).code(201);
      }
    
      return h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
      }).code(500);
    }
  }),
  
  server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
      const { name, reading, finished } = request.query;
    
      let filtered = books;
    
      if (name !== undefined) {
        filtered = filtered.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
      }
    
      if (reading !== undefined) {
        filtered = filtered.filter((book) => book.reading === !!Number(reading));
      }
    
      if (finished !== undefined) {
        filtered = filtered.filter((book) => book.finished === !!Number(finished));
      }
    
      return h.response({
        status: 'success',
        data: {
          books: filtered.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      }).code(200);
    }
  }),

  server.route({
    method: 'GET',
    path: '/books/{id}',
    handler: (request, h) => {
      const { id } = request.params;
      const book = books.filter((b) => b.id === id)[0];
    
      if (book !== undefined) {
        return {
          status: 'success',
          data: {
            book,
          },
        };
      }
    
      return h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }).code(404);
    }
  }),

  server.route({
    method: 'PUT',
    path: '/books/{id}',
    handler: (request, h) => {
      const { id } = request.params;
      const {
        name, year, author, summary, publisher, pageCount, readPage, reading,
      } = request.payload;
      const updatedAt = new Date().toISOString();
      const index = books.findIndex((book) => book.id === id);
    
      if (index !== -1) {
        if (name === undefined) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
          }).code(400);
        }
    
        if (pageCount < readPage) {
          return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
          }).code(400);
        }
    
        const finished = (pageCount === readPage);
    
        books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished,
          reading,
          updatedAt,
        };
    
        return h.response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        }).code(200);
      }
    
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      }).code(404);
    }
  }),

  server.route({
    method: 'DELETE',
    path: '/books/{id}',
    handler: (request, h) => {
      const { id } = request.params;
    
      const index = books.findIndex((note) => note.id === id);
    
      if (index !== -1) {
        books.splice(index, 1);
        return h.response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        }).code(200);
      }
    
      return h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      }).code(404);
    }
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
