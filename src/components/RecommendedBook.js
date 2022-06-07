const RecommendedBook = ({ recommendedBook }) => {
  return (
    <>
      <h3>Name: {recommendedBook.name}</h3>
      <p>Author: {recommendedBook.author}</p>

      <p> Rating: {recommendedBook.rating} </p>
      <p> ISBN: {recommendedBook.isbn}</p>
    </>
  );
};

export default RecommendedBook;
