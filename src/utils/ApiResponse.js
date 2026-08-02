class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400       //setting standard for ourself by sending statusCode>=400 through ApiError and which is also good practice
    }
}

export {ApiResponse}


// HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:

// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)

// This is standard limit/way for showing status response.
// Companies predefined their own statusCode for each response within this limit consideration
// They will provide you with sheet for their response for particular statusCode