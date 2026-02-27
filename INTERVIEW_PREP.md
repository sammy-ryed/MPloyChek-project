# MPloyChek Interview Prep Guide
### Samarth Ryan Edward — Software Intern Role
---

> **Read this entire file the night before. Practice saying answers out loud.**

---

## TABLE OF CONTENTS
1. [Your Project — Plain English Summary](#1-your-project--plain-english-summary)
2. [System Architecture](#2-system-architecture)
3. [Angular — Deep Dive](#3-angular--deep-dive)
4. [Node.js & Express — Deep Dive](#4-nodejs--express--deep-dive)
5. [REST APIs & HTTP](#5-rest-apis--http)
6. [JWT Authentication & Security](#6-jwt-authentication--security)
7. [TypeScript Essentials](#7-typescript-essentials)
8. [Async Programming](#8-async-programming)
9. [Git & GitHub](#9-git--github)
10. [UI/UX & Angular Material](#10-uiux--angular-material)
11. [Predicted Interview Questions + Model Answers](#11-predicted-interview-questions--model-answers)
12. [Things to Say to Impress Them](#12-things-to-say-to-impress-them)
13. [What to Avoid Saying](#13-what-to-avoid-saying)

---

## 1. YOUR PROJECT — PLAIN ENGLISH SUMMARY

**What you built:**
A Single Page Application (SPA) called MPloyChek — a digital background verification portal.

### Stack
| Layer | Technology |
|---|---|
| Frontend | Angular 14, Angular Material, TypeScript |
| Backend | Node.js, Express.js |
| Storage | XML flat files (users.xml, records.xml) |
| Auth | JWT (JSON Web Tokens) |
| Communication | REST API over HTTP |

### What each part does

**Login Page**
- User enters username, password, and selects a role (General User or Admin)
- The form is a **Reactive Form** with validation (required fields)
- On submit, Angular sends a POST request to `/api/auth/login`
- Backend verifies the password using **bcrypt** hash comparison
- On success, backend returns a **JWT token**
- Angular stores the token in **sessionStorage**

**Dashboard (Logged In Page)**
- Shows user profile details (name, role, email)
- Fetches a list of records via GET `/api/records`
- Records are displayed in a **MatTable** with sorting, pagination, and search filter
- Admin sees ALL records with owner names
- General User sees only THEIR OWN records (role-scoped data)

**Admin Panel (Admin only)**
- Full user management — Create, Read, Update, Delete (CRUD)
- Activate/Deactivate users
- Protected by a route guard so only Admin can access it
- A dialog (MatDialog) pops up to add/edit users

**Async Simulation**
- Every API call accepts a `?delay=<milliseconds>` query parameter
- The backend pauses for that many milliseconds before responding
- The frontend shows a **progress bar** during loading
- This simulates real-world async scenarios (network latency, processing time)

---

## 2. SYSTEM ARCHITECTURE

```
Browser (Angular SPA)
    |
    | HTTP requests to /api/*
    |
    v
Angular Dev Server (port 4200)
    |
    | Proxy forwards /api/* to port 3000
    |
    v
Node.js / Express Backend (port 3000)
    |
    |-- /api/auth/login   --> reads users.xml, bcrypt compare, return JWT
    |-- /api/auth/me      --> returns logged-in user from JWT
    |-- /api/users        --> CRUD on users.xml (Admin only)
    |-- /api/records      --> read records.xml (role-scoped)
    |
    v
XML Files (users.xml, records.xml)
```

### Why a Proxy?
- In development, Angular runs on port 4200 and the backend runs on port 3000
- Browsers block cross-origin requests (CORS policy)
- We configure `proxy.conf.json` to tell Angular's dev server: "if a request starts with `/api`, forward it to port 3000"
- This avoids CORS issues during development

---

## 3. ANGULAR — DEEP DIVE

### What is Angular?
Angular is a **TypeScript-based frontend framework** made by Google. It is used to build Single Page Applications (SPAs) — web apps where the page never fully reloads, instead views are swapped dynamically.

### Core Concepts You Used

#### 3.1 Modules (`@NgModule`)
- Angular apps are divided into **modules** — logical groupings of related components/services
- `AppModule` is the root module
- You created **feature modules**: `AuthModule`, `DashboardModule`, `AdminModule`
- This is called **modular architecture** — separation of concerns

```typescript
// Example: DashboardModule is a feature module
@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, MatTableModule, ...],
})
export class DashboardModule {}
```

#### 3.2 Lazy Loading
- Feature modules are **lazy loaded** — they are NOT downloaded until the user navigates to that route
- Improves initial load time (smaller bundle size on first load)
- Configured with `loadChildren` in the routing module

```typescript
// Lazy loaded route
{ path: 'dashboard', loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) }
```

**Why is this important?** If Admin module is 200KB, and a General User never goes there, they never download those 200KB. Better performance.

#### 3.3 Components
- A component = HTML template + TypeScript class + SCSS styles
- Each component has a lifecycle:
  - `ngOnInit()` — runs after component is created (where you call APIs)
  - `ngOnDestroy()` — cleanup before component is destroyed
  - `ngAfterViewInit()` — runs after the DOM is ready (where you initialize MatTable)

#### 3.4 Services
- Services hold **business logic and data fetching** — kept separate from components
- Services are **Injectable** — Angular's Dependency Injection system provides them to components

```typescript
// You inject UserService into a component like this:
constructor(private userService: UserService) {}
```

**Services you built:**
- `AuthService` — login, logout, token storage, current user state
- `UserService` — CRUD operations on users
- `RecordService` — fetch records from backend

#### 3.5 Dependency Injection (DI)
- Angular's system of providing instances of classes (services) to components automatically
- You declare a service as `@Injectable({ providedIn: 'root' })` and Angular creates a **singleton** — one shared instance across the whole app
- You don't create `new UserService()` manually — Angular does it for you and injects it

#### 3.6 Reactive Forms
- Used `FormBuilder`, `FormGroup`, `FormControl`, `Validators`
- Two-way binding between TypeScript and HTML without needing `ngModel`
- Validations defined in code (not HTML attributes)

```typescript
// Your login form
this.loginForm = this.fb.group({
  userId: ['', Validators.required],
  password: ['', [Validators.required, Validators.minLength(6)]],
  role: ['GeneralUser', Validators.required]
});
```

#### 3.7 Route Guards
- Guards protect routes from unauthorized access
- **`AuthGuard`** → checks if user is logged in (has a valid JWT). If not, redirects to `/login`
- **`AdminGuard`** → checks if logged-in user has the Admin role. If not, redirects to `/dashboard`
- Implements three interfaces: `CanActivate`, `CanActivateChild`, `CanLoad`
  - `CanLoad` is critical for lazy modules — blocks the module from even being downloaded

#### 3.8 HTTP Interceptors
- `JwtInterceptor` automatically attaches the Bearer token to EVERY outgoing HTTP request
- You don't manually add the Authorization header in every service call — the interceptor handles it globally

```typescript
// Interceptor adds this to every request:
headers: { Authorization: 'Bearer eyJhbGci...' }
```

#### 3.9 RxJS & Observables
- Angular's HTTP client returns **Observables** (not Promises)
- Observables are lazy streams — they only execute when subscribed to
- Key operators you used:
  - `subscribe()` — execute the observable and react to data
  - `tap()` — side effects without changing the stream (e.g., store token)
  - `catchError()` — handle errors
  - `BehaviorSubject` — an observable that holds a current value and emits it to new subscribers immediately

```typescript
// BehaviorSubject used for current user state
private currentUserSubject = new BehaviorSubject<User | null>(null);
currentUser$ = this.currentUserSubject.asObservable();
```

#### 3.10 Angular Material
- Google's Material Design component library for Angular
- Components you used: `MatTable`, `MatSort`, `MatPaginator`, `MatDialog`, `MatFormField`, `MatInput`, `MatButton`, `MatProgressBar`, `MatSidenavv`, `MatCard`, `MatChips`

---

## 4. NODE.JS & EXPRESS — DEEP DIVE

### What is Node.js?
- JavaScript runtime built on Chrome's V8 engine
- Allows you to run JavaScript **on the server** (outside the browser)
- **Non-blocking I/O** — can handle many requests concurrently without waiting for each one to finish
- Single-threaded but uses an **event loop** for async operations

### What is Express?
- A minimal web framework for Node.js
- Makes it easy to define routes, middleware, and handle HTTP requests/responses

### What you built

#### 4.1 Server Setup (`server.js`)
```javascript
const express = require('express');
const app = express();

app.use(cors());                    // Allow cross-origin requests
app.use(express.json());            // Parse JSON request bodies
app.use(delayMiddleware);           // Apply delay to all routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);

app.listen(3000);
```

#### 4.2 Middleware
Middleware = functions that run between receiving a request and sending a response.

**Order matters** — middleware runs top to bottom.

- **`delay.js`** — reads `req.query.delay`, waits that many ms, then calls `next()`
- **`auth.js`** — checks `Authorization` header, verifies JWT, attaches `req.user`, calls `next()` (or returns 401 if invalid)
- **CORS** — adds headers to allow the frontend to call the backend

```javascript
// Your delay middleware
function delayMiddleware(req, res, next) {
  const delay = Math.min(parseInt(req.query.delay) || 0, 10000);
  setTimeout(next, delay);
}
```

#### 4.3 Routes & Controllers
- `auth.js` — POST `/login`, GET `/me`
- `users.js` — GET, POST, PUT, DELETE on `/users`  (protected + Admin only)
- `records.js` — GET `/records` (role-scoped response)

#### 4.4 XML Storage
- Used `xml2js` library to parse XML files into JavaScript objects and write back
- `xmlHelper.js` exports `getUsers()`, `saveUsers()`, `getRecords()`
- Simulates a database without needing an actual DB setup

#### 4.5 Password Hashing with bcrypt
- User passwords are **never stored as plain text**
- `bcryptjs.hash(password, 10)` creates a one-way hash
- `bcryptjs.compare(inputPassword, storedHash)` verifies login
- Even if someone reads the XML file, they can't recover the passwords

---

## 5. REST APIs & HTTP

### HTTP Methods
| Method | Use | Example |
|---|---|---|
| GET | Read data | GET /api/records |
| POST | Create new data | POST /api/auth/login |
| PUT | Update existing data | PUT /api/users/:id |
| DELETE | Delete data | DELETE /api/users/:id |

### HTTP Status Codes
| Code | Meaning | When you use it |
|---|---|---|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Valid token but wrong role |
| 404 | Not Found | User/record doesn't exist |
| 500 | Server Error | Unexpected backend crash |

### REST Principles
- **Stateless** — each request contains all info needed (no session on server)
- **Resource-based** — URLs represent resources (`/users`, `/records`), not actions
- **Uniform Interface** — standard methods (GET/POST/PUT/DELETE)

### Query Parameters vs Body
- **Query params** (`?delay=2000`) — for filtering, sorting, optional modifiers
- **Request body** (JSON) — for creating/updating data
- **Path params** (`/users/:id`) — to identify a specific resource

---

## 6. JWT AUTHENTICATION & SECURITY

### What is JWT?
JSON Web Token — a compact, URL-safe token for securely transmitting information.

### Structure
A JWT has 3 parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEiLCJyb2xlIjoiQWRtaW4ifQ.abc123xyz
    HEADER                        PAYLOAD                    SIGNATURE
```

- **Header** — algorithm used (HS256)
- **Payload** — the data (userId, role, expiry) — BASE64 encoded, NOT encrypted (don't store passwords here!)
- **Signature** — HMAC of header+payload using a secret key — proves the token wasn't tampered with

### Your auth flow
```
1. User submits credentials
2. Backend: bcrypt.compare(password, storedHash)
3. If match: jwt.sign({ id, role }, SECRET, { expiresIn: '8h' })
4. Return token to frontend
5. Frontend: sessionStorage.setItem('mpoly_token', token)
6. Every future request: Authorization: Bearer <token>
7. Backend middleware: jwt.verify(token, SECRET) → gets user info
```

### Why sessionStorage and not localStorage?
- `sessionStorage` is cleared when the browser tab closes
- `localStorage` persists even after browser closes
- For security, sessionStorage is safer — tokens can't be stolen from a closed session

### Why 8 hours expiry?
- Tokens should expire to limit damage if stolen
- 8 hours = a typical work day session

---

## 7. TYPESCRIPT ESSENTIALS

### What is TypeScript?
- JavaScript with **static types** — you declare what type a variable is
- Catches errors at **compile time** instead of runtime
- Angular is built with TypeScript

### Key concepts you used

#### Interfaces (Models)
```typescript
// user.model.ts
export interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'Admin' | 'GeneralUser';   // union type — only these two values allowed
  isActive: boolean;
}
```

#### Generics
```typescript
// HttpClient.get returns Observable<T>
this.http.get<User[]>('/api/users')  // T = User[] here
```

#### Decorators
- `@Component`, `@NgModule`, `@Injectable`, `@Input`, `@Output`
- These are TypeScript metadata annotations that Angular uses to configure classes

#### Access Modifiers
- `private` — only accessible within the class
- `public` — accessible anywhere (default)
- `readonly` — can only be set once

---

## 8. ASYNC PROGRAMMING

### The Event Loop (Node.js)
- JavaScript is single-threaded — it can only do one thing at a time
- But it can **schedule** operations (I/O, timers) and handle other work while waiting
- The event loop picks up completed async operations and runs their callbacks

### Promises vs Observables
| | Promise | Observable |
|---|---|---|
| Values | One value | Multiple values over time |
| Lazy? | No (starts immediately) | Yes (starts on subscribe) |
| Cancellable? | No | Yes (unsubscribe) |
| Used in | Native JS, Node.js | Angular HTTP, RxJS |

### async/await (Node.js backend)
```javascript
// Your XML reading is synchronous, but if it were async:
async function getUsers() {
  const data = await fs.readFile('users.xml', 'utf-8');
  const parsed = await xml2js.parseStringPromise(data);
  return parsed;
}
```

### The delay parameter — why it matters for interviews
- Real-world APIs take time (database queries, external service calls)
- You built a simulation: `?delay=3000` makes the API wait 3 seconds
- The frontend shows a loading spinner/progress bar during this wait
- This demonstrates understanding of **async UX patterns** — don't freeze the UI while waiting

### How Angular handles async
```typescript
// subscribe pattern
this.recordService.getAll(2000).subscribe({
  next: (records) => { this.records = records; this.loading = false; },
  error: (err) => { this.error = err.message; this.loading = false; }
});
```

---

## 9. GIT & GITHUB

### Basic workflow you followed
```bash
git init                    # Initialize repo
git add .                   # Stage all files
git commit -m "message"     # Save snapshot
git remote add origin <url> # Link to GitHub
git push -u origin main     # Upload to GitHub
```

### What `.gitignore` does
- Lists files/folders git should NOT track
- You ignored `node_modules/` (100MB+ of dependencies — anyone can recreate with `npm install`)
- You ignored `dist/` (build output — can be regenerated)
- You ignored `.env` (contains secrets — never commit this!)

### Branch concept
- `main` is your primary branch
- In teams, you'd create feature branches: `git checkout -b feature/login-page`
- Merge via Pull Requests (PRs) on GitHub

---

## 10. UI/UX & ANGULAR MATERIAL

### Material Design
- Google's design system — rules for spacing, elevation (shadows), typography, color, animations
- Angular Material implements these components for Angular
- Your app uses: Cards, Tables, Buttons, Dialogs, Form Fields, Progress Bars, Sidenav

### Responsive Design
- CSS media queries adjust layout based on screen size
- Angular Material's grid/flex tools help with this

### What makes good UI (say this confidently)
- Clear visual hierarchy (what's important is prominent)
- Consistent spacing and typography
- Loading states (don't leave user wondering if something is happening)
- Error messages (tell the user what went wrong and what to do)
- Role-appropriate content (don't show admin controls to regular users)

---

## 11. PREDICTED INTERVIEW QUESTIONS + MODEL ANSWERS

---

### CATEGORY A: About Your Project

**Q: Walk me through your project.**

> "I built a Single Page Application called MPloyChek — a background verification portal. It has an Angular 14 frontend and a Node.js Express backend. The frontend has three modules: Auth for login, Dashboard for viewing records, and Admin for user management. The backend exposes REST APIs that read and write to XML files for storage. Authentication uses JWT tokens with bcrypt password hashing. I also implemented an async delay mechanism where any API call can accept a `delay` query parameter to simulate network latency, with a loading progress bar on the frontend."

---

**Q: Why did you choose XML for storage instead of a database?**

> "The challenge specifically allowed XML as a storage option. I chose it to keep the setup simple — no database server to install or configure. The `xml2js` library makes it straightforward to parse and serialize XML in Node.js. In a production system, I'd use a proper database like MongoDB or PostgreSQL for querying, indexing, and concurrent write safety."

---

**Q: How does the role-based access control work?**

> "It works at two levels. On the backend, the JWT payload contains the user's role. After token verification, route handlers check `req.user.role` — if it's not Admin, certain routes return 403 Forbidden. On the frontend, route guards (AuthGuard and AdminGuard) check the stored user's role before allowing navigation. The Admin module is also lazy-loaded and blocked by CanLoad guard so General Users can't even download the Admin code."

---

**Q: What is lazy loading and why did you use it?**

> "Lazy loading means Angular only downloads a module's code when the user first navigates to that route. Without it, all modules are bundled into one large file that the browser downloads on initial page load. With lazy loading, the initial bundle is smaller and the app starts faster. The Admin module only gets downloaded if the user is Admin and navigates to `/admin`."

---

**Q: How does the async delay work?**

> "The backend has a middleware function that runs before every route handler. It reads the `delay` query parameter, caps it at 10 seconds, and calls `setTimeout(() => next(), delay)` — which pauses the request processing for that duration. On the frontend, when a component initializes, it sets a loading flag to true, passes the delay value as a query param, subscribes to the Observable, and shows a MatProgressBar. When data arrives, it sets loading to false and displays the table."

---

**Q: Explain the JWT flow in your app.**

> "The user submits their credentials. The backend verifies the password using bcrypt's compare function against the stored hash. If valid, it signs a JWT with the user's ID and role using a secret key, with an 8-hour expiry. The frontend stores this token in sessionStorage. My HTTP Interceptor automatically reads this token and attaches it as a Bearer Authorization header to every subsequent API call. The backend's auth middleware verifies the token's signature on each request to authenticate the user."

---

**Q: Why did you use sessionStorage instead of localStorage?**

> "sessionStorage is scoped to the browser tab and is cleared when the tab closes. This means if someone closes the browser, their session ends automatically. localStorage persists across sessions which is a security risk — if the machine is shared or a token gets stolen via XSS, the damage window is larger with localStorage. For a background verification platform handling sensitive employment data, sessionStorage is the safer choice."

---

**Q: What is an HTTP Interceptor?**

> "An interceptor is an Angular service that sits in the HTTP pipeline. It can modify every outgoing request or every incoming response before they reach your service or component. I used it to clone every request and add the Authorization Bearer token header, so I don't have to manually add the header in every service method. It also handles 401 responses globally by triggering a logout."

---

### CATEGORY B: Angular Concepts

**Q: What is the difference between ngOnInit and the constructor?**

> "The constructor is called by TypeScript when the class is instantiated and is used for dependency injection — Angular injects services here. At that point, Angular hasn't set up the component's inputs or template yet. `ngOnInit` is a lifecycle hook called by Angular after it has set up the component and its inputs. It's the correct place to fetch data, access input properties, and start subscriptions."

---

**Q: What's the difference between reactive forms and template-driven forms?**

> "Template-driven forms use two-way data binding with `ngModel` in the HTML template — they're quick but harder to test and less explicit. Reactive forms define the form structure in TypeScript using `FormBuilder`, `FormGroup`, and `FormControl`. They're more explicit, easier to test, and give you finer control over validation logic. I used reactive forms because they're better for complex forms with custom validation, which is the Angular best practice."

---

**Q: What is a BehaviorSubject?**

> "A BehaviorSubject is a special RxJS Subject that holds a current value and immediately emits that value to any new subscriber. I used it in AuthService to hold the current user state. When a component subscribes to `currentUser$`, it immediately gets the current user (or null if not logged in) without waiting for a new emission. This is perfect for sharing application-wide state like authentication."

---

**Q: What is a route guard?**

> "A route guard is a service that implements specific interfaces to control whether Angular allows or prevents navigation to a route. CanActivate blocks navigation to a route. CanActivateChild blocks child routes. CanLoad prevents the module's code from even being downloaded. In my app, AuthGuard checks for a valid JWT before allowing any protected route, and AdminGuard further restricts to Admin-role users."

---

**Q: Explain Dependency Injection.**

> "Dependency Injection is a design pattern where a class receives its dependencies from an external source rather than creating them itself. In Angular, when I declare `constructor(private authService: AuthService)`, I'm not creating a new AuthService — Angular's DI container provides the existing singleton instance. This makes code modular, testable (you can inject mock services in tests), and promotes the Single Responsibility Principle."

---

### CATEGORY C: Node.js / Backend

**Q: What is middleware in Express?**

> "Middleware is a function with the signature `(req, res, next)` that runs in sequence for every matching request. It can modify `req` or `res`, end the request-response cycle, or call `next()` to pass control to the next middleware. I built two custom middleware: a delay middleware that pauses for n milliseconds before calling next(), and an auth middleware that verifies the JWT and attaches the user to the request object."

---

**Q: Why do we need CORS?**

> "Browsers enforce the Same-Origin Policy — a web page can only make requests to the same origin (domain + port) it was loaded from. My Angular app loads from port 4200 and my backend is on port 3000 — different origins. CORS (Cross-Origin Resource Sharing) lets the server tell browsers: 'I allow requests from these other origins.' I used the `cors` npm package to add the appropriate response headers."

---

**Q: What's the difference between synchronous and asynchronous code in Node.js?**

> "Synchronous code blocks execution — the program waits for an operation to finish before moving on. Asynchronous code doesn't block — Node.js schedules the operation and continues executing. When the operation completes, a callback/Promise/async-await handles the result. Node.js is designed for async because blocking on I/O operations (like reading a file or database query) while handling thousands of requests would be very slow."

---

### CATEGORY D: General Software Engineering

**Q: What is a SPA (Single Page Application)?**

> "A traditional multi-page app loads a new HTML page from the server for every navigation. A SPA loads one HTML page initially and then dynamically renders views in the browser using JavaScript, only fetching data from the server (not full pages). This makes navigation feel instant, reduces server load, and enables smoothly animated transitions. Angular, React, and Vue are all SPA frameworks."

---

**Q: What is the difference between authentication and authorization?**

> "Authentication is verifying who you are — 'prove you are who you claim to be' (login with username/password). Authorization is determining what you're allowed to do — 'you are authenticated, but are you allowed to access this resource?' (role checks). In my app, the login flow handles authentication (bcrypt + JWT). Route guards and backend role checks handle authorization."

---

**Q: What is REST?**

> "REST (Representational State Transfer) is an architectural style for designing APIs. Key principles: APIs are stateless (each request has all context needed), resources are identified by URLs, standard HTTP methods define operations (GET=read, POST=create, PUT=update, DELETE=delete), and responses use standard status codes. My API follows REST — `/api/users` is the resource, and I use GET/POST/PUT/DELETE on it."

---

**Q: What is bcrypt and why not use MD5/SHA?**

> "bcrypt is a password hashing function designed specifically for passwords. MD5 and SHA are fast — that's good for integrity checks but bad for passwords because attackers can compute billions of hashes per second to brute-force. bcrypt is intentionally slow (configurable 'cost factor') and includes a random salt. Bcrypt with cost factor 10 takes milliseconds for one hash but makes brute-forcing impractical. Passwords should NEVER be stored plain or with MD5/SHA."

---

**Q: What is the difference between `==` and `===` in JavaScript?**

> "`==` is loose equality — it converts types before comparing (`'5' == 5` is true). `===` is strict equality — no type conversion (`'5' === 5` is false). Always use `===` to avoid unexpected bugs from implicit type coercion."

---

**Q: What's the difference between `var`, `let`, and `const`?**

> "`var` is function-scoped and hoisted — can lead to bugs. `let` is block-scoped and can be reassigned. `const` is block-scoped and cannot be reassigned (though objects declared with const can have their properties mutated). Best practice: use `const` by default, `let` when you need to reassign, never use `var`."

---

**Q: What is an Observable vs a Promise?**

> "Both handle async operations. A Promise handles a single future value — once resolved or rejected, it's done. An Observable can emit multiple values over time and is cancellable. Observables are lazy — they don't execute until subscribed. Angular's HttpClient uses Observables because HTTP streams fit the Observable model, and you can compose/transform data with RxJS operators."

---

### CATEGORY E: HR / Soft Skills

**Q: Why did you choose this tech stack?**

> "The challenge specified Angular 12+ with Node.js or TypeScript. I chose Angular 14 because it has a rich ecosystem, Angular Material for consistent UI out of the box, and it enforces structure through modules and services which is important for scalable apps. Node.js with Express for the backend was a natural choice — JavaScript across the full stack means shared models and less context switching."

---

**Q: What was the hardest part of building this?**

> "The hardest part was getting lazy-loaded modules to work correctly with route guards. I had an Angular guard that implemented CanActivate but not CanLoad. Angular silently blocked the module download without console errors — it just showed a white screen. Debugging it required systematic checking of the routing configuration, and I discovered that for canLoad to work, the guard must explicitly implement the CanLoad interface."

---

**Q: If you had more time, what would you improve?**

> "I would replace the XML flat files with MongoDB for proper querying and concurrent write safety. I'd add unit tests using Jasmine/Karma for Angular components and Jest for Node.js. I'd implement token refresh logic using refresh tokens so users aren't logged out mid-session. I'd also add an audit log to track user management actions — important for a background verification platform. And I'd containerize the app with Docker for easier deployment."

---

**Q: How would this scale to production?**

> "For production: replace XML with a proper database (MongoDB Atlas or PostgreSQL). Deploy the Node.js backend to a cloud service like Azure App Service or AWS Lambda. Deploy the Angular build as a static site on Azure Static Web Apps or S3+CloudFront. Add load balancing, environment variables via Azure Key Vault or AWS Secrets Manager, HTTPS everywhere, and rate limiting on the API. The modular architecture I've used makes this migration straightforward."

---

## 12. THINGS TO SAY TO IMPRESS THEM

1. **"I separated concerns by using a core module"** — Services, guards, interceptors, and models are in `frontend/src/app/core/` — not dumped into AppModule.

2. **"I used singleton services with providedIn: 'root'"** — Ensures one shared instance across the app without manually registering in every module.

3. **"The JWT interceptor provides a clean separation"** — Auth logic isn't in each service method; it's centralized.

4. **"I applied the principle of least privilege"** — General Users only get back their own records. The backend enforces this — not just the frontend.

5. **"I validated on both sides"** — Frontend forms validate before submitting. Backend validates again before processing. Never trust client-side validation alone.

6. **"I capped the delay at 10 seconds on the backend"** — Prevents abuse where someone passes `?delay=999999` to freeze a server thread.

7. **"For a background verification platform, security is critical"** — That's why I used bcrypt (not plain text), JWT (not session cookies), and HTTPS-ready CORS config.

---

## 13. WHAT TO AVOID SAYING

- ❌ Don't say "I just copied it from Stack Overflow" — say "I referenced documentation and adapted it"
- ❌ Don't say "I don't know what that does" — say "I haven't worked with that specifically, but based on [related concept], I'd approach it by..."
- ❌ Don't say "It just works" — explain WHY it works
- ❌ Don't say "Angular is basically React" — they're different architecturally
- ❌ Don't say your XML approach is "production-ready" — be honest it's a proof-of-concept for the challenge

---

## QUICK REFERENCE CHEAT SHEET

```
App runs on:
  Frontend → http://localhost:4200
  Backend  → http://localhost:3000

Test credentials:
  admin / password123    → role: Admin
  jsmith / password123   → role: GeneralUser
  mjohnson / password123 → role: GeneralUser
  swilliams / password123 → role: Admin

Key files:
  backend/server.js              — Express app entry
  backend/routes/auth.js         — Login endpoint
  backend/data/users.xml         — User storage
  frontend/src/app/app.module.ts — Root Angular module
  frontend/proxy.conf.json       — Dev proxy config
  frontend/src/environments/     — Environment configs

Key concepts to mention:
  SPA, Lazy Loading, JWT, bcrypt, REST, Reactive Forms,
  Route Guards, DI, Interceptors, RxJS, Modular Architecture,
  Async/Await, Middleware, CORS, Role-Based Access Control
```

---

*Good luck tomorrow. You built this — you understand it better than anyone else in that room.*
