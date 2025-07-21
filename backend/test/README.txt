Đặt tên test suite là <chức năng>.test.js

Để đảm bảo môi trường test độc lập giữa các test case,
trước khi mỗi test case chạy sẽ clear toàn bộ database rồi import
các files trong test_data trở lại.

Trong test_data chứa các file json mà tên file chính là tên collection.
Khi export từ MongoDB compass vui lòng đặt tên lại cho đúng.

Chạy test bằng cách gõ npm run test

Nếu không muốn hiện console.log / error thì npm run test:silent

Nếu bị lỗi duplicate _id, chờ MongoDB load lại một tí rồi thử lại
tại vì MongoDB lưu trữ Index một lúc