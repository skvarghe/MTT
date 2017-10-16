// See LICENSE.MD for license information.

var app = angular.module('MTTApp', ['ngRoute', 'ngStorage']);

app.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<div class="loader"><img src="img/spinner.gif"></div>',
        link: function (scope, element, attr) {
              scope.$watch('loading', function (val) {
                  if (val)
                      $(element).show();
                  else
                      $(element).hide();
              });
        }
      }
  })
/*********************************
 Controllers
 *********************************/
app.controller('HeaderController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Set local scope to persisted user data
    $scope.user = $localStorage;

    // Logout function
    $scope.logout = function(){
                  $scope.loading = false;
                  $localStorage.$reset();
                  $localStorage.status=false;
                  $location.path('/login');
                  }
});

app.controller('LoginController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  if ($scope.user.loggedin==true) {
    $location.path('/timesheet');
  } else {
    $scope.user.id='';
    $scope.user.fullname='';
    $scope.user.userrole='';
    $scope.user.email='';
    $scope.user.loggedin=false;
  }
  $scope.submitLogin = function(){
    $http({
      method: 'GET',
      url: '/validate',
      headers:{
        'username':$scope.loginForm.username,
        'password':$scope.loginForm.password
      }

    })
      .success(function (data, status, headers, config) {
        $scope.loading = false;
        if (data.appcode==100) {
          $scope.user.id=data.body.id;
          $scope.user.fullname=data.body.fullname;
          $scope.user.userole=data.body.userrole;
          $scope.user.email=data.body.email;
          $scope.user.loggedin=true;
          $scope.loading = true;
          if (data.body.userole=='admin') {
            $scope.user.admin=true;
          } else {
            $scope.user.normal=true;
          }
          $location.path('/timesheet');
        } else {
          $('#msgDiv').addClass('msgFail');
          $('#msg').text(data.appcode +' - '+ data.appmsg);
          $('#msgDiv').css("display","block");
        }
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
        $('#msgDiv').addClass('msgFail');
        $('#msg').text(data.appcode +' - '+ data.appmsg);
        $('#msgDiv').css("display","block");
      });
  } // Submit Login END

}); //Login Controller END

app.controller('RegisterController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  $scope.submitRegister = function(){
    $http({
      method: 'POST',
      url: '/registration',
      headers:{
        'username':$scope.registerForm.employeeID,
        'password':$scope.registerForm.password,
        'email':$scope.registerForm.email,
        'fullname':$scope.registerForm.fullname
      }
    })
      .success(function (data, status, headers, config) {
        $scope.loading = false;
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
      });
  } // Submit Register END

}); //Register Controller END

app.controller('TimesheetController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  $('#msgDiv').css("display","none");
  $scope.loading = false;
  var date_input=$('#weekending'); //our date input has the name "date"
      var container=$('.whitewalker form').length>0 ? $('.whitewalker form').parent() : "body";
      var options={
        format: 'yyyy-mm-dd',
        container: container,
        todayHighlight: true,
        autoclose: true,
      };
  date_input.datepicker(options);
  for (j=1;j<6;j++) {
    $("#lplatform"+j).empty();
    $("#workarea"+j).empty();
    $("#workorder"+j).empty();
    $("#funcarea"+j).empty();
  }
  $http({
      method: 'GET',
      url: '/dropdowns',
      headers: {'content-type': 'application/json; charset=UTF-8'}
      }) //http End
      .success(function(res){
          $scope.loading = false;
          if (res.appcode==100){
            for (i=0;i<res.body.length;i++) {
              if(res.body[i].dtid==1) {
                for (j=1;j<6;j++) {
                  $("#lplatform"+j).append('<option value='+res.body[i].did+'>'+res.body[i].dropvalue+'</option>');
                }
              } else if(res.body[i].dtid==2) {
                  for (j=1;j<6;j++) {
                    $("#workarea"+j).append('<option value='+res.body[i].did+'>'+res.body[i].dropvalue+'</option>');
                  }
              } else if(res.body[i].dtid==3) {
                for (j=1;j<6;j++) {
                  $("#workorder"+j).append('<option value='+res.body[i].did+'>'+res.body[i].dropvalue+'</option>');
                }
              } else if(res.body[i].dtid==4) {
                for (j=1;j<6;j++) {
                  $("#funcarea"+j).append('<option value='+res.body[i].did+'>'+res.body[i].dropvalue+'</option>');
                }
              }
            }
          }
          else {
            $('#msgDiv').addClass('msgFail');
            $('#msg').text('Error getting dropdown values!');
          }
      })
      .error(function(res){
        $scope.loading = false;
        $('#msgDiv').addClass('msgFail');
        $('#msg').text('Error getting dropdown values!');
      });

}); //Timesheet Controller END


app.controller('AdminController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;

}); //Admin Controller END

/*********************************
 Routing
 *********************************/
app.config(function($routeProvider) {
    'use strict';

    $routeProvider.

        //Root
        when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController'
        }).

        //Root
        when('/#', {
            templateUrl: 'views/dashboard.html',
            controller: 'HomeController'
        }).

        //Login page
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).

        //Protected page
        when('/timesheet', {
            templateUrl: 'views/timesheet.html',
            controller: 'TimesheetController'
        }).

        //Protected page
        when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminController'
        });

});
