var App = angular
        .module('App', [
            'ngRoute'
        ])
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                        .when('/', {
                            url: "/",
                            templateUrl: "views/home.html",
                            controller: "HomeController"
                        })
                        .otherwise({
                            redirectTo: '/'
                        });
            }])
        .factory('pouch', function () {
            var db = new PouchDB('ng-pouch');
            db.sync('http://192.168.25.4:8888/ng-db', {
                live: true
            }).on('error', function (err) {
            });
            return db;
        })
        .factory('util', ['$q', '$rootScope',
            function ($q, $rootScope) {
                return {
                    resolve: function (value) {
                        $rootScope.$apply(function () {
                            return $q.when(value);
                        });
                    },
                    reject: function (error) {
                        $rootScope.$apply(function () {
                            return $q.reject(error);
                        });
                    }
                };
            }])
        .factory('Todos', ['$rootScope', 'pouch', 'util',
            function ($rootScope, pouch, util) {
                var todos = [];

                pouch.changes({live: true})
                        .on('change', function (change) {
                            if (!change.deleted) {
                                pouch.get(change.id).then(function (todo) {
                                    $rootScope.$apply(function () {
                                        todos.push(todo);
                                    });
                                }, function (err) {
                                    console.log(err);
                                }).catch(function () {
                                });
                            } else {
                                for (var i = 0; i < todos.length; ++i) {
                                    if (todos[i]._id === change.id) {
                                        $rootScope.$apply(function () {
                                            todos.splice(i, 1);
                                        });
                                        break;
                                    }
                                }
                            }
                        });

                return {
                    todos: todos,
                    add: function (text) {
                        return pouch.post({
                            type: 'todo',
                            text: text
                        }).then(util.resolve)
                                .catch(util.reject);
                    },
                    remove: function (todo) {
                        return pouch.get(todo._id)
                                .then(function (doc) {
                                    return pouch.remove(doc)
                                            .then(util.resolve, util.reject)
                                            .catch(function () {
                                                alert('error');
                                            });
                                })
                                .catch(util.reject);
                    }
                };
            }]);