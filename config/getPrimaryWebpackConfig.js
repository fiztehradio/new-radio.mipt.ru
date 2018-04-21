const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const ENVIRONMENTS = require('./Environments');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getPluginsArrayForCommonPages() {
    const templates = ['index'];
    return templates.map(template => {
        return new HtmlWebpackPlugin({
            template: `./src/templates/${template}.html`,
            chunks: [template],
            filename: `../${template}.html`,
            inject: 'head'
        });
    });
}

function getConfig(NODE_ENV) { // NOSONAR
    let settings;
    if (NODE_ENV === ENVIRONMENTS.WATCH) {
        settings = {
            output: '[name].js',
            outputChunk: '[name].js',
            hashed: '[name].[ext]',
            chunkSuffix: '',
            contentHashSuffix: ''
        };
    } else {
        settings = {
            output: '[name]-[hash].js',
            outputChunk: '[name]-[hash].[id].js',
            hashed: '[name]-[hash].[ext]',
            chunkSuffix: '-[hash]',
            contentHashSuffix: '-[contenthash]'
        };
    }

    const config = {
        entry: {
            index: './src/index.ts'
        },
        output: {
            filename: settings.output,
            path: path.resolve('./build/'),
            chunkFilename: settings.outputChunk,
        },
        resolve: {
            extensions: ['.js', '.ts', '.ejs', '.html'],
            modules: ['node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.pcss$/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            'css-loader?importLoaders=1',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: function () {
                                        return [
                                            require('postcss-smart-import')({}),
                                            require('precss')({}),
                                            require('autoprefixer')({ grid: true })
                                        ];
                                    }
                                }
                            }
                        ]
                    })
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader'
                    }
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    include: [
                        path.resolve(__dirname, '../../src/fonts')
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: settings.hashed
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 200000,
                                hash: 'sha512',
                                digest: 'hex',
                                name: settings.hashed
                            }
                        },
                        {
                            // To make png quality (and also weight) lower
                            loader: 'image-webpack-loader',
                            options: {
                                query: {
                                    optipng: {
                                        optimizationLevel: 7
                                    }
                                },
                                bypassOnDebug: true
                            }
                        }
                    ]
                },
                {
                    test: /\.ico$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanPlugin(['./build/'], {
                root: process.cwd()
            }),
            ...getPluginsArrayForCommonPages(),
            new ExtractTextPlugin(`style-[name]${settings.contentHashSuffix}.css`)
        ],
        bail: true
    };

    return config;
}

module.exports = getConfig;