import React from "react";

const BookSelect = ({ books, selectedBook, setSelectedBook }) => {
  return (
    <select
      value={selectedBook}
      onChange={(e) => setSelectedBook(e.target.value)}
      className="block w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    >
      {books.map((book) => (
        <option key={book.name} value={book.name}>
          {book.name}
        </option>
      ))}
    </select>
  );
};

export default BookSelect;
