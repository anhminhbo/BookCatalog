import { connectFirestoreEmulator } from "@firebase/firestore";
import Book from "./Book";

const BookOption = ({ book, options, onDelete, onEdit }) => {
  const groupValue = Object.keys(book);
  const books = book[groupValue];
  return (
    <>
      {options === "pubYear" && groupValue != 0 ? (
        <h2 style={{ color: "blue" }}>Publication Year: {groupValue} </h2>
      ) : options === "pubYear" && groupValue == 0 ? (
        <h2 style={{ color: "blue" }}>Books without Publication Year</h2>
      ) : options === "rating" && groupValue !== 0 ? (
        <h2 style={{ color: "blue" }}>Rating: {groupValue} </h2>
      ) : options === "author" ? (
        <h2 style={{ color: "blue" }}>Author: {groupValue} </h2>
      ) : (
        ""
      )}

      {books.map((book) => (
        <Book key={book.id} book={book} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </>
  );
};

export default BookOption;
