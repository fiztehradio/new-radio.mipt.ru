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
            template: `./src/templates/${name}.html`,
            chunks: [template],
            chunksSortMode: (a, b) => {
                const vendors = ['app', 'vendors'];

                const n = {
                    a: a.names[0],
                    b: b.names[0]
                };

                if (vendors.includes(n.a, n.b)) {
                    return n.a === 'app' ? 1 : -1;
                }

                return vendors.includes(n.a) ? -1 : 1;
            },
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
        /* 
            The reason to use build-hash is that there is a deffect (if use content-hash):
            Some pages was changed and they got new hash
            Some pages was not changed and they still have the same hash with previous version
            But webpack bootstrap has wrong refs to the pages, that was loaded from browser hash;

            Solution 1: use build hash
            Solution 2: extract webpack manifest https://webpack.js.org/guides/caching/#extracting-boilerplate
        */
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
            index: './js/index.ts',
            vendors: [
                'jquery',
            ]
        },
        output: {
            filename: settings.output,
            path: path.resolve('./build/'),
            chunkFilename: settings.outputChunk,
        },
        resolve: {
            extensions: ['.js', '.ts', '.ejs', '.html'],
            alias: {
                jquery: path.join(__dirname, './../../js/lib/jquery/jquery-2.1.4.js'),
                jqueryUi: path.join(__dirname, './../../js/lib/jquery/ui/jquery-ui-1.11.4.min.js'),
                jqueryGrayScale: path.join(__dirname, './../../js/lib/jquery/grayscale/jquery-gray-1.4.5.min.js'),
                jqueryFormstyler: path.join(__dirname, './../../js/lib/jquery/formStyler/jquery-formstyler-1.7.4.js'),
                jqueryDebounce: path.join(__dirname, './../../js/lib/jquery/debounce/debounce-1.1.min.js'),
                jqueryDatepicker: path.join(__dirname, './../../js/lib/jquery/datepicker/jquery-datepicker-2.2.3.js'),
                jqueryDotdotdot: path.join(__dirname, './../../js/lib/jquery/dotdotdot/jquery.dotdotdot-1.8.3.min.js'),
                jqueryPasteImage: path.join(__dirname, './../../js/lib/jquery/pasteImage/pasteimage-1.0.0.js'),
                jqueryScrollbar: path.join(__dirname, './../../js/lib/jquery/scrollbar/jquery.scrollbar-0.2.11.js'),
                statistic: path.join(__dirname, './../../js/lib/statistics/statistic-2.16.0.js'),
                device: path.join(__dirname, './../../js/lib/device/device-0.2.7.min.js'),
                dateFormat: path.join(__dirname, './../../js/lib/dateformat/dateformat-2.0.0.js')
            },
            modules: ['node_modules']
        },
        module: {
            rules: [
                {
                    test: /exceptionHelper.js/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                },
                {
                    test: /jquery-gray/,
                    use: 'imports-loader?this=>window'
                },
                {
                    test: /debounce/,
                    use: 'imports-loader?this=>{jQuery: $}'
                },
                {
                    test: /\.pcss$/,
                    exclude: ['error.pcss'],
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
                    exclude: [
                        path.resolve(__dirname, './../../src/images/default-photo.png'),
                        path.resolve(__dirname, './../../src/images/nouser.png')
                    ],
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
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    include: [
                        path.resolve(__dirname, './../../src/images/default-photo.png'),
                        path.resolve(__dirname, './../../src/images/nouser.png')
                    ],
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]'
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
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                "window.jQuery": 'jquery'
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendors',
                minChunks: function (module) {
                    return module.context && (module.context.indexOf('node_modules') > -1 || module.context.indexOf('Home.Web\\js\\lib') > -1);
                },
                filename: `vendors${settings.chunkSuffix}.js`
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'app',
                filename: `app${settings.chunkSuffix}.js`,
                minChunks: 2,
                chunks: ['index', 'employee', 'servicedesk', 'services2employees', 'mytravel', 'vacationrequest', 'mytasks']
            }),
            ...getPluginsArrayForErrorPages(),
            ...getPluginsArrayForCommonPages(),
            new ExtractTextPlugin(`style-[name]${settings.contentHashSuffix}.css`)
        ],
        bail: true
    };

    const typescript = {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
            loader: 'ts-loader'
        }
    };

    if (NODE_ENV === ENVIRONMENTS.PROD) {
        typescript.exclude = /_tests/;
    }

    config.module.rules.push(typescript);

    return config;
}

module.exports = getConfig;