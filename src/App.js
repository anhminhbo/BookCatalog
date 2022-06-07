import { useState, useEffect } from "react";
import { mapValues, groupBy, omit } from "lodash";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";

import Header from "./components/Header";
import Books from "./components/Books";

import RecommendedBook from "./components/RecommendedBook";

function App() {
  const booksCollectionRef = collection(db, "books");
  const [books, setBooks] = useState([]);
  const [recommendedBook, setRecommendedBook] = useState({});
  const [options, setOptions] = useState("pubYear");

  // first time going to website
  useEffect(() => {
    getBooksGroupBy(options);
  }, [options]);

  // function to group by options
  const getBooksGroupBy = async (options) => {
    let orderData = [];
    const orderResponse = await getDocs(booksCollectionRef);
    const orders = orderResponse.docs;
    orderData = orders.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Handle recommended book
    let books = [...orderData];

    const date = new Date();
    const currentYear = date.getFullYear();
    const booksMin3Years = books.filter(
      (book) => currentYear - book.pubYear <= 3
    );

    // Handle if there are books 3 years earlier
    if (booksMin3Years.length === 0) {
      setRecommendedBook({});
    } else if (booksMin3Years.length === 1) {
      setRecommendedBook(booksMin3Years[0]);
    } else {
      const bestRating = booksMin3Years.reduce((prevBook, currentBook) => {
        return prevBook.rating > currentBook.rating
          ? prevBook.rating
          : currentBook.rating;
      });

      const filteredBook = booksMin3Years.filter(
        (book) => book.rating === bestRating
      );

      if (filteredBook.length > 1) {
        const randomPosition = Math.floor(Math.random() * filteredBook.length);
        setRecommendedBook(filteredBook[randomPosition]);
      } else {
        setRecommendedBook(filteredBook[0]);
      }
    }

    // Handle group by
    // grouped value example:
    // { option1: [{book1}, {book2}]
    //   option1: [{book3}, {book4}] }
    let grouped = mapValues(groupBy(orderData, options), (clist) =>
      clist.map((optionValue) => omit(optionValue, options))
    );

    // sort book alphabetically for each group
    const keysOption = Object.keys(grouped);

    keysOption.forEach((key) => {
      grouped[key].sort((firstItem, secondItem) => {
        return firstItem.name.toLowerCase() < secondItem.name.toLowerCase()
          ? -1
          : firstItem.name.toLowerCase() > secondItem.name.toLowerCase()
          ? 1
          : 0;
      });
    });

    // sort group by groupValue desc
    // entries value example:
    // [ option1, [{book1}, {book2}],
    //  option2, [{book3}, {book4}] ]
    const entries = Object.entries(grouped);
    entries.sort((firstArray, secondArray) => {
      return secondArray[0] - firstArray[0];
    });

    // map new object into new array with this format
    // [ option3 : [{bookA}, {bookB}],
    //   option2: [{bookD}, {bookE}],
    //   option1 : [{bookB}, {bookE}] ]
    const arrOfObj = entries.map(([key, value]) => {
      return { [key]: value };
    });

    setBooks(arrOfObj);
  };

  // Handle group by options
  const handleOptionsChange = (event) => {
    setOptions(event.target.value);
  };

  // add book
  const [name, setName] = useState("");
  const [author, setauthor] = useState("");
  const [pubYear, setpubYear] = useState(0);
  const [rating, setRating] = useState(0);
  const [isbn, setIsbn] = useState("");
  // Add book logic
  const addBookHandler = async () => {
    if (!name || name.length > 100) {
      alert("Book name should be between 0 and 100 characters.");
      return;
    }
    if (!author) {
      alert("Book author should have at least one.");
      return;
    }
    if (pubYear && pubYear < 1800) {
      alert("Publication year should be > 1800.");
      return;
    }

    if (+rating > 10 || +rating < 0) {
      alert("Book rating should be between 0 and 10.");
      return;
    }

    const isValidIsbn = (isbnCode) => {
      if (isbnCode.length !== 10) return false;
      let sum = 0;
      [...isbnCode].forEach((c, index) => {
        // Handle the last element of isbn
        if (index === 9 && c === "X") {
          sum += (10 - index) * 10;
        } else {
          if (Number.isInteger(+c)) sum += (10 - index) * +c;
          else return false;
        }
      });

      if (sum % 11 === 0) return true;

      return false;
    };

    if (isbn && !isValidIsbn(isbn)) {
      alert("ISBN is invalid");
      return;
    }

    await addDoc(booksCollectionRef, {
      name: name.trim(),
      author: author.trim(),
      pubYear: +pubYear,
      rating: +rating,
      isbn: isbn,
    });

    await getBooksGroupBy(options);
  };

  // onSubmit to reset value of all fields
  const onSubmit = (e) => {
    e.preventDefault();

    setName("");
    setauthor("");
    setpubYear(0);
    setRating(0);
    setIsbn("");
  };

  // Delete book
  const deleteBookHandler = async (id) => {
    const bookDoc = doc(db, "books", id);
    await deleteDoc(bookDoc);
    await getBooksGroupBy(options);
  };

  // Edit book
  const updateBookHandler = async (id) => {
    if (!name || name.length > 100) {
      alert("Edit Book name should be between 0 and 100 characters.");
      return;
    }
    if (!author) {
      alert("Edit Book author should have at least one.");
      return;
    }
    if (pubYear && pubYear < 1800) {
      alert("Edit Publication year should be > 1800.");
      return;
    }

    if (+rating > 10 || +rating < 0) {
      alert("Edit Book rating should be between 0 and 10.");
      return;
    }

    const isValidIsbn = (isbnCode) => {
      if (isbnCode.length !== 10) return false;
      let sum = 0;
      [...isbnCode].forEach((c, index) => {
        // Handle the last element of isbn
        if (index === 9 && c === "X") {
          sum += (10 - index) * 10;
        } else {
          if (Number.isInteger(+c)) sum += (10 - index) * +c;
          else return false;
        }
      });

      if (sum % 11 === 0) return true;

      return false;
    };

    if (isbn && !isValidIsbn(isbn)) {
      alert("Edit ISBN is invalid");
      return;
    }
    const bookDoc = doc(db, "books", id);
    await updateDoc(bookDoc, {
      name: name.trim(),
      author: author.trim(),
      pubYear: +pubYear,
      rating: +rating,
      isbn: isbn,
    });

    await getBooksGroupBy(options);

    setName("");
    setauthor("");
    setpubYear(0);
    setRating(0);
    setIsbn("");
  };

  return (
    <div className="container">
      <Header title="Book Catalog" />
      <form className="add-form" onSubmit={onSubmit}>
        <div className="form-control">
          <label>Name</label>
          <input
            type="text"
            placeholder="Add Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label>Author</label>
          <input
            type="text"
            placeholder="Add author"
            value={author}
            onChange={(e) => setauthor(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label>Publication Year</label>
          <input
            type="number"
            value={pubYear}
            onChange={(e) => setpubYear(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label>Rating</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label>ISBN</label>
          <input
            type="text"
            placeholder="Add ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
        </div>

        <input
          type="submit"
          value="Submit Add Book"
          className="btn btn-block"
          onClick={addBookHandler}
        />
      </form>
      <h1>Recommended Book</h1>
      {recommendedBook && Object.keys(recommendedBook).length !== 0 ? (
        <RecommendedBook recommendedBook={recommendedBook} />
      ) : (
        <p>No books meet criteria to recommend</p>
      )}
      <select value={options} onChange={handleOptionsChange}>
        <option value="pubYear"> Group by Years</option>
        <option value="rating"> Group by Rating</option>
        <option value="author"> Group by Author</option>
      </select>

      {books.length > 0 ? (
        <Books
          books={books}
          options={options}
          onDelete={deleteBookHandler}
          onEdit={updateBookHandler}
        />
      ) : (
        "No Books to show"
      )}
    </div>
  );
}

export default App;
