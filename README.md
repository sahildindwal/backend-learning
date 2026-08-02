# backend-learning
My backend learning repository from the Chai Aur Code course. Implemented authentication, REST APIs, MongoDB integration, file uploads, JWT, refresh tokens, and other backend concepts while learning Node.js and Express.


# Backend Learning Journey

This repository contains the project I built while following the **Complete Backend Development** course by **Chai Aur Code**. The goal wasn't just to complete the course but to understand how a real backend application is structured and how different technologies work together.

Along the way, I implemented authentication, file uploads, MongoDB aggregation pipelines, and learned how to write cleaner and more maintainable backend code.

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (JSON Web Tokens)
* bcrypt
* Multer
* Cloudinary
* Cookie Parser
* CORS
* dotenv

## What I Learned

### Backend Fundamentals

* Building REST APIs with Express
* Routing and Middleware
* MVC project structure
* Environment variables with dotenv
* Async programming using async/await

### MongoDB & Mongoose

* Database design using schemas and models
* CRUD operations
* Schema validation
* Mongoose middleware (pre hooks)
* Model instance methods
* References between collections
* MongoDB Aggregation Pipeline
* Using `$lookup`, `$match`, `$project`, `$addFields`, `$size`, `$cond`, and other aggregation stages for complex queries

### Authentication & Security

* User registration and login
* Password hashing with bcrypt
* JWT Access Tokens
* JWT Refresh Tokens
* Protected routes using authentication middleware
* Secure logout
* HTTP-only cookies
* Refresh token validation and regeneration

### File Uploads

* Uploading files using Multer
* Cloudinary integration
* Avatar upload
* Cover image upload

### Error Handling

* Custom `ApiError` class
* Custom `ApiResponse` class
* Async handler to avoid repetitive try-catch blocks
* Proper HTTP status codes and error responses

## APIs Implemented

* Register User
* Login User
* Logout User
* Refresh Access Token
* Get Current User
* Change Password
* Update Account Details
* Update Avatar
* Update Cover Image
* Get User Channel Profile (Aggregation Pipeline)
* Get Watch History (Aggregation Pipeline)

## Things I Practiced

* Writing modular backend code
* Designing RESTful APIs
* Connecting Express with MongoDB
* Handling authentication using JWT
* Working with Access & Refresh Tokens
* Uploading and managing images with Cloudinary
* Using MongoDB Aggregation Pipeline for advanced queries
* Organizing code using MVC architecture
* Testing APIs with Postman
* Debugging backend issues and understanding error handling

## Why I Built This

I created this project as part of my backend learning journey. It helped me move beyond basic CRUD operations and understand how authentication, database relationships, file uploads, cookies, and aggregation pipelines are used in real applications.

There are still many things to learn, but this project gave me a strong foundation in backend development and serves as a reference for everything I learned during the course.

## Acknowledgements

Thanks to **Chai Aur Code** for creating a beginner-friendly backend course that helped me understand these concepts by building them step by step.
