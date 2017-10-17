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
    $scope.loading = true;
    $http({
      method: 'GET',
      url: '/validate',
      headers:{
        'username':$scope.loginForm.username,
        'password':$scope.loginForm.password
      }

    })
      .success(function (data, status, headers, config) {
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
          $scope.loading = false;
          showMsg(data.appcode +' - '+ data.appmsg,true);
        }
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
        showMsg(data.appcode +' - '+ data.appmsg,true);
      });
  } // Submit Login END

}); //Login Controller END

app.controller('RegisterController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  hideMsg();
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
        $location.path('/timesheet');
      })
      .error(function (data, status, headers, config) {
        $scope.loading = false;
        showMsg(data.appcode +' - '+ data.appmsg,true);
      });
  } // Submit Register END

}); //Register Controller END

app.controller('TimesheetController', function($scope, $localStorage, $sessionStorage, $http, $location){
  $scope.user = $localStorage;
  hideMsg();
  var date_input=$('#dtcont .input-group.date'); //our date input has the name "date"
      var container=$('.whitewalker form').length>0 ? $('.whitewalker form').parent() : "body";
      var options={
        format: 'yyyy-mm-dd',
        container: container,
        todayHighlight: true,
        daysOfWeekDisabled: "0,1,2,3,4,6",
        autoclose: true
      };
  date_input.datepicker(options);
  $('.datepicker').addClass('anotdt');

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
            $scope.loading = false;
          }
          else {
            $scope.loading = false;
            showMsg('Error getting dropdown values',true);
          }
      })
      .error(function(res){
        $scope.loading = false;
        showMsg('Error getting dropdown values',true);
      });

      $scope.getTimeForm = function(){
        var insrt='';
        for (j=1;j<6;j++) {
          if ($("#hours"+j).val()!='' && $("#hours"+j).val()!=0) {
            if (insrt=='') {
              insrt="("+$scope.user.id+",'"+$('#weekending').val()+"',"+$('#lplatform'+j).val()+","+$('#workarea'+j).val()+","+$('#workorder'+j).val()+","+$('#funcarea'+j).val()+",'"+$('#other'+j).val()+"','"+$('#taskdetails'+j).val()+"',"+$('#hours'+j).val()+")";
            } else {
              insrt=insrt+",("+$scope.user.id+",'"+$('#weekending').val()+"',"+$('#lplatform'+j).val()+","+$('#workarea'+j).val()+","+$('#workorder'+j).val()+","+$('#funcarea'+j).val()+",'"+$('#other'+j).val()+"','"+$('#taskdetails'+j).val()+"',"+$('#hours'+j).val()+")";
            }
          }
        }
      }
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

function showMsg(msg, err) {
  if (err) {
    $('#msgDiv').addClass('alert-danger');
    $('#msgDiv').removeClass('alert-success');
  } else {
    $('#msgDiv').removeClass('alert-danger');
    $('#msgDiv').addClass('alert-success');
  }
  $('#msg').text(msg);
  $('#msgDiv').fadeIn(500);
  $('html, body').animate({ scrollTop: $('body').offset().top }, 'slow');
}

function hideMsg() {
  $('#msgDiv').fadeOut(500);
  $('#msg').text('');
}

$('#btnXMsgDiv').click(function(){
  hideMsg();
});
