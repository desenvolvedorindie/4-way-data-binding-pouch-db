'use strict';

App.controller('HomeController', function ($rootScope, $scope, $http, Todos) {

    $scope.todos = Todos.todos;

    $scope.submit = function () {
        if ($scope.text !== '')
            Todos.add($scope.text).then(function (res) {
                $scope.text = '';
            }).catch(function (reason) {
                console.log(reason);
            });
    };

    $scope.remove = function (todo) {
        Todos.remove(todo)
                .catch(function (reason) {
                    console.log(reason);
                });
    };
});