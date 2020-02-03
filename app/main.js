var app = angular.module('order', ['ui.grid', 'angular-ladda']);

app.controller('orderCtrl', function($scope, $http){

    $scope.formModel = {
    }

    $scope.submitting = false;
    $scope.IdCont = 0   ;

    $scope.gridModel = {
        id: "",
        input: "",
        output: "",
        transmitido_api: true,
    };

    //$scope.gridData = [$scope.gridModel];
    $scope.gridData = [];

    $scope.addOrder = function(input, output, api) {
        $scope.IdCont++;
        $scope.gridData.push({'id': $scope.IdCont, 'input': input, 'output':output, 'transmitido_api':api})
    }


    $scope.updateState = function(output) {
        let newOutput = {
            id: this.state.nextOutputId,
            input: this.state.input,
            output
        };

        let {list} = this.state;
        list.push(newOutput);

        this.setState(...this.state, {
            nextOutputId: ++this.state.nextOutputId,
            output,
            list
        });
    }


    $scope.onSubmit = function (name) {
        $scope.submitting = true;
        //const cOrder = this.processOrder();
        const processedOrder = $scope.processOrder(name);
        let output = "";

        output = processedOrder.entree.quantity > 0 ? `${processedOrder.entree.name}, ` : output;
        
        if (processedOrder.side.quantity > 0) {
            if (processedOrder.side.quantity > 1) {
                output += `${processedOrder.side.name}(x${processedOrder.side.quantity}), `;
            } else {
                output += `${processedOrder.side.name}, `
            }
        }

        if (processedOrder.drink.quantity > 0) {
            if (processedOrder.drink.quantity > 1) {
                output += `${processedOrder.drink.name}(x${processedOrder.drink.quantity}), `;
            } else {
                output += `${processedOrder.drink.name}, `
            }
        }

        output = processedOrder.dessert.quantity > 0 ? output + processedOrder.dessert.name : output;

        if (processedOrder.error) {
            output += "error";
        }

        if (output.charAt(output.length - 2) == ',') {
            output = output.substr(0, output.length - 2);
        }

        
        $scope.formModel.output = output;

        console.log(processedOrder);
        console.log("Entrada: " + name);
        console.log("Saída: " + $scope.formModel.output);
        console.log(output);

        console.log($scope.formModel);

        //$http.post('http://localhost:5000/api/values', '"teste"').
        $http.post('https://minmax-server.herokuapp.com/register/', $scope.formModel).
        success(function (data) {
            console.log("Output trafegado para o backend do projeto Web API:" + output);
            $scope.submitting = false;
            $scope.addOrder(name, output, true)
        }).error(function(data) {
            console.log (" Erro ao enviar a mensagem 'POST' para Web API.");
            $scope.submitting = false;
            $scope.addOrder(name, output, false)
        });




    };


    $scope.processOrder = function (model) {
            
        const MENU = {
            morning: [{
              type: 1,
              name: "eggs"
            }, {
              type: 2,
              name: "toast"
            }, {
              type: 3,
              name: "coffee"
            }],
            night: [{
              type: 1,
              name: "steak"
            }, {
              type: 2,
              name: "potato"
            }, {
              type: 3,
              name: "wine"
            }, {
              type: 4,
              name: "cake"
            }]
          };
        
        let order = {
            error: false,
            entree: {name: null, quantity: 0},
            side: {name: null, quantity: 0},
            drink: {name: null, quantity: 0},
            dessert: {name: null, quantity: 0}
        };


        const theOrder = model.split(',');
        const time = theOrder[0].toLowerCase();
        const dishes = MENU[time];

        
        console.log(time);
        console.log(dishes);

        if (theOrder.length > 0 && dishes) {
            theOrder.shift();

            for(let i = 0; i < theOrder.length; i++) {
                const dishType = theOrder[i].trim();

                if(dishType == "1") {
                    if (order.entree.quantity > 0) {
                        order.error = true;
                        break;
                    } else {
                        order.entree.name = dishes[dishType - 1].name;
                        order.entree.quantity++;
                    }
                } else if (dishType == "2") {
                    if (order.side.quantity > 0) {
                        if (time == "night") {
                            order.side.quantity++;
                        } else {
                            order.error = true;
                            break;
                        }
                    } else {
                        order.side.name = dishes[dishType - 1].name;
                        order.side.quantity++;
                    }
                } else if (dishType == "3") {
                    if (order.drink.quantity > 0) {
                        if (time == "morning") {
                            order.drink.quantity++;
                        } else {
                            order.error = true;
                            break;
                        }
                    } else {
                        order.drink.name = dishes[dishType - 1].name;
                        order.drink.quantity++;
                    }
                } else if (dishType == "4") {
                    if (time == "morning" || order.dessert.quantity > 0) {
                        order.error = true;
                        break;
                    } else {
                        order.dessert.name = dishes[dishType - 1].name;
                        order.dessert.quantity++;
                    }
                } else {
                    order.error = true;
                    break;
                }
            }
        } else {
            order.error = true;
        }

        return order;
    };


});