# Backend Useful Routes Và Bản Đồ Debug

Tài liệu này tập trung vào backend Express trong `backend/src`:

- Route nào đi qua file nào theo từng feature
- Vì sao số file trong `routes/`, `controllers/`, `middlewares/`, `services/` không giống nhau
- Mỗi file trong từng thư mục dùng để làm gì
- Khi fix bug thì nên mở file nào trước

Tài liệu này ưu tiên “đường đi thực tế” của request, không chỉ là sơ đồ lý thuyết.

## 1. Điểm vào của backend

Mọi request backend đều bắt đầu từ:

- `backend/src/index.ts`

File này:

- khởi tạo Express app
- gắn middleware chung: `cors`, `compression`, `express.json`
- mount toàn bộ API prefix
- tách OCR ra thành `/api/ocr/*`

Map prefix tổng:

- `/api/v1/auth` -> `backend/src/routes/auth.routes.ts`
- `/api/v1/users` -> `backend/src/routes/user.routes.ts`
- `/api/v1/analysis` -> `backend/src/routes/analysis.routes.ts`
- `/api/v1/products` -> `backend/src/routes/product.routes.ts`
- `/api/v1/history` -> `backend/src/routes/history.routes.ts`
- `/api/v1/admin` -> `backend/src/routes/admin.routes.ts`
- `/api/v1/reports` -> `backend/src/routes/report.routes.ts`
- `/api/v1/ingredients` -> `backend/src/routes/ingredient.routes.ts`
- `/api/v1/notifications` -> `backend/src/routes/notification.routes.ts`
- `/api/ocr` -> `backend/src/modules/ocr/ocrRoutes.ts`

Nếu bug là “API không vào đúng route”, `404`, prefix sai, frontend gọi sai endpoint, hoặc health check fail, hãy mở `backend/src/index.ts` trước.

## 2. Vì sao số file giữa các thư mục không giống nhau

Số lượng hiện tại:

- `routes/`: 9 file
- `controllers/`: 10 file
- `middlewares/`: 3 file
- `services/`: 7 file

Lý do không bằng nhau:

1. `middlewares/` là cross-cutting layer

- `auth.middleware.ts`, `admin.middleware.ts`, `rateLimit.middleware.ts` được tái sử dụng bởi nhiều feature.
- 1 middleware có thể phục vụ rất nhiều route, nên thường ít file hơn.

2. `controllers/` tách nhỏ theo HTTP concern, không nhất thiết 1-1 với `routes/`

- `excel.controller.ts` không có route riêng. Nó được import trực tiếp vào `admin.routes.ts`.
- Vì vậy controllers nhiều hơn routes.

3. `services/` gom business logic theo domain, không gom theo từng route

- `admin.service.ts` gom rất nhiều feature admin: ingredients, rules, products, users, dashboard, AI suggestions.
- 1 service lớn có thể phục vụ nhiều controller action và nhiều endpoint.
- Ngược lại, `history` và `notification` hiện tại không có service riêng; controller đang query Prisma trực tiếp.

4. OCR là module riêng, không nằm trong bộ `routes/controllers/services` chính

- `backend/src/modules/ocr/ocrRoutes.ts`
- `backend/src/modules/ocr/ocrController.ts`
- `backend/src/modules/ocr/ocrService.ts`
- `backend/src/modules/ocr/ingredientsExtractor.ts`

Nó vẫn đi theo flow `route -> controller -> service`, nhưng được tách module riêng vì đây là upload/OCR pipeline.

5. Một số flow đang “rút gọn”

- `ingredient.controller.ts`
- `history.controller.ts`
- `notification.controller.ts`

Ba controller này đang làm việc trực tiếp với Prisma, nên không có:

- `ingredient.service.ts`
- `history.service.ts`
- `notification.service.ts`

## 3. Flow thực tế theo từng feature

### 3.1 Auth

Đăng ký:

1. `backend/src/index.ts`
2. `backend/src/routes/auth.routes.ts`
3. `backend/src/controllers/auth.controller.ts` -> `register`
4. `backend/src/services/auth.service.ts` -> `registerUser`
5. `backend/src/utils/prisma.ts`

Đăng nhập:

1. `backend/src/index.ts`
2. `backend/src/routes/auth.routes.ts`
3. `backend/src/controllers/auth.controller.ts` -> `login`
4. `backend/src/services/auth.service.ts` -> `loginUser`
5. `backend/src/utils/prisma.ts`
6. `jsonwebtoken` ký token, token này sẽ được `auth.middleware.ts` đọc ở các request sau

Mở trước khi debug:

- Sai validate request body, sai status code auth: `auth.controller.ts`
- Lỗi hash password, duplicate username, JWT: `auth.service.ts`
- Lỗi DB user: `utils/prisma.ts` và schema/database liên quan

### 3.2 User Profile

Lấy profile:

1. `backend/src/routes/user.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/user.controller.ts` -> `getProfile`
4. `backend/src/services/user.service.ts` -> `getUserProfile`
5. `backend/src/utils/prisma.ts`

Update profile:

1. `backend/src/routes/user.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/user.controller.ts` -> `updateProfile`
4. `backend/src/services/user.service.ts` -> `updateUserProfile`
5. `backend/src/utils/prisma.ts`

Đổi password:

1. `backend/src/routes/user.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/user.controller.ts` -> `changePassword`
4. `backend/src/services/user.service.ts` -> `changePassword`
5. `backend/src/utils/prisma.ts`

Mở trước khi debug:

- Token có user nhưng API vẫn `401`: `auth.middleware.ts`
- Profile update xong recommendation/analysis vẫn sai `skinType`: `user.controller.ts`, `user.service.ts`, rồi sang `analysis.controller.ts`

### 3.3 Analysis Core

Flow `/api/v1/analysis/check`:

1. `backend/src/routes/analysis.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/middlewares/rateLimit.middleware.ts`
4. `backend/src/controllers/analysis.controller.ts` -> `checkAnalysis`
5. `backend/src/utils/prisma.ts` lấy user mới nhất
6. `backend/src/services/analysis.service.ts` -> `analyzeIngredients`
7. `backend/src/utils/prisma.ts` query `ingredient` + `ingredientRule`
8. Nếu thiếu ingredient và có `skinType`:
9. `backend/src/utils/gemini.ts` -> `analyzeWithGemini`
10. quay lại `backend/src/services/analysis.service.ts` để cache `aiIngredientSuggestion`
11. quay lại `backend/src/controllers/analysis.controller.ts` để lưu `analysisHistory`

Mở trước khi debug:

- Bị `429`, quota sai role: `rateLimit.middleware.ts`
- User vừa đổi `skinType` nhưng kết quả phân tích chưa đổi: `analysis.controller.ts`
- Ingredient có trong DB mà vẫn bị AI/fallback: `analysis.service.ts`
- AI không trả kết quả: `utils/gemini.ts`
- Kết quả OCR/INCI bị lệch uppercase-lowercase: `analysis.service.ts`

### 3.4 Product Recommendation

Flow `/api/v1/products/recommendations`:

1. `backend/src/routes/product.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/product.controller.ts` -> `getRecommendations`
4. `backend/src/services/product.service.ts` -> `getSafeRecommendations`
5. Prisma lấy `product -> ingredients -> ingredient -> rules`
6. service lọc BAD, chấm điểm GOOD, trộn top pool và trả về 3 item

Mở trước khi debug:

- User chưa có `skinType`: `product.controller.ts`
- Sản phẩm có ingredient BAD mà vẫn được gợi ý: `product.service.ts`
- Thứ tự/số lượng recommendation thay đổi bất thường: `product.service.ts`

### 3.5 History

Flow:

1. `backend/src/routes/history.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/history.controller.ts`
4. `backend/src/utils/prisma.ts`

Không có service riêng.

Mở trước khi debug:

- Lịch sử không lưu sau analysis: `analysis.controller.ts`
- Lịch sử hiện sai user, xóa nhầm user khác: `history.controller.ts`

### 3.6 Ingredient Search

Flow `/api/v1/ingredients/search`:

1. `backend/src/routes/ingredient.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/ingredient.controller.ts` -> `searchIngredientByName`
4. `backend/src/utils/prisma.ts`

Không có service riêng.

Mở trước khi debug:

- Search đúng tên mà vẫn `404`: `ingredient.controller.ts`
- Vấn đề normalize `trim().toLowerCase()`: `ingredient.controller.ts` và `admin.service.ts` vì admin tạo ingredient ở đó

### 3.7 Community Reports

Tạo report:

1. `backend/src/routes/report.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/report.controller.ts` -> `createReport`
4. `backend/src/services/report.service.ts` -> `createReport`

Vote report:

1. `backend/src/routes/report.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/report.controller.ts` -> `voteReport`
4. `backend/src/services/report.service.ts` -> `vote`

Lấy pending reports:

1. `backend/src/routes/report.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/report.controller.ts` -> `getPendingReports`
4. `backend/src/services/report.service.ts` -> `getPendingReports`

Lấy vote của user hiện tại:

1. `backend/src/routes/report.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/report.controller.ts` -> `getUserVote`
4. `backend/src/services/report.service.ts` -> `getUserVote`

Resolve report bằng admin:

1. `backend/src/routes/report.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/middlewares/admin.middleware.ts`
4. `backend/src/controllers/report.controller.ts` -> `resolveReport`
5. `backend/src/services/report.service.ts` -> `resolveReport`
6. Nếu `APPROVED`:
7. `backend/src/services/admin.service.ts` -> `createOrUpdateRule`
8. Tạo notification cho user submit report

Mở trước khi debug:

- Vote toggle sai, up/down count sai: `report.service.ts`
- Pending sort theo vote/newest sai: `report.service.ts`
- Admin approve report nhưng rule không đổi: `report.service.ts` và `admin.service.ts`
- Notification resolve report không gửi: `report.service.ts`

### 3.8 Notifications

Lấy notifications:

1. `backend/src/routes/notification.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/notification.controller.ts` -> `getNotifications`
4. Prisma query trực tiếp trong controller

Mark 1 notification đã đọc:

1. `backend/src/routes/notification.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/notification.controller.ts` -> `markAsRead`
4. Prisma query trực tiếp trong controller

Mark all đã đọc:

1. `backend/src/routes/notification.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/controllers/notification.controller.ts` -> `markAllAsRead`
4. Prisma query trực tiếp trong controller

Admin gửi thông báo:

1. `backend/src/routes/notification.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/middlewares/admin.middleware.ts`
4. `backend/src/controllers/notification.controller.ts` -> `sendAdminMessage`
5. Prisma query trực tiếp trong controller

Không có service riêng.

Mở trước khi debug:

- Mark read sai ownership: `notification.controller.ts`
- Notification dropdown thiếu item: `notification.controller.ts`
- Lỗi role admin gửi message: `notification.routes.ts`, `admin.middleware.ts`

### 3.9 Admin CRUD

Toàn bộ flow admin đều bắt đầu:

1. `backend/src/routes/admin.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/middlewares/admin.middleware.ts`

Sau đó chia ra:

Ingredients:

- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

Rules:

- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

Products:

- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

Users:

- `backend/src/controllers/admin.controller.ts`
- `backend/src/services/admin.service.ts`

Dashboard stats:

- `backend/src/controllers/admin.controller.ts` -> `getDashboardStats`
- `backend/src/services/admin.service.ts` -> `getDashboardStats`

Reports summary:

- `backend/src/controllers/admin.controller.ts` -> `getReports`
- `backend/src/services/admin.service.ts` -> `getReports`

AI suggestions:

- `backend/src/controllers/admin.controller.ts` -> `getAiSuggestions`, `approveAiSuggestion`, `rejectAiSuggestion`
- `backend/src/services/admin.service.ts` -> `getAiSuggestions`, `resolveAiSuggestion`

Mở trước khi debug:

- Admin bị `403` dù token hợp lệ: `auth.middleware.ts`, `admin.middleware.ts`
- CRUD ingredient/rule/product sai normalize, duplicate, relation: `admin.service.ts`
- Product update xong thứ tự ingredient bị sai: `admin.service.ts`
- AI suggestion approve xong vẫn chưa có ingredient/rule chính thức: `admin.service.ts`

### 3.10 Excel Import / Export

Route vẫn đi qua admin route:

1. `backend/src/routes/admin.routes.ts`
2. `backend/src/middlewares/auth.middleware.ts`
3. `backend/src/middlewares/admin.middleware.ts`
4. `backend/src/controllers/excel.controller.ts`
5. `backend/src/services/excel.service.ts`
6. `backend/src/utils/prisma.ts`

Import thêm 1 tầng middleware upload:

1. `backend/src/routes/admin.routes.ts`
2. `backend/src/controllers/excel.controller.ts` -> `excelUploadMiddleware`
3. `backend/src/controllers/excel.controller.ts` -> `importIngredientsExcel` / `importRulesExcel` / `importProductsExcel`
4. `backend/src/services/excel.service.ts`

Mở trước khi debug:

- Upload file fail, sai field `file`, mime type sai: `excel.controller.ts`
- Dữ liệu import sai cột, mapping enum sai, update/create sai: `excel.service.ts`
- Product import xóa quan hệ ingredient sai: `excel.service.ts`

### 3.11 OCR Upload

Flow `/api/ocr/ingredients`:

1. `backend/src/index.ts`
2. `backend/src/modules/ocr/ocrRoutes.ts`
3. multer memory upload ngay trong `ocrRoutes.ts`
4. `backend/src/modules/ocr/ocrController.ts` -> `extractIngredientsController`
5. `backend/src/modules/ocr/ocrService.ts` -> `parseImageForIngredients`
6. OCR.Space API
7. `backend/src/modules/ocr/ingredientsExtractor.ts` -> `extractIngredients`

Mở trước khi debug:

- File quá lớn, upload fail: `ocrRoutes.ts`
- OCR API fail hoặc timeout: `ocrService.ts`
- Text OCR ra nhiều rác, tách ingredient sai: `ingredientsExtractor.ts`

## 4. Hướng dẫn file-by-file theo thư mục

## 4.1 `backend/src/routes`

### `auth.routes.ts`

Làm gì:

- public endpoints cho register/login

Mở khi:

- endpoint auth sai method/path
- cần check route có auth middleware hay không

### `user.routes.ts`

Làm gì:

- profile và change password cho user đang login
- đặt `router.use(authMiddleware)` cho cả file

Mở khi:

- profile API bị `401/403` bất ngờ
- cần xem middleware đặt ở mức router hay từng endpoint

### `analysis.routes.ts`

Làm gì:

- route phân tích INCI
- chain `authMiddleware` -> `analysisRateLimiter`

Mở khi:

- analysis không vào controller
- bị `429` hoặc nghi middleware order sai

### `product.routes.ts`

Làm gì:

- route recommendation

Mở khi:

- frontend gọi recommendation sai path
- cần check route có auth hay không

### `history.routes.ts`

Làm gì:

- list/xóa history của user

Mở khi:

- method `DELETE /:id` và `DELETE /` gây nhầm lẫn

### `report.routes.ts`

Làm gì:

- community report + vote + pending + resolve
- auth cho toàn file, admin middleware chỉ cho `resolve`

Mở khi:

- user route và admin route cùng nằm một file nên cần check thứ tự và scope middleware

### `ingredient.routes.ts`

Làm gì:

- ingredient search cho luồng report/community

Mở khi:

- search endpoint sai prefix/query

### `notification.routes.ts`

Làm gì:

- đọc/mark notification và admin send message

Mở khi:

- bug role admin/send
- muốn biết endpoint nào protected bởi auth, endpoint nào protected thêm bởi admin

### `admin.routes.ts`

Làm gì:

- route lớn nhất backend
- gom admin CRUD, dashboard, reports, AI suggestions, excel import/export

Mở khi:

- bug thuộc vùng admin
- cần xem endpoint cụ thể nằm ở controller nào: `admin.controller.ts` hay `excel.controller.ts`

## 4.2 `backend/src/controllers`

### `auth.controller.ts`

Làm gì:

- validate body auth
- mapping error service -> HTTP status code

Mở khi:

- response auth sai message/status

### `user.controller.ts`

Làm gì:

- validate profile/password inputs
- gọi `user.service.ts`

Mở khi:

- body đúng nhưng API vẫn trả `400/401`

### `analysis.controller.ts`

Làm gì:

- check request body
- refresh `skinType` từ DB
- gọi `analysis.service.ts`
- lưu `analysisHistory`

Mở khi:

- kết quả phân tích và history có vấn đề

### `product.controller.ts`

Làm gì:

- lấy `skinType` và parse query `ingredients`
- gọi `product.service.ts`

Mở khi:

- recommendation endpoint trả `400` vì user profile chưa đầy đủ

### `history.controller.ts`

Làm gì:

- query Prisma trực tiếp cho history

Mở khi:

- bug liên quan ownership/history
- bạn muốn refactor tách service sau này

### `ingredient.controller.ts`

Làm gì:

- search ingredient theo query name
- normalize lowercase trước khi hit DB

Mở khi:

- bug search exact-match

### `report.controller.ts`

Làm gì:

- validate report/vote/resolve inputs
- gọi `report.service.ts`

Mở khi:

- status code report sai
- enum validation sai

### `notification.controller.ts`

Làm gì:

- query Prisma trực tiếp cho notification

Mở khi:

- bug ownership notification
- cần đổi sang service architecture sau này

### `admin.controller.ts`

Làm gì:

- HTTP adapter cho admin CRUD
- validate params/body/query
- gọi `admin.service.ts`

Mở khi:

- admin API trả sai status, sai query pagination, sai mapping error

### `excel.controller.ts`

Làm gì:

- upload middleware cho file Excel
- set response headers khi export
- chuyển `req.file.buffer` vào `excel.service.ts`

Mở khi:

- bug upload/export file
- request là `multipart/form-data`

## 4.3 `backend/src/middlewares`

### `auth.middleware.ts`

Làm gì:

- đọc JWT từ `Authorization: Bearer ...`
- gắn `req.user`

Mở khi:

- tất cả bug `401/Unauthorized`
- controller cần `req.user` nhưng bị `undefined`

### `admin.middleware.ts`

Làm gì:

- check `req.user.role === 'ADMIN'`

Mở khi:

- admin bị `403`
- route admin gọi sau auth nhưng vẫn không vào được

### `rateLimit.middleware.ts`

Làm gì:

- giới hạn số lần analysis theo ngày
- bỏ qua limit cho admin, nâng limit cho role `PRO`

Mở khi:

- user than bị khóa lượt phân tích
- nghi `keyGenerator` hoặc `max` tính sai

## 4.4 `backend/src/services`

### `auth.service.ts`

Làm gì:

- hash/compare password
- create JWT
- đọc/ghi user auth data

Mở khi:

- bug security/auth core

### `user.service.ts`

Làm gì:

- lấy profile
- update skin type/display name
- đổi password

Mở khi:

- profile DB cập nhật sai
- password change logic sai

### `analysis.service.ts`

Làm gì:

- tách INCI string
- match ingredient có sẵn trong DB
- gọi Gemini cho ingredient chưa biết
- cache AI suggestion
- trả về `DATABASE` / `AI` / `FALLBACK`

Mở khi:

- kết quả phân tích sai source, sai effect, sai fallback

### `product.service.ts`

Làm gì:

- scoring recommendation từ ingredient rules

Mở khi:

- recommendation ranking/filtering sai

### `report.service.ts`

Làm gì:

- create report
- toggle/update vote
- sort pending reports
- resolve report và gửi notification

Mở khi:

- bug business logic community reporting

### `admin.service.ts`

Làm gì:

- service tổng cho admin:
- ingredients
- rules
- products
- users
- dashboard stats
- reports summary
- AI suggestions

Mở khi:

- bug domain data do admin tạo/duyệt/sửa
- muốn trace side effects khi admin approve AI suggestion hoặc resolve dữ liệu

### `excel.service.ts`

Làm gì:

- import/export Excel
- validate từng dòng
- map enum/normalize headers

Mở khi:

- bug dữ liệu bulk import/export

## 5. Những ngoại lệ kiến trúc cần nhớ khi fix bug

1. Không phải feature nào cũng có service

- `history.controller.ts`
- `ingredient.controller.ts`
- `notification.controller.ts`

Nếu bug nằm ở 3 khu vực này, controller là nơi chứa logic chính.

2. Không phải controller nào cũng có route file riêng

- `excel.controller.ts` được mount bên trong `admin.routes.ts`

3. `admin.service.ts` là “service hợp”

- nó lớn hơn service khác vì gom nhiều sub-feature admin vào một nơi
- bug admin cần grep theo method cụ thể, không nên đọc nguyên file theo thứ tự từ trên xuống

4. OCR không nằm trong thư mục `routes/controllers/services` chính

- nếu frontend upload ảnh fail, đừng tìm trong `routes/analysis.routes.ts`
- phải nhảy thẳng sang `backend/src/modules/ocr/*`

5. `analysis.controller.ts` có side effect lưu history

- bug history đôi khi không nằm ở `history.controller.ts`
- nó có thể bắt đầu từ `analysis.controller.ts`

6. `report.service.ts` có side effect cập nhật rule và tạo notification

- bug report approve có thể lan sang `admin.service.ts`
- bug notification report resolve có thể nằm trong `report.service.ts`, không phải `notification.controller.ts`

## 6. Thứ tự mở file nhanh theo loại bug

Nếu bị `404`:

1. `backend/src/index.ts`
2. file trong `backend/src/routes/*.routes.ts`

Nếu bị `401/403`:

1. `backend/src/middlewares/auth.middleware.ts`
2. `backend/src/middlewares/admin.middleware.ts`
3. route file đang gắn middleware đó

Nếu body/query hợp lệ mà trả `400`:

1. controller tương ứng
2. service tương ứng

Nếu DB đúng nhưng kết quả business sai:

1. service tương ứng
2. controller nếu feature đó không có service

Nếu bug liên quan upload file:

1. `backend/src/controllers/excel.controller.ts`
2. `backend/src/modules/ocr/ocrRoutes.ts`
3. service upload tương ứng

Nếu bug liên quan AI:

1. `backend/src/services/analysis.service.ts`
2. `backend/src/utils/gemini.ts`
3. `backend/src/services/admin.service.ts` nếu là AI suggestion review

## 7. Gợi ý refactor sau này

Nếu muốn backend đều tay hơn và dễ debug hơn sau này, 3 ứng viên nên tách service riêng là:

- `history.controller.ts` -> `history.service.ts`
- `notification.controller.ts` -> `notification.service.ts`
- `ingredient.controller.ts` -> `ingredient.service.ts`

Nếu muốn admin dễ đọc hơn, có thể tách `admin.service.ts` thành:

- `admin-ingredients.service.ts`
- `admin-rules.service.ts`
- `admin-products.service.ts`
- `admin-users.service.ts`
- `admin-ai-suggestions.service.ts`

Hiện tại chưa cần refactor ngay để fix bug, nhưng nên nhớ đây là lý do admin area trong repo có cảm giác “dày đặc” hơn các feature khác.
