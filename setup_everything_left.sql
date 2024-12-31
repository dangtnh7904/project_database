alter table books
add constraint book_pkey primary key (book_id);

alter table authors
add constraint author_pkey primary key (author_id);

alter table staff
add constraint staff_pkey primary key (staff_id);

alter table users
add constraint users_pkey primary key (user_id);

alter table books
add constraint book_author_id_fkey foreign key (author_id)
references authors(author_id);

ALTER TABLE books
ADD CONSTRAINT book_staff_id_fkey FOREIGN KEY (staff_id)
REFERENCES staff(staff_id);

ALTER table re
ADD CONSTRAINT re_book_id_fkey FOREIGN KEY (book_id)
REFERENCES books(book_id);

ALTER table re 
ADD CONSTRAINT re_user_id_fkey FOREIGN key (user_id)
REFERENCES users(user_id);

ALTER TABLE read
ADD CONSTRAINT read_user_id_fkey FOREIGN KEY (user_id)
REFERENCES users(user_id);

ALTER TABLE read
ADD CONSTRAINT read_book_id_fkey FOREIGN KEY (book_id)
REFERENCES books(book_id);
