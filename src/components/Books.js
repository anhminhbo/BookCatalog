import BookOption from "./BookOption";

const Books = ({ books, options, onDelete, onEdit }) => {
  return (
    <>
      {books.map((book) => (
        <BookOption
          key={Object.keys(book)}
          book={book}
          options={options}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </>
  );
};

export default Books;
