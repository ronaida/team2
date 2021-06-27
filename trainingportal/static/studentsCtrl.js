app.controller("studentsCtrl",  ['$rootScope','$http','$location','dataSvc', function($scope, $http, $location, dataSvc) {

    
    //redirect the user to the previous page if they got logged out
    var redirectPath = window.sessionStorage.getItem("redirectPath");
    if(redirectPath!=null && redirectPath!=="" && redirectPath.indexOf("/")===0){
        //clear the session storage
        window.sessionStorage.removeItem("redirectPath");
        $location.url(redirectPath);
    }
    
    $scope.activityHeartBeat = function(){
        $http.get("/api/activity/heartbeat",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null && response.status === 200){
                    if(response.data.length > 0){
                        var activity = response.data[0];
                        var message = activity.givenName + " " + activity.familyName + " has solved '" +
                        activity.challengeName + "'";
                        $scope.showActivityMessage = $scope.latestActivityMessage !== message;
                        if($scope.showActivityMessage && $scope.fetchActivity){
                            $scope.fetchActivity();
                        }
                        $scope.latestActivityMessage = message;  
                    }            
                    else if(response.data.status===401){
                        window.location = "/"; 
                    }
                }
                else{
                    window.location = "/";    
                }
            },function(){
                window.location = "/";
            });
    }

    $scope.fetchActivity = function(){
        var filter = "";
        if(typeof nameFilter !== 'undefined'){
            filter=nameFilter.value;
        }
        $http.get("/api/activity?query="+filter,window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                }
            })
    }

    setInterval($scope.activityHeartBeat,10*1000);
    
    //whether the menu is active
    $scope.isActive = function (viewLocation) { 
        if(viewLocation==="/") return $location.path()===viewLocation;
        return $location.path().indexOf(viewLocation)==0;
    };

    //fetch Teams
    $scope.fetchTeams = function(){
        $http.get("/api/teams",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.teamNames = {};
                    var teamList = response.data;
                    //create a map of team names to team ids
                    for(let team of teamList){
                        $scope.teamNames[team.id] = team.name;
                    }
                    $http.get("/api/users",window.getAjaxOpts())
                    .then(function(response) {
                        if(response != null && response.data != null){

                            for(let team of teamList){
                                if(team.ownerId!=null && team.ownerId === $scope.user.id){// the user cannot change their team until they delete their current team
                                    $scope.ownedTeam = team;
                                }
                                if(team.id===$scope.user.teamId){
                                    userTeamListChoice.value = team.name;
                                    $scope.existingTeamSelect = team.id;
                                }
                            }
                            $scope.teamList = teamList;

                        }
                    });
                }
            });
    }


    $scope.updateLocalUser = function(){
        $scope.isProfileSaveError = false;
        $scope.isProfileSaveSuccess = false;
        $scope.profileSaveErrorMessage = "";
        var profileInfo = {};
        profileInfo.curPassword = currentPassword.value.trim();
        profileInfo.newPassword = newPassword.value.trim();
        
        if(vfyPassword.value.trim()!==profileInfo.newPassword){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "New password and verification password do not match";
            return;
        }

        $http.post("/api/localUser/updateUser",{"profileInfo":profileInfo},window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                if(response.data.status == 200){
                    $scope.isProfileSaveSuccess = true;
                    $scope.profileSaveSuccessMessage = "User updated.";
                }
                else{
                    $scope.isProfileSaveError = true;
                    $scope.profileSaveErrorMessage = response.data.statusMessage;
                }

            }
        },function(errorResponse){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "A http error has occurred.";
            
        });
    }

    $scope.loadData = function(){
        $http.get("/api/user",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                var user = response.data;
                
                $scope.user = user;

                $scope.fullName = user.givenName + ' ' + user.familyName;
                $scope.firstName = user.givenName;
                $scope.role__=user.role;
                $scope.fetchTeams();
                        
                //do the first activity heartbeat
                $scope.activityHeartBeat();

                //fetch students
                $http.get('/api/students?user_accountId=' + user.accountId.replace('Local_', '') ,window.getAjaxOpts())
                .then(function(response) {
                    if(response != null && response.data != null){
                        $scope.studentsList = response.data;
                    }
                })
                
                //get the code blocks definitions
                $http.get("static/codeBlocks/codeBlocksDefinitions.json").then(function(response) {
                    if(response != null && response.data != null){
                        $scope.codeBlocks = response.data;

                    }
                });
            }
        });


    }

    $scope.loadData();

}]);