module.exports = {
    cors: {
        origin: process.env.CLIENT_ORIGIN,
        methods: ["GET", "PATCH", "POST"]
    }
}