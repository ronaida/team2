app.controller("studentsCtrl", function($scope, $http) {
    
    $scope.fetchMyStudents();

    $scope.toLocaleDate = (ts) => {
        if(ts!==null){
            ts = new Date(ts).toLocaleString();
        }
        else{
            ts = "";
        }
        return ts;
    }
});