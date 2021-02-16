class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); 
        this.code = errorCode; //So we can append http code to error object
    }
}

module.exports = HttpError;