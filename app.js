(function () {
    'use strict';

    angular.module('NarrowItDownApp',[])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

    function FoundItemsDirective() {
        var ddo = {
            templateUrl: 'foundItems.html',
            scope: {
                items: '<',
                onRemove: '&'
            }
        }
        
        return ddo;
    }

    NarrowItDownController.$inject = ['MenuSearchService'];
    function NarrowItDownController(MenuSearchService) {
        var ctrl = this;

        ctrl.searchTerm = '';

        ctrl.getMenuList = function () {
            if(ctrl.searchTerm === undefined || ctrl.searchTerm === ''){
                ctrl.message = "Nothing found!";
            } else{
                var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchTerm);

                promise.then(function (response) {
                    ctrl.found = response.foundItems;
                    if(ctrl.found === undefined || ctrl.found.length === 0){
                        ctrl.message = "Nothing found!";
                    }else{
                        ctrl.message = "";
                    }
                })
                .catch(function (error) {
                    ctrl.message = error.message;
                    console.log(error.message);
                });
            }            
        };

        ctrl.removeItem = function (index) {
            ctrl.found.splice(index, 1);
        }

    }

    MenuSearchService.$inject = ['$http','$q'];
    function MenuSearchService($http,$q) {
        var service = this;

        

        service.getMatchedMenuItems = function (searchTerm) {
            var deferred = $q.defer();

            var result = {
                foundItems: [],
                message: ""
            }

            var promise = service.getMenuItems();
            
            promise.then(function (response) {
                var menuItems = response.data.menu_items;

                for (var i in menuItems) {
                    var description = menuItems[i].description;
                    if (description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
                        result.foundItems.push(menuItems[i]);
                    }
                }
                deferred.resolve(result);
            })
            .catch(function (error) {
                result.message = "Nothing found!";
                deferred.reject(result);
            });

            return deferred.promise;
        }

        service.getMenuItems = function () {
            var response = $http({
                method: "GET",
                url: ("https://davids-restaurant.herokuapp.com/menu_items.json")
            });
            return response;
        }

    }

})();