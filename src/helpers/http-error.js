class HttpError extends Error {
    constructor(message, errorCode) {
        super(message); 
        this.code = errorCode; //So we can append http code to error object
    }
    static handleError(err, res) {
        //unless a custom HttpError is thrown explicitly, sends back generic 500
        if (!err.code) {
            err.message = "Something went wrong";
            err.code = 500;
        }
        res.status(err.code);
        res.json({ error: err.message, status: err.code })
    }
}

module.exports = HttpError;