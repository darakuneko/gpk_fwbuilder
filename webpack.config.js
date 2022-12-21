const path = require('path');

module.exports = [{
    target: "electron-renderer",
    devtool: 'source-map',
    mode: 'development',
    entry: {
        app: './src',
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, 'public/build')
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src"),
            "node_modules",
        ],
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            }
        ]
    },
    plugins: []
}]