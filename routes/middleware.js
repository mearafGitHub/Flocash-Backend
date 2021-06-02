const {createProxyMiddleware} = require("http-proxy-middleware")

module.exports = function (app) {
    app.use(
        "/rest/v2/orders", 
        createProxyMiddleware({
            target: "https://sandbox.flocash.com/",
            changeOrigin: true
        })  
    )
}