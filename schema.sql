DROP TABLE IF EXISTS Book;

  CREATE TABLE Book (
      id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255)
   
);
INSERT INTO Book (author,title) VALUES ('author test','title test');