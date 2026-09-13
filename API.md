# FeastFlow API

All responses use `{ success, data }` or `{ success:false, error }`. Protected requests require `Authorization: Bearer <JWT>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Discovery | `GET /restaurants?city&search&cuisine&minRating&veg&sort`, `GET /restaurants/:id`, `GET /foods?search`, `GET /categories`, `GET /offers`, `GET /search?q` |
| Cart | `GET /cart`, `POST /cart`, `PUT /cart/:itemId`, `DELETE /cart/:itemId` |
| Address / checkout | `GET/POST /addresses`, `PUT/DELETE /addresses/:id`, `POST /coupons/validate`, `POST /orders` |
| Orders | `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/status` (admin/owner) |
| Account | `GET/PUT /users/profile`, `GET/POST /favorites`, `GET /notifications`, `GET /reviews/:restaurantId`, `POST /reviews` |
| Management | `POST/PUT /restaurants`, `POST/PUT/DELETE /foods`, `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:id/block`, `GET/POST/PUT/DELETE /admin/coupons` |

`POST /cart` accepts `{ foodId, quantity, addons, instructions }`. `POST /orders` accepts `{ addressId, paymentMethod, coupon, discount }`.
