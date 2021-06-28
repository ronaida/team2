app.controller("trainingModulesCtrl", function ($scope, $http) {
    $scope.badges = null;

    $scope.init=()=>{
        $http.get("/api/user/badges",window.getAjaxOpts())
        .then((response) => {
            $scope.badges = response.data;
        });
    }

    $scope.isModuleEnabled = (moduleId)=>{
        if($scope.modules === null) return false;
        var trainingModule = $scope.modules[moduleId];
        for(let reqModuleId of trainingModule.requiredModules){
            let found = $scope.isModuleComplete(reqModuleId);
            if(!found){
                return false;
            }
        }
        return true;
    }
    $scope.isModuleComplete = (moduleId)=>{
        if($scope.badges === null) return false;
        for(let badge of $scope.badges){
            if(moduleId === badge.moduleId){
                return true;
            }
        }
        return false;
    }
    $scope.beltsdeff=['Yellow Belt','Orange Belt','Green Belt','Purple Belt','Blue Belt','Black Belt'];


    $scope.changeBelt = function (index){
        //$window.alert("Row Index: " + index);
        $scope.indexVal=$scope.studentsList[index];
    }

    $scope.checkBelt = function (value1, value2){
        if(value1==value2){
            $scope.selcted_belt_val='selected';
            return "selected";
        }
            
       // $scope.indexVal=$scope.studentsList[index];
    }

});