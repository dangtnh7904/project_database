
-- Writing triggers for this library management database will help automate some critical tasks and ensure data consistency. Below are four sample triggers that implement the listed functions:

-- 1. Trigger to update the number of books when a book is reserved:
-- When a user reserves a book, the available quantity of that book will decrease by 1.
CREATE OR REPLACE FUNCTION update_book_quantity_on_reserve()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET quantity = quantity - 1
    WHERE book_id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_book_quantity_on_reserve
AFTER INSERT ON re
FOR EACH ROW
EXECUTE FUNCTION update_book_quantity_on_reserve();


-- 2. Trigger to restore the number of books when a book is returned:
-- When a user returns a book, the available quantity of that book will increase by 1

CREATE OR REPLACE FUNCTION update_book_quantity_on_return()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET quantity = quantity + 1
    WHERE book_id = NEW.book_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_book_quantity_on_return
AFTER DELETE ON re
FOR EACH ROW
EXECUTE FUNCTION update_book_quantity_on_return();


-- 3 Trigger to update the book status when there are changes (update/delete):
-- When there is any change to a book, update the corresponding book status.
CREATE OR REPLACE FUNCTION update_book_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity = 0 THEN
        UPDATE books
        SET status = 'Not Available'
        WHERE book_id = NEW.book_id;
    ELSE
        UPDATE books
        SET status = 'Available'
        WHERE book_id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_book_status
AFTER UPDATE OR DELETE ON books
FOR EACH ROW
EXECUTE FUNCTION update_book_status();

--4. Trigger to To prevent INSERT operations into the re table if the quantity in 
--the books table is less than 1.
CREATE OR REPLACE FUNCTION check_book_quantity_before_insert() 
RETURNS TRIGGER AS $$ 
BEGIN 
    IF (
        SELECT quantity
        FROM books
        WHERE book_id = NEW.book_id
    ) < 1 THEN RAISE EXCEPTION 'Cannot reserve book with quantity less than 1.';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_check_book_quantity_before_insert 
BEFORE INSERT ON re 
FOR EACH ROW 
EXECUTE FUNCTION check_book_quantity_before_insert();




--Queries


--List highest rated books
SELECT * FROM books
WHERE avg_star = (SELECT MAX(avg_star) FROM books)
ORDER BY avg_star DESC;
LIMIT 10;


--Return books information based on the author's name

CREATE or REPLACE FUNCTION find_books_by_author(author_name VARCHAR)
RETURNS TABLE (
    book_id INT,
    title VARCHAR,
    genre VARCHAR,
    )
AS $$
BEGIN
    RETURN QUERY
    SELECT b.book_id, b.title, b.genre
    FROM books b
    JOIN authors a ON b.author_id = a.author_id
    WHERE a.name = author_name;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM find_books_by_author('Pernell Dellenbroker');

--Get the most 30 active users (who have read or reserved the most books)

WITH top_age AS (
    SELECT u.user_id,
        u.user_name,
        COALESCE(r.read_count, 0) + COALESCE(re.reserve_count, 0) AS count
    FROM users u
        LEFT JOIN (
            SELECT read.user_id,
                COUNT(*) AS read_count
            FROM read 
            GROUP BY read.user_id ) r 
        ON u.user_id = r.user_id
        LEFT JOIN (
            SELECT re.user_id,
                COUNT(*) AS reserve_count
            FROM re
            GROUP BY re.user_id
        ) re ON u.user_id = re.user_id
    ORDER BY count DESC
    LIMIT 30
)
SELECT u.user_id,
    u.user_name,
    COALESCE(r.read_count, 0) + COALESCE(re.reserve_count, 0) AS activity
FROM users u
    LEFT JOIN (
        SELECT read.user_id,
            COUNT(*) AS read_count
        FROM read
        GROUP BY read.user_id
    ) r ON u.user_id = r.user_id
    LEFT JOIN (
        SELECT re.user_id,
            COUNT(*) AS reserve_count
        FROM re
        GROUP BY re.user_id
    ) re ON u.user_id = re.user_id
WHERE (COALESCE(r.read_count, 0) + COALESCE(re.reserve_count, 0)) >= 
                (SELECT MIN(count) FROM top_age)
ORDER BY activity DESC;



--User account registration/login
INSERT INTO users (user_id, user_name, birth_year,email, password, address)
VALUES (1001, 'Donal Trump', '1945-05-05', 'trump@poresident.com','12345678', 'America');


--Display a user's borrowed books list
SELECT users.user_name,books.book_id, 
        books.title,count(re.book_id)::INTEGER as borrowed_times
FROM books
JOIN re ON books.book_id = re.book_id
JOIN users ON re.user_id = users.user_id
WHERE re.user_id = 4
GROUP BY books.book_id, books.title, users.user_name;

--Get the authors with the highest average book rating
CREATE OR REPLACE FUNCTION get_top_rated_authors(p_limit INT) 
RETURNS TABLE (
        author_id INT,
        name VARCHAR,
        avg_rating FLOAT
    ) AS $$ 
BEGIN RETURN QUERY
SELECT a.author_id,
    a.name,
    AVG(r.star)::float AS avg_rating
FROM authors a
    JOIN books b ON a.author_id = b.author_id
    JOIN read r ON b.book_id = r.book_id
GROUP BY a.author_id,
    a.name
ORDER BY avg_rating DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM get_top_rated_authors(5);
--3.Get the average rating of books by genre
CREATE OR REPLACE FUNCTION get_avg_rating_by_genre() 
RETURNS TABLE (
        genre VARCHAR,
        avg_rating DOUBLE PRECISION
    ) AS $$ BEGIN RETURN QUERY
SELECT b.genre,
    AVG(r.star)::DOUBLE PRECISION AS avg_rating
FROM books b
    JOIN read r ON b.book_id = r.book_id
GROUP BY b.genre;
END;
$$ LANGUAGE plpgsql;

--Get users with the most overdue books
CREATE OR REPLACE FUNCTION get_users_with_most_overdue_books(
        p_current_date TIMESTAMP,
        p_limit INT
    ) RETURNS TABLE (
        user_id INT,
        user_name VARCHAR,
        overdue_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT u.user_id,
    u.user_name,
    COUNT(*)::INT AS overdue_count
FROM re
    JOIN users u ON re.user_id = u.user_id
WHERE re.due < p_current_date
    AND re.return_date IS NULL
GROUP BY u.user_id,
    u.user_name
ORDER BY overdue_count DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

select * from get_users_with_most_overdue_books('2024-12-04', 2);
--Get the staff member with the most managed books
CREATE OR REPLACE FUNCTION get_staff_with_most_managed_books() 
RETURNS TABLE (
        staff_id INT,
        name VARCHAR,
        managed_books_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT s.staff_id,
    s.name,
    COUNT(*)::INT AS managed_books_count
FROM staff s
    JOIN books b ON s.staff_id = b.staff_id
GROUP BY s.staff_id,
    s.name
ORDER BY managed_books_count DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;

Select * from get_staff_with_most_managed_books();

--Get the nationality with the most authors
CREATE OR REPLACE FUNCTION get_nationality_with_most_authors() 
RETURNS TABLE (
        nationality VARCHAR,
        author_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT a.nationality,
    COUNT(*)::INT AS author_count
FROM authors a
GROUP BY a.nationality
ORDER BY author_count DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;

select * from get_nationality_with_most_authors();
--Get the user who has reserved the most unique books
CREATE OR REPLACE FUNCTION get_user_with_most_unique_reservations() 
RETURNS TABLE (
        user_id INT,
        user_name VARCHAR,
        unique_reservations_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT u.user_id,
    u.user_name,
    COUNT(DISTINCT re.book_id)::INT AS unique_reservations_count
FROM users u
    JOIN re ON u.user_id = re.user_id
GROUP BY u.user_id,
    u.user_name
ORDER BY unique_reservations_count DESC
LIMIT 1;
END;
$$ LANGUAGE plpgsql;

Select * from get_user_with_most_unique_reservations();
--Get the top genres by average rating
CREATE OR REPLACE FUNCTION get_top_genres_by_avg_rating(p_limit INT) 
RETURNS TABLE (genre VARCHAR, avg_rating FLOAT) 
AS $$ BEGIN RETURN QUERY
SELECT b.genre,
    AVG(r.star)::float AS avg_rating
FROM books b
    JOIN read r ON b.book_id = r.book_id
GROUP BY b.genre
ORDER BY avg_rating DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

Select * from get_top_genres_by_avg_rating(5);
--Get the number of books each staff member is responsible for
CREATE OR REPLACE FUNCTION get_books_per_staff() 
RETURNS TABLE (
        staff_id INT,
        name VARCHAR,
        books_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT s.staff_id,
    s.name,
    COUNT(b.book_id)::INT AS books_count
FROM staff s
    LEFT JOIN books b ON s.staff_id = b.staff_id
GROUP BY s.staff_id,
    s.name
ORDER BY books_count DESC;
END;
$$ LANGUAGE plpgsql;

Select * from get_books_per_staff();
--Get the most popular book genres based on reservations
CREATE OR REPLACE FUNCTION get_most_popular_genres_by_reservations
                            (p_limit INT) 
RETURNS TABLE (
        genre VARCHAR,
        reservation_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT b.genre,
    COUNT(re.book_id)::INT AS reservation_count
FROM books b
    JOIN re ON b.book_id = re.book_id
GROUP BY b.genre
ORDER BY reservation_count DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

Select * from get_most_popular_genres_by_reservations(5);
--Get the most borrowed books by genre
CREATE OR REPLACE FUNCTION get_most_borrowed_books_by_genre
                (p_genre VARCHAR, p_limit INT) 
RETURNS TABLE (
        book_id INT,
        title VARCHAR,
        borrow_count INT
    ) AS $$ BEGIN RETURN QUERY
SELECT b.book_id,
    b.title,
    COUNT(re.book_id)::INT AS borrow_count
FROM books b
    JOIN re ON b.book_id = re.book_id
WHERE b.genre = p_genre
GROUP BY b.book_id,
    b.title
ORDER BY borrow_count DESC
LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

Select * from get_most_borrowed_books_by_genre('romance', 5);

--list of users currently borrowing books
CREATE OR REPLACE FUNCTION get_users_borrowing_books() 
RETURNS TABLE (
        user_id INT,
        user_name VARCHAR,
        book_id INT,
        title VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT u.user_id,
    u.user_name,
    b.book_id,
    b.title
FROM users u
    JOIN re ON u.user_id = re.user_id
    JOIN books b ON re.book_id = b.book_id
WHERE re.return_date IS NULL;
END;
$$ LANGUAGE plpgsql;

select * from get_users_borrowing_books();

--return books
UPDATE re 
SET return_date = now() 
WHERE book_id = 52 
AND user_id = 278;

--Display the number of users who have borrowed books so far
Create or replace function get_number_of_users_reserved_books() 
returns int as $$
DECLARE sum int;
BEGIN
    select count(*) into sum
    from users 
    where user_id in (
        select distinct user_id from re
        where extract (epoch from reserve_date) 
                < extract (epoch from now()));
    return sum;
END;
$$ language plpgsql;

select get_number_of_users_reserved_books();

---INDEX---
CREATE INDEX idx_books_staff_id ON books (staff_id);
CREATE INDEX idx_books_avg_star_desc ON books (avg_star DESC);